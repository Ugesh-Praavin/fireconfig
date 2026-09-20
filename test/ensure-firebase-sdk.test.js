const test = require("node:test");
const assert = require("node:assert/strict");

const {
    ensureFirebaseSDK,
} = require("../src/installers/ensure-firebase-sdk");

test("passes when Firebase SDK is already installed", async () => {
    let installCalled = false;

    const result = await ensureFirebaseSDK(
        "/test/project",
        "npm",
        {
            detectFn: () => ({
                installed: true,
                version: "^12.19.0",
            }),

            installFn: async () => {
                installCalled = true;
                return true;
            },
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.installed, true);
    assert.equal(result.version, "^12.19.0");
    assert.equal(installCalled, false);
});

test("installs Firebase SDK when it is missing", async () => {
    let detectCalls = 0;
    let installCalled = false;

    const result = await ensureFirebaseSDK(
        "/test/project",
        "npm",
        {
            detectFn: () => {
                detectCalls++;

                if (detectCalls === 1) {
                    return {
                        installed: false,
                        version: null,
                    };
                }

                return {
                    installed: true,
                    version: "^12.19.0",
                };
            },

            installFn: async () => {
                installCalled = true;
                return true;
            },
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.installed, true);
    assert.equal(result.version, "^12.19.0");
    assert.equal(installCalled, true);
    assert.equal(detectCalls, 2);
});

test("fails when Firebase SDK installation is declined or fails", async () => {
    const result = await ensureFirebaseSDK(
        "/test/project",
        "npm",
        {
            detectFn: () => ({
                installed: false,
                version: null,
            }),

            installFn: async () => false,
        }
    );

    assert.equal(result.success, false);
    assert.equal(result.installed, false);
});

test("fails when installation succeeds but SDK cannot be verified", async () => {
    let detectCalls = 0;

    const result = await ensureFirebaseSDK(
        "/test/project",
        "npm",
        {
            detectFn: () => {
                detectCalls++;

                return {
                    installed: false,
                    version: null,
                };
            },

            installFn: async () => true,
        }
    );

    assert.equal(result.success, false);
    assert.equal(result.installed, false);
    assert.equal(detectCalls, 2);
});