const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    generateNextjsEnv,
} = require("../src/generators/nextjs-env");

function createTempProject() {
    return fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-nextjs-")
    );
}

test("generates Next.js Firebase environment file", () => {
    const projectRoot = createTempProject();

    const config = {
        apiKey: "test-api-key",
        authDomain: "test.firebaseapp.com",
        projectId: "test-project",
        storageBucket: "test.firebasestorage.app",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef",
    };

    const result = generateNextjsEnv(
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
        /NEXT_PUBLIC_FIREBASE_API_KEY=test-api-key/
    );

    assert.match(
        content,
        /NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test\.firebaseapp\.com/
    );

    assert.match(
        content,
        /NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project/
    );

    assert.match(
        content,
        /NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test\.firebasestorage\.app/
    );

    assert.match(
        content,
        /NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789/
    );

    assert.match(
        content,
        /NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef/
    );
});
test("does not overwrite existing Next.js environment file", () => {
    const projectRoot = createTempProject();

    const envPath = path.join(
        projectRoot,
        ".env.local"
    );

    const existingContent =
        "NEXT_PUBLIC_FIREBASE_API_KEY=existing-value\n";

    fs.writeFileSync(
        envPath,
        existingContent,
        "utf8"
    );

    const config = {
        apiKey: "new-api-key",
        authDomain: "new.firebaseapp.com",
        projectId: "new-project",
        storageBucket: "new.firebasestorage.app",
        messagingSenderId: "987654321",
        appId: "1:987654321:web:new",
    };

    const result = generateNextjsEnv(
        projectRoot,
        config
    );

    assert.equal(result.success, false);
    assert.equal(result.exists, true);
    assert.equal(result.path, envPath);

    const content = fs.readFileSync(
        envPath,
        "utf8"
    );

    assert.equal(
        content,
        existingContent
    );
});