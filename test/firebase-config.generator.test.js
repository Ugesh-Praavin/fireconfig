const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    generateFirebaseConfig,
} = require("../src/generators/firebase-config");

const firebaseConfig = {
    apiKey: "test-api-key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:test123",
};

function createTempProject() {
    return fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-generator-")
    );
}

test("generates Firebase config file", () => {
    const projectRoot = createTempProject();

    const result = generateFirebaseConfig(
        projectRoot,
        firebaseConfig
    );

    assert.equal(result.success, true);
    assert.equal(result.exists, false);

    assert.equal(
        fs.existsSync(result.path),
        true
    );
});

test("generated config contains required Firebase values", () => {
    const projectRoot = createTempProject();

    const result = generateFirebaseConfig(
        projectRoot,
        firebaseConfig
    );

    const content = fs.readFileSync(
        result.path,
        "utf8"
    );

    assert.match(
        content,
        /"apiKey":\s*"test-api-key"/
    );

    assert.match(
        content,
        /"authDomain":\s*"test\.firebaseapp\.com"/
    );

    assert.match(
        content,
        /"projectId":\s*"test-project"/
    );

    assert.match(
        content,
        /"storageBucket":\s*"test\.firebasestorage\.app"/
    );

    assert.match(
        content,
        /"messagingSenderId":\s*"123456789"/
    );

    assert.match(
        content,
        /"appId":\s*"1:123456789:web:test123"/
    );

    assert.match(
        content,
        /initializeApp\(firebaseConfig\)/
    );
});

test("does not overwrite existing Firebase config", () => {
    const projectRoot = createTempProject();

    const firstResult = generateFirebaseConfig(
        projectRoot,
        firebaseConfig
    );

    assert.equal(firstResult.success, true);

    const originalContent = fs.readFileSync(
        firstResult.path,
        "utf8"
    );

    const modifiedContent =
        "// Existing user configuration\n";

    fs.writeFileSync(
        firstResult.path,
        modifiedContent,
        "utf8"
    );

    const secondResult = generateFirebaseConfig(
        projectRoot,
        {
            ...firebaseConfig,
            projectId: "different-project",
        }
    );

    assert.equal(secondResult.success, false);
    assert.equal(secondResult.exists, true);

    const finalContent = fs.readFileSync(
        firstResult.path,
        "utf8"
    );

    assert.equal(
        finalContent,
        modifiedContent
    );

    assert.notEqual(
        finalContent,
        originalContent.replace(
            '"projectId": "test-project"',
            '"projectId": "different-project"'
        )
    );
});