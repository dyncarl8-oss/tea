
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env.local
// Points to ../../.env.local relative to dist/server/config.js
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Also mock verify that keys are present
console.log('Environment loaded.');
