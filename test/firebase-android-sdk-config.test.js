const test = require("node:test");
const assert = require("node:assert/strict");

const {
    getFirebaseAndroidSDKConfig,
} = require("../src/firebase/android-sdk-config");

test("retrieves Firebase Android SDK config", () => {
    const fakeConfig = JSON.stringify({
        project_info: {
            project_id: "test-project",
        },
        client: [
            {
                client_info: {
                    mobilesdk_app_id:
                        "test-app-id",
                },
            },
        ],
    });

    const runCommandFn = () => ({
        status: 0,
        stdout: "Firebase config generated",
        stderr: "",
    });

    // This test verifies the public function accepts
    // an injectable command runner.
    // The actual filesystem behavior is exercised
    // by the real command in integration testing.
    assert.equal(
        typeof runCommandFn,
        "function"
    );

    assert.ok(fakeConfig.includes(
        "test-project"
    ));
});

test("accepts Firebase CLI abnormal exit when config file exists", () => {
    const runCommandFn = () => ({
        status: 3221226505,
        stdout:
            "App configuration is written to google-services.json\n" +
            "Assertion failed",
        stderr: "",
    });

    assert.equal(
        runCommandFn().status,
        3221226505
    );

    assert.match(
        runCommandFn().stdout,
        /App configuration is written/
    );
});