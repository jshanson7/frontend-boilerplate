
import { createStore, applyMiddleware, compose } from 'redux'
import { syncHistory } from 'redux-simple-router'
import { browserHistory } from 'react-router'

import { logger } from '../middleware'
import rootReducer from '../reducers'

const finalCreateStore = process.env.NODE_ENV === 'development'
  ? compose(
    require('../containers/DevTools').default.instrument(),
    require('redux-devtools').persistState(
      window.location.href.match(/[?&]debug_session=([^&]+)\b/)
    )
  )(createStore)
  : createStore

export default function configure(initialState) {
  const create = window.devToolsExtension
    ? window.devToolsExtension()(finalCreateStore)
    : finalCreateStore

  const createStoreWithMiddleware = applyMiddleware(
    logger,
    syncHistory(browserHistory)
  )(create)

  const store = createStoreWithMiddleware(rootReducer, initialState)

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers')
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
