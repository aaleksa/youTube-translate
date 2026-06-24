import * as esbuild from 'esbuild';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const handlersDir = new URL('../src/handlers', import.meta.url).pathname;

function collectHandlers(dir, prefix = '') {
  const entries = readdirSync(dir);
  const handlers = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relPath = prefix ? `${prefix}/${entry}` : entry;

    if (statSync(fullPath).isDirectory()) {
      handlers.push(...collectHandlers(fullPath, relPath));
      continue;
    }

    if (entry.endsWith('.ts')) {
      if (relPath === 'api/handler') continue;
      handlers.push(relPath.replace(/\.ts$/, ''));
    }
  }

  return handlers;
}

const handlers = collectHandlers(handlersDir);

await esbuild.build({
  entryPoints: ['src/handlers/api/handler.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: 'dist/api/handler.js',
  external: ['@aws-sdk/*', 'aws-jwt-verify', 'bcryptjs', 'google-auth-library'],
  sourcemap: true,
});

await esbuild.build({
  entryPoints: handlers.map((name) => `src/handlers/${name}.ts`),
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outdir: 'dist',
  outbase: 'src/handlers',
  external: ['@aws-sdk/*', 'aws-jwt-verify', 'bcryptjs', 'google-auth-library'],
  sourcemap: true,
});

console.log(`Built API router and ${handlers.length} Lambda handlers.`);
