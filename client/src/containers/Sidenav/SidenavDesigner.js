import React, { Component } from 'react'
import { connect } from 'react-redux'

import './SidenavDesigner.css'

const groupLinkId = 'sidenav-item-group-link'
const headerId = 'sidenav-item-header'
const linkId = 'sidenav-item-link'
const dividerId = 'sidenav-item-divider'

class SidenavDesigner extends Component {
	constructor(props) {
		super(props)

		this.state = {
			isShowSidenavItemProperties: false
		}
	}

	render() {
		const { isShowSidenavItemProperties } = this.state
		const properties = ['Display name', 'Type', 'Link', 'Enable']
		const sidenavItems = [
			{
				name:'Group link', 
				id: groupLinkId,
				html: <div style={{display: 'none'}}>
								<li><span className="subheader">Header</span></li>
								<div>
									<li>
										<a href="#test">
											<i className="material-icons">format_list_bulleted</i>
											Link 1
										</a>
										<a href="#test">
											<i className="material-icons">format_list_bulleted</i>
											Link 2
										</a>
									</li>
								</div>
								<li><div className="divider"></div></li>
							</div>
			}, 
			{
				name:'Header', 
				id: headerId,
				html: <li style={{display: 'none'}}>
								<span className="subheader">Header</span>
							</li>
			},
			{
				name:'Link', 
				id: linkId,
				html: <li style={{display: 'none'}}>
								<a href="#test">
									<i className="material-icons">format_list_bulleted</i>
									Link 
								</a>
							</li>
			},
			{
				name:'Divider', 
				id: dividerId,
				html: <li style={{display: 'none'}}>
								<div className="divider"></div>
							</li>
			}
		]

		

		return (
			<div className="row sidenav-designer left-align">
				<div id="sidenav-item-picker" className="col s2 offset-s1">
					<div className="title">
						<span>Sidenav item</span>
					</div>
					{
						sidenavItems.map(item => (
							<div className="sidenav-item">
								<div id={item.id}
									draggable 
									onDragStart={this.handleDragSidenavItem}
								>
									{item.html}
									<span>{item.name}</span>
								</div>
							</div>
						))
					}
				</div>
				<div id="sidenav-designer-preview" 
					onClick={this.handleShowHideSidenavItemProperties}
					className="col s3"
					onDrop={this.handleDropSidenavItem}
					onDragOver={e => e.preventDefault()}
				>
				</div>
				<div id="sidenav-item-properties" className="col s3" style={{display: isShowSidenavItemProperties ? 'block' : 'none'}}>
					<div className="title">
						<span className="zero-margin">Item properties</span>
					</div>
					{
						properties.map(item => (
							<div className="item-property">
								<span className="property-label">{item} </span> :
								<input type="text" className="property-input browser-default" />
							</div>
						))
					}
				</div>
      </div>
		)
	}

	handleDragSidenavItem = (event) => {
		event.dataTransfer.setData('data', event.target.id)
	}

	handleDropSidenavItem = (event) => {
		event.preventDefault()
		const data = event.dataTransfer.getData('data')
		
		const groupLink = document.getElementById(data).children[0].cloneNode(true)
		groupLink.removeAttribute('style')
		console.log('groupLink = ', groupLink)
		document.getElementById('sidenav-designer-preview').appendChild(groupLink)
	}

	handleShowHideSidenavItemProperties = () => {
		const { isShowSidenavItemProperties } = this.state
		this.setState({ isShowSidenavItemProperties: !isShowSidenavItemProperties})
	}


}

const mapStateToProps = (state) => {
	return {
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SidenavDesigner)
