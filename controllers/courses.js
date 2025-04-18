const mongoose = require("mongoose");
const Course = require("../models/course");
const User = require("../models/user");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError");
const findMaxWeightedSchedule = require("../public/javascripts/algorithm.js");
const getRatingColor = require("../utils/getRatingColor");
const { isLoggedIn } = require("../middleware");

module.exports.listDepartments = async (req, res) => {
  try {
    const departmentsResult = await Course.aggregate([
      { $group: { _id: "$department" } },
      { $project: { _id: 0, department: "$_id" } },
      { $sort: { department: 1 } },
    ]);

    const departments = departmentsResult
      .map((d) => d.department)
      .filter(Boolean);
    res.render("courses/departments", { departments });
  } catch (error) {
    console.error("Error in listDepartments:", error);
    res.status(500).send("An error occurred while listing departments");
  }
};

module.exports.showDepartmentCourses = async (req, res) => {
  try {
    const { department } = req.params;

    const courses = await Course.find({ department: department });

    let userDashboardCourses = [];

    if (req.user) {
      const user = await User.findById(req.user._id).populate(
        "dashboardCourses"
      );
      userDashboardCourses = user.dashboardCourses.map((course) =>
        course._id.toString()
      );
    }

    courses.forEach((course) => {
      course.ratingColor = getRatingColor(course.student_rating);
    });

    res.render("courses/index", { courses, userDashboardCourses, department });
  } catch (error) {
    console.error("Error in showDepartmentCourses:", error);
    res.status(500).send("An error occurred while fetching courses");
  }
};

module.exports.index = async (req, res) => {
  const allCourses = await Course.find({});
  let userDashboardCourses = [];

  if (req.user) {
    const user = await User.findById(req.user._id).populate("dashboardCourses");
    userDashboardCourses = user.dashboardCourses.map((course) =>
      course._id.toString()
    );
  }

  const courses = allCourses.filter(
    (course) => !userDashboardCourses.includes(course._id.toString())
  );

  courses.forEach((course) => {
    course.ratingColor = getRatingColor(course.student_rating);
  });

  res.render("courses/index", { courses, userDashboardCourses });
};

module.exports.renderNew = (req, res) => {
  res.render("courses/new");
};

module.exports.createCourse = async (req, res, next) => {
  try {
    const course = new Course(req.body.course);
    course.author = req.user._id;
    await course.save();
    req.flash("success", "Successfully made a new course");
    res.redirect(`/courses/${course._id}`);
  } catch (error) {
    console.error("Error in createCourse:", error);
    req.flash("error", "An error occurred while creating the course");
    res.redirect("/courses");
  }
};

module.exports.showCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    if (!course) {
      req.flash("error", "Cannot find that course");
      return res.redirect("/courses");
    }
    res.render("courses/show", { course });
  } catch (error) {
    console.error("Error in showCourse:", error);
    req.flash("error", "An error occurred while fetching the course");
    res.redirect("/courses");
  }
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

    user.dashboardCourses = user.dashboardCourses.filter(
      (id) => !id.equals(courseId)
    );
    await user.save();

    res.json({ message: "Course removed from dashboard" });
  } catch (error) {
    console.error("Error removing course from dashboard:", error);
    res.status(500).json({
      message: "Error removing course from dashboard",
      error: error.message,
    });
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
    req.flash(
      "error",
      "You must be logged in to add courses to your dashboard"
    );
    res.status(500).json({
      message: "Error adding course to dashboard",
      error: error.message,
    });
  }
};

module.exports.optimizer = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("dashboardCourses");
    const selectedCourses = {};
    user.dashboardCourses.forEach((course) => {
      selectedCourses[course._id] = course;
    });
    res.render("courses/optimizer", { selectedCourses });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while loading the optimizer");
  }
};
module.exports.search = async (req, res) => {
  const query = req.query.q;
  const department = req.query.department;

  let searchCriteria = {};
  if (query) {
    searchCriteria.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { description: { $regex: new RegExp(query, "i") } },
    ];
  }
  if (department) {
    searchCriteria.department = department;
  }

  try {
    let results = await Course.find(searchCriteria);

    let userDashboardCourses = [];
    if (req.user) {
      const user = await User.findById(req.user._id).populate(
        "dashboardCourses"
      );
      userDashboardCourses = user.dashboardCourses.map((course) =>
        course._id.toString()
      );
    }

    results = results.filter(
      (course) => !userDashboardCourses.includes(course._id.toString())
    );

    results.forEach((course) => {
      course.ratingColor = getRatingColor(course.student_rating);
    });

    res.json(results);
  } catch (error) {
    console.error("Error in search:", error);
    res
      .status(500)
      .json({ error: "An error occurred while searching courses" });
  }
};

module.exports.generateSchedule = async (req, res) => {
  try {
    const { courses, isRandomized } = req.body;

    const coursesArray = Array.isArray(courses)
      ? courses
      : Object.values(courses);

    if (!coursesArray || coursesArray.length === 0) {
      return res.status(400).json({ error: "No courses provided" });
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

    const { schedule, maxWeight } = findMaxWeightedSchedule(
      parsedCourses,
      isRandomized
    );
    res.json({ schedule, maxWeight });
  } catch (error) {
    console.error("Error generating schedule:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

module.exports.allCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({});
    let userDashboardCourses = [];

    if (req.user) {
      const user = await User.findById(req.user._id).populate(
        "dashboardCourses"
      );
      userDashboardCourses = user.dashboardCourses.map((course) =>
        course._id.toString()
      );
    }

    res.render("courses/all-courses", { allCourses, userDashboardCourses });
  } catch (error) {
    console.error("Error in allCourses:", error);
    req.flash("error", "An error occurred while fetching courses");
    res.redirect("/");
  }
};
