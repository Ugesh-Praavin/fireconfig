const test = require("node:test");
const assert = require("node:assert/strict");

const {
    getConfigurationStrategy,
} = require("../src/config/strategy");

test("returns Firebase config strategy for React", () => {
    const strategy = getConfigurationStrategy("react");

    assert.deepEqual(strategy, {
        type: "firebase-config",
        generator: "firebase-config",
    });
});

test("returns environment strategy for Next.js", () => {
    const strategy = getConfigurationStrategy("nextjs");

    assert.deepEqual(strategy, {
        type: "environment",
        generator: "nextjs-env",
    });
});

test("returns React Native Android configuration strategy", () => {
    assert.deepStrictEqual(
        getConfigurationStrategy("react-native"),
        {
            type: "react-native-android",
            generator: "react-native-android",
        }
    );
});
test("marks Expo configuration as not implemented", () => {
    const strategy = getConfigurationStrategy("expo");

    assert.deepEqual(strategy, {
        type: "not-implemented",
        generator: null,
    });
});

test("returns null for unknown project types", () => {
    const strategy = getConfigurationStrategy(
        "unknown"
    );

    assert.equal(strategy, null);
});
test("returns environment strategy for React + Vite", () => {
    const strategy = getConfigurationStrategy(
        "react-vite"
    );

    assert.deepEqual(strategy, {
        type: "environment",
        generator: "react-vite-env",
    });
});
test("returns environment strategy for React + Create React App", () => {
    const strategy =
        getConfigurationStrategy(
            "react-cra"
        );

    assert.deepEqual(
        strategy,
        {
            type: "environment",
            generator: "react-cra-env",
        }
    );
});