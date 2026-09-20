const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

function createTempNextjsProject() {
    const projectRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-init-nextjs-")
    );

    const packageJson = {
        name: "fireconfig-init-test",
        dependencies: {
            next: "^15.0.0",
            react: "^19.0.0",
            firebase: "^12.19.0",
        },
    };

    fs.writeFileSync(
        path.join(projectRoot, "package.json"),
        JSON.stringify(packageJson, null, 2),
        "utf8"
    );

    fs.writeFileSync(
        path.join(projectRoot, "package-lock.json"),
        "",
        "utf8"
    );

    return projectRoot;
}

test("init generates Next.js Firebase environment configuration", () => {
    const projectRoot = createTempNextjsProject();

    const config = {
        apiKey: "test-api-key",
        authDomain: "test.firebaseapp.com",
        projectId: "test-project",
        storageBucket: "test.firebasestorage.app",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:test",
    };

    const { generateNextjsEnv } = require("../src/generators/nextjs-env");

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
        /NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:test/
    );
});