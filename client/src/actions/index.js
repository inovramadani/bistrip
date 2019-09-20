import axios from 'axios';
import M from 'materialize-css/dist/js/materialize.min.js'

import API_URL from '../utils/api_url'
import * as TYPES from './types';

export const fetchUser = () => {
 	return (dispatch) => {
   axios.get('/api/current_user')
   	.then(res => {
		   dispatch({ type: TYPES.FETCH_USER, payload: {...res.data, isLoggedIn: res.data.googleId != null} });
   	})
	}
}

export const handleToken = (token) => {
 	return (dispatch) => {
	  axios.post('/api/stripe', token)
	  	.then(res => {
			  dispatch({ type: TYPES.ADD_CREDITS, payload: res.data })  		
	  	})
	}
}

export const setCollectionNavItem = () => {
	return (dispatch) => {
		axios.get(`${API_URL}/sidenav-links`)
			.then(res => {
				const collectionNavItem = {
					header: 'Collections',
					dividerBottom: true,
					links: res.data.data
				}

				dispatch({ type: TYPES.SET_COLLECTION_NAV_ITEM, collectionNavItem })
			})
			.catch(e => console.error(e))
	}
}

export const setDefaultNavItem = () => {
	return (dispatch) => {
		const defaultNavItem = {
			header: 'Setup',
			links: [
				{	name: 'collection-list',
					route: '/collection-list',
					icon: 'apps',
					text: 'Collections',
				},
				{	name: 'sidenav-setup',
					route: '/sidenav-setup',
					icon: 'settings',
					text: 'Sidenav',
				},
			],
			dividerBottom: false,
		}

		dispatch({ type: TYPES.SET_DEFAULT_NAV_ITEM , defaultNavItem })
	}
}


export const loadCollectionNavItemLinks = () => {
	return (dispatch) => {
		axios.get(`${API_URL}/sidenav-links`)
			.then(res => {
				dispatch({ type: TYPES.LOAD_COLLECTION_NAV_ITEM_LINKS, payload: res.data.data })
			})
			.catch(e => console.error(e))
	}
}

export const setSidenavAdmin = () => {
	return (dispatch) => {
		const defaultNavItem = {
			header: 'Admin',
			links: [
				{	name: 'user',
					route: '/user',
					icon: 'account_circle',
					text: 'User management',
				},
				{	name: 'settings',
					route: '/settings',
					icon: 'settings',
					text: 'Settings',
				},
			],
			dividerBottom: false,
		}

		// set sidenav admin will automatically unset default user sidenav
		// implemented directly in UserReducer.js
		dispatch({ type: TYPES.SET_ADMIN_SIDENAV_LINKS, defaultNavItem })
	}
}

export const setSidenavFromConfig = (collections, sidenavGroupLinks) => {
	return (dispatch) => {
		let collectionNavItem = undefined

		if (collections.length > 0 ) {
			collectionNavItem = {
				header: 'Collections',
				dividerBottom: true,
				links: [...collections]
			}
		}

		dispatch({ type: TYPES.SET_COLLECTION_NAV_ITEM, collectionNavItem })
		dispatch({ type: TYPES.SET_SIDENAV_GROUP_LINKS, sidenavGroupLinks })
		dispatch({ type: TYPES.SET_DEFAULT_NAV_ITEM , defaultNavItem: undefined })

	}
}

export const setSidenavGroupLinks = (sidenavGroupLinks) => {	
	return (dispatch) => {
		dispatch({ type: TYPES.SET_SIDENAV_GROUP_LINKS, sidenavGroupLinks })
	}
}

// save sidenav config in DB
export const saveSidenavConfig = (config) => {	
	return (dispatch) => {
		axios.post(`${API_URL}/sidenav-config`, config)
			.then(res => {M.toast({html: res.data.message})})
			.catch(e => console.error(e))	
	}
}

export const unsetSidenavFromConfig = () => {
	return (dispatch) => {
		dispatch({ type: TYPES.SET_SIDENAV_FROM_CONFIG, sidenav: undefined })
	}
}

export const loadSidenavConfig = (appName) => {
	return (dispatch) => {
		axios.get(`/api/sidenav-config?app_name=${appName}`)
			.then(res => {
				dispatch({ type: TYPES.LOAD_SIDENAV_CONFIG, sidenavConfig: res.data.data })
			})
			.catch(e => console.error(e))
	}
}

export const setApp = (appName) => {
	return (dispatch) => {
		dispatch({ type: TYPES.SET_APP, appName })
	}
}

export const setCollectionList = (collectionList) => {
	return (dispatch) => {
		dispatch({ type: TYPES.SET_COLLECTION_LIST, collectionList })
	}
}

export const setDummyManagerAndDepartment = () => {
	return (dispatch) => {
		const payload = {
			department: 'IT (dummy department)',
			manager: 'John The Dummy Manager'
		}

		dispatch({ type: TYPES.SET_DUMMY_MANAGER_AND_DEPARTMENT, payload })
	}
}
