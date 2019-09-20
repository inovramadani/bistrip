import React, { Component } from 'react'
import M from 'materialize-css/dist/js/materialize.min.js'
import { connect } from 'react-redux'

import './UserMenu.css'

class UserMenu extends Component {
	render() {
		return (
			<span className={this.props.className + " user-menu-container dropdown-trigger"} 
				 data-target="dropdown-user-menu">
		    <ul id="dropdown-user-menu" className="dropdown-content">
		      {this.props.item}
		    </ul>
		  	{this.props.user.firstname}
		  </span>
		)
	}
	
	componentDidMount() {
		// materialize css initialization
		M.AutoInit()
	}
}


UserMenu.defaultProps = {
	user: {
		firstname: 'User'
	}
}

function mapStateToProps({ user }) {
  return { user }
}

export default connect(mapStateToProps, null) (UserMenu);