const express = require("express");
const router = express.Router();

const passport = require("passport");

// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateTaskInput = require("../../validation/task");
// Load Profile Model
const Profile = require("../../models/Profile");
// Load User Model
const User = require("../../models/User");

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["isCrew"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Private Admin
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user.isCrew) {
      return res.status(400).json("Unauthorized");
    }

    const errors = {};
    console.log(req.user);
    Profile.find({ adminName: req.user.userName })
      .populate("user", ["isCrew"])
      .then(profiles => {
        if (!profiles) {
          errors.noprofile = "There are no profiles";
          return res.status(404).json(errors);
        }

        res.json(profiles);
      })
      .catch(err => res.status(404).json({ profile: "There are no profiles" }));
  }
);

// @route   GET api/profile/crew/:handle
// @desc    Get profile by handle name using Admin user
// @access  Private Admin

router.get(
  "/crew/:handle",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    if (req.user.isCrew) {
      return res.status(400).json("Unauthorized");
    }

    Profile.findOne({ handle: req.params.handle })
      .populate("user", ["isCrew"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          res.status(404).json(errors);
        } else if (profile.adminName != req.user.userName) {
          errors.crew = "Unauthorized user";
          res.status(400).json(errors);
        } else {
          res.json(profile);
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }
    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.handle = req.user.userName;
    if (req.body.adminName) profileFields.adminName = req.body.adminName;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.fullName) profileFields.fullName = req.body.fullName;
    if (req.body.position) profileFields.position = req.body.position;
    if (req.body.email) profileFields.email = req.body.email;
    if (req.body.hourlyRate) profileFields.hourlyRate = req.body.hourlyRate;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route   POST api/profile/task/:handle
// @desc    Add task to crew
// @access  Private Admin
router.post(
  "/task/:handle",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateTaskInput(req.body);

    if (req.user.isCrew) {
      return res.status(400).json("Unauthorized");
    }
    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ handle: req.params.handle }).then(profile => {
      const newTask = {
        title: req.body.title,
        definition: req.body.definition
      };
      const exisTask = profile.task
        .map(item => item.title)
        .indexOf(newTask.title);
      if (exisTask >= 0) {
        return res.status(400).json("Task title already exists");
      }
      // Add to task array
      profile.task.unshift(newTask);

      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   POST api/profile/task/
// @desc    Add task using crew
// @access  Private Crew
router.post(
  "/task",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateTaskInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newTask = {
        title: req.body.title,
        definition: req.body.definition
      };
      const exisTask = profile.task
        .map(item => item.title)
        .indexOf(newTask.title);
      if (exisTask >= 0) {
        return res.status(400).json("Task title already exists");
      }

      // Add to task array
      profile.task.unshift(newTask);

      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   POST api/profile/start/:start_title
// @desc    Update started task
// @access  Private Crew
router.post(
  "/start/:task_title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      const currTask = profile.task
        .map(item => item.title)
        .indexOf(req.params.task_title);

      profile.task[currTask].started = req.body.started;

      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   POST api/profile/end/:start_title
// @desc    Update end task
// @access  Private Crew
router.post(
  "/end/:task_title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      const currTask = profile.task
        .map(item => item.title)
        .indexOf(req.params.task_title);

      profile.task[currTask].end = req.body.end;

      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   DELETE api/profile/task/:exp_title
// @desc    Delete title from profile
// @access  Private Crew
router.delete(
  "/task/:task_title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove task
        const removeTask = profile.task
          .map(item => item.title)
          .indexOf(req.params.task_title);

        // Splice out of array
        profile.task.splice(removeTask, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

// @route   DELETE api/profile
// @desc    Delete crew user and profile
// @access  Private Admin
router.delete(
  "/admin/:handle",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user.isCrew) {
      return res.status(400).json("Unauthorized");
    }
    Profile.find({ adminName: req.user.userName }).then(profile => {
      const checkHandle = profile
        .map(item => item.handle)
        .indexOf(req.params.handle);

      if (checkHandle < 0) {
        return res.status(404).json("Crew Not Found");
      } else {
        Profile.findOneAndRemove({ handle: req.params.handle }).then(() => {
          User.findOneAndRemove({ userName: req.params.handle }).then(() =>
            res.json({ success: true })
          );
        });
      }
    });
  }
);

module.exports = router;
