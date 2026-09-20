const test = require("node:test");
const assert = require("node:assert/strict");

const {
    detectFirebaseSDK,
} = require("../src/detectors/firebase-sdk");

test("detectFirebaseSDK exports a function", () => {
    assert.equal(
        typeof detectFirebaseSDK,
        "function"
    );
});