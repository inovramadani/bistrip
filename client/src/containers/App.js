import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from '../actions'
import './App.css'

import Topnav from './Topnav'
import User from './Admin/User'
import Settings from './Admin/Settings'
import DataInput from './Collection/DataInput'
import SampleCollectionPage from '../components/SampleCollectionPage'
import CollectionPage from './Collection/CollectionPage'
import RecordPage from './Collection/RecordPage'
import CollectionList from './Collection/CollectionList'
import ExternalCollectionPage from './Collection/ExternalCollectionPage'
import SidenavSetup from './Sidenav/SidenavSetup'
import CreateForm from './Form/CreateForm'
import Dashboard from './Dashboard'
import Landing from './LandingPage'
import ProfilePage from './ProfilePage'
import CreateApp from './Apps/CreateApp'
import AppSettings from './Apps/AppSettings'
import UploadForm from './UploadForm'

class App extends Component {

  render() {
    return (
        <BrowserRouter>
        <div className="container">
          <Topnav />
          <Route exact path="/" component={Landing} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/user" component={User} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/data-input" component={DataInput} />
          <Route exact path="/sample-collection" component={SampleCollectionPage} />
          <Route exact path="/collection" component={CollectionPage} />
          <Route exact path="/record" component={RecordPage} />
          <Route exact path="/collection-list" component={CollectionList} />
          <Route exact path="/create-form" component={CreateForm} />
          <Route exact path="/profile" component={ProfilePage} />
          <Route exact path="/sidenav-setup" component={SidenavSetup} />
          <Route exact path="/external-collection" component={ExternalCollectionPage} />
          <Route exact path="/create-app" component={CreateApp} />
          <Route exact path="/app-settings" component={AppSettings} />
          <Route exact path="/upload-form" component={UploadForm} />
        </div>

        </BrowserRouter>
    );
  }

  componentWillMount() {
    this.props.fetchUser()
    this.props.setApp('default')
  }
};

export default connect(null, actions)(App)
