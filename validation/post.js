const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePostInput(data) {
  let errors = {};

  //this is going to check if the value is 'null' and if so it will turn it to an empty string
  // and then it will send it to the .isEmpty() to validate
  data.text = !isEmpty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, { min: 10, max: 300 })) {
    errors.text = "Post must be between 10 and 300 characters!";
  }

  if (Validator.isEmpty(data.text)) {
    errors.text = "Text field is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
