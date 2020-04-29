var express = require('express');
var router = express.Router();
let User = require('../models/User');
let Department = require('../models/Department');
let Faculty = require('../models/Faculty');
let Course = require('../models/Course');
let Review = require('../models/Review');
let Message = require('../models/Message');
/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.render('construction', { title: 'Major Space' });
}); */

router.get('/', async(request, response) => {
  if (request.user) {
    let departments = await Department.query();
    response.render('welcome', { title: 'Major Space', user: request.user, departments });
  } else {
    response.render('welcome', {title: 'Major Space'});
  }
});



// Route to render the new review form
router.get('/newReview', async(request, response) => {
  if (!request.user) {
    response.redirect('/');
  }

  let departments = await Department.query().orderBy('name');
  let faculty = await Faculty.query().orderBy('name');
  let courses = await Course.query().orderBy('course_number');

  response.render('newReview', {user: request.user, departments, faculty, courses});
});

// Route to post a new review
router.post('/newReview', async(request, response) => {
  if (!request.user) {
    response.redirect('/');
  }

  let {department, courseNumber, courseTitle,
    faculty, description, review, rating} = request.body;

  if (courseNumber.includes(' ')) {
    return response.render('newReview', {spaceInCourseNumber: true});
  }
  let dbDepartment = await Department.query().findOne({name: department});
  let dbFaculty = await Faculty.query().findOne({name: faculty});
  let dbCourse;
  try {
    dbCourse = await Course.query().insert({
      departmentId: dbDepartment.id,
      courseNumber: courseNumber
    });
  } catch {
    dbCourse = await Course.query().findOne({'course_number': courseNumber});
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
  if (!request.user) {
    response.redirect('/');
  }
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
