var express = require('express');
var router = express.Router();
let User = require('../models/User');

/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.render('construction', { title: 'Major Space' });
}); */

router.get('/', (request, response) => {
  if (request.user) {
    response.render('construction', { user: request.user });
  } else {
    response.redirect('/sign-in');
  }
  });

  router.get('/sign-up', (request, response) => {
  if (request.user) {
    response.redirect('/');
  } else {
    response.render('sign-up');
  }
  });

  router.post('/sign-up', async (request, response) => {
  let firstName = request.body.firstName;
  let lastName = request.body.lastName;
  let classYear = request.body.classYear;
  let email = request.body.email;
  let password = request.body.password;

  let user = await User.query().insert({
    firstName: firstName,
    lastName: lastName,
    classYear: classYear,
    email: email,
    password: password,
  });

  if (user) {
    request.session.userId = user.id;
    response.redirect('/');
  } else {
    response.render('sign-up');
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
