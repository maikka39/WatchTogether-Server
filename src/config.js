module.exports = {
  PORT: process.env.PORT || 5000,
  ADMIN_USER: process.env.ADMIN_USER || "Watch-Together",
  LOG_PATH: process.env.LOG_PATH || `${process.cwd()}/logs`,
}