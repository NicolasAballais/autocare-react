module.exports = function (config) {
    const navegadorAislado = process.env.AUTOCARE_NAVEGADOR_AISLADO === '1';

    config.set({

        frameworks: [
            "jasmine",
            "webpack"
        ],

        files: [
            {
                pattern: "src/test/**/*.spec.jsx",
                watched: false
            },
            { pattern: 'public/images/**/*', included: false, watched: false }
        ],

        proxies: { '/images/': '/base/public/images/' },

        preprocessors: {
            "src/test/**/*.spec.jsx": [
                "webpack"
            ]
        },

        webpack: {

            mode: "development",

            devtool: "inline-source-map",

            resolve: {
                extensions: [
                    ".js",
                    ".jsx"
                ]
            },

            module: {

                rules: [
                    { test: /\.css$/, type: 'asset/source' },

                    /*
                        Permite que Webpack resuelva imports
                        como './productosService'
                        aunque el archivo real sea
                        './productosService.js'
                    */
                    {
                        test: /\.m?js$/,
                        resolve: {
                            fullySpecified: false
                        }
                    },

                    /*
                        Babel procesa JavaScript y JSX
                        para las pruebas.
                    */
                    {
                        test: /\.jsx?$/,

                        exclude: /node_modules/,

                        use: {

                            loader: "babel-loader",

                            options: {

                                babelrc: false,

                                configFile: false,

                                presets: [

                                    "@babel/preset-env",

                                    [
                                        "@babel/preset-react",
                                        {
                                            runtime: "automatic"
                                        }
                                    ]
                                ],

                                plugins: [

                                    [
                                        "istanbul",
                                        {
                                            include: [
                                                "src/**/*.{js,jsx}"
                                            ],

                                            exclude: [
                                                "src/test/**"
                                            ]
                                        }
                                    ]
                                ]
                            }
                        }
                    }
                ]
            }
        },

        plugins: [
            "karma-jasmine",
            "karma-webpack",
            "karma-chrome-launcher",
            "karma-coverage",
            "karma-spec-reporter"
        ],

        reporters: [
            "spec",
            "coverage"
        ],

        coverageReporter: {

            dir: "coverage/karma",

            reporters: [

                {
                    type: "html",
                    subdir: "html"
                },

                {
                    type: "text-summary"
                },
                { type: "json", subdir: "." },
                { type: "json-summary", subdir: "." }
            ]
        },

        browsers: [navegadorAislado ? 'ChromeHeadlessAislado' : 'ChromeHeadless'],
        customLaunchers: {
            ChromeHeadlessAislado: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-gpu', '--disable-software-rasterizer']
            }
        },

        singleRun: true

    });

};