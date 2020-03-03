const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TrackerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  coordinates: [
    {
      longitude: {
        type: String,
        required: true
      },
      latitude: {
        type: String,
        required: true
      },
      date: {
        type: String,
        required: true
      },
      time: {
        type: String
      }
    }
  ]
});

module.exports = Tracker = mongoose.model("tracker", TrackerSchema);
