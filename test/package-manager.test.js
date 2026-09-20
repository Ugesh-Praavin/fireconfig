const test = require("node:test");
const assert = require("node:assert/strict");

const {
    detectPackageManager,
} = require("../src/detectors/package-manager");

test("detectPackageManager exports a function", () => {
    assert.equal(
        typeof detectPackageManager,
        "function"
    );
});