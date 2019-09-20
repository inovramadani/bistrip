import React, { Component } from 'react'
import axios from 'axios'

import API_URL from '../../../utils/api_url'
import './ModalChooseTemplate.css'

class ModalChooseTemplate extends Component {
	constructor(props) {
		super(props)

		this.state = {
			templateName: '',
			templates: []
		}
	}

	render () {
		const { handleClickOKChooseTemplate } = this.props
		const { templateName, templates } = this.state

		return (
			<div id="modal-choose-template" className="modal">
				<div className="modal-content">
					<h5 className="center">Choose template</h5>
					<div className="row">
						<form>
						{
							templates.map((template, index) => (
								<span key={index} className="radio-option">
						      <label>
						        <input 
						        	type="radio" 
						        	name="form-template" 
						        	className="with-gap" 
						        	checked={templateName === template.name}
						        	onChange={this.handleChangeTemplateName}
						        	value={template.name}
						        />
						        <span>{template.name}</span>
						      </label>
					      </span>
							))
						}
						</form>
					</div>
					<div className="row">
						<div className="col s12 center">
							<span className="waves-effect waves-light btn btn-ok" 
								disabled={false}
								onClick={e => handleClickOKChooseTemplate(templateName)}
							>
					    	OK
					    </span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	componentWillMount() {
		axios.get(`${API_URL}/templates`)
			.then(res => {
				const { templates } = res.data
				this.setState({ templates })
			})
	}

	handleChangeTemplateName = ({ target }) => {
		this.setState({ templateName: target.value })
	}
}

export default ModalChooseTemplate