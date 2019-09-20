import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import M from 'materialize-css/dist/js/materialize.min.js'

import * as helper from '../../utils/helperFunctions'
import * as ACT from '../../actions'
import SidenavDesigner from './SidenavDesigner'
import './SidenavSetup.css'

class SidenavSetup extends Component {
	constructor(props) {
		super(props)

		this.state = {
			appName: props.appName,
			JSONconfig: '',
			defaultConfig: {},
			config: {}
		}

		this.textJSONconfig = React.createRef()
	}

	render() {
		const { JSONconfig, config } = this.state
		let groupLinks = config ? config.groupLinks : []

		return (
			<div className="row sidenav-setup">
				<ul className="tabs">
	        <li className="tab col s3"><a href="#sidenav-config">Sidenav config</a></li>
	        <li className="tab col s3"><a href="#sidenav-designer">Sidenav designer</a></li>
	      </ul>
	      <div id="sidenav-designer">
	      	<SidenavDesigner location={this.props.location} />
	      </div>
	      <div id="sidenav-config">
					<div className="col s3">
						<ul id="sidenav-preview">
				  	{
				  		groupLinks && 
				  		groupLinks.map((groupLink, index) => (
				  			<div key={index}>
				  			{
				  				groupLink.header.length > 0 &&
				    			<li><span className="subheader">{groupLink.header}</span></li>
				    		}
				  			{
				  				groupLink.links.map((item, i) => (
				  					<div key={i} >
							    		<div>
								    		<li>
								    			{
								    				item.isExternal ?
												    	<a href={item.route}>
												    		<i className="material-icons">{item.icon}</i>
												    		{item.text}
												    	</a>
												    : <Link to={item.route}>
												    		<i className="material-icons">{item.icon}</i>
												    		{item.text}
												    	</Link>
								    			}
										    </li>
										  </div>
									    {
									    	item.sublink &&
								    		item.sublink.length > 0 && 
								    		item.sublink.map((subitem, idx) => (
								    			<li key={idx} className="sublink">
											    	{
									    				subitem.isExternal ?
													    	<a href={subitem.route}>
													    		<i className="material-icons">{subitem.icon}</i>
													    		{subitem.text}
													    	</a>
													    : <Link to={subitem.route}>
													    		<i className="material-icons">{subitem.icon}</i>
													    		{subitem.text}
													    	</Link>
											    	}
											    </li>
								    		))
								    	}
									  </div>
				  				))
				  			}
				  			{
				  				groupLink.dividerBottom &&
				  				<li><div className="divider"></div></li>
				  			}
				  			</div>
				  		))
				  	}
				  	</ul>
					</div>
					<div className="col s7">
						<div className="input-field col s12">
		          <span className="left"><strong>Sidenav JSON config</strong></span>
		          <textarea 
		          	id="textarea-sidenav-json-config" 
		          	value={JSONconfig}
		          	onChange={this.handleChangeJSONconfig}
		          	ref={this.textJSONconfig}
		          	onKeyDown={event => helper.handleTabPressedOnJSONTextarea(event, this.textJSONconfig.current)} />
		        </div>
					</div>
					<div className="col s2 btn-actions">
						<span className="waves-effect waves-light btn" onClick={this.handleDefaultConfig}>Default</span>
						<span className="waves-effect waves-light btn" onClick={this.handlePreviewConfig}>Preview</span>
						<span className="waves-effect waves-light btn" onClick={this.handleSaveApplyConfig}>Save & Apply</span>
					</div>
				</div>
      </div>
		)
	}

	componentWillMount() {
		const { loadSidenavConfig } = this.props
		const { appName } = this.state

		// load sidenav config based on app name
		loadSidenavConfig(appName)
	}

	componentDidMount() {
		M.AutoInit()
	}

	componentDidUpdate(prevProps) {
		const { appName, sidenavConfig, loadSidenavConfig } = this.props

		if (sidenavConfig !== prevProps.sidenavConfig) {
			const JSONconfig = helper.stringifyPrettyJSON(sidenavConfig.groupLinks)

			this.setState({ 
				config: sidenavConfig, 
				defaultConfig: sidenavConfig,
				JSONconfig,
			})
		}

		if (appName !== prevProps.appName) {
			loadSidenavConfig(appName)
		}
	}

	handleChangeJSONconfig = (event) => {
		this.setState({ JSONconfig: event.target.value })
	}

	handleDefaultConfig = () => {
		const { defaultConfig } = this.state
		const JSONconfig = helper.stringifyPrettyJSON(defaultConfig.groupLinks)
		this.setState({ 
			config: defaultConfig,
			JSONconfig 
		})
	}

	handlePreviewConfig = () => {
		const newConfig = this.updateConfig()
		this.setState({ config: newConfig })
	}

	updateConfig = () => {
		const { JSONconfig, config, defaultConfig } = this.state
		let newConfig = defaultConfig
		try {
			newConfig = { ...config, groupLinks: JSON.parse(JSONconfig) }
		} catch (err) {
			alert('JSON config is not valid\nError : ' + err)
		} 

		return newConfig
	}

	handleSaveApplyConfig = (JSONconfig) => {
		const config = this.updateConfig()
		const { saveSidenavConfig, setSidenavFromConfig } = this.props
		this.handlePreviewConfig()
		saveSidenavConfig(config)
		setSidenavFromConfig([], config.groupLinks)
	}
}

const mapStateToProps = (state) => {
	return {
		sidenavConfig: state.user.sidenavConfig,
		appName: state.user.appName,
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		saveSidenavConfig: (config) => dispatch(ACT.saveSidenavConfig(config)),
		loadSidenavConfig: (appName) => dispatch(ACT.loadSidenavConfig(appName)),
		setSidenavFromConfig: (collections, groupLinks) => dispatch(ACT.setSidenavFromConfig(collections, groupLinks)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SidenavSetup)
