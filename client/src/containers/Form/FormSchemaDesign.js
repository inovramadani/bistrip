import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import queryString from 'query-string'
import M from 'materialize-css/dist/js/materialize.min.js'
import Form from 'react-jsonschema-form'
import { isEqual } from 'lodash'

import { arrayFieldTemplate } from '../../utils/jsonSchemaFormUITemplate'
import customFields from '../../utils/RJSFCustomFields'
import * as helper from '../../utils/helperFunctions'
import API_URL from '../../utils/api_url'
import * as ACT from '../../actions'
import './FormSchemaDesign.css'

class FormSchemaDesign extends Component {
	constructor(props) {
		super(props)

		this.state = {
			collectionName: '',
			stringJSONschema: '',
			defaultJSONschema: { title: 'Form', type: "object", properties: {} },
			JSONSchema: { title: 'Form', type: "object", properties: {} },
			JSONSchemaPreview: { title: 'Form', type: "object", properties: {} },
			stringUIschema: '',
			defaultUIschema: {},
			uiSchema: {},
			stringFormData: '',
			defaultFormData: {},
			formData: {},
			formStyleTheme: '',
		}

		this.textareaUIschema = React.createRef()
		this.textareaJSONschema = React.createRef()
		this.textareaFormData = React.createRef()
	}

	render() {
		const { 
			collectionName, 
			stringJSONschema,
			stringUIschema,
			stringFormData,
			JSONSchemaPreview,
			uiSchema,
			formData,
			formStyleTheme
		} = this.state

	  return (
			<div className="row form-schema-design">
				<div className="col s6 title left-align">
					<h5 className="zero-margin">Design {collectionName} form</h5>
				</div>
				<div className="col s6 btn-actions right-align">
					<span className="waves-effect waves-light btn" onClick={this.handleCancel}>Cancel</span>
					<span className="waves-effect waves-light btn" onClick={this.handleOpenModalFormStyle}>Style</span>
					<span className="waves-effect waves-light btn" onClick={this.handleDefaultSchema}>Default</span>
					<span className="waves-effect waves-light btn" onClick={this.handlePreviewSchema}>Preview</span>
					<span className="waves-effect waves-light btn" onClick={this.handleSaveApplySchema}>Save & Apply</span>
				</div>
				<div className="col s6">
          <span className="left"><strong>JSON schema</strong></span>
          <textarea 
          	id="textarea-form-json-schema"
          	className="textarea-json"
          	value={stringJSONschema}
          	onChange={this.handleChangeJSONschema}
          	ref={this.textareaJSONschema}
          	onKeyDown={e => helper.handleTabPressedOnJSONTextarea(e, this.textareaJSONschema.current)} 
          />
          <div className="UI-schema-container col s6">
	          <span className="left"><strong>UI schema</strong></span>
	          <textarea 
	          	id="textarea-form-ui-schema"
	          	className="textarea-json"
	          	value={stringUIschema}
	          	onChange={this.handleChangeUIschema}
	          	ref={this.textareaUIschema}
	          	onKeyDown={e => helper.handleTabPressedOnJSONTextarea(e, this.textareaUIschema.current)} />
					</div>
					<div className="form-data-container col s6">
	          <span className="left"><strong>Form data</strong></span>
	          <textarea 
	          	id="textarea-form-data"
	          	className="textarea-json"
	          	value={stringFormData}
	          	onChange={this.handleChangeFormData}
	          	ref={this.textareaFormData}
	          	onKeyDown={e => helper.handleTabPressedOnJSONTextarea(e, this.textareaFormData.current)} />
					</div>
				</div>
				<div className="col s6">
					<div id="form-preview">
			  		<div className={`form-schema-design-json-form ${formStyleTheme}`}>
							<Form 
								uiSchema={uiSchema}
								fields={customFields}
								schema={JSONSchemaPreview}
								formData={formData}
								ArrayFieldTemplate={arrayFieldTemplate}
								onChange={this.handleChangeFormPreviewData}
			        />
			      </div>
			  	</div>
				</div>

				{ this.renderModalFormStyle() }
			</div>
	  )
	}

	renderModalFormStyle () {
		const { formStyleTheme } = this.state

		return (
			<div id="modal-form-style" className="modal">
        <div className="modal-content center">
          <h5 className="title">Choose form style</h5>
          <div className="row left-align">
          	<div className="col s12 subcontent form-style-column">
          		<span className="subtitle">Theme</span>
          		<form onChange={this.handleChangeFormStyleTheme} className="form-radio-container">
          			<span className="radio-option">
						      <label>
						        <input 
						        	type="radio" 
						        	name="form-style-theme" 
						        	className="with-gap" 
						        	checked={formStyleTheme === "materialize"}
						        	onChange={this.handleChangeFormStyleTheme}
						        	value="materialize"
						        />
						        <span>materialize</span>
						      </label>
					      </span>
          			<span className="radio-option">
						      <label>
						        <input 
						        	type="radio" 
						        	name="form-style-theme" 
						        	className="with-gap" 
						        	checked={formStyleTheme === "bootstrap"}
						        	onChange={this.handleChangeFormStyleTheme}
						        	value="bootstrap"
						        />
						        <span>bootstrap</span>
						      </label>
					      </span>
          		</form>
          	</div>
          	<div className="col s12 btn-container right-align">
						  <span className="btn" onClick={this.handleConfirmFormStyle}>OK</span>
						</div>
          </div>
        </div>
      </div>
		)
	}

	componentWillMount() {
		this.props.setDummyManagerAndDepartment()
		this.loadData()
	}

	componentDidMount() {
		M.AutoInit()
	}

	loadData() {
		const { location } = this.props
		const formId = queryString.parse(location.search).id

		axios.get(`${API_URL}/form?id=${formId}`)
			.then(res => {
				const { data: baseSchema } = res.data
				const { formStyle } = res.data
				let uiSchema = res.data.uiSchema
				const stringUIschema = helper.stringifyPrettyJSON(uiSchema)
				const stringJSONschema = helper.stringifyPrettyJSON(baseSchema)

				if (uiSchema == null) {
					uiSchema = Object.keys(baseSchema.properties).reduce((obj, key) => {
						if (baseSchema.properties[key].type !== 'boolean') {
							 // eslint-disable-next-line 
							return {...obj, [key] : { ['ui:widget']: 'text' }}
						} else {
							return {...obj, [key] : {}}
						}
					}, {})
				}

				this.setState({
						JSONSchema: baseSchema, 
						defaultJSONschema: baseSchema,
						stringJSONschema,
						collectionName: res.data.collectionDisplayName,
						uiSchema,
						defaultUIschema: uiSchema,
						stringUIschema,
						formStyleTheme: formStyle ? formStyle.theme : ''
					})

				const promisedSchema = helper.replaceDefaultValueStringPatternWithData(baseSchema, this.props.user)
				promisedSchema.then(schema => {
					this.setState({ JSONSchemaPreview: schema })
				})
			})
			.catch(e => console.error(e))
	}

	log = (type) => console.log.bind(console, type)

	handleChangeJSONschema = ({ target }) => {
		this.setState({ stringJSONschema: target.value })
	}

	handleChangeUIschema = ({ target }) => {
		this.setState({ stringUIschema: target.value })
	}

	handleChangeFormData = ({ target }) => {
		this.setState({ stringFormData: target.value })
	}

	handleDefaultSchema = () => {
		const { defaultJSONschema, defaultUIschema, defaultFormData } = this.state
		const stringJSONschema = helper.stringifyPrettyJSON(defaultJSONschema)
		const stringUIschema = helper.stringifyPrettyJSON(defaultUIschema)
		const stringFormData = helper.stringifyPrettyJSON(defaultFormData)
		
		this.setState({
			JSONSchema: defaultJSONschema,
			stringJSONschema,
			uiSchema: defaultUIschema,
			stringUIschema,
			formData: defaultFormData,
			stringFormData
		})
	}

	handlePreviewSchema = () => {
		const { JSONSchema } = this.state
		const newSchema = this.updateSchema()

		if (!newSchema.error) {
			this.setState({ 
				JSONSchema: newSchema.JSON,
				uiSchema: newSchema.UI,
				formData: newSchema.formData
			})

			const promisedSchema = helper.replaceDefaultValueStringPatternWithData(newSchema.JSON, this.props.user)
			promisedSchema.then(schema => {
				this.setState({ JSONSchemaPreview: schema })

				if (!isEqual(JSONSchema, newSchema.JSON)) {
					this.setState({ formData: this.state.defaultFormData })
				}
			})
		}
	}

	updateSchema = () => {
		const { 
			stringJSONschema,
			defaultJSONschema, 
			stringUIschema,
			defaultUIschema,
			stringFormData,
			defaultFormData 
		} = this.state

		let newSchema = { JSON: defaultJSONschema, UI: defaultUIschema, formData: defaultFormData }
		try {
			newSchema.JSON = JSON.parse(stringJSONschema)
		} catch (err) {
			alert('JSON schema is not valid\nError : ' + err)
			return {error: true}
		}

		try {
			newSchema.UI = JSON.parse(stringUIschema)
		} catch (err) {
			alert('UI schema is not valid\nError : ' + err)
			return {error: true}
		}

		try {
			newSchema.formData = JSON.parse(stringFormData)
		} catch (err) {
			alert('Form data is not valid\nError : ' + err)
			return {error: true}
		}
		
		return newSchema
	}

	handleChangeFormPreviewData = ({ formData }) => {
		this.updateFormData(formData)
	}

	updateFormData = (formData) => {
		const stringFormData = helper.stringifyPrettyJSON(formData)

		this.setState({ formData, stringFormData })
	}

	handleSaveApplySchema = () => {
		const { formStyleTheme } = this.state

		const style = {
			theme: formStyleTheme
		}

		const schema = this.updateSchema()

		if (!schema.error) {
			this.handlePreviewSchema()
			this.saveFormSchema(schema)
			this.saveFormStyle(style)
		}
	}

	saveFormSchema(schema) {
		const { id } = queryString.parse(this.props.location.search)

		axios.patch(`${API_URL}/update-form-schema?id=${id}`, schema)
			.then(res => {
				M.toast({ html: res.data.message })
			})
			.catch(err => console.error(err))
	}

	saveFormStyle(style) {
		const { id } = queryString.parse(this.props.location.search)

		axios.patch(`${API_URL}/update-form-style?id=${id}`, style)
			.then(res => {
				M.toast({ html: res.data.message })
				helper.openCloseModal('modal-edit-form', 'close')
			})
			.catch(err => console.error(err))
	}

	handleCancel = () => {
		helper.openCloseModal('modal-edit-form', 'close')
	}

	handleOpenModalFormStyle = () => {
		this.openCloseModalFormStyle('open')
	}

	openCloseModalFormStyle (action) {
		const modal = document.getElementById('modal-form-style')
		if (action === 'open') M.Modal.getInstance(modal).open()
		else if (action === 'close') M.Modal.getInstance(modal).close()
	}

	handleChangeFormStyleTheme = ({ target }) => {
		this.setState({ formStyleTheme: target.value })
	}

	handleConfirmFormStyle = () => {
		this.openCloseModalFormStyle('close')
	}
}

const mapStateToProps = ({ user, form }) => ({
	user
})

const mapDispatchToProps = (dispatch) => ({
	setDummyManagerAndDepartment: () => dispatch(ACT.setDummyManagerAndDepartment())
})

export default connect(mapStateToProps, mapDispatchToProps) (FormSchemaDesign)
