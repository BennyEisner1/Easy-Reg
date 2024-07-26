const Course = require("../models/course");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
const findMaxWeightedSchedule = require("../public/javascripts/algorithm.js");
const getRatingColor = require("../utils/getRatingColor"); 
const { isLoggedIn } = require('../middleware'); 


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

module.exports.removeFromDash = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the course from the user's dashboardCourses
    user.dashboardCourses = user.dashboardCourses.filter(id => !id.equals(courseId));
    await user.save();

    res.json({ message: "Course removed from dashboard" });
  } catch (error) {
    console.error("Error removing course from dashboard:", error);
    res.status(500).json({ message: "Error removing course from dashboard", error: error.message });
  }
};

module.exports.addToDash = async (req, res) => {
  try {
      const { courseId } = req.body;
      const user = await User.findById(req.user._id);
      const course = await Course.findById(courseId);

      if (!course) {
          return res.status(404).json({ message: "Course not found" });
      }

      if (!user.dashboardCourses.includes(courseId)) {
          user.dashboardCourses.push(courseId);
          await user.save();
      }

      res.json({ message: "Course added to dashboard", course });
  } catch (error) {
      res.status(500).json({ message: "Error adding course to dashboard", error: error.message });
  }
};

module.exports.optimizer = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('dashboardCourses');
        const selectedCourses = {};
        user.dashboardCourses.forEach(course => {
            selectedCourses[course._id] = course;
        });
        res.render('courses/optimizer', { selectedCourses });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while loading the optimizer");
    }
}
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
exports.generateSchedule = async (req, res) => {
  try {
    const { courses, isRandomized } = req.body;
    
    // Check if courses is an object and convert it to an array if necessary
    const coursesArray = Array.isArray(courses) ? courses : Object.values(courses);
    
    if (!coursesArray || coursesArray.length === 0) {
      return res.status(400).json({ error: 'No courses provided' });
    }

    const parsedCourses = coursesArray.map((course) => {
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

    const { schedule, maxWeight } = findMaxWeightedSchedule(parsedCourses, isRandomized);
    res.json({ schedule, maxWeight });
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};