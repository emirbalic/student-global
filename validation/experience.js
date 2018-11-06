const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateExperienceInput(data) {
  let errors = {};

  //this is going to check if the value is 'null' and if so it will turn it to an empty string
  // and then it will send it to the .isEmpty() to validate
  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Job title field is required!";
  }

  if (Validator.isEmpty(data.company)) {
    errors.company = "Company field is required!";
  }
  if (Validator.isEmpty(data.from)) {
    errors.from = "From date field is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
