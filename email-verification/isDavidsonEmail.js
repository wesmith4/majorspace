function isDavidsonEmail(email) {
  return email.split('@')[1] === 'davidson.edu';
}

module.exports = isDavidsonEmail;
