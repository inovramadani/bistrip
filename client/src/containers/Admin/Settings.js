import React, { Component } from 'react'
import './Settings.css'

class Settings extends Component {

  render() {
    return (
      <div className="settings-page">
        <div className="row">
        	<div className="col s6">
        		<h5><strong>Company details</strong></h5>
        		<div className="card grey lighten-1 settings-card">
	        		<table className="settings-table">
	              <thead>
	                <tr><th>Item</th><th>Details</th></tr>
	              </thead>
	              <tbody>
	                <tr><td>Logo</td><td>Upload</td></tr>
	                <tr><td>Company Name</td><td>Bistrip</td></tr>
	                <tr><td>Address</td><td>Marina Bay Sans</td></tr>
	                <tr><td>Country</td><td>Singapore</td></tr>
	              </tbody>
	            </table>
	          </div>
        	</div>
        	<div className="col s6">
	        	<h5><strong>Portal administrator</strong></h5>
        		<div className="card grey lighten-1 settings-card portal-administrator">
		        	<table className="settings-table">
	              <thead>
	                <tr><th>Item</th><th>Details</th></tr>
	              </thead>
	              <tbody>
	                <tr><td>Name</td><td>Richard Roe</td></tr>
	                <tr><td>Email</td><td>RichardR@ntxte07.com</td></tr>
	                <tr><td>User ID</td><td>5c1c4dd9f783d945d868993e</td></tr>
	              </tbody>
	            </table>
            </div>
        	</div>
        </div>
        <div className="row">
        	<div className="col s6">
	        	<h5><strong>SMTP</strong></h5>
        		<div className="card grey lighten-1 settings-card">
		        	<table className="settings-table">
	              <thead>
	                <tr><th>Item</th><th>Details</th></tr>
	              </thead>
	              <tbody>
	                <tr><td>Server</td><td>Mail.ntxte07.com</td></tr>
	                <tr><td>Port</td><td>25</td></tr>
	              </tbody>
	            </table>
            </div>
        	</div>
        	<div className="col s6">
	        	<h5><strong>Database</strong></h5>
        		<div className="card grey lighten-1 settings-card database">
		        	<table className="settings-table">
	              <thead>
	                <tr><th>Item</th><th>Details</th></tr>
	              </thead>
	              <tbody>
	                <tr><td>MongoURI</td><td>mongodb://uri:here@ds153552.mlab.com:53552/flowngin-dev</td></tr>
	              </tbody>
	            </table>
            </div>
        	</div>
        </div>
      </div>
    );
  }
};

export default Settings
