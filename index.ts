import * as continuationLocalStorage from 'cls-hooked'
import * as uuid from 'uuid'

export function getKoaMiddleware() {
  const namespace = this.createNamespace()

  return async function(ctx, next) {
    await new Promise(
      namespace.bind(function(resolve, reject) {
        namespace.set('request_id', ctx.request.headers['x-request-id'] || uuid.v4())

        next()
          .then(resolve)
          .catch(reject)
      }),
    )
  }
}

export function getExpressMiddleware() {
  const namespace = this.createNamespace()

  return (req, res, next) => {
    namespace.bindEmitter(req)
    namespace.bindEmitter(res)

    namespace.run(() => {
      namespace.set('request_id', req.headers['x-request-id'] || uuid.v4())

      next()
    })
  }
}

export function setOnContext(key, value) {
  const namespace = this.createNamespace()
  namespace.set(key, value)
}

export function getContextStorage() {
  if (this._namespace && this._namespace.active) {
    const { id, _ns_name, ...contextData } = this._namespace.active
    return contextData
  }

  return {}
}

export function getRequestId() {
  return this.getContextStorage().request_id
}

export function addContextStorageToInput() {
  return input => Object.assign({}, input, this.getContextStorage())
}

export function addRequestIdToInput() {
  return input => Object.assign({}, input, { request_id: this.getRequestId() })
}

export function destroyNamespace() {
  if (this._namespace) {
    continuationLocalStorage.destroyNamespace('tracing')
    this._namespace = null
  }
}

export function createNamespace() {
  if (!this._namespace) {
    this._namespace = continuationLocalStorage.createNamespace('tracing')
  }
  return this._namespace
}
