const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const courses = require("../controllers/courses");
const { isLoggedIn, isAuthor, validateCourse } = require("../middleware");




router.get("/", catchAsync(courses.index));

router.get("/new", isLoggedIn, courses.renderNew);

router.post("/", isLoggedIn, validateCourse, catchAsync(courses.createCourse));

router.get("/:id", catchAsync(courses.showCourse));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(courses.renderEdit));

router.put("/:id", isLoggedIn, isAuthor, validateCourse, catchAsync(courses.updateCourse));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(courses.delete));

router.get("/search", catchAsync(courses.search));

router.get("/optimizer", isLoggedIn, catchAsync(courses.optimizer));

router.post("/generate-schedule", catchAsync(courses.generateSchedule));

router.post("/add-to-dashboard", isLoggedIn, catchAsync(courses.addToDash));

router.post("/remove-course", courses.removeFromDash);

module.exports = router;
