import { combineReducers } from 'redux';
import userReducer from './userReducer';
import formReducer from './formReducer';

export default combineReducers ({
  user: userReducer,
  form: formReducer
});
