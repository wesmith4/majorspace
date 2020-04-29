let User = require('./models/User');

async function loadUser(req, res, next) {
  let userId = req.session.userId;

  res.locals.user = null;
  if (userId) {
    let user = await User.query().findById(userId);
    if (user.verifiedAt) {
      req.user = await User.query().findById(userId);
      res.locals.user = req.user;
    }
  }

  next();
}

module.exports = loadUser;
