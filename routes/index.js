var express = require('express');
var router = express.Router();
let User = require('../models/User');
let Department = require('../models/Department');
let Faculty = require('../models/Faculty');
let Course = require('../models/Course');
let Review = require('../models/Review');

/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.render('construction', { title: 'Major Space' });
}); */

router.get('/', (request, response) => {
  if (request.user) {
    response.render('construction', { title: 'Major Space',user: request.user });
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

// Route to render the new review form
router.get('/newReview', async(request, response) => {
  let departments = await Department.query().orderBy('name');
  let faculty = await Faculty.query().orderBy('name');
  let courses = await Course.query().orderBy('course_number');

  response.render('newReview', {user: request.user, departments, faculty, courses});
});

// Route to post a new review
router.post('/newReview', async(request, response) => {
  let {department, courseNumber, courseTitle,
    faculty, description, review, rating} = request.body;
  let dbDepartment = await Department.query().findOne({name: department});
  let dbFaculty = await Faculty.query().findOne({name: faculty});
  let dbCourse;
  try {
    dbCourse = await Course.query().findOne({courseNumber: courseNumber});
  } catch {
    dbCourse = await Course.query().insert({
      departmentId: dbDepartment.id,
      courseNumber: courseNumber
    })
  }
  let newReview = await Review.query().insert({
    userId: request.user.id,
    courseId: dbCourse.id,
    courseTitle: courseTitle,
    departmentId: dbDepartment.id,
    facultyId: dbFaculty.id,
    description: description,
    review: review,
    rating: rating
  });

  if (newReview) {
    console.log(`New Review posted for ${courseNumber}: ${courseTitle} by ${request.user.firstName}}`);
    console.log('------------------------------------------');
    console.log('Form Data: ', request.body);
  }
  response.redirect('/');
});

// Route to show all reviews
router.get('/reviews', async(request, response) => {
  let user = request.user;
  let reviews = await Review.query();
  for (let each of reviews) {
    each.professor = each.$relatedQuery('faculty');
    each.department = each.$relatedQuery('departments');
    each.author = each.$relatedQuery('users');
  }

  response.render('allReviews', {user, reviews});
});


module.exports = router;
