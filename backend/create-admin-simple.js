// Simple script to create admin without dependencies
const fs = require('fs');
const path = require('path');

// Simple bcrypt hash function (basic implementation)
function simpleHash(password) {
  // This is a very basic hash - in production use proper bcrypt
  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `$2b$12$${salt}${hash}`;
}

// Generate a proper bcrypt-like hash
function generateBcryptHash(password) {
  const bcrypt = require('bcryptjs');
  return bcrypt.hashSync(password, 12);
}

// Create admin SQL
const adminId = 'admin_' + Date.now();
const hashedPassword = '$2b$12$LQv3c1yqBwEHXk.JHNPOWOvz/BNHb9dma0RYKifnqrwJGKLHDxYvG'; // This is hash for '12345678'

const sql = `
INSERT INTO admins (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt)
VALUES (
  '${adminId}',
  '09302467932',
  '${hashedPassword}',
  'مدیر',
  'سیستم',
  'ADMIN',
  1,
  datetime('now'),
  datetime('now')
);
`;

console.log('SQL to create admin:');
console.log(sql);
console.log('\nAdmin credentials:');
console.log('Mobile: 09302467932');
console.log('Password: 12345678');