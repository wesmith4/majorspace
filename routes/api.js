var express = require('express');
var router = express.Router();
let User = require('../models/User');
let Department = require('../models/Department');
let Faculty = require('../models/Faculty');
let Course = require('../models/Course');
let Review = require('../models/Review');
let Message = require('../models/Message');
let crypto = require('crypto-random-string');
let sendVerificationEmail = require('../email-verification/sendVerificationEmail');
let isDavidsonEmail = require('../email-verification/isDavidsonEmail');

// ============ AUTH ROUTES ============

// GET /api/auth/me - Get current user
router.get('/auth/me', (req, res) => {
  if (req.user) {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        classYear: req.user.classYear,
        availableAsMentor: req.user.availableAsMentor,
        verifiedAt: req.user.verifiedAt,
      },
    });
  } else if (req.unverifiedUser) {
    res.json({ unverified: true, email: req.email });
  } else {
    res.json({ user: null });
  }
});

// POST /api/auth/sign-in
router.post('/auth/sign-in', async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await User.query().findOne({ email });
    let passwordValid = user && (await user.verifyPassword(password));
    if (passwordValid) {
      req.session.userId = user.id;
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
  } catch (err) {
    console.error('Sign-in error:', err);
    res.status(500).json({ success: false, error: 'An error occurred.' });
  }
});

// POST /api/auth/sign-up
router.post('/auth/sign-up', async (req, res) => {
  let { firstName, lastName, classYear, email, password } = req.body;

  if (!isDavidsonEmail(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email. Must be a valid "@davidson.edu" email address.' });
  }

  try {
    let existingUser = await User.query().findOne({ email });
    if (existingUser) {
      req.session.userId = existingUser.id;
      return res.json({ success: true });
    }

    let user = await User.query().insert({
      firstName, lastName, classYear, email, password,
    });

    let token = await user.$relatedQuery('token').insert({
      token: crypto({ length: 20 }),
    });

    try {
      sendVerificationEmail(user.email, token.token);
    } catch (emailErr) {
      console.log('Email send failed (non-critical):', emailErr.message);
    }

    req.session.userId = user.id;
    res.json({ success: true });
  } catch (err) {
    console.error('Sign-up error:', err);
    res.status(500).json({ success: false, error: 'Error creating account.' });
  }
});

// POST /api/auth/sign-out
router.post('/auth/sign-out', (req, res) => {
  req.session.userId = null;
  res.json({ success: true });
});

// ============ DEPARTMENT ROUTES ============

// GET /api/departments
router.get('/departments', async (req, res) => {
  try {
    let departments = await Department.query().orderBy('name');
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments.' });
  }
});

// ============ FACULTY ROUTES ============

// GET /api/faculty
router.get('/faculty', async (req, res) => {
  try {
    let faculty = await Faculty.query().orderBy('name');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch faculty.' });
  }
});

// ============ COURSE ROUTES ============

// GET /api/courses
router.get('/courses', async (req, res) => {
  try {
    let courses = await Course.query().orderBy('course_number');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// ============ REVIEW ROUTES ============

// POST /api/reviews
router.post('/reviews', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  let { department, courseNumber, courseTitle, faculty, description, review, rating, semester } = req.body;

  if (courseNumber.includes(' ')) {
    return res.status(400).json({ error: 'Course number cannot have a space.' });
  }

  try {
    let dbDepartment = await Department.query().findOne({ name: department });
    let dbFaculty = await Faculty.query().findOne({ name: faculty });

    let dbCourse;
    try {
      dbCourse = await Course.query().insert({
        departmentId: dbDepartment.id,
        courseNumber: courseNumber,
      });
    } catch {
      dbCourse = await Course.query().findOne({ 'course_number': courseNumber });
    }

    let newReview = await Review.query().insert({
      userId: req.user.id,
      courseId: dbCourse.id,
      courseTitle: courseTitle,
      departmentId: dbDepartment.id,
      facultyId: dbFaculty.id,
      description: description,
      review: review,
      rating: rating,
      semester: semester,
    });

    res.json({ success: true, review: newReview });
  } catch (err) {
    console.error('Review creation error:', err);
    res.status(500).json({ error: 'Failed to create review.' });
  }
});

// ============ SPACES ROUTES ============

// GET /api/spaces/:departmentName - Feed data
router.get('/spaces/:departmentName', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    let department = await Department.query().findOne({ name: req.params.departmentName });
    if (!department) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    let userBelongsToDepartment = await req.user.belongsToDepartment(department.name);

    let messages = await department.$relatedQuery('messages')
      .where('parent_message_id', null)
      .orderBy('created_at', 'desc');

    for (let message of messages) {
      message.replies = await message.$relatedQuery('children').orderBy('created_at', 'desc');
      let messageLikes = await message.$relatedQuery('likes');
      message.numLikes = messageLikes.length;
      message.numReplies = message.replies ? message.replies.length : 0;

      for (let reply of message.replies) {
        reply.user = await reply.$relatedQuery('user');
        let replyLikes = await reply.$relatedQuery('likes');
        reply.numLikes = replyLikes.length;
      }

      message.user = await message.$relatedQuery('user');
    }

    res.json({ department, messages, userBelongsToDepartment });
  } catch (err) {
    console.error('Space fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch space data.' });
  }
});

// GET /api/spaces/:departmentName/reviews
router.get('/spaces/:departmentName/reviews', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    let department = await Department.query().findOne({ name: req.params.departmentName });
    if (!department) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    let reviews = await department.$relatedQuery('reviews');
    for (let review of reviews) {
      review.user = await review.$relatedQuery('user');
      review.course = await review.$relatedQuery('course');
      review.faculty = await review.$relatedQuery('faculty');
    }

    res.json({ reviews });
  } catch (err) {
    console.error('Reviews fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// GET /api/spaces/:departmentName/faculty
router.get('/spaces/:departmentName/faculty', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    let department = await Department.query().findOne({ name: req.params.departmentName });
    if (!department) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    let faculty = await department.$relatedQuery('faculty');

    // Sort by last name
    faculty = faculty.sort((a, b) => {
      let nameListA = a.name.split(' ');
      let nameListB = b.name.split(' ');
      if (nameListA[nameListA.length - 1] === nameListB[nameListB.length - 1]) {
        return nameListA[0] > nameListB[0] ? 1 : -1;
      }
      return nameListA[nameListA.length - 1] > nameListB[nameListB.length - 1] ? 1 : -1;
    });

    res.json({ faculty });
  } catch (err) {
    console.error('Faculty fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch faculty.' });
  }
});

// POST /api/spaces/:departmentName/messages
router.post('/spaces/:departmentName/messages', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    let department = await Department.query().findOne({ name: req.params.departmentName });
    let { subject, messageBody, isQuestion } = req.body;
    let questionBoolean = isQuestion ? 1 : 0;

    let newMessage = await department.$relatedQuery('messages').insert({
      userId: req.user.id,
      subject: subject,
      messageBody: messageBody,
      isQuestion: questionBoolean,
    });

    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.error('Message creation error:', err);
    res.status(500).json({ error: 'Failed to post message.' });
  }
});

// POST /api/spaces/:departmentName/messages/:messageId/reply
router.post('/spaces/:departmentName/messages/:messageId/reply', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    let department = await Department.query().findOne({ name: req.params.departmentName });
    let parentMessage = await Message.query().findById(Number(req.params.messageId));
    let { messageBody } = req.body;

    let newReply = await parentMessage.$relatedQuery('children').insert({
      userId: req.user.id,
      departmentId: department.id,
      subject: parentMessage.subject,
      messageBody: messageBody,
    });

    res.json({ success: true, reply: newReply });
  } catch (err) {
    console.error('Reply creation error:', err);
    res.status(500).json({ error: 'Failed to post reply.' });
  }
});

// POST /api/spaces/:departmentName/messages/:messageId/like
router.post('/spaces/:departmentName/messages/:messageId/like', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    let messageId = Number(req.params.messageId);
    let userLikes = await req.user.$relatedQuery('message_likes').where('message_id', messageId);

    if (userLikes.length === 0) {
      await req.user.$relatedQuery('message_likes').insert({ messageId: messageId });
    } else {
      await req.user.$relatedQuery('message_likes').delete().where('message_id', messageId);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Like toggle error:', err);
    res.status(500).json({ error: 'Failed to toggle like.' });
  }
});

// POST /api/spaces/:departmentName/join
router.post('/spaces/:departmentName/join', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    let department = await Department.query().findOne({ name: req.params.departmentName });
    await req.user.$relatedQuery('departments').relate(department);
    res.json({ success: true });
  } catch (err) {
    console.log('Join failed:', err.message);
    res.json({ success: true }); // Already joined
  }
});

// POST /api/spaces/:departmentName/leave
router.post('/spaces/:departmentName/leave', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    let department = await Department.query().findOne({ name: req.params.departmentName });
    await req.user.$relatedQuery('departments').unrelate().where('departments.name', department.name);
    res.json({ success: true });
  } catch (err) {
    console.log('Leave failed:', err.message);
    res.status(500).json({ error: 'Failed to leave department.' });
  }
});

module.exports = router;
