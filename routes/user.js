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
    response.render('sign-up', {title: 'Major Space'});
  }
});

router.post('/sign-up', async (request, response) => {
  let firstName = request.body.firstName;
  let lastName = request.body.lastName;
  let classYear = request.body.classYear;
  let email = request.body.email;
  let password = request.body.password;

  // Reject non-Davidson emails
  if (!isDavidsonEmail(email)) {
    response.render('sign-up', {invalidEmail: true, title: 'Major Space'});
  } else {
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
      response.render('sign-up', {title: 'Major Space'});
    }
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

  let userId = request.session.userId;
  let linkToken = request.query.token;

  console.log('USER ID: ----- ', userId);

  let user = await User.query().findById(userId);

  if (!user) {
    console.log('~~~~~~ USER IS NULL');
    request.session.userId = null;
  } else {
    console.log('~~~~~ We have a user');
    console.log('~~~~~~ The link token is ', linkToken);
    let userToken = await user.$relatedQuery('token');
    console.log('~~~~~ The user token is ', userToken.token);

    if (await user.isValidVerificationToken(linkToken)) {
      console.log('~~~~~ Link Token is equal to User TOken');
      await user.$query().patch({
        verifiedAt: new Date(),
      });
      console.log('~~~~~~ We have patched the user to authorize');
    }
  }

  console.log('~~~~~ About to redirect to home page');
  response.redirect('/');
});


router.get('/sign-in', (request, response) => {
  if (request.user) {
    response.redirect('/');
  } else {
    response.render('sign-in', {title: 'Major Space'});
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
    response.render('sign-in', { invalidLogin: true , title: 'Major Space'});
  }
});

router.post('/sign-out', (request, response) => {
  request.session.userId = null;
  response.redirect('/');
});


module.exports = router;
