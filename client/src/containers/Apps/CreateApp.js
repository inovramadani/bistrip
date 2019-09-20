import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'
import axios from 'axios'
import M from 'materialize-css/dist/js/materialize.min.js'

import initialSidenavConfig from '../Sidenav/initialSidenavConfig'
import API_URL from '../../utils/api_url'
// import * as ACT from '../../actions'
import './CreateApp.css'

class CreateApp extends Component {
	state = {
		appName: '',
		appIcon: '',
		users: [],
		selectedUsers: [],
		isAppNameOk: false
	}

  render() {
  	const { 
  		appName, 
  		appIcon, 
  		users, 
  		selectedUsers, 
  		isAppNameOk 
  	} = this.state

    return (
      <div className="create-app-page">
        <h4 className="title">Create new app</h4>
        <div className="row">
        	<div className="col s3">
        		<span className="app-preview-container">
        			<span className="container">
			        	<p><strong>App preview</strong></p>
				    		<span id="app-preview">
				    			<i className="material-icons">{appIcon}</i>
				    			{appName}
				    		</span>
				    	</span>
			    		<span className="btn btn-create-app" 
			        	onClick={this.handleClickCreateApp}
			        	disabled={!isAppNameOk}>
			        	Create
			      	</span>
			    	</span>
        	</div>
        	<div className="col s7">
        		<div className="col s6 left-align">
			        <div className="input-field input-icon-container">
			        	<input id="app-icon" type="text" value={appIcon} onChange={this.handleChangeAppIcon} />
			        	<label htmlFor="app-icon">App icon</label>
			        </div>
			        <a href="https://materializecss.com/icons.html" 
		        		target="_blank" 
		        		rel="noopener noreferrer">
		        		Icon name reference
		        	</a>
		        </div>
	        	<div className="col s6">
	        		<div className="col s9 zero-padding">
				        <div className="input-field">
				        	<input id="app-name" type="text" value={appName} onChange={this.handleChangeAppName} />
				        	<label htmlFor="app-name">App name</label>
				        </div>
	        		</div>
	        		<div className="col s3">
				        <span className="btn btn-check-app-name" onClick={this.handleClickCheckAppName}>Check</span>
	        		</div>
	        	</div>
		      	<div className="col s12 left-align zero-padding">
			      	<div className="col s6">
				      	<p><strong>Choose users</strong></p>
				      	{
				      		users.map((user, index) => (
				      			<div key={index}>
					      			<label>
								        <input type="checkbox" 
								        	className="filled-in" 
								        	checked={selectedUsers.includes(user)}
								        	onChange={e => this.handleChangeSelectedUsers(user)}
								        />
								        <span>{user.firstname + ' ' + user.lastname}</span>
								      </label>
								    </div>
				      		))
				      	}
			      	</div>
			      	<div className="col s6">
			      		<p><strong>Selected users</strong></p>
			      		{
			      			selectedUsers.map(user => user.firstname + ' ' + user.lastname)
			      				.sort((a, b) => { // ignore case comparison
			      					const A = a.toUpperCase()
			      					const B = b.toUpperCase()

			      					if (A < B) return -1
			      					else if (A > B) return 1
			      					return 0
			      				})
			      				.map((userFullName, index) => (
			      					<p key={index} className="selected-users">{`${index + 1}. ${userFullName}`}</p>
			      				))
			      		}
			      	</div>
		      	</div>
        	</div>
	      </div>
      </div>
    )
  }

  componentWillMount () {
  	this.loadUsers()
  }

  loadUsers () {
  	axios.get(`${API_URL}/users`)
  		.then(res => {
  			const users = res.data
  			this.setState({ users })
  		})
  }

  handleChangeAppName = ({ target }) => {
  	this.setState({ appName: target.value })
  }

  handleChangeAppIcon = ({ target }) => {
  	this.setState({ appIcon: target.value })
  }

  handleClickCheckAppName = () => {
    const { appName } = this.state

    axios.get(`${API_URL}/check-app-name?name=${appName}`)
      .then(res => {
        const { isFound, currentName } = res.data
        let message, icon = ''
        let isAppNameOk = false

        if (!isFound) {
          icon = '<i class="material-icons">check_circle</i>'
          message = '<span>&nbsp;Name is unique, you can create new template with it</span>'
          isAppNameOk = true
        } else if (isFound && currentName === appName) {
          icon = '<i class="material-icons">check_circle</i>'
          message = '<span>&nbsp;Name is the same with current app name</span>'
          isAppNameOk = true
        } else {
          icon = '<i class="material-icons">highlight_off</i>'
          message = '<span>&nbsp;Name is already used, please change</span>'
        }

        M.toast({ html: icon + message })
        this.setState({ isAppNameOk })
      })
  }

  handleChangeSelectedUsers = (user) => {
  	const { selectedUsers } = this.state
  	let newSelectedUsers = [...selectedUsers]

  	if (selectedUsers.includes(user)) {
  		const idx = selectedUsers.findIndex(user2 => isEqual(user, user2))
  		newSelectedUsers.splice(idx, 1)
  	} else {
	  	newSelectedUsers = [...selectedUsers, user]
  	}

  	this.setState({ selectedUsers: newSelectedUsers })
  }

  handleClickCreateApp = () => {
  	const { appName, appIcon, selectedUsers } = this.state
  	const { user } = this.props

  	const userData = {
  		_id: user._id,
  		firstname: user.firstname,
  		lastname: user.lastname,
  		role_id: user.role_id,
  		level: user.level
  	}

  	const body = {
  		name: appName,
  		icon: appIcon,
  		owner: userData,
  		userList: selectedUsers
  	}

  	const sidenav = {
  		appName,
  		groupLinks: initialSidenavConfig.groupLinks
  	}

  	axios.post(`${API_URL}/create-app`, body)
  		.then(res => {
  			axios.post(`${API_URL}/sidenav-config`, sidenav)
		  		.then(res2 => {
		  			M.toast({ html: res.data.message })
		  			window.location = '/'
		  		})
  		})
  }
}

const mapStateToProps = ({ user }) => ({
	user
})

const mapDispatchToProps = (dispatch) => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(CreateApp)
