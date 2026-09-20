const test = require("node:test");
const assert = require("node:assert/strict");

const {
    checkFirebaseAuth,
} = require("../src/detectors/firebase-auth");

test("detects authenticated Firebase user", () => {
    const fakeRunner = () => ({
        status: 0,
        stdout: "Logged in as user@example.com\n",
        stderr: "",
    });

    const result = checkFirebaseAuth(
        fakeRunner
    );

    assert.equal(
        result.authenticated,
        true
    );
});

test("detects unauthenticated Firebase user", () => {
    const fakeRunner = () => ({
        status: 0,
        stdout: "No authorized accounts found.",
        stderr: "",
    });

    const result = checkFirebaseAuth(
        fakeRunner
    );

    assert.equal(
        result.authenticated,
        false
    );
});

test("handles Firebase authentication command failure", () => {
    const fakeRunner = () => ({
        status: 1,
        stdout: "",
        stderr: "Firebase CLI error",
    });

    const result = checkFirebaseAuth(
        fakeRunner
    );

    assert.equal(
        result.authenticated,
        false
    );
});

test("handles Firebase authentication command error", () => {
    const fakeRunner = () => ({
        error: new Error(
            "spawn firebase ENOENT"
        ),
        status: null,
        stdout: "",
        stderr: "",
    });

    const result = checkFirebaseAuth(
        fakeRunner
    );

    assert.equal(
        result.authenticated,
        false
    );
});