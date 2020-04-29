let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Department = require('../models/Department');
let Faculty = require('../models/Faculty');
let Course = require('../models/Course');
let Review = require('../models/Review');
let Message = require('../models/Message');


router.get('/', async(request, response) => {

});


// Display all information for a department homepage
router.get('/:departmentName', async(request, response) => {
  let departments = await Department.query();
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
  let links = await department.$relatedQuery('links');
  let reviews = await department.$relatedQuery('reviews').orderBy('created_at', 'desc');
  for (let each of reviews) {
    each.course = await each.$relatedQuery('course');
    each.faculty = await each.$relatedQuery('faculty');
  }


  let courses = await department.$relatedQuery('courses');
  let requests = await department.$relatedQuery('requests').orderBy('created_at', 'desc');

  console.log('Courses: ', courses);
  console.log('Messages: ', messages);
  console.log('Reviews: ', reviews);
  response.render('majorspace', {department, messages, faculty, links, reviews, courses, requests, title: department.name, user: request.user, departments});
});



router.post('/:departmentName/messages', async(request, response) => {
  let user = request.user;
  let department = await Department.query().findOne({name: request.params.departmentName});

  let {subject, messageBody, isQuestion} = request.body;
  let newMessage = await department.$relatedQuery('messages').insert({
    userId: user.id,
    subject: subject,
    messageBody: messageBody,
    isQuestion: isQuestion
  });

  console.log(`New message ${subject} posted by ${user.firstName}`);
  response.redirect(`/spaces/${department.name}`)
});

router.post('/:departmentName/messages/:messageId/reply', async(request, response) => {
  let user = request.user;
  let department = await Department.query().findOne({name: request.params.departmentName});
  let parentMessage = await Message.query().findById(Number(request.params.messageId));

  let {messageBody} = request.body;
  let subject = parentMessage.subject;

  let newReply = await parentMessage.$relatedQuery('children').insert({
    userId: user.id,
    departmentId: department.id,
    subject: subject,
    messageBody: messageBody
  });

  response.redirect(`/spaces/${department.name}`);
});

module.exports = router;
