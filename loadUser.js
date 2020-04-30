let User = require('./models/User');
let Department = require('./models/Department');
let Faculty = require('./models/Faculty');


async function loadUser(req, res, next) {
  let userId = req.session.userId;

  res.locals.user = null;
  if (userId) {
    let user = await User.query().findById(userId);
    if (user.verifiedAt) {
      req.user = user;
      res.locals.user = req.user;
    } else {
      req.unverifiedUser = true;
      req.email = user.email;
    }
  }

  next();
}

module.exports = loadUser;
