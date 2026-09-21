const test = require("node:test");
const assert = require("node:assert/strict");

const {
    selectFirebaseProject,
    CREATE_PROJECT_SENTINEL,
} = require("../src/ui/project-selector");

const mockProjects = [
    { projectId: "bear-ai-gen", displayName: "Bear Ai" },
    { projectId: "campusbus-23a14", displayName: "campusbus" },
];

test("returns null when project list is empty", async () => {
    const result = await selectFirebaseProject([]);
    assert.equal(result, null);
});

test("displays 'Create a new Firebase project' as the first choice when projects exist", async () => {
    let capturedChoices = null;

    await selectFirebaseProject(mockProjects, async ({ choices }) => {
        capturedChoices = choices;
        return choices[0].value;
    });

    assert.equal(capturedChoices.length, 3);
    assert.equal(capturedChoices[0].name, "Create a new Firebase project");
    assert.equal(capturedChoices[0].value, CREATE_PROJECT_SENTINEL);

    assert.equal(capturedChoices[1].name, "Bear Ai (bear-ai-gen)");
    assert.deepEqual(capturedChoices[1].value, mockProjects[0]);

    assert.equal(capturedChoices[2].name, "campusbus (campusbus-23a14)");
    assert.deepEqual(capturedChoices[2].value, mockProjects[1]);
});

test("selecting an existing project returns that project unchanged", async () => {
    const result = await selectFirebaseProject(mockProjects, async ({ choices }) => {
        // User selects the second project (campusbus)
        return choices[2].value;
    });

    assert.deepEqual(result, mockProjects[1]);
});

test("selecting 'Create a new Firebase project' returns CREATE_PROJECT_SENTINEL", async () => {
    const result = await selectFirebaseProject(mockProjects, async ({ choices }) => {
        // User selects the first choice
        return choices[0].value;
    });

    assert.equal(result, CREATE_PROJECT_SENTINEL);
});
