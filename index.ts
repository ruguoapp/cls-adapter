import * as continuationLocalStorage from 'cls-hooked'
import { Namespace } from 'cls-hooked'
import { v4 as uuid } from 'uuid'
import { Context } from 'koa'

const DEFAULT_NAMESPACE = 'tracing'

export function getKoaMiddleware() {
  const namespace = this.createNamespace()
  return async function(ctx: Context, next: Function) {
    await new Promise(
      namespace.bind(async function(resolve: Function, reject: Function) {
        namespace.set('request_id', ctx.request.headers['x-request-id'] || uuid())
        try {
          resolve(await next())
        } catch (err) {
          reject(err)
        }
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

export function getRequestId(): string {
  return this.getContextStorage().request_id
}

export function destroyNamespace() {
  if (this._namespace) {
    continuationLocalStorage.destroyNamespace(DEFAULT_NAMESPACE)
    this._namespace = null
  }
}

export function createNamespace(): Namespace {
  if (!this._namespace) {
    this._namespace = continuationLocalStorage.createNamespace(DEFAULT_NAMESPACE)
  }
  return this._namespace
}
