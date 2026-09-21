const fs = require("fs");
const path = require("path");

const KNOWN_REACT_ENV_DEPENDENCIES = [
    "webpack",
    "webpack-cli",
    "dotenv",
    "dotenv-webpack",
    "parcel",
    "@parcel/core",
    "esbuild",
    "rollup",
    "tsup",
    "browserify",
    "babel-plugin-transform-inline-environment-variables",
    "@craco/craco",
    "react-app-rewired",
];

const KNOWN_REACT_CONFIG_FILES = [
    "webpack.config.js",
    "webpack.config.cjs",
    "webpack.config.mjs",
    "webpack.config.ts",
    "rollup.config.js",
    "rollup.config.mjs",
    "rollup.config.ts",
    "esbuild.config.js",
    "esbuild.config.mjs",
    ".parcelrc",
];

/**
 * Checks whether a plain React project has build tooling or an environment
 * mechanism that supports injecting environment variables like process.env.
 *
 * @param {string} projectRoot
 * @returns {{ supported: boolean, tool?: string, reason?: string }}
 */
function checkPlainReactEnvironment(projectRoot) {
    if (!projectRoot) {
        return { supported: true };
    }

    // Check config files first
    for (const configFile of KNOWN_REACT_CONFIG_FILES) {
        if (fs.existsSync(path.join(projectRoot, configFile))) {
            return {
                supported: true,
                tool: configFile,
            };
        }
    }

    const pkgPath = path.join(projectRoot, "package.json");
    if (!fs.existsSync(pkgPath)) {
        return {
            supported: false,
            reason: "package.json not found",
        };
    }

    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        const allDeps = {
            ...(pkg.dependencies || {}),
            ...(pkg.devDependencies || {}),
        };

        for (const dep of KNOWN_REACT_ENV_DEPENDENCIES) {
            if (allDeps[dep]) {
                return {
                    supported: true,
                    tool: dep,
                };
            }
        }
    } catch {
        return {
            supported: false,
            reason: "Unable to parse package.json",
        };
    }

    return {
        supported: false,
        reason:
            "No build tooling or environment mechanism detected (such as Webpack, Dotenv, or Parcel). Generic browser React does not support process.env by default.",
    };
}

/**
 * Returns capability-oriented configuration strategy for a project type.
 *
 * @param {string} projectType - react, react-vite, react-cra, nextjs, react-native, expo
 * @param {string} [projectRoot] - Optional project root for deep capability verification
 */
function getConfigurationStrategy(projectType, projectRoot) {
    const strategies = {
        "react-vite": {
            platform: "web",
            environment: {
                file: ".env.local",
                prefix: "VITE_FIREBASE_",
                access: "import.meta.env",
            },
            initialization: {
                generator: "web-firebase-config",
                path: "src/firebase/config.js",
            },
        },

        nextjs: {
            platform: "web",
            environment: {
                file: ".env.local",
                prefix: "NEXT_PUBLIC_FIREBASE_",
                access: "process.env",
            },
            initialization: {
                generator: "web-firebase-config",
                path: "src/firebase/config.js",
            },
        },

        "react-cra": {
            platform: "web",
            environment: {
                file: ".env.local",
                prefix: "REACT_APP_FIREBASE_",
                access: "process.env",
            },
            initialization: {
                generator: "web-firebase-config",
                path: "src/firebase/config.js",
            },
        },

        react: {
            platform: "web",
            environment: {
                file: ".env.local",
                prefix: "REACT_APP_FIREBASE_",
                access: "process.env",
            },
            initialization: {
                generator: "web-firebase-config",
                path: "src/firebase/config.js",
            },
        },

        "react-native": {
            platform: "native",
            type: "react-native-android",
            generator: "react-native-android",
        },

        expo: {
            platform: null,
            type: "not-implemented",
            generator: null,
        },
    };

    const strategy = strategies[projectType] || null;
    if (!strategy) {
        return null;
    }

    // For plain React, if projectRoot is provided, verify build tooling
    if (projectType === "react" && projectRoot) {
        const envCheck = checkPlainReactEnvironment(projectRoot);
        if (!envCheck.supported) {
            return {
                ...strategy,
                environment: {
                    ...strategy.environment,
                    supported: false,
                    access: null,
                    reason: envCheck.reason,
                },
            };
        }
        return {
            ...strategy,
            environment: {
                ...strategy.environment,
                supported: true,
                tool: envCheck.tool,
            },
        };
    }

    return strategy;
}

module.exports = {
    getConfigurationStrategy,
    checkPlainReactEnvironment,
};