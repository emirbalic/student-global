const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};

  //this is going to check if the value is 'null' and if so it will turn it to an empty string
  // and then it will send it to the .isEmpty() to validate
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid!";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required!";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
