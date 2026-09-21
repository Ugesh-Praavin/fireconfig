const test = require("node:test");
const assert = require("node:assert/strict");

const {
    confirmCreateFirebaseProject,
    confirmCreateNewFirebaseProject,
} = require("../src/prompts/create-project");

test("confirmCreateFirebaseProject prompts with zero-projects message by default", async () => {
    let capturedOptions = null;

    const result = await confirmCreateFirebaseProject({}, async (options) => {
        capturedOptions = options;
        return true;
    });

    assert.equal(result, true);
    assert.equal(
        capturedOptions.message,
        "No Firebase projects found. Would you like to create one?"
    );
    assert.equal(capturedOptions.default, true);
});

test("confirmCreateNewFirebaseProject prompts with user-selected creation message by default", async () => {
    let capturedOptions = null;

    const result = await confirmCreateNewFirebaseProject({}, async (options) => {
        capturedOptions = options;
        return true;
    });

    assert.equal(result, true);
    assert.equal(
        capturedOptions.message,
        "Would you like to create a new Firebase project?"
    );
    assert.equal(capturedOptions.default, true);
});
