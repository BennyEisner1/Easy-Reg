const Course = require("../models/course");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

module.exports.createReview = async (req, res, next) => {
  try {
    let reviewData = req.body.review;

    if (typeof reviewData === "string") {
      try {
        reviewData = JSON.parse(reviewData);
      } catch (e) {
        console.error("Error parsing review data:", e);
        return next(new ExpressError("Invalid review data", 400));
      }
    }

    if (typeof reviewData !== "object") {
      reviewData = req.body;
    }

    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new ExpressError("Course not found", 404));
    }
    const review = new Review(reviewData);
    review.author = req.user._id;
    course.reviews.push(review);
    await review.save();
    await course.save();
    req.flash("success", "Created new review");
    res.redirect(`/courses/${course._id}`);
  } catch (error) {
    console.error("Error in createReview:", error);
    next(error);
  }
};
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Course.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/courses/${id}`);
};
