const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn } = require("../middleware.js");

const catchAsync = require("../utils/catchAsync");
const reviews = require("../controllers/reviews");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", catchAsync(reviews.deleteReview));

module.exports = router;
