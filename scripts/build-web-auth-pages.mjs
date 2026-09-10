import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');

function loadLocalEnvironment() {
  const environmentPath = resolve(projectDirectory, '.env.local');
  if (!existsSync(environmentPath)) return;

  for (const line of readFileSync(environmentPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnvironment();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl)) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL must be configured before building the web app.');
}
if (!supabaseAnonKey || supabaseAnonKey.length < 40) {
  throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY must be configured before building the web app.');
}

const templatePath = resolve(projectDirectory, 'web-auth', 'team-invite.html');
const outputPath = resolve(projectDirectory, 'dist', 'auth', 'team-invite.html');
const logoSource = resolve(projectDirectory, 'assets', 'website', 'rekoda-logo.png');
const logoOutput = resolve(projectDirectory, 'dist', 'rekoda-email-logo.png');

const page = readFileSync(templatePath, 'utf8')
  .replace('__SUPABASE_URL__', JSON.stringify(supabaseUrl))
  .replace('__SUPABASE_ANON_KEY__', JSON.stringify(supabaseAnonKey));

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, page, 'utf8');
copyFileSync(logoSource, logoOutput);

console.log('Generated lightweight team invitation page and email logo.');
