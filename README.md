##WL (winston loggly) Logger

Uses a console and Loggly transport with Winston. The Loggly transport is only used when process.env.NODE_ENV = "production".

Env variables to setup:

* LOG_LEVEL (info, debug, error)
* LOGGLY_TOKEN (your Loggly token)
* LOGGLY_SUBDOMAIN (your Loggly subdomain)
* LOGGLY_TAG (the tag you want associated with the logs)

The console logger uses ISO8601, the file that called the log message, type of message, the message, 
and then smartly JSON encodes the data, or if that's not possible (circular reference error) it will use util.inspect.

Large objects will span multiple lines and have indentation (only in console logger) to make reading them easier.

Example output:

`2018-01-26T05:43:09.363Z /app/src/redis.js INFO Connected to Redis. {time: 200}`

`2018-01-26T05:54:48.678Z /app/src/login.js ERROR This is an error! {"error":"BadLoginException"}`

Usage:

```
import * as log from "wl-logger"
log.info("This is a message.", {time: 250});
```