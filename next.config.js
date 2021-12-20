const { version } = require("./package.json");
const { load } = require("js-yaml");
const { readFileSync } = require("fs");

const yamlConfig = load(
    readFileSync(process.env.SERVICE_CONFIG_FILE ?? "./conf/config.yaml", "utf-8"),
);

module.exports = {
    reactStrictMode: true,

    eslint: {
        dirs: ["components", "modules", "pages"],
    },

    serverRuntimeConfig: yamlConfig.serverRuntimeConfig,
    publicRuntimeConfig: {
        ...yamlConfig.publicRuntimeConfig,
        ...{
            version,
        },
    },
};
