import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'

import * as ACT from '../../actions'
import API_URL from '../../utils/api_url'
import appList from './AppList'
import './Apps.css'

class Apps extends Component {
  constructor(props) {
    super(props)

    this.state = {
      apps: appList
    }
  }

  render() {
    const { user } = this.props
    const { apps } = this.state

    return (
      <ul id="dropdown-apps" className="dropdown-content">
        {
          apps.map((app, index) => (
            <span key={index}>
            <li>
              <Link to={app.link} onClick={e => this.handleChangeApp(app.name)}>
                <i className="material-icons center">{app.icon}</i>
                {app.name}
              </Link>
            </li>
            </span>
          ))
        }
        {
          user.role_id >= 3 &&
          <span id="btn-create-new-app" 
            className="btn" 
            onClick={this.handleClickCreateNewApp} 
          >
            New app
          </span>
        }
      </ul>
    )
  }

  componentWillMount () {
    this.loadApps()
  }

  loadApps () {
    const { apps } = this.state

    axios.get(`${API_URL}/apps`)
      .then(res => {
        const newApps = [...apps, ...res.data.apps]
        this.setState({ apps: newApps })
      })
  }

  handleChangeApp = (appName) => {
    const { setApp, loadSidenavConfig } = this.props

    if (appName === 'Dashboard') {
      setApp('default')
      loadSidenavConfig('default')
    } else {
      setApp(appName)
      loadSidenavConfig(appName)
    }
  }

  handleClickCreateNewApp = () => {
    window.location = '/create-app'
  }
}

const mapStateToProps = ({ user }) => ({ 
  user
})

const mapDispatchToProps = (dispatch) => ({
  setApp: (appName) => dispatch(ACT.setApp(appName)),
  loadSidenavConfig: (appName) => dispatch(ACT.loadSidenavConfig(appName))
})

export default connect(mapStateToProps, mapDispatchToProps) (Apps);
