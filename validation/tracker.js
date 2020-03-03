const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateTrackerInput(data) {
  let errors = {};

  data.longitude = !isEmpty(data.longitude) ? data.longitude : "";
  data.latitude = !isEmpty(data.latitude) ? data.latitude : "";
  data.date = !isEmpty(data.date) ? data.date : "";

  if (Validator.isEmpty(data.longitude)) {
    errors.longitude = "longitude field is required";
  }

  if (Validator.isEmpty(data.latitude)) {
    errors.latitude = "latitude field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
