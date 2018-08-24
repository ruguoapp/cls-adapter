import * as continuationLocalStorage from 'cls-hooked'
import * as uuid from 'uuid'

const DEFAULT_NAMESPACE = 'tracing'

export function getKoaMiddleware() {
  const namespace = this.createNamespace()

  return async function(ctx: any, next: Function) {
    await new Promise(
      namespace.bind(function(resolve: Function, reject: Function) {
        namespace.set('request_id', ctx.request.headers['x-request-id'] || uuid.v4())

        next()
          .then(resolve)
          .catch(reject)
      }),
    )
  }
}

export function setOnContext(key: string, value: any) {
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

export function destroyNamespace() {
  if (this._namespace) {
    continuationLocalStorage.destroyNamespace(DEFAULT_NAMESPACE)
    this._namespace = null
  }
}

export function createNamespace() {
  if (!this._namespace) {
    this._namespace = continuationLocalStorage.createNamespace(DEFAULT_NAMESPACE)
  }
  return this._namespace
}
