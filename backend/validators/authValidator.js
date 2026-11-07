function validateRegister(data) {
  const errors = [];

  if (!data.username || typeof data.username !== "string" || !data.username.trim()) {
    errors.push("Username is required");
  }

  if (!data.password || typeof data.password !== "string" || data.password.length < 6) {
    errors.push("Password is required and must be at least 6 characters long");
  }

  return errors;
}

function validateLogin(data) {
  const errors = [];

  if (!data.username || typeof data.username !== "string" || !data.username.trim()) {
    errors.push("Username is required");
  }

  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required");
  }

  return errors;
}

module.exports = {
  validateRegister,
  validateLogin
};
