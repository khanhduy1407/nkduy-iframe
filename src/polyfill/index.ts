import { IFrameWorker } from "../worker"

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

declare global {
  interface Window {
    IFrameWorker: typeof IFrameWorker
  }
}

/* ----------------------------------------------------------------------------
 * Polyfill
 * ------------------------------------------------------------------------- */

window.IFrameWorker = IFrameWorker
if (location.protocol === "file:")
  window.Worker = IFrameWorker
