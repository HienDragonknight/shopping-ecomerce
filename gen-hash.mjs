import bcrypt from 'bcryptjs';

const adminPw = 'Admin@123';
const customerPw = '123456';

const adminHash = bcrypt.hashSync(adminPw, 10);
const customerHash = bcrypt.hashSync(customerPw, 10);

console.log('=== CORRECT HASHES ===');
console.log(`Admin@123 hash: ${adminHash}`);
console.log(`123456 hash:    ${customerHash}`);
console.log('');
console.log('=== VERIFICATION ===');
console.log(`Admin@123 matches: ${bcrypt.compareSync(adminPw, adminHash)}`);
console.log(`123456 matches:    ${bcrypt.compareSync(customerPw, customerHash)}`);
console.log('');
// Also test against current DB hash
const currentDbHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjTa6T8AfMi';
console.log('=== CURRENT DB HASH TEST ===');
console.log(`Admin@123 vs DB hash: ${bcrypt.compareSync(adminPw, currentDbHash)}`);
console.log(`123456 vs DB hash:    ${bcrypt.compareSync(customerPw, currentDbHash)}`);

// Print SQL to fix
console.log('\n=== SQL TO RUN ===');
console.log(`UPDATE users SET password = '${adminHash}' WHERE email = 'admin@fashion.com';`);
console.log(`UPDATE users SET password = '${customerHash}' WHERE email IN ('customer@test.com', 'test2@test.com');`);
