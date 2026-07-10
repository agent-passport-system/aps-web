// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// Browser entry for the offline evidence-bundle inspector. The verification is
// the published SDK's: verifyEvidenceBundle + computeClaimBoundaryReport,
// bundled unchanged from agent-passport-system@3.3.1 (see build-verify.mjs).
// The only logic added here is the exit_reason classification, copied verbatim
// from the SDK CLI's cmdVerifyBundle (src/cli/index.ts) so the report is
// byte-identical to `agent-passport verify-bundle --json`.

import { verifyEvidenceBundle, computeClaimBoundaryReport } from 'aps-sdk/evidence-bundle'

const UNKNOWN_AXES = { authority: 'UNKNOWN', action: 'UNKNOWN', revocation: 'UNKNOWN', evidence: 'UNKNOWN' }

// inspectBundle(parsedBundle, {strict?, now?}) -> {axes, overall, exit_reason, details}
// axes/overall/exit_reason match the CLI --json object exactly. `details`
// carries the SDK verifier's per-axis reason strings (not authored copy).
export function inspectBundle(parsed, opts = {}) {
  const strict = !!opts.strict
  const now = opts.now ? new Date(opts.now) : new Date()

  // Structural guard, matching the CLI's shape check -> exit 3.
  if (
    typeof parsed !== 'object' || parsed === null ||
    typeof parsed.signer_public_key !== 'string' ||
    typeof parsed.manifest !== 'object' ||
    !Array.isArray(parsed.members)
  ) {
    return { axes: { ...UNKNOWN_AXES }, overall: 'UNKNOWN', exit_reason: 'bundle_unreadable', details: {} }
  }

  const verification = verifyEvidenceBundle(parsed)
  if (!verification.signatureValid) {
    return { axes: { ...UNKNOWN_AXES }, overall: 'UNKNOWN', exit_reason: 'manifest_signature_failed', details: {} }
  }

  const report = computeClaimBoundaryReport(parsed, { verification, now })
  const states = [
    report.axes.authority.state, report.axes.action.state,
    report.axes.revocation.state, report.axes.evidence.state,
  ]
  let exit_reason = 'ok'
  if (states.includes('INVALID')) {
    exit_reason = 'axis_invalid'
  } else if (strict && (report.axes.authority.state === 'MISSING' || report.axes.evidence.state === 'MISSING')) {
    exit_reason = 'strict_missing'
  }

  return {
    axes: {
      authority: report.axes.authority.state,
      action: report.axes.action.state,
      revocation: report.axes.revocation.state,
      evidence: report.axes.evidence.state,
    },
    overall: report.overall,
    exit_reason,
    details: {
      authority: report.axes.authority.detail,
      action: report.axes.action.detail,
      revocation: report.axes.revocation.detail,
      evidence: report.axes.evidence.detail,
    },
  }
}
