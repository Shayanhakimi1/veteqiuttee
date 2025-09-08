import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Looking for .env at:', path.join(__dirname, '.env'));

// Check if .env file exists
import fs from 'fs';
const envPath = path.join(__dirname, '.env');
console.log('File exists:', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('File content length:', content.length);
  console.log('File content (first 100 chars):', content.substring(0, 100));
  console.log('File content (hex):', Buffer.from(content).toString('hex').substring(0, 100));
}

console.log('Testing environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

console.log('\nAll process.env keys containing our variables:');
Object.keys(process.env).filter(key => 
  key.includes('DATABASE') || 
  key.includes('JWT') || 
  key.includes('PORT') ||
  key.includes('NODE_ENV')
).forEach(key => {
  console.log(`${key}: ${process.env[key]}`);
});