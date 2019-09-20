import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import M from 'materialize-css/dist/js/materialize.min.js'
import { isEmpty } from 'lodash'

import initialSidenavConfig from './initialSidenavConfig'
import './Sidenav.css'
import * as ACT from '../../actions'

class Sidenav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedNavItem: undefined,
		}
	}

	render() {
		const { selectedNavItem } = this.state
		const { user } = this.props
		let { groupLinks } = this.props

		if (!groupLinks || isEmpty(groupLinks)) {
			groupLinks = initialSidenavConfig.groupLinks
		}

		// hide sidenav setup section for user with role_id < 3
		if (user.role_id < 3) {
			const setupGroupLinkIdx = groupLinks.findIndex(groupLink => groupLink.header === 'setup')
			groupLinks.splice(setupGroupLinkIdx, 1)
		}
		
		return (
			<Fragment>
			{/* eslint-disable-next-line */}
				<a data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a>

				<ul id="slide-out" className="sidenav">
			  	{
			  		groupLinks &&
			  		groupLinks.map((groupLink, index) => (
			  			<div key={index}>
			  			{
			  				groupLink.header.length > 0 &&
			    			<li>
			  					{/* eslint-disable-next-line */}
			    				<a className="subheader">{groupLink.header}</a>
			    			</li>
			    		}
			  			{
			  				groupLink.links.map((item, i) => (
			  					<div key={i} >
						    		<div className={selectedNavItem === i ? 'active' : ''} onClick={this.handleClickNavItem.bind(this, i)}>
							    		<li>
									    	{
									    		user.isLoggedIn ?
								    				item.isExternal ?
												    	<a href={item.route}>
												    		<i className="material-icons">{item.icon}</i>
												    		{item.text}
												    	</a>
												    : <Link to={item.route}>
												    		<i className="material-icons">{item.icon}</i>
												    		{item.text}
												    	</Link>
												  : <a className="modal-trigger" href="#modal-login-message">
											    		<i className="material-icons">{item.icon}</i>
											    		{item.text}
											    	</a>
							    			}
									    </li>
									  </div>
								    {
								    	item.sublink &&
							    		item.sublink.length > 0 && 
							    		item.sublink.map((subitem, idx) => (
							    			<li key={idx} className="sublink" onClick={this.handleClickNavItem.bind(this,i)}>
										    	{
										    		user.isLoggedIn ?
									    				subitem.isExternal ?
													    	<a href={subitem.route}>
													    		<i className="material-icons">{subitem.icon}</i>
													    		{subitem.text}
													    	</a>
													    : <Link to={subitem.route}>
													    		<i className="material-icons">{subitem.icon}</i>
													    		{subitem.text}
													    	</Link>
													  : <a className="modal-trigger" href="#modal-login-message">
												    		<i className="material-icons">{subitem.icon}</i>
												    		{subitem.text}
												    	</a>
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

			  <div id="modal-login-message" className="modal">
			  	<div className="modal-content">
						<i className="large material-icons">info</i>
			      <h5>Please login to access the page</h5>
			    </div>
			  </div>
	    </Fragment>
		);
	}

	componentWillMount() {
		const { 
			setApp,
			loadSidenavConfig
		} = this.props

    setApp('default')
    loadSidenavConfig('default')
	}

	componentDidUpdate(prevProps) {
		const { 
			appName, 
			sidenavConfig, 
			setSidenavFromConfig,
		} = this.props

		if (appName !== prevProps.appName || sidenavConfig !== prevProps.sidenavConfig) {
			if (sidenavConfig !== prevProps.sidenavConfig && sidenavConfig) {
					setSidenavFromConfig([], sidenavConfig.groupLinks)
			}
		}
	}

	componentDidMount() {
		// materialize css initialization
		this.initMaterialize()
	}

	initMaterialize() {
		let sidenav = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenav);

    let modal = document.querySelectorAll('.modal');
    M.Modal.init(modal);
	}

	handleClickNavItem(i) {
		const elems = document.querySelectorAll('.sidenav');
		const sidenavInstance = M.Sidenav.getInstance(elems[0])
		sidenavInstance.close()

		this.setState({
			selectedNavItem: i,
		})
	}
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  	appName: state.user.appName,
    groupLinks: state.user.sidenavGroupLinks ? state.user.sidenavGroupLinks : [],
    sidenavConfig: state.user.sidenavConfig,
  }
}

const mapDispatchToProps = (dispatch) => {
	return {
		setApp: (appName) => dispatch(ACT.setApp(appName)),
		loadSidenavConfig: (appName) => dispatch(ACT.loadSidenavConfig(appName)),
		setSidenavFromConfig: (collections, groupLinks) => dispatch(ACT.setSidenavFromConfig(collections, groupLinks)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);