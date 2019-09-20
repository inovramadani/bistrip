import React, { Component } from 'react'
import { connect } from 'react-redux'

import './FormDesigner.css'

class FormDesigner extends Component {
	constructor(props) {
		super(props)

		this.state = {
			isShowControlProperties: false
		}
	}

	render() {
		const { isShowControlProperties } = this.state
		const properties = ['text', 'selected', 'color', 'border']

	  return (
			<div className="row form-designer">
				<div id="form-control" className="col s3">
					<div className="title">
						<span>Control pallete</span>
					</div>
					<div className="row control-item control-input">
						<span className="col s4 zero-padding">text input </span>
						<span className="col s8 zero-padding" 
							draggable
							id="text"
							onDragStart={e => {
								e.dataTransfer.setData('data', e.target.id)
							}}
						>
						<div className="control-item-preview">
							<input type="text" className="browser-default control-item-preview" disabled/>
						</div>
						</span>
					</div>
					<div className="row control-item control-select">
						<span className="col s4 zero-padding">select </span>
						<span className="col s8 zero-padding" 
							draggable
							id="select"
							onDragStart={e => {
								e.dataTransfer.setData('data', e.target.id)
							}}
						>
							<div className="control-item-preview">
								<select className="browser-default control-item-preview" disabled/>
							</div>
						</span>
					</div>
					<div className="row control-item control-radio">
						<span className="col s4 zero-padding">radio </span>
						<span className="col s8 zero-padding" 
							draggable
							id="radio"
							onDragStart={e => {
								e.dataTransfer.setData('data', e.target.id)
							}}
						>
							<div className="control-item-preview">
								<label>
					        <input className="with-gap" name="group1" type="radio" disabled checked/>
					        <span>text</span>
					      </label>
					    </div>
						</span>
					</div>
					<div className="row control-item control-checkbox">
						<span className="col s4 zero-padding">checkbox </span>
						<span className="col s8 zero-padding" 
							draggable
							id="checkbox"
							onDragStart={e => {
								e.dataTransfer.setData('data', e.target.id)
							}}
						>
							<div className="control-item-preview">
								<label>
					        <input type="checkbox" 
					        	className="filled-in" 
					        	checked="checked" 
					        	disabled
					        />
					        <span>text</span>
					      </label>
							</div>
						</span>
					</div>
					<div className="row control-item control-textarea">
						<span className="col s4 zero-padding">textarea </span>
						<span className="col s8 zero-padding"
							draggable
							id="textarea"
							onDragStart={e => {
								e.dataTransfer.setData('data', e.target.id)
							}}
						>
			        <textarea
			        	className="control-item-preview browser-default"
			        	disabled
			        />
						</span>
					</div>
				</div>
				<div id="form-canvas" 
					className={`col s${isShowControlProperties ? 6 : 9}`}
					onDrop={this.handleDropFormControl}
					onDragOver={e => e.preventDefault()}
				>
					<div className="title">
						<span className="zero-margin">Form canvas</span>
					</div>
				</div>
				<div id="control-properties" className="col s3" style={{display: isShowControlProperties ? 'block' : 'none'}}>
					<div className="title">
						<span className="zero-margin">Control properties</span>
					</div>
					{
						properties.map((item, index) => (
							<div key={index} className="control-property">
								<span className="property-label">{item} </span> :
								<input type="text" className="property-input browser-default" />
							</div>
						))
					}
				</div>
			</div>
	  )
	}

	handleDropFormControl = (e) => {
		e.preventDefault(); 
		
		const data = e.dataTransfer.getData('data')
		const copyElement = document.getElementById(data).children[0].cloneNode(true)
		let newElement = copyElement
		let isAppendToExistingNode = false

		if (copyElement) {
			const el = copyElement

			// remove disabled attribute 
			el.removeAttribute('disabled')
			
			if (el.children[0]) {
				if (el.children[0].children[0]) {
					if (el.children[0].children[0].children[0]) el.children[0].children[0].children[0].removeAttribute('disabled')
					else el.children[0].children[0].removeAttribute('disabled')
				}
				else el.children[0].removeAttribute('disabled')
			}

			// add OnClick method
			el.onclick = () => this.openCloseControlProperties(el)
		}

		if (data === 'radio') {
			const formRadio = document.getElementsByClassName('form-radio')
			if (formRadio.length === 0) {
				const form = document.createElement('FORM')
				form.classList.add('form-radio')
				form.appendChild(copyElement)
				newElement = form
			} else {
				let form = document.getElementsByClassName('form-radio')[0]
				form.appendChild(copyElement)
				isAppendToExistingNode = true
			}
		}

		if (!isAppendToExistingNode) {
			e.target.appendChild(newElement)
		}
	}

	openCloseControlProperties = (el) => {
		const { isShowControlProperties } = this.state
		this.setState({
			isShowControlProperties:!isShowControlProperties
		})
	}
}

const mapStateToProps = ({ user, form }) => ({
})

const mapDispatchToProps = (dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps) (FormDesigner)
