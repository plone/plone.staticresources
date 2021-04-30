process.traceDeprecation = true;
const path = require("path");
const mockup_config = require("mockup/webpack.config.js");
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

    // Fix paths
    config.entry["bundle-polyfills"] = path.resolve(__dirname, "node_modules/@patternslib/patternslib/src/polyfills.js"); // prettier-ignore
    config.entry["bundle-polyfills.min"] = config.entry["bundle-polyfills"];
    config.resolve.alias.moment = path.resolve(__dirname, "node_modules/moment"); // prettier-ignore

    return config;
};
