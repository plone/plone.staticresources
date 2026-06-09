process.traceDeprecation = true;
const path = require("path");
const mockup_config = require("@plone/mockup/webpack.config.js");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = () => {
    const config = mockup_config();

    config.output.path = path.resolve(
        __dirname,
        "src/plone/staticresources/static/bundle-plone/"
    );

    // Plain TypeScript (.ts) modules shipped inside @plone/mockup (e.g. the
    // filemanager pattern, since 5.7.x). Mockup's own webpack `.ts` rule
    // excludes `node_modules`, so when we consume mockup as a dependency those
    // files reach webpack's default parser untranspiled and fail with
    // "Module parse failed: Unexpected token". Route them through babel-loader
    // to strip the TypeScript types. `.svelte.ts` files are handled by the
    // svelte-loader rule, so they are excluded here.
    config.module.rules.push({
        test: /\.ts$/,
        include: /node_modules[\\/]@plone[\\/]mockup[\\/]/,
        exclude: /\.svelte\.ts$/,
        use: {
            loader: "babel-loader",
            options: {
                babelrc: false,
                configFile: false,
                presets: [
                    [
                        "@babel/preset-typescript",
                        { allExtensions: true, allowDeclareFields: true },
                    ],
                ],
            },
        },
    });

    config.plugins.push(
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "node_modules/bootstrap-icons/icons"),
                    to: path.resolve(__dirname, "src/plone/staticresources/static/icons-bootstrap"), // prettier-ignore
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

    // NOTE: Use object-literal (colon) syntax here, not `config.resolve.x = ...`
    // assignments. Because this webpack config is exported as a function,
    // svelte-loader cannot read the runtime value and instead regex-scans this
    // file's source for an array assigned with colon syntax. The inherited
    // mockup config already sets these at runtime, but svelte-loader scans THIS
    // file (the one passed via --config), so the literal must be repeated here
    // to silence the spurious "add 'svelte' to resolve.conditionNames" warning.
    config.resolve = {
        ...config.resolve,
        extensions: [".js", ".ts", ".json", ".wasm", ".svelte"],
        mainFields: ["browser", "module", "main"],
        conditionNames: ["svelte", "browser", "require"],
    };

    return config;
};
