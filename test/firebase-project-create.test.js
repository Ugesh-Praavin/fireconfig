const test = require("node:test");
const assert = require("node:assert/strict");

const {
    createFirebaseProject,
} = require("../src/firebase/project-create");

test("creates a Firebase project successfully", () => {
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

    const result = createFirebaseProject(
        "fireconfig-test-project",
        "FireConfig Test Project",
        fakeSpawn
    );

    assert.equal(result.success, true);

    assert.deepEqual(result.project, {
        projectId: "fireconfig-test-project",
        displayName: "FireConfig Test Project",
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
            "projects:create",
            "fireconfig-test-project",
            "--display-name",
            "FireConfig Test Project",
        ]);
    } else {
        assert.deepEqual(capturedArgs, [
            "projects:create",
            "fireconfig-test-project",
            "--display-name",
            "FireConfig Test Project",
        ]);
    }
});

test("returns an error when Firebase project creation fails", () => {
    const fakeSpawn = () => ({
        status: 1,
        stdout: "",
        stderr: "Project creation failed.",
    });

    const result = createFirebaseProject(
        "fireconfig-test-project",
        "FireConfig Test Project",
        fakeSpawn
    );

    assert.equal(result.success, false);
    assert.equal(result.project, null);
    assert.equal(result.error, "Project creation failed.");
});

test("returns spawn error when Firebase CLI cannot be executed", () => {
    const fakeSpawn = () => ({
        status: null,
        stdout: "",
        stderr: "",
        error: new Error("Firebase CLI not found"),
    });

    const result = createFirebaseProject(
        "fireconfig-test-project",
        "FireConfig Test Project",
        fakeSpawn
    );

    assert.equal(result.success, false);
    assert.equal(result.project, null);
    assert.equal(result.error, "Firebase CLI not found");
});