let User = require('./models/User');
let Department = require('./models/Department');
let Faculty = require('./models/Faculty');


async function loadUser(req, res, next) {
  let userId = req.session.userId;


  res.locals.user = null;
  req.user = null;


  if (userId) {
    let user = await User.query().findById(userId);
    if (user) {
      if (user.verifiedAt || process.env.BYPASS) {
        console.log('USER is VERIFIED');
        req.user = user;
        res.locals.user = req.user;
      } else {
        console.log('User is not verified');
        req.unverifiedUser = true;
        req.email = user.email;
      }
    } else {
      console.log('NO USER EXISTS FOR CURRENT USER_ID');
      req.session.userId = null;
    }
  }
  next();
}

module.exports = loadUser;
