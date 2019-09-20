import React, { Component } from 'react'
import axios from 'axios'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../../../utils/api_url'
import { isEmptyString, openCloseModal } from '../../../utils/helperFunctions'
import './ModalSaveTemplate.css'

class ModalSaveTemplate extends Component {
	constructor(props) {
		super(props)

		this.state = {
			templateName: props.collectionDisplayName,
			isTemplateNameOK: false
		}
	}

	render () {
		const { templateName, isTemplateNameOK } = this.state

		return (
			<div id="modal-save-template" className="modal">
				<div className="modal-content">
					<h5 className="center">Save as template</h5>
					<div className="row">
						<div className="input-field col s10">
							<input type="text" 
								id="template_name"
								value={templateName} 
								onChange={this.handleChangeTemplateName} />
							<label htmlFor="template_name">Template name</label>
						</div>
						<div className="col s2 right-align">
							<span className="waves-effect waves-light btn btn-check-template-name tooltipped"
							 disabled={isEmptyString(templateName)}
							 data-position="right"
							 data-tooltip="Check if name existed"
	        		 onClick={this.handleCheckTemplateName}
	        		>
					    	Check
					    </span>
						</div>
					</div>
					<div className="row">
						<div className="col s12 center">
							<span className="waves-effect waves-light btn btn-save-template" 
								disabled={isEmptyString(templateName) || !isTemplateNameOK}
								onClick={this.handleClickSave}
							>
					    	Save
					    </span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	handleChangeTemplateName = ({ target }) => {
		this.setState({ 
			templateName: target.value
		})
	}

	handleCheckTemplateName = () => {
		const { templateName } = this.state
		const { formId } = this.props

		axios.get(`${API_URL}/check-template-name?name=${templateName}&form_id=${formId}`)
			.then(res => {
				const { isFound, isCurrent } = res.data
				let message, icon, isTemplateNameOK

				if (isFound) {
					if (isCurrent) {
						message = '<span>&nbsp;Name is the same with current template name</span>'
						icon = '<i class="material-icons">check_circle</i>'
						isTemplateNameOK = true
					} else {
						message = '<span>&nbsp;Name is already used, please change</span>'
						icon = '<i class="material-icons">highlight_off</i>'
						isTemplateNameOK = false
					}
				} 
				else { // not found
					message = '<span>&nbsp;Name is unique, you can create new template with it</span>'
					icon = '<i class="material-icons">check_circle</i>'
					isTemplateNameOK = true
				}

				M.toast({
					html: icon + message,
					displayLength: 5000,
				})

				this.setState({ isTemplateNameOK })
			})
	}

	handleClickSave = () => {
		const { templateName: name } = this.state
		const { formId, formStructure, fields } = this.props
		const body = {
			name,
			formId,
			formStructure,
			fields
		}

		axios.post(`${API_URL}/save-template`, body)
			.then(res => {
				const { message } = res.data
				
				M.toast({ html: message })
				openCloseModal('modal-save-template', 'close')
			})
	}
}

export default ModalSaveTemplate