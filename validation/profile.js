const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
  let errors = {};

  data.adminName = !isEmpty(data.adminName) ? data.adminName : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.fullName = !isEmpty(data.fullName) ? data.fullName : "";
  data.position = !isEmpty(data.position) ? data.position : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.hourlyRate = !isEmpty(data.hourlyRate) ? data.hourlyRate : "";

  if (Validator.isEmpty(data.fullName)) {
    errors.fullName = "Full Name field is required";
  }

  if (Validator.isEmpty(data.hourlyRate)) {
    errors.hourlyRate = "Hourly Rate field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
