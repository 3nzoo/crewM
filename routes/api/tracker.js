const express = require("express");
const router = express.Router();

const passport = require("passport");

// Post model
const Tracker = require("../../models/Tracker");

// Validation
const validateTrackerInput = require("../../validation/tracker");

// @route   GET api/tracker/test
// @desc    Tests tracker route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Tracker Works" }));

// @route   GET api/tracker
// @desc    Get tracker
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Tracker.find()
      .sort({ date: -1 })
      .then(track => res.json(track))
      .catch(err => res.status(404).json({ nopostsfound: "No content found" }));
  }
);

// @route   GET api/track/:id
// @desc    Get track record by id from Profile {user}
// @access  Private Crew
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Tracker.findOne({ user: req.params.id })
      .then(track => {
        // const searchDate =
        //   new Date.getFullYear() +
        //   "/" +
        //   Date().getMonth() +
        //   "/" +
        //   Date().getDay();
        // const newTrack = track.coordinates
        //   .map(item => item.date)
        //   .indexOf(searchDate);

        // console.log(newTrack);

        res.json(track);
      })
      .catch(err =>
        res
          .status(404)
          .json({ nocontentfound: "No content found with that ID" })
      );
  }
);

// @route   GET api/track/crew/:date
// @desc    Get track record by certain date from Profile {user}
// @access  Private Crew
router.get(
  "/crew/:date",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Tracker.findOne({ user: req.user.id })
      .then(track => {
        const searchDate = req.params.date.replace(/-/g, `/`);
        // console.log(track.find());
        // console.log(track);
        const test = track.filter(searchDate);
        console.log(test);
        const newTrack = track.coordinates.map(item => {
          if (item.date == searchDate) {
            trackFields = new item();
          }
        });
      })
      .catch(err =>
        res
          .status(404)
          .json({ nocontentfound: "No content found with that ID" })
      );
  }
);

// @route   POST api/tracker
// @desc    Create tracker
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateTrackerInput(req.body);
    const today = new Date();
    const nowDate =
      today.getFullYear() + "/" + today.getMonth() + "/" + today.getDay();

    const timeNow =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    if (!req.user.isCrew) {
      return res.status(400).json("Not a Crew account");
    }

    Tracker.findOne({ user: req.user.id }).then(track => {
      const newCoordinate = {
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        date: nowDate,
        time: timeNow
      };
      const trackFields = {};
      if (!track) {
        trackFields.user = req.user.id;
        trackFields.coordinates = [
          {
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            date: nowDate,
            time: timeNow
          }
        ];

        new Tracker(trackFields).save().then(track => res.json(track));
      } else {
        track.coordinates.unshift(newCoordinate);
        track.save().then(track => res.json(track));
      }
    });
  }
);

module.exports = router;
