/** A subset of pino's LoggerOptions, which can be serialized.
 *
 * We want to store the config in a file, i.e., config options which are functions are not allowed
 * in our case.
 *
 * To keep everything simple, we have really only included a minimal subset here, corresponding to
 * the options which we actually use or at least used.
 */
export type SerializablePinoOptions = {
    transport?: {
        target: string;
    };
};

/** A typed view on our next.js config object. */
export type TypedNextConfig = {
    serverRuntimeConfig: {
        nats: {
            server: string;
        };
        logging: SerializablePinoOptions;
    };
    publicRuntimeConfig: {
        version: string;
        staticFolder: string;
    };
};
