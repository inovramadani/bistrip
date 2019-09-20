import * as TYPES from '../actions/types';

const initialState = {
	isLoggedIn: false,
}

export default function (state = initialState, action) {
  switch (action.type) {
    case TYPES.FETCH_USER:
      return { ...state, ...action.payload }

    case TYPES.ADD_CREDITS:
      return { ...state, ...action.payload }
    
    case TYPES.SET_APP: {
      const { appName } = action
      return { ...state, appName }
    }

    case TYPES.LOAD_COLLECTION_NAV_ITEM_LINKS: {
      const newCollectionNavItem = { 
        ...state.collectionNavItem, 
        links: action.payload 
      }

      return { 
        ...state, 
        collectionNavItem: newCollectionNavItem
      }
    }

    case TYPES.SET_DEFAULT_NAV_ITEM: {
      const { defaultNavItem } = action
      return { ...state, defaultNavItem }
    }

    case TYPES.SET_ADMIN_SIDENAV_LINKS: {
    	const { defaultNavItem } = action
    	return { 
        ...state, 
        collectionNavItem: undefined, 
        defaultNavItem 
      }
    }

    case TYPES.SET_COLLECTION_NAV_ITEM : {
    	const { collectionNavItem } = action
    	return { ...state, collectionNavItem }
    }

    case TYPES.SET_SIDENAV_FROM_CONFIG : {
      const { sidenavGroupLinks } = action
      return { ...state, sidenavGroupLinks }
    }

    case TYPES.SET_SIDENAV_GROUP_LINKS : {
      const { sidenavGroupLinks } = action
      return { ...state, sidenavGroupLinks }
    }
      
    case TYPES.LOAD_SIDENAV_CONFIG: {
      const { sidenavConfig } = action
      return { ...state, sidenavConfig }
    }

    case TYPES.SET_DUMMY_MANAGER_AND_DEPARTMENT: {
      const { department, manager } = action.payload
      return { ...state, department, manager }
    }

    default:
      return state;
  }
}
