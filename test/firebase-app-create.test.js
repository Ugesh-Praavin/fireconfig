const test = require("node:test");
const assert = require("node:assert/strict");

const {
    createFirebaseWebApp,
} = require("../src/firebase/app-create");

test("creates a Firebase Web App successfully", () => {
    let capturedCommand;
    let capturedArgs;

    const fakeSpawn = (command, args) => {
        capturedCommand = command;
        capturedArgs = args;

        return {
            status: 0,
            stdout: "",
            stderr: "",
        };
    };

    const result = createFirebaseWebApp(
        "fireconfig-test-project",
        "FireConfig Test Web App",
        fakeSpawn
    );

    assert.equal(result.success, true);

    assert.deepEqual(result.app, {
        displayName: "FireConfig Test Web App",
    });

    assert.equal(
        capturedCommand,
        process.platform === "win32"
            ? process.env.ComSpec || "cmd.exe"
            : "firebase"
    );

    if (process.platform === "win32") {
        assert.deepEqual(capturedArgs, [
            "/d",
            "/s",
            "/c",
            "firebase",
            "--project",
            "fireconfig-test-project",
            "apps:create",
            "WEB",
            "FireConfig Test Web App",
        ]);
    } else {
        assert.deepEqual(capturedArgs, [
            "--project",
            "fireconfig-test-project",
            "apps:create",
            "WEB",
            "FireConfig Test Web App",
        ]);
    }
});

test("returns an error when Firebase Web App creation fails", () => {
    const fakeSpawn = () => ({
        status: 1,
        stdout: "",
        stderr: "Web App creation failed.",
    });

    const result = createFirebaseWebApp(
        "fireconfig-test-project",
        "FireConfig Test Web App",
        fakeSpawn
    );

    assert.equal(result.success, false);
    assert.equal(result.app, null);
    assert.equal(result.error, "Web App creation failed.");
});

test("returns spawn error when Firebase CLI cannot be executed", () => {
    const fakeSpawn = () => ({
        status: null,
        stdout: "",
        stderr: "",
        error: new Error("Firebase CLI not found"),
    });

    const result = createFirebaseWebApp(
        "fireconfig-test-project",
        "FireConfig Test Web App",
        fakeSpawn
    );

    assert.equal(result.success, false);
    assert.equal(result.app, null);
    assert.equal(result.error, "Firebase CLI not found");
});