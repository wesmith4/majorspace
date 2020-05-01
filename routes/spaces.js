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
  let user = request.user;
  let departments = await Department.query();
  let {departmentName} = request.params;
  console.log(request.params);
  let department = await Department.query().findOne({name: departmentName});

  let userBelongsToDepartment = await user.belongsToDepartment(department.name);
  console.log(`USER BELONGS TO ${department.name}: ${userBelongsToDepartment}`);

  let messages = await department.$relatedQuery('messages').where('parent_message_id',null).orderBy('created_at', 'desc');
  for (let message of messages) {
    message.replies = await message.$relatedQuery('children').orderBy('created_at', 'desc');
    let messageLikes = await message.$relatedQuery('likes');
    message.numLikes = messageLikes.length;
    if (message.replies) {
      message.numReplies = message.replies.length;
    }
    for (let reply of message.replies) {
      reply.user = await reply.$relatedQuery('user');
      reply.user.joined = reply.user.belongsToDepartment(department.name);
      let replyLikes = await reply.$relatedQuery('likes');
      reply.numLikes = replyLikes.length;

    }
    message.user = await message.$relatedQuery('user');
    message.user.joined = userBelongsToDepartment;
  }

  response.render('majorspace', {department, messages, title: department.name, user, departments, feedTab: true, userBelongsToDepartment});


});

router.get('/:departmentName/reviews', async(request, response) => {
  let departments = await Department.query();
  let department = await Department.query().findOne({name: request.params.departmentName});
  let reviews = await department.$relatedQuery('reviews');
  let user = request.user;
  let userBelongsToDepartment = await user.belongsToDepartment(department.name);
  for (let review of reviews) {
    review.user = await review.$relatedQuery('user');
    review.course = await review.$relatedQuery('course');
    review.faculty = await review.$relatedQuery('faculty');
  }

  response.render('majorspace', {user: request.user, departments, reviews, department, title: department.name, reviewsTab: true, userBelongsToDepartment});
});

router.get('/:departmentName/faculty', async(request, response) => {
  let departments = await Department.query();
  let department = await Department.query().findOne({name: request.params.departmentName});
  let faculty = await department.$relatedQuery('faculty');
  let user = request.user;
  let userBelongsToDepartment = await user.belongsToDepartment(department.name);

  // Sort faculty by last name
  faculty = faculty.sort((a,b) => {
    let nameListA = a.name.split(' ');
    let nameListB = b.name.split(' ');
    if (nameListA[nameListA.length - 1] === nameListB[nameListB.length - 1]) {
      return (nameListA[0] > nameListB[0] ? 1 : -1);
    } else {
      return (nameListA[nameListA.length - 1] > nameListB[nameListB.length - 1] ? 1 : -1);
    }
  });


  response.render('majorspace', {title: department.name, user: request.user, departments, department, faculty, facultyTab: true, userBelongsToDepartment});
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

router.get('/:departmentName/messages/:messageId/like', async(request, response) => {
  let department = await Department.query().findOne({name: request.params.departmentName});
  let user = request.user;
  let messageId = Number(request.params.messageId);

  let userLikes = await user.$relatedQuery('message_likes').where('message_id',messageId);
  if (userLikes.length === 0) {
    await user.$relatedQuery('message_likes').insert({
      messageId: messageId
    });
  } else {
    await user.$relatedQuery('message_likes').delete().where('message_id', messageId);
  }

  response.redirect(`/spaces/${department.name}`);
});

router.get('/:departmentName/join', async(request, response) => {
  let department = await Department.query().findOne({name: request.params.departmentName});
  let user = request.user;

  try {
    await user.$relatedQuery('departments').relate(department);
  } catch {
    console.log(`Failed to add department ${department.name} to user profile.`)
  }

  response.redirect(`/spaces/${department.name}`);
});

router.get('/:departmentName/leave', async(request, response) => {
  let department = await Department.query().findOne({name: request.params.departmentName});
  let user = request.user;
  try {
    await user.$relatedQuery('departments').unrelate().where('departments.name', department.name);
  } catch {
    console.log('Failed to unrelate user and department: ', department.name);
  }

  response.redirect(`/spaces/${department.name}`);
})

module.exports = router;
