var express = require('express');
var router = express.Router();
let User = require('../models/User');
let crypto = require('crypto-random-string');
let sendVerificationEmail = require('../email-verification/sendVerificationEmail');
let isDavidsonEmail = require('../email-verification/isDavidsonEmail');

router.get('/sign-up', (request, response) => {
  if (request.user) {
    response.redirect('/');
  } else if (request.unverifiedUser) {
    response.redirect('/');
  } else {
    response.render('sign-up');
  }
})

router.post('/sign-up', async (request, response) => {
  let firstName = request.body.firstName;
  let lastName = request.body.lastName;
  let classYear = request.body.classYear;
  let email = request.body.email;
  let password = request.body.password;

  // Reject non-Davidson emails
  if (!isDavidsonEmail(email)) {
    response.render('sign-up', {invalidEmail: true});
  }

  let user;
  let token;
  try {
    user = await User.query().insert({
      firstName: firstName,
      lastName: lastName,
      classYear: classYear,
      email: email,
      password: password,
    });

    token = await user.$relatedQuery('token').insert({
      token: crypto({length: 20})
    });
  } catch {
    (err) => {
      console.log(err.stack);
    }
  }

  sendVerificationEmail(user.email, token.token);

  if (user) {
    request.session.userId = user.id;
    response.redirect('/');
  } else {
    response.render('sign-up');
  }
});

router.get('/resend', async(req,res) => {
  let user = await User.query().findOne({email: req.email});
  let newToken = crypto({length: 20});
  console.log('newToken: ', newToken);
  await user.$relatedQuery('token').patch({
    token: newToken
  });
  sendVerificationEmail(user.email, newToken);
  res.redirect('/');
});


router.get('/verify', async(request, response) => {
  let linkToken = request.query.token;
  let linkEmail = request.query.email;

  let user = await User.query().findOne({email: linkEmail});
  let userToken = await user.$relatedQuery('token');

  if (linkToken === userToken) {
    let currentTime = new Date();
    await User.query().patchAndFetchById(user.id, {
      verifiedAt: currentTime
    });
    response.redirect('/');
  } else {
    response.redirect('verificationPage', {errorInVerification: true});
  }
});


router.get('/sign-in', (request, response) => {
  if (request.user) {
    response.redirect('/');
  } else {
    response.render('sign-in');
  }
});

router.post('/sign-in', async (request, response) => {
  let email = request.body.email;
  let password = request.body.password;

  let user = await User.query().findOne({ email: email });
  let passwordValid = user && (await user.verifyPassword(password));

  if (passwordValid) {
    request.session.userId = user.id;

    response.redirect('/');
  } else {
    response.render('sign-in', { invalidLogin: true });
  }
});

router.post('/sign-out', (request, response) => {
  request.session.userId = null;
  response.redirect('/');
});


module.exports = router;
