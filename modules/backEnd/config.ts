import { LoggerOptions } from "pino";
import getConfig from "next/config";

type TypedNextConfig = {
    serverRuntimeConfig: {
        nats: {
            server: string;
        };
        logging: LoggerOptions;
    };
    publicRuntimeConfig: {
        version: string;
        staticFolder: string;
    };
};

/** Provides a properly typed view on our next.js config object. */
export function getTypedConfig(): TypedNextConfig {
    return getConfig() as TypedNextConfig;
}
