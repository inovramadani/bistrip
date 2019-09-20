import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'
import axios from 'axios'
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../../utils/api_url'
import * as ACT from '../../actions'
import { openCloseModal } from '../../utils/helperFunctions'
import ModalConfirmation from '../../components/ModalConfirmation'
import './AppSettings.css'

class AppSettings extends Component {
	state = {
    appName: '',
    appIcon: '',
    users: [],
    selectedUsers: [],
    isAppNameOk: false,
    isAppLoaded: false,
    isAppNameChanged: false
	}

  render() {
  	const { 
      appName, 
      appIcon, 
      users, 
      selectedUsers, 
      isAppNameOk,
      isAppLoaded,
      isAppNameChanged
  	} = this.state

    return (
      <div className="app-settings-page">
        <h4 className="title">App settings</h4>
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
              <div className="btn-update-container">
  			    		<span className="btn btn-action-app" 
  			        	onClick={this.handleClickUpdateApp}
  			        	disabled={!isAppNameOk}>
  			        	Update
  			      	</span>
              </div>
              <div>
                <span className="btn btn-action-app red" 
                  disabled={!isAppLoaded}
                  onClick={this.handleClickDeleteApp}>
                  Delete
                </span>
              </div>
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
				        <span className="btn btn-check-app-name" 
                  onClick={this.handleClickCheckAppName}
                  disabled={!isAppNameChanged}>
                  Check
                </span>
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
								        	className="filled-in browser-default" 
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

        <ModalConfirmation 
          id='modal-confirm-delete-app'
          contentClass='center'
          title='Delete app'
          text='Are you sure you want to delete this app?'
          showOkButton={true}
          showCancelButton={true}
          onConfirm={this.handleConfirmDeleteApp}
        />
      </div>
    )
  }

  componentWillMount () {
    this.loadAppSettings()
    this.loadUsers()
  }

  componentDidMount () {
    M.AutoInit()
  }

  loadAppSettings () {
    const { user } = this.props
    const { appName } = user

    axios.get(`${API_URL}/app?app_name=${appName}`)
      .then(res => {
        const { app } = res.data
        const { _id, name, icon, userList } = app

        this.setState({
          appId: _id,
          appName: name,
          appIcon: icon,
          selectedUsers: userList,
          isAppNameOk: true,
          isAppLoaded: true
        })
      })
  }

  loadUsers () {
  	axios.get(`${API_URL}/users`)
  		.then(res => {
  			const users = res.data
  			this.setState({ users })
  		})
  }

  handleChangeAppName = ({ target }) => {
  	this.setState({ 
      appName: target.value,
      isAppNameOk: false,
      isAppNameChanged: true
    })
  }

  handleChangeAppIcon = ({ target }) => {
  	this.setState({ appIcon: target.value })
  }

  handleClickCheckAppName = () => {
  	const { appName, appId } = this.state

  	axios.get(`${API_URL}/check-app-name?name=${appName}&id=${appId}`)
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
  			this.setState({ isAppNameOk, isAppNameChanged: false })
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

  handleClickUpdateApp = () => {
    const { 
      appId,
      appName, 
      appIcon,
      selectedUsers 
    } = this.state

  	const body = {
  		name: appName,
  		icon: appIcon,
  		userList: selectedUsers
  	}

  	axios.patch(`${API_URL}/update-app?id=${appId}`, body)
  		.then(res => {
  			M.toast({ html: res.data.message })
  			window.location = '/'
  		})
  }

  handleClickDeleteApp = () => {
    openCloseModal('modal-confirm-delete-app', 'open')
  }

  handleConfirmDeleteApp = () => {
    const { appId } = this.state
    const { setApp, loadSidenavConfig } = this.props

    axios.delete(`${API_URL}/app?id=${appId}`)
      .then(res => {
        M.toast({ html: res.data.message })
        setApp('default')
        loadSidenavConfig('default')
        window.location = '/'
      })
  }
}

const mapStateToProps = ({ user }) => ({
	user
})

const mapDispatchToProps = (dispatch) => ({
  setApp: (appName) => dispatch(ACT.setApp(appName)),
  loadSidenavConfig: (appName) => dispatch(ACT.loadSidenavConfig(appName))
})

export default connect(mapStateToProps, mapDispatchToProps)(AppSettings)
