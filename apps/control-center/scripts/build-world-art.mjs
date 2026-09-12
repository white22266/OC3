import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(scriptDir, 'world-art');
const outputPath = join(scriptDir, '..', 'public', 'world', 'company-world.webp');
const EXPECTED_SHA256 = 'ddddd27086498314c0d36471cdae5781ee2401092bfb2e25bffb849288a499ae';
const EXPECTED_MIN_BYTES = 240_000;

const sourceFiles = (await readdir(sourceDir))
  .filter((name) => /^source-\d{2}\.b64$/.test(name))
  .sort();

if (sourceFiles.length !== 17) {
  throw new Error(`Expected 17 company-world source chunks, found ${sourceFiles.length}`);
}

const base64 = (await Promise.all(
  sourceFiles.map((name) => readFile(join(sourceDir, name), 'utf8')),
)).join('').replace(/\s+/g, '');

const artwork = Buffer.from(base64, 'base64');
const sha256 = createHash('sha256').update(artwork).digest('hex');

if (artwork.byteLength < EXPECTED_MIN_BYTES) {
  throw new Error(`Company-world artwork is truncated (${artwork.byteLength} bytes)`);
}
if (artwork.subarray(0, 4).toString('ascii') !== 'RIFF' || artwork.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('Company-world artwork is not a valid WebP container');
}
if (sha256 !== EXPECTED_SHA256) {
  throw new Error(`Company-world artwork checksum mismatch: ${sha256}`);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, artwork);
console.log(`[OC3] Company World artwork ready: ${artwork.byteLength} bytes (${sha256.slice(0, 12)}…)`);
