const test = require("node:test");
const assert = require("node:assert/strict");

const {
    detectFirebaseCLI,
} = require("../src/detectors/firebase-cli");

test("detects installed Firebase CLI", () => {
    const fakeRunner = () => ({
        status: 0,
        stdout: "15.30.2\n",
        stderr: "",
    });

    const result = detectFirebaseCLI(fakeRunner);

    assert.equal(result.installed, true);
    assert.equal(result.version, "15.30.2");
});

test("detects missing Firebase CLI", () => {
    const fakeRunner = () => ({
        status: 1,
        stdout: "",
        stderr: "firebase: command not found",
    });

    const result = detectFirebaseCLI(fakeRunner);

    assert.equal(result.installed, false);
    assert.equal(result.version, null);
});

test("handles command execution error", () => {
    const fakeRunner = () => ({
        error: new Error("spawn firebase ENOENT"),
        status: null,
        stdout: "",
        stderr: "",
    });

    const result = detectFirebaseCLI(fakeRunner);

    assert.equal(result.installed, false);
    assert.equal(result.version, null);
});

test("handles empty version output", () => {
    const fakeRunner = () => ({
        status: 0,
        stdout: "",
        stderr: "",
    });

    const result = detectFirebaseCLI(fakeRunner);

    assert.equal(result.installed, true);
    assert.equal(result.version, "");
});