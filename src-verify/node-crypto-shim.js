// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// Browser shim for the subset of `node:crypto` that the published APS SDK
// verify path actually uses: SHA-256 hashing (canonical.js, attribution.js,
// evidence-bundle.js), Ed25519 sign/verify over raw hex keys (crypto/keys.js),
// and randomBytes (verification/verify.js).
//
// This replaces ONLY the crypto primitive backend. Every line of APS
// verification logic (canonicalization, Merkle recomputation, claim-axis
// mapping, the keys.js DER-wrapping + length guards) is the SDK's own code,
// unchanged, running on top of this shim. The SDK's keys.js verify() is
// synchronous, so Ed25519 verify here must be synchronous too: @noble/ed25519
// v2 needs etc.sha512Sync set to enable its sync path.

import * as ed25519 from '@noble/ed25519'
import { sha256, sha512 } from '@noble/hashes/sha2'
import { Buffer } from 'buffer'

ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m))

function bytesToHex(bytes) {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0')
  return s
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16)
  return out
}

// Normalize createHash().update() / crypto.sign|verify() inputs to bytes.
// The SDK passes strings (utf8 or 'hex') and Buffers.
function toBytes(data, encoding) {
  if (data == null) return new Uint8Array(0)
  if (typeof data === 'string') {
    return encoding === 'hex' ? hexToBytes(data) : new TextEncoder().encode(data)
  }
  if (data instanceof Uint8Array) return data
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  return new Uint8Array(data)
}

export function createHash(algorithm) {
  if (algorithm !== 'sha256') throw new Error(`crypto-shim: unsupported hash "${algorithm}"`)
  const chunks = []
  return {
    update(data, encoding) {
      chunks.push(toBytes(data, encoding))
      return this
    },
    digest(enc) {
      let total = 0
      for (const c of chunks) total += c.length
      const buf = new Uint8Array(total)
      let o = 0
      for (const c of chunks) { buf.set(c, o); o += c.length }
      const h = sha256(buf)
      if (enc === 'hex') return bytesToHex(h)
      if (enc === 'base64') return Buffer.from(h).toString('base64')
      return Buffer.from(h)
    },
  }
}

export function randomBytes(n) {
  const b = new Uint8Array(n)
  ;(globalThis.crypto || crypto).getRandomValues(b)
  return Buffer.from(b)
}

// keys.js wraps a raw 32-byte Ed25519 key in a fixed-length DER prefix, then
// hands us {key: derBuffer, format:'der', type}. The raw key is the trailing
// 32 bytes regardless of the SPKI/PKCS8 prefix.
function rawFromDer(der) {
  const bytes = toBytes(der)
  return bytes.slice(bytes.length - 32)
}

function derWrapPublic(raw) {
  const prefix = hexToBytes('302a300506032b6570032100')
  const out = new Uint8Array(prefix.length + raw.length)
  out.set(prefix, 0)
  out.set(raw, prefix.length)
  return Buffer.from(out)
}

export function createPublicKey(input) {
  // Verify path: {key: derBuffer, format, type}
  if (input && input.key !== undefined) {
    const raw = rawFromDer(input.key)
    return { _type: 'public', _raw: raw, export: () => derWrapPublic(raw) }
  }
  // publicKeyFromPrivate path: a private keyObj -> derive the public key.
  if (input && input._type === 'private') {
    const raw = ed25519.getPublicKey(input._raw)
    return { _type: 'public', _raw: raw, export: () => derWrapPublic(raw) }
  }
  throw new Error('crypto-shim: unsupported createPublicKey input')
}

export function createPrivateKey(input) {
  if (input && input.key !== undefined) {
    return { _type: 'private', _raw: rawFromDer(input.key) }
  }
  throw new Error('crypto-shim: unsupported createPrivateKey input')
}

export function sign(_algorithm, message, keyObj) {
  return Buffer.from(ed25519.sign(toBytes(message), keyObj._raw))
}

export function verify(_algorithm, message, keyObj, signature) {
  try {
    return ed25519.verify(toBytes(signature), toBytes(message), keyObj._raw)
  } catch {
    return false
  }
}

export function generateKeyPairSync(_type, _opts) {
  const priv = ed25519.utils.randomPrivateKey()
  const pub = ed25519.getPublicKey(priv)
  // keys.js reads the trailing 32 bytes of each, so raw arrays are sufficient.
  return { publicKey: Buffer.from(pub), privateKey: Buffer.from(priv) }
}

export default {
  createHash,
  randomBytes,
  createPublicKey,
  createPrivateKey,
  sign,
  verify,
  generateKeyPairSync,
}
