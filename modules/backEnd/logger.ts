import pino from "pino";
import { getTypedConfig } from "./config";

const { serverRuntimeConfig } = getTypedConfig();

export const logger = pino(serverRuntimeConfig.logging);
