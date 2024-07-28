const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const courses = require("../controllers/courses");
const {
  isLoggedIn,
  isAuthor,
  validateCourse,
  sanitizeUserInput,
} = require("../middleware");

router.get("/", catchAsync(courses.listDepartments));
router.get(
  "/department/:department",
  catchAsync(courses.showDepartmentCourses)
);

router.get("/search", catchAsync(courses.search));
router.get("/optimizer", isLoggedIn, catchAsync(courses.optimizer));
router.post("/generate-schedule", catchAsync(courses.generateSchedule));
router.post("/add-to-dashboard", isLoggedIn, catchAsync(courses.addToDash));
router.post("/remove-course", isLoggedIn, catchAsync(courses.removeFromDash));

router
  .route("/:id")
  .get(catchAsync(courses.showCourse))
  .put(
    isLoggedIn,
    isAuthor,
    validateCourse,
    sanitizeUserInput,
    catchAsync(courses.updateCourse)
  )
  .delete(isLoggedIn, isAuthor, sanitizeUserInput, catchAsync(courses.delete));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  sanitizeUserInput,
  catchAsync(courses.renderEdit)
);

module.exports = router;
