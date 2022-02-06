/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Send a message from the worker to the parent window
 *
 * @param message - Message
 * @param origin - Target origin
 */
export function postMessage(message: any, origin: string) {
  parent.postMessage(message, origin || "*")
}

/**
 * Import one or more scripts into the worker's scope
 *
 * Note that due to JavaScript's event-driven nature `importScripts` cannot be
 * synchronous. For this reason, we diverge from the official spec here and
 * return a `Promise`, which is fulfilled when the scripts have loaded. The
 * caller can `await` the `Promise` to ensure that the scripts have loaded.
 *
 * @param urls - Script URLs to import
 *
 * @returns Promise returning with no result
 */
export function importScripts(...urls: string[]): Promise<void> {
  return urls.reduce((promise, url) => (
    promise.then(() => new Promise(resolve => {
      const script = document.createElement("script")
      script.src = url
      script.addEventListener("load", () => resolve())
      document.body.appendChild(script)
    }))
  ), Promise.resolve())
}
