import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import queryString from 'query-string'
import lodash from 'lodash'
import Form from 'react-jsonschema-form'
import M from 'materialize-css/dist/js/materialize.min.js'

import { arrayFieldTemplate } from '../../utils/jsonSchemaFormUITemplate'
import { 
	dataURLtoBlob, 
	replaceDefaultValueStringPatternWithData,
	computeValueByFormula,
	lookUpValue
} from '../../utils/helperFunctions'
import customFields from '../../utils/RJSFCustomFields'
import API_URL from '../../utils/api_url'
import * as ACT from '../../actions'
import ModalUploadProgress from './components/ModalUploadProgress'
import './DataInput.css'

class DataInput extends Component {
	constructor(props) {
		super(props)

		this.state = {
			formStructure: { title: 'Form', type: "object", properties: {} },
			formData: {},
			formStyleTheme: '',
			uiSchema: {},
			clientUploadProgress: 0,
			totalSize: 0,
			second: 0
		}
	}

	render() {
		const { 
			formData,
			formStructure, 
			formStyleTheme,
			uiSchema,
			clientUploadProgress
		} = this.state

		return (
			<div className="form-input">
				<h5>Input form</h5>
				<div className="right-align">
					<span className="btn" onClick={this.updateLookUpValues} style={{marginRight: '5px'}}>update lookup values</span>
					<span className="btn" onClick={this.recomputeValues}>recompute values</span>
				</div>
				<div className={`json-form ${formStyleTheme}`}>
					<Form 
						formData={formData}
						schema={formStructure}
						uiSchema={uiSchema}
	        	ArrayFieldTemplate={arrayFieldTemplate}
	        	fields={customFields}
	        	onChange={this.onChange}
	        	onSubmit={this.onSubmit}
	        	onError={this.log("errors")} />
	      </div>

	      <ModalUploadProgress 
	      	countUploadProgress={this.countUploadProgress} 
	      	clientUploadProgress={clientUploadProgress} />
			</div>
		)
	}

	componentWillMount() {
		const { location } = this.props
		const formId = location.search.slice(4)

		this.loadFormData(formId)
		this.props.setDummyManagerAndDepartment()
	}

	componentDidMount() {
		M.AutoInit()

		// fix hidden dropdown select due to materializecss override script
		// by adding 'browser-default' class
		const delay = setInterval(() => {
			const selects = document.getElementsByTagName('SELECT')

			if (selects.length > 0) {
				for (let i = 0; i < selects.length; i++) {
					selects[i].classList.add('browser-default')
					this.isFoundSelectElement = true
				}
			}

			if (this.isFoundSelectElement) clearInterval(delay)
		}, 500)
	}

	componentWillUnmount() {
		clearInterval(this.timer)
	}

	loadFormData (formId) {
		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				const {
					data: formStructure, 
					uiSchema, 
					createdActionAPI,
					formStyle
				} = res.data

				const promisedStructure = replaceDefaultValueStringPatternWithData(formStructure, this.props.user)
				promisedStructure.then(newFormStructure => {
					this.setState({
						formStructure: newFormStructure,
						uiSchema,
						createdActionAPI,
						formStyleTheme: formStyle ? formStyle.theme : ''
					})
				})
			})
			.catch(e => console.error(e))
	}
	 
	log = (type) => console.log.bind(console, type)

	updateLookUpValues = () => {
		const { formStructure, formData } = this.state
		const { properties } = formStructure

		lookUpValue(properties, formData).then(newFormData => {
    	this.setState({ formData: newFormData })
    })
	}

	recomputeValues = () => {
		const { formStructure, formData } = this.state
		const { properties } = formStructure

		const newFormData = computeValueByFormula(properties, formData)
  	this.setState({ formData: newFormData })
	}

	onChange = ({ schema, formData }) => {
		const { properties } = schema
    
    this.updateTotalCell(properties)
    
  	const newFormData = computeValueByFormula(properties, formData)
  	this.setState({ formData: newFormData })
	}

	updateTotalCell (properties) {
		const columnToSumEl = document.getElementById('sum-column-name')
		const columnToSum = columnToSumEl ? columnToSumEl.value : ''
		const total = this.countValuesOnCells(columnToSum, properties)
		const totalCell = document.getElementById('total-amount-array-items')
		if (totalCell) totalCell.innerHTML = total
	}

	countValuesOnCells = (targetProperty, properties) => {
		let total = 0

		Object.keys(properties).forEach(key => {
			if (properties[key].type === 'array') {
				Object.keys(properties[key].items.properties).forEach(key2 => {
					if (key2 === targetProperty && properties[key].items.properties[key2].type === 'number') {
						const cells = Array.prototype.slice.call(document.getElementsByClassName(`${key2}-cell`))
						cells.forEach(cell => {
							const input = cell.children[0].children[0].children[0].children[0].children[2]
							if (input) total += Number(input.value)
						})
					}
				})
			}
		})

		return total
	}

	onSubmit = ({ formData }) => {
		if (formData.file) {
			const { file } = formData
			const nameStartIdx = file.indexOf(';name=') + 6
			const nameEndIdx = file.indexOf(';base64,')
			const filename = file.slice(nameStartIdx, nameEndIdx)

			const sBoundary = "---------------------------" + Date.now().toString(16)

			const formFile = new FormData()
			formFile.append("file", dataURLtoBlob(file), filename)

			// open progress modal
	    let modal = document.getElementById('modal-upload-progress')
    	M.Modal.getInstance(modal).open()

    	this.timer = setInterval(() => {
    		this.setState({ second: this.state.second + 1 })
    	}, 1000)

			// upload attachment file
			const config = {
				headers: {'content-type': `multipart/form-data; boundary=${sBoundary}`},
	    	onUploadProgress: progressEvent => {
	    		const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        	this.setState({ 
        		totalSize: progressEvent.total,
        		clientUploadProgress: progress
        	})
	    	}
			}

			axios.post(`${API_URL}/upload`, formFile, config)
				.then(res => {
					const { filename, fileId, contentType, size, message } = res.data

					// close progress modal
			    let modal = document.getElementById('modal-upload-progress')
			    M.Modal.getInstance(modal).close()

					M.toast({ html: message })
					
					// submit form data fields
					let formFields = lodash.omit(formData, ['file'])
					formFields = {...formFields, filename, fileId, contentType, size}
					this.submitFormFields(formFields)
				})
				.catch(err => console.log(err))
		} else {
			this.submitFormFields(formData)
		}
	}

	submitFormFields (formFields) {
		const { createdActionAPI } = this.state
		const { location } = this.props
		const { id: formId } = queryString.parse(location.search)

		// submit form data fields
		axios.post(`${API_URL}/record?id=${formId}`, formFields)
			.then(res => {
				if (res.data.success) {
					M.toast({ html: 'Data submitted' })

					// call event api after saving data to database
					if (createdActionAPI && createdActionAPI.isActive && createdActionAPI.url) {
						axios.post(`${API_URL}/call-events-api?form_id=${formId}&action_type=created`, formFields)
							.then(res2 => {
								// redirect to collection page						
								this.props.history.push(`/collection?id=${formId}`)
							})
							.catch(err2 => console.error(err2))
					} else {
						this.props.history.push(`/collection?id=${formId}`)
					}
				}
			})
			.catch(err => console.log(err))
	}

	countUploadProgress = () => {
		const { totalSize, second } = this.state

		// used 125000bytes/second as average upload speed
		const progress = Math.round((125000 * second) / totalSize * 100)
		return progress < 100 ? progress : 100
	}
}

const mapStateToProps = ({ user, form }) => ({
	user
})

const mapDispatchToProps = (dispatch) => ({
	setDummyManagerAndDepartment: () => dispatch(ACT.setDummyManagerAndDepartment())
})

export default connect(mapStateToProps, mapDispatchToProps) (DataInput)
