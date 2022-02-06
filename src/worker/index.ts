import { importScripts, postMessage } from "./runtime"

/* ----------------------------------------------------------------------------
 * Helper functions
 * ------------------------------------------------------------------------- */

/**
 * Create an invisible `iframe`
 *
 * @returns Element
 */
function createIFrameHost(): HTMLIFrameElement {
  const iframe = document.createElement("iframe")
  iframe.width = iframe.height = iframe.frameBorder = "0"
  return iframe
}

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

/**
 * A tiny and mostly spec-compliant WebWorker polyfill
 *
 * This WebWorker polyfill is implemented on top of an `iframe` element to allow
 * web workers in contexts when `XMLHTTPRequest` is not available or blocked by
 * the browser, e.g. when using the `file:` protocol. Note that this polyfill
 * cannot provide asynchronous workers, as iframes are synchronous by nature.
 */
export class IFrameWorker implements Worker {

  public addEventListener: Worker["addEventListener"]
  public removeEventListener: Worker["removeEventListener"]
  public dispatchEvent: Worker["dispatchEvent"]

  public onerror: Worker["onerror"] = null
  public onmessage: Worker["onmessage"] = null
  public onmessageerror: Worker["onmessageerror"] = null

  /**
   * The `iframe` we'll use to simulate a worker
   */
  public iframe: HTMLIFrameElement

  /**
   * A promise indicating whether the `iframe` was initialized
   */
  protected ready: Promise<unknown>

  /**
   * Create a new worker from the given URL
   *
   * @param url - Worker script URL
   * @param options - Worker options
   */
  public constructor(
    protected url: string | URL, options?: WorkerOptions
  ) {
    if (typeof options !== "undefined")
      throw new TypeError("Options are not supported for iframe workers")
    const target = new EventTarget()

    /* Delegate event handling to internal target */
    this.addEventListener    = target.addEventListener.bind(target)
    this.removeEventListener = target.removeEventListener.bind(target)
    this.dispatchEvent       = target.dispatchEvent.bind(target)

    /* Create iframe to host the worker script */
    document.body.appendChild(this.iframe = createIFrameHost())

    /* Initialize runtime and worker script */
    this.worker.document.open()
    this.worker.document.write(`
      <html>
        <body>
          <script>
            postMessage = ${postMessage}
            importScripts = ${importScripts}
            addEventListener("error", function(ev) {
              parent.dispatchEvent(new ErrorEvent("error", {
                filename: "${url}",
                error: ev.error
              }))
            })
          </script>
          <script src="${url}?${+Date.now()}"></script>
        </body>
      </html>
    `)
    this.worker.document.close()

    /* Register internal listeners and track iframe state */
    window.addEventListener("message", this.handleMessage)
    window.onerror = this.handleError as OnErrorEventHandler
    this.ready = new Promise((resolve, reject) => {
      this.worker.onload = resolve
      this.worker.onerror = reject
    })
  }

  /**
   * Immediately terminate the worker
   */
  public terminate(): void {
    document.body.removeChild(this.iframe)

    /* Unregister internal listeners */
    window.removeEventListener("message", this.handleMessage)
    window.onerror = null
  }

  /**
   * Send a message to the worker
   *
   * @param data - Message data
   */
  public postMessage(data: unknown): void {
    void this.ready
      .catch()
      .then(() => {
        this.worker.dispatchEvent(
          new MessageEvent("message", { data })
        )
      })
  }

  /**
   * Helper to retrieve the content window of the `iframe`
   *
   * If the window doesn't exist, e.g. when the `iframe` has been removed by
   * terminating the web worker, an error is thrown.
   *
   * @returns Window
   */
  protected get worker(): Window {
    /* istanbul ignore if: no idea when this might happen, PR if you do */
    if (!this.iframe.contentWindow)
      throw new ReferenceError("Invalid iframe: expected window to be present")
    return this.iframe.contentWindow
  }

  /**
   * Internal listener that proxies message events
   *
   * @param ev - Message event
   */
  protected handleMessage = (ev: MessageEvent): void => {
    if (ev.source === this.worker) {
      ev.stopImmediatePropagation()
      this.dispatchEvent(new MessageEvent("message", { data: ev.data }))
      if (this.onmessage)
        this.onmessage(ev)
    }
  }

  /**
   * Internal listener that proxies error events
   *
   * @param message - Error message
   * @param filename - Source filename
   * @param lineno - Source line number
   * @param colno - Source column number
   * @param error - Error object
   */
  protected handleError = (
    message?: string, filename?: string,
    lineno?: number, colno?: number,
    error?: Error
  ): void => {
    /* istanbul ignore else: will terminate jasmine */
    if (filename === this.url.toString()) {
      const ev = new ErrorEvent("error", {
        message, filename, lineno, colno, error
      })
      this.dispatchEvent(ev)
      if (this.onerror)
        this.onerror(ev)
    }
  }
}
