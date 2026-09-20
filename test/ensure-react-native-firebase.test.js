const test = require("node:test");
const assert = require("node:assert/strict");

const {
    ensureReactNativeFirebase,
} = require("../src/installers/ensure-react-native-firebase");

test("passes when React Native Firebase is already installed", async () => {
    const result =
        await ensureReactNativeFirebase(
            "project",
            "npm",
            {
                detectFn: () => ({
                    installed: true,
                    version: "^26.4.0",
                }),
                installFn: async () => {
                    throw new Error(
                        "Install should not be called"
                    );
                },
            }
        );

    assert.deepStrictEqual(
        result,
        {
            success: true,
            installed: true,
            version: "^26.4.0",
        }
    );
});

test("installs React Native Firebase when missing", async () => {
    let detectCalls = 0;

    const result =
        await ensureReactNativeFirebase(
            "project",
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
                        version: "26.4.0",
                    };
                },
                installFn: async () => true,
            }
        );

    assert.deepStrictEqual(
        result,
        {
            success: true,
            installed: true,
            version: "26.4.0",
        }
    );

    assert.equal(
        detectCalls,
        2
    );
});

test("fails when installation is declined or fails", async () => {
    const result =
        await ensureReactNativeFirebase(
            "project",
            "npm",
            {
                detectFn: () => ({
                    installed: false,
                    version: null,
                }),
                installFn: async () => false,
            }
        );

    assert.deepStrictEqual(
        result,
        {
            success: false,
            installed: false,
        }
    );
});

test("fails when installation succeeds but SDK cannot be verified", async () => {
    const result =
        await ensureReactNativeFirebase(
            "project",
            "npm",
            {
                detectFn: () => ({
                    installed: false,
                    version: null,
                }),
                installFn: async () => true,
            }
        );

    assert.deepStrictEqual(
        result,
        {
            success: false,
            installed: false,
        }
    );
});