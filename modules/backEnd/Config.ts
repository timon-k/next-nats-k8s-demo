import Ajv, { JSONSchemaType } from "ajv";
import getConfig from "next/config";
import schema from "./Config.schema.json";

/** A typed view on our next.js config object.
 *
 * We could maintain the link between the JSON schema and the typescript interface via
 * schema-to-code compilers (or vice versa), but ajv is quite picky in its requirements
 * on the symmetry between schema and typescript (if you use the typed version of ajv).
 *
 * See section "JSON valiation" in `README.md`.
 */
export interface TypedNextConfig extends TypedServerConfig, TypedClientConfig {}

export interface TypedServerConfig {
    serverRuntimeConfig: {
        nats: {
            server: string;
        };
        /**
         * A subset of pino's LoggerOptions, which can be serialized.
         *
         * We want to store the config in a file, i.e., config options which are functions are not
         * allowed in our case.
         *
         * To keep everything simple, we have really only included a minimal subset here,
         * corresponding to the options which we actually use or at least used.
         */
        logging: {
            transport?: {
                target: string;
            };
        };
    };
}

export interface TypedClientConfig {
    publicRuntimeConfig: {
        version: string;
        basePath: string;
        staticFolder: string;
    };
}

const ajv = new Ajv();
const validate = ajv.compile(schema as JSONSchemaType<TypedNextConfig>);

/** Get the full validated config.
 *
 * Only works at server-side, since part of the config is empty for the client-side. */
export function getTypedConfig(): TypedNextConfig {
    const rawConfig = getConfig();
    if (validate(rawConfig)) {
        return rawConfig;
    } else {
        throw new Error(JSON.stringify(validate.errors, undefined, 2));
    }
}

/** Get the client-side config.
 *
 * We do not validate it here again, since validation is already done at the server side
 * and since we would need to further complicate the JSON schema in order to be able to
 * validate both config versions (with and without server-side parts).
 */
export function getTypedClientConfig(): TypedClientConfig {
    return getConfig() as TypedClientConfig;
}
