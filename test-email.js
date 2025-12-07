#!/usr/bin/env node
// Test email sending locally to debug the issue

const nodemailer = require('nodemailer');
require('dotenv').config({ path: './server/.env' });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

console.log('Testing email with:');
console.log('  Service:', EMAIL_SERVICE);
console.log('  User:', EMAIL_USER);
console.log('  Password length:', EMAIL_PASSWORD?.length, 'chars');

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  },
  logger: true,
  debug: true
});

console.log('\n--- Verifying transporter ---');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Transporter verification FAILED:');
    console.error('  Error:', error.message);
    console.error('  Code:', error.code);
    console.error('  Details:', error);
    process.exit(1);
  } else {
    console.log('✅ Transporter verification SUCCESS');
    
    console.log('\n--- Sending test email ---');
    transporter.sendMail({
      from: `"MORTALS Test" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: 'MORTALS - Test Email',
      text: 'This is a test email. If you receive this, nodemailer is working correctly.',
      html: '<h1>MORTALS Test</h1><p>This is a test email. If you receive this, nodemailer is working correctly.</p>'
    }, (err, info) => {
      if (err) {
        console.error('❌ Email send FAILED:');
        console.error('  Error:', err.message);
        console.error('  Code:', err.code);
        console.error('  Response:', err.response);
        console.error('  Details:', err);
        process.exit(1);
      } else {
        console.log('✅ Email send SUCCESS');
        console.log('  Response:', info.response);
        console.log('  Message ID:', info.messageId);
        process.exit(0);
      }
    });
  }
});
