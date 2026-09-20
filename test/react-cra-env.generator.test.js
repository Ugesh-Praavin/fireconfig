const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    generateReactCraEnv,
} = require("../src/generators/react-cra-env");

function createTempProject() {
    return fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-react-cra-"
        )
    );
}

test("generates React CRA Firebase environment file", () => {
    const projectRoot = createTempProject();

    const config = {
        apiKey: "test-api-key",
        authDomain: "test.firebaseapp.com",
        projectId: "test-project",
        storageBucket: "test.firebasestorage.app",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:test",
    };

    const result = generateReactCraEnv(
        projectRoot,
        config
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
        /REACT_APP_FIREBASE_API_KEY=test-api-key/
    );

    assert.match(
        content,
        /REACT_APP_FIREBASE_AUTH_DOMAIN=test\.firebaseapp\.com/
    );

    assert.match(
        content,
        /REACT_APP_FIREBASE_PROJECT_ID=test-project/
    );

    assert.match(
        content,
        /REACT_APP_FIREBASE_STORAGE_BUCKET=test\.firebasestorage\.app/
    );

    assert.match(
        content,
        /REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789/
    );

    assert.match(
        content,
        /REACT_APP_FIREBASE_APP_ID=1:123456789:web:test/
    );
});

test("does not overwrite existing React CRA environment file", () => {
    const projectRoot = createTempProject();

    const envPath = path.join(
        projectRoot,
        ".env.local"
    );

    const existingContent =
        "EXISTING_VALUE=keep-me\n";

    fs.writeFileSync(
        envPath,
        existingContent,
        "utf8"
    );

    const result = generateReactCraEnv(
        projectRoot,
        {
            apiKey: "new-key",
            authDomain: "new.firebaseapp.com",
            projectId: "new-project",
            storageBucket: "new.firebasestorage.app",
            messagingSenderId: "987654321",
            appId: "new-app-id",
        }
    );

    assert.equal(
        result.success,
        false
    );

    assert.equal(
        result.exists,
        true
    );

    assert.equal(
        fs.readFileSync(
            envPath,
            "utf8"
        ),
        existingContent
    );
});