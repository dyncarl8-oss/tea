
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env.local');

// Only load .env.local if not in production and it exists
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: envPath });
}

// Also mock verify that keys are present
console.log('Environment context:', process.env.NODE_ENV || 'development');
