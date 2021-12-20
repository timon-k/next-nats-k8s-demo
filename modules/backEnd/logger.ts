import getConfig from "next/config";
import pino from "pino";

const { serverRuntimeConfig } = getConfig();

export const logger = pino(serverRuntimeConfig.logging);
