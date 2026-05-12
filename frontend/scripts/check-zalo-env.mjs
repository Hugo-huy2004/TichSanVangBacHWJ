import fs from 'node:fs';
import path from 'node:path';

const readEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    fs.readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        return separator === -1
          ? [line, '']
          : [line.slice(0, separator), line.slice(separator + 1)];
      })
  );
};

const root = process.cwd();
const env = {
  ...readEnvFile(path.join(root, '.env')),
  ...readEnvFile(path.join(root, '.env.production')),
  ...process.env
};

const failures = [];
const apiBaseUrl = env.VITE_API_BASE_URL || '';
const miniAppId = env.VITE_ZALO_MINI_APP_ID || '';

if (!miniAppId) {
  failures.push('Missing VITE_ZALO_MINI_APP_ID.');
}

if (!apiBaseUrl) {
  failures.push('Missing VITE_API_BASE_URL.');
}

if (/localhost|127\.0\.0\.1/.test(apiBaseUrl)) {
  failures.push('VITE_API_BASE_URL must be a public HTTPS backend URL before deploying to Zalo.');
}

if (apiBaseUrl && !apiBaseUrl.startsWith('https://')) {
  failures.push('VITE_API_BASE_URL should use HTTPS for public Mini App usage.');
}

if (failures.length) {
  console.error('Zalo deploy preflight failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Zalo deploy preflight ok.');
