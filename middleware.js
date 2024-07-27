const { body, validationResult } = require('express-validator');
const { courseSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Course = require("./models/course");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "you must be signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ExpressError(errorMessages.join(', '), 400);
  }
  next();
};

module.exports.validateReview = [
  body('review.rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review.body').trim().notEmpty().withMessage('Review body cannot be empty').escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map(err => err.msg).join(', ');
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  }
];

module.exports.validateCourse = [
  body('course.title').trim().notEmpty().withMessage('Course title cannot be empty').escape(),
  body('course.description').trim().notEmpty().withMessage('Course description cannot be empty').escape(),
  body('course.department').trim().notEmpty().withMessage('Department cannot be empty').escape(),
  body('course.code').trim().notEmpty().withMessage('Course code cannot be empty').escape(),
  body('course.student_rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Student rating must be between 0 and 5'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map(err => err.msg).join(', ');
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  }
];
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/courses/${id}`);
  }
  next();
};

module.exports.sanitizeUserInput = [
  body('*').trim().escape()
];