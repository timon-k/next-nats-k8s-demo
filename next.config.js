const { version } = require("./package.json");

module.exports = {
    reactStrictMode: true,

    eslint: {
        dirs: ["components", "modules", "pages"],
    },

    serverRuntimeConfig: {
        nats: {
            server: "nats://127.0.0.1:4222",
        },
    },
    publicRuntimeConfig: {
        version,
        staticFolder: "/static",
    },
};
