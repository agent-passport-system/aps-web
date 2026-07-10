// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// esbuild `inject` target: makes free `Buffer` references in the SDK's keys.js
// (Buffer.from / Buffer.concat, for DER key assembly) resolve to the browser
// buffer polyfill.
import { Buffer } from 'buffer'
export { Buffer }
