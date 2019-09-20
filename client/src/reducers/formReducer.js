import * as TYPES from '../actions/types';

const initialState = {
	collectionList: [],
}

export default function (state = initialState, action) {
  switch (action.type) {
    case TYPES.SET_COLLECTION_LIST:
      return { ...state, collectionList: action.collectionList }

    default:
      return state;
  }
}
