const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateTaskInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.definition = !isEmpty(data.definition) ? data.definition : "";

  data.started = !isEmpty(data.started) ? data.started : "";
  data.end = !isEmpty(data.end) ? data.end : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
