import * as winston from "winston";
import * as winlog from "winston-loggly-bulk";
import * as util from "util";

const transports = [
  new (winston.transports.Console)({
    level: process.env.LOG_LEVEL,
    stringify: true,
    timestamp: true,
    colorize: true,
    formatter: (options) =>  {
      const date = new Date().toISOString();
      const file = winston.config.colorize("verbose", options.meta.file);
      delete options.meta.file;
      let json = "";
      if (Object.keys(options.meta).length > 0) {
        try {
          if (Object.keys(options.meta).length > 6) {
            json = "\n" + JSON.stringify(options.meta, null, 2);
          } else {
            json = JSON.stringify(options.meta);
          }
        } catch (error) {
          json = util.inspect(options.meta, {depth: 4});
        }
      }
      return date + " " + file + " " + winston.config.colorize(options.level, options.level.toUpperCase()) + " " +
        (options.message ? options.message : "") + " " + json;
    },
  })
];

if (process.env.NODE_ENV === "production") {
  transports.push(
    new (winston.transports.Loggly)({
      inputToken: process.env.LOGGLY_TOKEN,
      subdomain: process.env.LOGGLY_SUBDOMAIN,
      handleExceptions: true,
      tags: [process.env.LOGGLY_TAG],
      level: process.env.LOG_LEVEL || "info",
      json: true
    })
  );
}

function getCaller() {
  // @ts-ignore
  const pst = Error.prepareStackTrace;
  // @ts-ignore
  Error.prepareStackTrace = (x, s) => {
    // @ts-ignore
    Error.prepareStackTrace = pst;
    return s;
  };
  let stack = (new Error()).stack;
  stack = stack.slice(2);
  let file;
  do {
    // @ts-ignore
    const frame = stack.shift();
    file = frame && frame.getFileName();
  } while (stack.length && file === "module.js");
  return file;
}

function exit() {
  winlog.flushLogsAndExit();
}
process.on("SIGINT", exit);
process.on("SIGTERM", exit);

const logger = new (winston.Logger)({transports: transports});

export function debug(message: string, data?: object) {
  logger.debug(message, Object.assign({file: getCaller()}, data));
}

export function info(message: string, data?: object) {
  logger.info(message, Object.assign({file: getCaller()}, data));
}

export function warn(message: string, data?: object) {
  logger.warn(message, Object.assign({file: getCaller()}, data));
}

export function error(message: string, data?: object) {
  logger.error(message, Object.assign({file: getCaller()}, data));
}

