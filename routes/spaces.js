let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Department = require('../models/Department');
let Faculty = require('../models/Faculty');
let Course = require('../models/Course');
let Review = require('../models/Review');

// Display all information for a department homepage
router.get('/:departmentName', async(request, response) => {
  let {departmentName} = request.params;
  console.log(request.params);
  let department = await Department.query().findOne({name: departmentName});

  let messages = await department.$relatedQuery('messages').orderBy('created_at', 'desc');
  messages = messages.filter(message => !message.parentMessageId).map(async message => {
    replies = await message.$relatedQuery('children').orderBy('created_at', 'desc');
    message.replies = replies;
    return message;
  });

  let faculty = await department.$relatedQuery('faculty').orderBy('name');
  let reviews = await department.$relatedQuery('reviews').orderBy('created_at', 'desc');
  reviews = Promise.all(reviews.map(async review => {
    review.course = await review.$relatedQuery('course');
    return review;
  }));
  let courses = await department.$relatedQuery('courses');
  let requests = await department.$relatedQuery('requests').orderBy('created_at', 'desc');

  console.log('Courses: ', courses);
  console.log('Messages: ', messages);
  console.log('Reviews: ', reviews);
  response.render('majorspace', {department, messages, faculty, reviews, courses, requests});
});

module.exports = router;
