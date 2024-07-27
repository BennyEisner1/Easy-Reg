const Course = require("../models/course");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");



module.exports.createReview = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ExpressError("Course not found", 404);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    course.reviews.push(review);
    await review.save();
    await course.save();
    req.flash("success", "Created new review");
    res.redirect(`/courses/${course._id}`);
  }

  module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Course.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/courses/${id}`);
  }


