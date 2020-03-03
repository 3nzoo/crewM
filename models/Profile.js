const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  handle: {
    type: String,
    required: true
  },
  adminName: {
    type: String
  },
  company: {
    type: String
  },
  fullName: {
    type: String,
    required: true
  },
  position: {
    type: String
  },
  email: {
    type: String
  },
  hourlyRate: {
    type: String,
    required: true
  },
  task: [
    {
      title: {
        type: String,
        required: true
      },
      definition: {
        type: String
      },
      started: {
        type: Date
      },
      end: {
        type: Date
      },
      addedDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
