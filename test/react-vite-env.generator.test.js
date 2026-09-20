const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    generateReactViteEnv,
} = require("../src/generators/react-vite-env");

function createTempProject() {
    return fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-vite-env-"
        )
    );
}

const firebaseConfig = {
    apiKey: "test-api-key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:test",
};

test("generates React Vite Firebase environment file", () => {
    const projectRoot = createTempProject();

    const result = generateReactViteEnv(
        projectRoot,
        firebaseConfig
    );

    assert.equal(result.success, true);

    const envPath = path.join(
        projectRoot,
        ".env.local"
    );

    assert.equal(
        fs.existsSync(envPath),
        true
    );

    const content = fs.readFileSync(
        envPath,
        "utf8"
    );

    assert.match(
        content,
        /VITE_FIREBASE_API_KEY=test-api-key/
    );

    assert.match(
        content,
        /VITE_FIREBASE_AUTH_DOMAIN=test\.firebaseapp\.com/
    );

    assert.match(
        content,
        /VITE_FIREBASE_PROJECT_ID=test-project/
    );

    assert.match(
        content,
        /VITE_FIREBASE_STORAGE_BUCKET=test\.firebasestorage\.app/
    );

    assert.match(
        content,
        /VITE_FIREBASE_MESSAGING_SENDER_ID=123456789/
    );

    assert.match(
        content,
        /VITE_FIREBASE_APP_ID=1:123456789:web:test/
    );
});

test("does not overwrite existing React Vite environment file", () => {
    const projectRoot = createTempProject();

    const envPath = path.join(
        projectRoot,
        ".env.local"
    );

    const existingContent =
        "EXISTING_VALUE=keep-this\n";

    fs.writeFileSync(
        envPath,
        existingContent,
        "utf8"
    );

    const result = generateReactViteEnv(
        projectRoot,
        firebaseConfig
    );

    assert.equal(result.success, false);
    assert.equal(result.exists, true);

    assert.equal(
        fs.readFileSync(envPath, "utf8"),
        existingContent
    );
});