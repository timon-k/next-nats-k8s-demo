import getConfig from "next/config";
import pino from "pino";
import validate from "./config.validator";

const { serverRuntimeConfig } = validate(getConfig());

export const logger = pino(serverRuntimeConfig.logging);
