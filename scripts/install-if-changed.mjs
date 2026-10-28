import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

// Remembers which package-lock.json node_modules was installed from.
// npm ci deletes node_modules, so the file is gone after every manual npm ci too.
const hashFile = 'node_modules/.package-lock.hash';

const lockHash = createHash('sha256')
  .update(readFileSync('package-lock.json'))
  .digest('hex');

let installedHash = null;
try {
  installedHash = readFileSync(hashFile, 'utf8');
} catch {
  // No hash yet → install
}

if (installedHash === lockHash) {
  console.log('Dependencies unchanged, skipping npm ci.');
} else {
  execSync('npm ci', { stdio: 'inherit' });
  writeFileSync(hashFile, lockHash);
}
