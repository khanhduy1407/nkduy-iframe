# nkduy-iframe

A tiny [WebWorker][1] polyfill for the `file://` protocol

_Like [pseudo-worker][2] but using an `iframe` instead of `XMLHTTPRequest`.
This polyfill should be mostly spec-compliant and supports `importScripts`.
It should pretty much be a drop-in replacement, at least for modern browsers
which include a constructable `EventTarget` and `Promise`._

## Installation

``` sh
npm install nkduy-iframe
```

## Usage

You can use the polyfill from [unpkg.com](https://unpkg.com) __(recommended)__:

``` html
<script src="https://unpkg.com/nkduy-iframe/polyfill"></script>
```

... or include the polyfill in your Webpack build:

``` js
import "nkduy-iframe/polyfill"
```

... or use `IFrameWorker` programmatically:

``` js
import { IFrameWorker } from "nkduy-iframe"
```

The polyfill will automatically mount if the document is served via `file://`.

## Caveats

In Worker scripts, `importScripts` is a synchronous operation which will wait
for the script to be loaded and executed. While it's not possible to implement
this behavior as part of an `iframe`, the `importScripts` function that is
provided as part of this polyfill returns a `Promise` which can be awaited on.
Since awaiting a non-Promise is a no-op, using `await` on `importScripts` will
work in polyfilled and non-polyfilled environments.

## Motivation

The main reason this polyfill exists is that some users of [Docurial][3] need to distribute their documentation as static HTML files and
bundle it with their product. Users would browser the documentation locally,
using the `file://` protocol, which broke the search functionality of the
documentation, as search is implemented as part of a web worker. This polyfill
in combination with the [localsearch][4] plugin allows to use search on
the `file://` protocol.

  [1]: https://www.w3.org/TR/workers/
  [2]: https://github.com/nolanlawson/pseudo-worker
  [3]: https://github.com/khanhduy1407/docurial
  [4]: https://github.com/khanhduy1407/docums-localsearch
