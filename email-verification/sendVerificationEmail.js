'use strict';
require('dotenv').config();
const mailgun = require('mailgun-js');
let crypto = require('crypto-random-string');

function sendVerificationEmail(email, token) {
  const mg = new mailgun({
    apiKey: process.env.MAILGUN_APIKEY,
    domain: process.env.DOMAIN
  });

  let link = `https://majorspace.net/user/verify?token=${token}&email=${to}`;
  const data = {
    from: 'Major Space <verify@majorspace.net>',
    to: email,
    subject: 'Verify your Major Space account',
    text: 'Testing message from Mailgun'
  };

  mg.messages().send(data, function(error, body) {
    console.log(body);
  });
}

module.exports = sendVerificationEmail;

if (require.main === module) {
  sendVerificationEmail('wismith@davidson.edu', crypto({length: 20}));
}
