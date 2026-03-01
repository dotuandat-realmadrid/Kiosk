// server/utils/auth.util.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = 12;

// Validate email
function validateEmail(email) {
  return validator.isEmail(email);
}

// Validate password
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar;
}

// Validate phone
function validatePhone(phone) {
  // Vietnamese phone format
  return /^(0|\+84)[0-9]{9,10}$/.test(phone);
}

// Hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verify password
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate Access Token
function generateAccessToken(user_id, username, roles) {
  return jwt.sign(
    { user_id, username, roles, type: 'access' },
    JWT_SECRET,
    { expiresIn: '30m' }
  );
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  hashPassword,
  verifyPassword,
  generateAccessToken,
  JWT_SECRET
};