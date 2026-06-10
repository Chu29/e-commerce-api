import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Pino Logger Configuration
 * - Pretty printing in development
 * - JSON logging in production
 */
const logger = pino({
  level:
    process.env.LOG_LEVEL || (process.env.NODE_ENV === "test" ? "silent" : "info"),

  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
        messageFormat: "{msg}",
      },
    },
  }),

  ...(!isDevelopment && {
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),

  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        "user-agent": req.headers["user-agent"],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

export default logger;
