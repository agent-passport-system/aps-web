// Runs run.mjs and compares its output with expected-output.txt byte for byte.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const out = execFileSync(process.execPath, ['run.mjs'], { encoding: 'utf8' })
const expected = readFileSync(new URL('./expected-output.txt', import.meta.url), 'utf8')
if (out !== expected) {
  console.log('run.mjs output differs from expected-output.txt')
  console.log(out)
  process.exit(1)
}
console.log('run.mjs output matches expected-output.txt')
