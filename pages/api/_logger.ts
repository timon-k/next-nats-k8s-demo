import pino from "pino";

const devMode = process.env.NODE_ENV === "development";

export const logger = pino(
    devMode
        ? {
              transport: {
                  target: "pino-pretty",
              },
          }
        : {},
);
