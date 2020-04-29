let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Department = require('../models/Department');
let Faculty = require('../models/Faculty');
let Course = require('../models/Course');
let Review = require('../models/Review');
let Message = require('../models/Message');

// Display all information for a department homepage
router.get('/:departmentName', async(request, response) => {
  let departments = await Department.query();
  let {departmentName} = request.params;
  console.log(request.params);
  let department = await Department.query().findOne({name: departmentName});

  let messages = await department.$relatedQuery('messages').where('parent_message_id',null).orderBy('created_at', 'desc');
  for (let message of messages) {
    message.replies = await message.$relatedQuery('children').orderBy('created_at', 'desc');
    for (let reply of message.replies) {
      reply.user = reply.$relatedQuery('user');
    }
    message.user = await message.$relatedQuery('user');
  }
  response.render('majorspace', {department, messages, title: department.name, user: request.user, departments, feedTab: true});
});

router.get('/:departmentName/reviews', async(request, response) => {
  let departments = await Department.query();
  let department = await Department.query().findOne({name: request.params.departmentName});
  let reviews = await department.$relatedQuery('reviews');
  for (let review of reviews) {
    review.course = await review.$relatedQuery('course');
    review.faculty = await review.$relatedQuery('faculty');
  }

  response.render('majorspace', {user: request.user, departments, reviewsTab: true, reviews, department, title: department.name});
});

router.get('/:departmentName/faculty', async(request, response) => {
  let departments = await Department.query();
  let department = await Department.query().findOne({name: request.params.departmentName});
  let faculty = await department.$relatedQuery('faculty');

  response.render('majorspace', {title: department.name, user: request.user, departments, department, faculty, facultyTab: true});
});



router.post('/:departmentName/messages', async(request, response) => {
  let user = request.user;
  let department = await Department.query().findOne({name: request.params.departmentName});

  let {subject, messageBody, isQuestion} = request.body;
  console.log(request.body);

  let questionBoolean = (isQuestion ? 1 : 0);
  let newMessage = await department.$relatedQuery('messages').insert({
    userId: user.id,
    subject: subject,
    messageBody: messageBody,
    isQuestion: questionBoolean
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
