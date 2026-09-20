const test = require("node:test");
const assert = require("node:assert/strict");

const {
    detectProject,
} = require("../src/detectors/project");

test("detectProject exports a function", () => {
    assert.equal(
        typeof detectProject,
        "function"
    );
});