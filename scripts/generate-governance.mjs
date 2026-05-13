#!/usr/bin/env node
/**
 * generate-governance.mjs — Generate signed governance blocks + aps.txt for aeoess.com
 * 
 * Usage: node scripts/generate-governance.mjs
 * 
 * Generates:
 * 1. Ed25519 keypair (saved to .keys/)
 * 2. Signed governance block for HTML embedding
 * 3. aps.txt for site-wide governance
 */

import {
  generateKeyPair, generateGovernanceBlock, generateApsTxt,
  renderGovernanceHTML, verifyGovernanceBlock
} from 'agent-passport-system';
import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const KEYS_DIR = join(ROOT, '.keys');
const WELL_KNOWN = join(ROOT, '.well-known');
const KEY_FILE = join(KEYS_DIR, 'governance.json');

const DOMAIN = 'aeoess.com';
const DID_PREFIX = 'did:aps:aeoess';

// Default terms for aeoess.com
const DEFAULT_TERMS = {
  inference: 'permitted',
  training: 'attribution_required',
  redistribution: 'permitted',
  caching: 'permitted'
};

async function main() {
  // 1. Load or generate keys
  let keys;
  if (existsSync(KEY_FILE)) {
    keys = JSON.parse(readFileSync(KEY_FILE, 'utf-8'));
    console.log('Loaded existing keypair');
  } else {
    keys = generateKeyPair();
    mkdirSync(KEYS_DIR, { recursive: true });
    writeFileSync(KEY_FILE, JSON.stringify(keys, null, 2));
    console.log('Generated new Ed25519 keypair → .keys/governance.json');
  }
  console.log(`Public key: ${keys.publicKey.slice(0, 40)}...`);


  // 2. Generate governance block for index.html
  const indexContent = readFileSync(join(ROOT, 'index.html'), 'utf-8');
  const block = generateGovernanceBlock({
    content: indexContent,
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    terms: DEFAULT_TERMS,
    revocationPolicy: {
      mechanism: 'aps_txt',
      endpoint: `https://${DOMAIN}/.well-known/aps.txt`
    }
  });
  console.log(`\nGovernance block generated (signed: ${!!block.signature})`);

  // 3. Render as HTML script tag
  const scriptTag = renderGovernanceHTML(block);
  writeFileSync(join(KEYS_DIR, 'governance-block.html'), scriptTag);
  console.log(`Script tag → .keys/governance-block.html (${scriptTag.length} chars)`);

  // 4. Block is signed — verification available via verifyGovernanceBlock(block, publicKey)
  console.log('Content hash:', block.content_hash.slice(0, 40) + '...');
  console.log('Source DID:', block.source_did);

  // 5. Generate aps.txt
  try {
    const apsTxt = generateApsTxt({
      did: `${DID_PREFIX}:governance`,
      domain: DOMAIN,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      defaults: DEFAULT_TERMS,
      paths: [
        { pattern: '/llms*.txt', terms: { inference: 'permitted', training: 'permitted', caching: 'permitted' } },
        { pattern: '/world.html', terms: { inference: 'permitted', training: 'denied', redistribution: 'denied' } }
      ]
    });
    mkdirSync(WELL_KNOWN, { recursive: true });
    writeFileSync(join(WELL_KNOWN, 'aps.txt'), apsTxt);
    console.log(`\naps.txt → .well-known/aps.txt`);
  } catch (e) {
    console.log(`\naps.txt generation failed: ${e.message}`);
    console.log('(Will create manually from governance block)');
  }


  // 6. Embed in all HTML pages
  const htmlFiles = readdirSync(ROOT).filter(f => f.endsWith('.html'));
  let embedded = 0;

  for (const file of htmlFiles) {
    const path = join(ROOT, file);
    let html = readFileSync(path, 'utf-8');
    
    // Skip if already has governance block
    if (html.includes('application/aps-governance+json')) {
      console.log(`  ${file}: already has governance block`);
      continue;
    }
    
    // Generate page-specific block
    const pageBlock = generateGovernanceBlock({
      content: html,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      terms: file === 'world.html' 
        ? { inference: 'permitted', training: 'denied', redistribution: 'denied', caching: 'permitted' }
        : DEFAULT_TERMS,
      revocationPolicy: {
        mechanism: 'aps_txt',
        endpoint: `https://${DOMAIN}/.well-known/aps.txt`
      }
    });
    
    const tag = renderGovernanceHTML(pageBlock);
    
    // Insert before </head>
    html = html.replace('</head>', tag + '\n</head>');
    writeFileSync(path, html);
    embedded++;
    console.log(`  ${file}: embedded ✅`);
  }

  console.log(`\n═══ Summary ═══`);
  console.log(`Pages with governance: ${embedded} new + ${htmlFiles.length - embedded} existing`);
  console.log(`Public key: ${keys.publicKey}`);
  console.log(`DID: ${DID_PREFIX}:governance`);
  console.log(`Terms: inference=${DEFAULT_TERMS.inference}, training=${DEFAULT_TERMS.training}`);
  console.log(`\nVerify: curl -s https://aeoess.com/ | grep aps-governance`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
