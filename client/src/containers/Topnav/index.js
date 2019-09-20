import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Payments from './Payments'
import Sidenav from '../Sidenav/Sidenav'
import Apps from './Apps'
import UserMenu from './UserMenu'
import * as ACT from '../../actions'

import './Topnav.css'

class Topnav extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedItem: ''
    }
  }

  render() {
    const { isLoggedIn } = this.props.user
    const dropdown_menu_item = [
      <li key="1" className="non-hoverable"><Payments /></li>,
      <li key="2" className="non-hoverable" style={{padding: '15px'}}>Credits: {this.props.user.credits}</li>,
      <li key="3"><Link to="/profile">Profile</Link></li>,
      <li key="4"><a href="/api/logout">Logout</a></li>
    ]

    return (
      <nav>
        <Sidenav />
        <div className="nav-wrapper">
          <Link
            to={this.props.user ? '/dashboard' : '/'}
            onClick={this.setSidenavUser}
            className="brand-logo left"
          >
             BISTRIP
          </Link>
          {
            isLoggedIn &&
            <UserMenu
              className="right"
              item={dropdown_menu_item} 
            />
          }
          { this.renderMenuItem() }
          <Apps />
        </div>
      </nav>
    )
  }

  renderMenuItem() {
    const { selectedItem } = this.state

    switch (this.props.user.isLoggedIn) {
      case false:
        // return <ul className="right"><li><a href="/auth/google">Login with Google</a></li></ul>
        return <ul className="right"><li><a href="/">Login with Google</a></li></ul>
      case true:
        return ( 
          <ul className="right">
            <li>
              <span 
                className={`dropdown-trigger ${selectedItem === 'apps' ? "selected" : ""}`}
                data-target="dropdown-apps"
                onClick={this.handleClickApps}>
                Apps
              </span>
            </li>
            <li>
              <Link 
                className={selectedItem === 'admin' ? "selected" : ""} 
                to="/user" 
                onClick={this.handleClickAdmin}>
                Admin
              </Link>
            </li>
          </ul>
        )
      default:
        // return <ul className="right"><li><a href="/auth/google">Login With Google</a></li></ul>
        return <ul className="right"><li><a href="/">Login With Google</a></li></ul>
    }
  }

  handleClickApps = () => {
    this.setState({ selectedItem: 'apps' })
  }

  handleClickAdmin = () => {
    this.setSidenavAdmin()
    this.setState({ selectedItem: 'admin' })
  }

  setSidenavAdmin = () => {
    this.props.setApp('admin')
    this.props.loadSidenavConfig('admin')
  }
}

const mapStateToProps = ({ user }) => ({ user })

const mapDispatchToProps = (dispatch) => ({
  setApp: (appName) => dispatch(ACT.setApp(appName)),
  loadSidenavConfig: (appName) => dispatch(ACT.loadSidenavConfig(appName))
})

export default connect(mapStateToProps, mapDispatchToProps) (Topnav);
