const test = require("node:test");
const assert = require("node:assert/strict");

const {
    installFirebaseSDK,
} = require("../src/installers/firebase-sdk");

test("installs Firebase SDK with npm when user confirms", async () => {
    let receivedCommand = null;
    let receivedArgs = null;

    const result = await installFirebaseSDK("npm", {
        confirmFn: async () => true,
        runCommandFn: (command, args) => {
            receivedCommand = command;
            receivedArgs = args;

            return {
                status: 0,
                error: null,
            };
        },
    });

    assert.equal(result, true);
    assert.equal(receivedCommand, "npm");
    assert.deepEqual(receivedArgs, [
        "install",
        "firebase",
    ]);
});

test("does not install Firebase SDK when user declines", async () => {
    let commandExecuted = false;

    const result = await installFirebaseSDK("npm", {
        confirmFn: async () => false,
        runCommandFn: () => {
            commandExecuted = true;

            return {
                status: 0,
                error: null,
            };
        },
    });

    assert.equal(result, false);
    assert.equal(commandExecuted, false);
});

test("handles Firebase SDK installation failure", async () => {
    const result = await installFirebaseSDK("npm", {
        confirmFn: async () => true,
        runCommandFn: () => ({
            status: 1,
            error: null,
        }),
    });

    assert.equal(result, false);
});

test("handles Firebase SDK command execution error", async () => {
    const result = await installFirebaseSDK("npm", {
        confirmFn: async () => true,
        runCommandFn: () => ({
            status: null,
            error: new Error("command failed"),
        }),
    });

    assert.equal(result, false);
});

test("rejects unsupported package manager", async () => {
    let commandExecuted = false;

    const result = await installFirebaseSDK(
        "unknown",
        {
            confirmFn: async () => true,
            runCommandFn: () => {
                commandExecuted = true;

                return {
                    status: 0,
                    error: null,
                };
            },
        }
    );

    assert.equal(result, false);
    assert.equal(commandExecuted, false);
});