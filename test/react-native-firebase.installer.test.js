const test = require("node:test");
const assert = require("node:assert/strict");

const {
    installReactNativeFirebase,
} = require("../src/installers/react-native-firebase");

test("installs React Native Firebase with npm when user confirms", async () => {
    let command;
    let args;

    const result =
        await installReactNativeFirebase(
            "npm",
            {
                confirmFn: async () => true,
                runCommandFn: (
                    receivedCommand,
                    receivedArgs
                ) => {
                    command =
                        receivedCommand;

                    args =
                        receivedArgs;

                    return {
                        status: 0,
                    };
                },
            }
        );

    assert.equal(result, true);
    assert.equal(command, "npm");

    assert.deepStrictEqual(
        args,
        [
            "install",
            "@react-native-firebase/app",
        ]
    );
});

test("does not install React Native Firebase when user declines", async () => {
    let called = false;

    const result =
        await installReactNativeFirebase(
            "npm",
            {
                confirmFn: async () => false,
                runCommandFn: () => {
                    called = true;

                    return {
                        status: 0,
                    };
                },
            }
        );

    assert.equal(result, false);
    assert.equal(called, false);
});

test("handles React Native Firebase installation failure", async () => {
    const result =
        await installReactNativeFirebase(
            "npm",
            {
                confirmFn: async () => true,
                runCommandFn: () => ({
                    status: 1,
                }),
            }
        );

    assert.equal(result, false);
});

test("handles command execution error", async () => {
    const result =
        await installReactNativeFirebase(
            "npm",
            {
                confirmFn: async () => true,
                runCommandFn: () => ({
                    status: null,
                    error: new Error(
                        "command failed"
                    ),
                }),
            }
        );

    assert.equal(result, false);
});

test("rejects unsupported package manager", async () => {
    const result =
        await installReactNativeFirebase(
            "unknown",
            {
                confirmFn: async () => true,
                runCommandFn: () => ({
                    status: 0,
                }),
            }
        );

    assert.equal(result, false);
});