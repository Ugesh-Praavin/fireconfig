const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    checkFirebaseConfigFile,
} = require("../src/doctor/firebase-config");

function createTempProject(configContent) {
    const projectRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-test-")
    );

    const firebaseDirectory = path.join(
        projectRoot,
        "src",
        "firebase"
    );

    fs.mkdirSync(firebaseDirectory, {
        recursive: true,
    });

    fs.writeFileSync(
        path.join(firebaseDirectory, "config.js"),
        configContent,
        "utf8"
    );

    return projectRoot;
}

test("valid Firebase config passes", () => {
    const projectRoot = createTempProject(`
const firebaseConfig = {
    "apiKey": "test-api-key",
    "authDomain": "test.firebaseapp.com",
    "projectId": "test-project",
    "storageBucket": "test.firebasestorage.app",
    "messagingSenderId": "123",
    "appId": "1:123:web:test"
};
`);

    const result =
        checkFirebaseConfigFile(projectRoot);

    assert.equal(result.passed, true);
});

test("incomplete Firebase config fails", () => {
    const projectRoot = createTempProject(`
const firebaseConfig = {
    "apiKey": "test-api-key",
    "authDomain": "test.firebaseapp.com",
    "projectId": "test-project"
};
`);

    const result =
        checkFirebaseConfigFile(projectRoot);

    assert.equal(result.passed, false);
});

test("missing Firebase config fails", () => {
    const projectRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-test-")
    );

    const result =
        checkFirebaseConfigFile(projectRoot);

    assert.equal(result.passed, false);
});