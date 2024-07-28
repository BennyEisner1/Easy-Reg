const express = require("express");
const router = express.Router();
const { storeReturnTo } = require("../middleware");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome");
      res.redirect("/courses");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};
module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  const redirectUrl = req.session.returnTo || "/courses";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/");
  });
};
