import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch {
  try {
    bcrypt = require('bcrypt');
  } catch {
    console.log('No bcrypt library found, generating new hash instead...');
    process.exit(1);
  }
}

const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjTa6T8AfMi';
console.log('Hash in DB:', hash);
console.log('Admin@123 matches:', bcrypt.compareSync('Admin@123', hash));
console.log('123456    matches:', bcrypt.compareSync('123456', hash));
console.log('admin123  matches:', bcrypt.compareSync('admin123', hash));
