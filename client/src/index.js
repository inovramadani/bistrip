import 'materialize-css/dist/css/materialize.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';

import App from './containers/App';
import reducers from './reducers';

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, storeEnhancers(applyMiddleware(reduxThunk)))
window.store = store

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.querySelector('#root')
);
