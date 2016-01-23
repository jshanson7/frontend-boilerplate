
import { createStore, applyMiddleware, compose } from 'redux'
import { syncHistory } from 'redux-simple-router'
import { browserHistory } from 'react-router'

import { logger } from '../middleware'
import rootReducer from '../reducers'

export default function configure(initialState) {
  let create = createStore

  if (process.env.NODE_ENV === 'development') {
    create = compose(
      require('../containers/DevTools').default.instrument(),
      require('redux-devtools').persistState(
        window.location.href.match(/[?&]debug_session=([^&]+)\b/)
      )
    )(create)
  }

  if (window.devToolsExtension) {
    create = window.devToolsExtension()(create)
  }

  create = applyMiddleware(logger, syncHistory(browserHistory))(create)

  const store = create(rootReducer, initialState)

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers')
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
