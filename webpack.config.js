process.traceDeprecation = true;
const path = require("path");
const mockup_config = require("@plone/mockup/webpack.config.js");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = async (env, argv) => {
    const config = await mockup_config(env, argv);

    config.output.path = path.resolve(
        __dirname,
        "src/plone/staticresources/static/bundle-plone/"
    );

    config.plugins.push(
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "node_modules/jquery/dist"),
                    to: path.resolve(__dirname, "src/plone/staticresources/static/bundle-jquery"), // prettier-ignore
                },
                {
                    from: path.resolve(__dirname, "node_modules/bootstrap-icons/icons"),
                    to: path.resolve(__dirname, "src/plone/staticresources/static/icons-bootstrap"), // prettier-ignore
                },
                {
                    from: path.resolve(__dirname, "node_modules/bootstrap/dist"),
                    to: path.resolve(__dirname, "src/plone/staticresources/static/bundle-bootstrap"), // prettier-ignore
                },
                {
                    from: path.resolve(__dirname, "node_modules/svg-country-flags"),
                    to: path.resolve(__dirname, "src/plone/staticresources/static/icons-country-flags"), // prettier-ignore
                    globOptions: {
                        ignore: ["**/png*/*", "**/scripts/*"],
                    },
                },
            ],
        })
    );

    return config;
};
