import pino from "pino";
import { getTypedConfig } from "./Config";

const { serverRuntimeConfig } = getTypedConfig();

export const logger = pino(serverRuntimeConfig.logging);
