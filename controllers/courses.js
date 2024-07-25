const Course = require("../models/course");
const ExpressError = require("../utils/ExpressError");
const findMaxWeightedSchedule = require("../public/javascripts/algorithm.js");
const getRatingColor = require("../utils/getRatingColor"); // Ensure this path is correct

module.exports.index = async (req, res) => {
  const courses = await Course.find({});
  courses.forEach((course) => {
    course.ratingColor = getRatingColor(course.student_rating);
  });
  res.render("courses/index", { courses });
};

module.exports.renderNew = (req, res) => {
  res.render("courses/new");
};

module.exports.createCourse = async (req, res, next) => {
  const course = new Course(req.body.course);
  course.author = req.user._id;
  await course.save();
  req.flash("success", "Successfully made a new course");
  res.redirect(`/courses/${course._id}`);
};

module.exports.showCourse = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("reviews")
    .populate("author");
  if (!course) {
    req.flash("error", "Cannot find that course");
    return res.redirect("/courses");
  }
  res.render("courses/show", { course });
};

module.exports.renderEdit = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    req.flash("error", "Cannot find that course");
    return res.redirect("/courses");
  }
  res.render("courses/edit", { course });
};

module.exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findByIdAndUpdate(id, { ...req.body.course });
  req.flash("success", "Successfully updated course");
  res.redirect(`/courses/${course._id}`);
};

module.exports.delete = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course.author.equals(req.user._id)) {
    req.flash("error", "You cannot edit a course you didn't create");
    return res.redirect(`/courses/${id}`);
  }
  await Course.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted course");
  res.redirect("/courses");
};

module.exports.removeFromDash = (req, res) => {
  const { courseIndex } = req.body;
  if (req.session.selectedCourses) {
    req.session.selectedCourses.splice(courseIndex, 1);
  }
  res.json({ success: true });
};

module.exports.addToDash = async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }
  if (!req.session.selectedCourses) {
    req.session.selectedCourses = [];
  }
  req.session.selectedCourses.push(course);
  res.json(course);
};

module.exports.optimizer = async (req, res) => {
  const selectedCourses = req.session.selectedCourses || [];
  res.render("courses/optimizer", { selectedCourses });
};

module.exports.search = async (req, res) => {
  const query = req.query.q;
  let results;
  if (query) {
    results = await Course.find({
      title: { $regex: `.*${query}.*`, $options: "i" },
    });
  } else {
    results = await Course.find({});
  }
  results.forEach((course) => {
    course.ratingColor = getRatingColor(course.student_rating);
  });
  res.json(results);
};

module.exports.generateSchedule = async (req, res) => {
  try {
    console.log("Session data:", req.session);
    if (!req.body.courses) {
      console.error("No courses in request");
      req.flash("error", "No courses provided");
      return res.status(400).json({ error: "No courses provided" });
    }
    console.log("Received request:", req.body);
    const courses = req.body.courses;
    console.log("Courses:", courses);
    const parsedCourses = courses.map((course) => {
      if (!course.times || course.times.length === 0) {
        throw new Error(`Course ${course.title} is missing times`);
      }
      return {
        ...course,
        times: course.times.map((time) => ({
          start_time: parseInt(time.start_time.replace(":", "")),
          end_time: parseInt(time.end_time.replace(":", "")),
          day: time.day,
        })),
      };
    });

    console.log("Parsed Courses with times:", parsedCourses);
    const { schedule, maxWeight } = findMaxWeightedSchedule(parsedCourses);
    const scheduleResult = [];
    schedule.forEach((item) => {
      const course = parsedCourses[item.courseIndex];
      course.times.forEach((time) => {
        scheduleResult.push({
          courseIndex: item.courseIndex,
          start: time.start_time,
          end: time.end_time,
          day: time.day,
        });
      });
    });
    console.log("Generated schedule:", scheduleResult);
    res.json({ schedule: scheduleResult });
  } catch (error) {
    console.error("Error generating schedule:", error);
    req.flash("error", "Internal Server Error");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
