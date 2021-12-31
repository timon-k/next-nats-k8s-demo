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
export interface TypedNextConfig {
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
    publicRuntimeConfig: {
        version: string;
        staticFolder: string;
    };
}

const ajv = new Ajv();
const validate = ajv.compile(schema as JSONSchemaType<TypedNextConfig>);

export function getTypedConfig(): TypedNextConfig {
    const rawConfig = getConfig();
    if (validate(rawConfig)) {
        return rawConfig;
    } else {
        throw new Error(validate.errors?.toString());
    }
}
