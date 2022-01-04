const { version } = require("./package.json");
const { load } = require("js-yaml");
const { readFileSync } = require("fs");

const yamlConfig = load(
    readFileSync(process.env.SERVICE_CONFIG_FILE ?? "./conf/config.yaml", "utf-8"),
);

// Must be kept in sync with the k8s ingress path in `k8s-deployment.yaml`
const basePath = "/chat";

module.exports = {
    basePath: basePath,

    reactStrictMode: true,

    eslint: {
        dirs: ["components", "modules", "pages"],
    },

    serverRuntimeConfig: yamlConfig.serverRuntimeConfig,
    publicRuntimeConfig: {
        ...yamlConfig.publicRuntimeConfig,
        ...{
            version,
            basePath,
        },
    },
};
