import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const files = [];
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.local'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await visit(file);
    else if (/\.(mjs|js)$/.test(entry.name)) files.push(file);
  }
}
await visit(root);
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) { console.error(result.stderr); process.exit(1); }
}
const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
if (!html.includes('lang="ru"')) throw new Error('Missing Russian document language');
if (/WebAppData=chat|autologin_token=[^<\s]+/.test(html)) throw new Error('Private source-session data in UI');
for (const match of html.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)) {
  if (/^(?:https?:|data:|mailto:)/.test(match[1])) continue;
  await access(path.resolve(root, 'dist', match[1].replace(/^\//, '')));
}
for (const file of files.filter(file => file.startsWith(path.join(root, 'dist') + path.sep))) {
  const code = await readFile(file, 'utf8');
  for (const match of code.matchAll(/(?:from\s*|import\s*)["'](\.\.?\/[^"']+)["']/g)) {
    await access(path.resolve(path.dirname(file), match[1]));
  }
}
console.log(`Syntax checked: ${files.length} files. HTML entry checked.`);
