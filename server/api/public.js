const express = require("express");
const User = require("../models/User");
const Item = require("../models/Item");
//const TeacherSchedule = require("../models/TeacherSchedule");
//const ParentBooking = require("../models/ParentBooking");

const router = express.Router();

/*router.get("/teachers", async (req, res) => {
  try {
    let query = req.query;
    const users = await User.getList({ pageNumber: query.pageNumber });
    const test = { test: 1 };
    res.json(test);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});*/

router.get("/get-teacher-list", async (req, res) => {
  try {
    const { pageNum } = req.query;
    const teacherList = await User.getTeacherList({ pageNum });
    res.json(teacherList);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

/*router.get("/get-teacher-schedule-list", async (req, res) => {
  try {
    const { teacherId, week } = req.query;
    const teacherScheduleList = await TeacherSchedule.getByTeacherId({
      teacherId,
      week
    });
    res.json(teacherScheduleList);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});*/

router.post("/sign-up", async (req, res) => {
  try {
    const { email, password, type, userGroup } = req.body;
    const result = await User.signUp({
      email,
      password,
      type,
      userGroup
    });
    /*if (result.type == "success") {
      let home = {};
      home[2] = "/parent/home";
      home[3] = "/teacher/home";
      home[4] = "/headteacher/home";
      User.findOne({ email, password }).then(user => {
        req.session.user = user;
        res.redirect(home[user.userGroup]);
      });
    }*/
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
      password
    });
    var result = { message: "請再嘗試", type: "error" };
    if (user) {
      if (!user.validated) {
        result = {
          message: "請先查閱您的郵箱，點擊鏈接啓動此帳號",
          type: "error"
        };
      } else if (user.deleted) {
        result = { message: "此帳號已被封鎖", type: "error" };
      } else {
        req.session.user = user;
        result = {
          message: "成功登入",
          type: "success",
          userGroup: user.userGroup
        };
      }
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get("/get-item-package-list", async (req, res) => {
  try {
    const packageList = await Item.getPackageList();
    res.json(packageList);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
