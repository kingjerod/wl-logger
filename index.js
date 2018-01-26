"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const winlog = require("winston-loggly-bulk");
const util = require("util");
const transports = [
    new (winston.transports.Console)({
        level: process.env.LOG_LEVEL,
        stringify: true,
        timestamp: true,
        colorize: true,
        formatter: (options) => {
            const date = new Date().toISOString();
            const file = winston.config.colorize("verbose", options.meta.file);
            delete options.meta.file;
            let json = "";
            if (Object.keys(options.meta).length > 0) {
                try {
                    if (Object.keys(options.meta).length > 6) {
                        json = "\n" + JSON.stringify(options.meta, null, 2);
                    }
                    else {
                        json = JSON.stringify(options.meta);
                    }
                }
                catch (error) {
                    json = util.inspect(options.meta, { depth: 4 });
                }
            }
            return date + " " + file + " " + winston.config.colorize(options.level, options.level.toUpperCase()) + " " +
                (options.message ? options.message : "") + " " + json;
        },
    })
];
if (process.env.NODE_ENV === "production") {
    transports.push(new (winston.transports.Loggly)({
        inputToken: process.env.LOGGLY_TOKEN,
        subdomain: process.env.LOGGLY_SUBDOMAIN,
        handleExceptions: true,
        tags: [process.env.LOGGLY_TAG],
        level: process.env.LOG_LEVEL || "info",
        json: true
    }));
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
const logger = new (winston.Logger)({ transports: transports });
function debug(message, data) {
    logger.debug(message, Object.assign({ file: getCaller() }, data));
}
exports.debug = debug;
function info(message, data) {
    logger.info(message, Object.assign({ file: getCaller() }, data));
}
exports.info = info;
function warn(message, data) {
    logger.warn(message, Object.assign({ file: getCaller() }, data));
}
exports.warn = warn;
function error(message, data) {
    logger.error(message, Object.assign({ file: getCaller() }, data));
}
exports.error = error;
//# sourceMappingURL=index.js.map