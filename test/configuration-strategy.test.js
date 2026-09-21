const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    getConfigurationStrategy,
    checkPlainReactEnvironment,
} = require("../src/config/strategy");

test("returns capability-oriented strategy for React", () => {
    const strategy = getConfigurationStrategy("react");

    assert.deepEqual(strategy, {
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
    });
});

test("returns capability-oriented strategy for Next.js", () => {
    const strategy = getConfigurationStrategy("nextjs");

    assert.deepEqual(strategy, {
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
    });
});

test("returns capability-oriented strategy for React + Vite", () => {
    const strategy = getConfigurationStrategy("react-vite");

    assert.deepEqual(strategy, {
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
    });
});

test("returns capability-oriented strategy for React + Create React App", () => {
    const strategy = getConfigurationStrategy("react-cra");

    assert.deepEqual(strategy, {
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
    });
});

test("returns React Native Android configuration strategy", () => {
    assert.deepStrictEqual(
        getConfigurationStrategy("react-native"),
        {
            platform: "native",
            type: "react-native-android",
            generator: "react-native-android",
        }
    );
});

test("marks Expo configuration as not implemented", () => {
    const strategy = getConfigurationStrategy("expo");

    assert.deepEqual(strategy, {
        platform: null,
        type: "not-implemented",
        generator: null,
    });
});

test("returns null for unknown project types", () => {
    const strategy = getConfigurationStrategy("unknown");
    assert.equal(strategy, null);
});

test("verifies plain React build tooling when projectRoot is provided", () => {
    const dirWithWebpack = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-strategy-webpack-")
    );
    fs.writeFileSync(
        path.join(dirWithWebpack, "package.json"),
        JSON.stringify({ dependencies: { react: "^18.0.0", webpack: "^5.0.0" } }),
        "utf8"
    );

    const supportedStrategy = getConfigurationStrategy("react", dirWithWebpack);
    assert.equal(supportedStrategy.environment.supported, true);
    assert.equal(supportedStrategy.environment.access, "process.env");

    const dirBareReact = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-strategy-bare-")
    );
    fs.writeFileSync(
        path.join(dirBareReact, "package.json"),
        JSON.stringify({ dependencies: { react: "^18.0.0" } }),
        "utf8"
    );

    const unsupportedStrategy = getConfigurationStrategy("react", dirBareReact);
    assert.equal(unsupportedStrategy.environment.supported, false);
    assert.equal(unsupportedStrategy.environment.access, null);
    assert.ok(unsupportedStrategy.environment.reason.includes("No build tooling"));
});