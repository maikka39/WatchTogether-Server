const fs = require('fs');
const pino = require("pino");
const childProcess = require("child_process");
const stream = require("stream");

const {
  LOG_PATH
} = require("../config");

const cwd = process.cwd();

const passThrough = new stream.PassThrough();
const logger = pino({}, passThrough);

if (!fs.existsSync(LOG_PATH)) {
  fs.mkdirSync(LOG_PATH);
}

const child = childProcess.spawn(process.execPath, [
  require.resolve("pino-tee"),
  "warn", `${LOG_PATH}/warn.log`,
  "error", `${LOG_PATH}/error.log`,
  "info", `${LOG_PATH}/info.log`
], {
  cwd,
  env: process.env
});

passThrough.pipe(child.stdin);

passThrough.pipe(process.stdout)


module.exports = logger;