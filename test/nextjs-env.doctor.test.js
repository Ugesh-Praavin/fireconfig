const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    checkNextjsFirebaseEnv,
} = require("../src/doctor/nextjs-env");

function createTempProject() {
    return fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-nextjs-doctor-")
    );
}

test("detects missing Next.js Firebase environment configuration", () => {
    const projectRoot = createTempProject();

    const result =
        checkNextjsFirebaseEnv(projectRoot);

    assert.equal(result.passed, false);
    assert.equal(
        result.message,
        "Next.js Firebase environment configuration not found"
    );

    assert.deepEqual(
        result.missing,
        [
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
            "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
            "NEXT_PUBLIC_FIREBASE_APP_ID",
        ]
    );
});

test("detects incomplete Next.js Firebase environment configuration", () => {
    const projectRoot = createTempProject();

    fs.writeFileSync(
        path.join(projectRoot, ".env.local"),
        [
            "NEXT_PUBLIC_FIREBASE_API_KEY=test-key",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project",
            "",
        ].join("\n"),
        "utf8"
    );

    const result =
        checkNextjsFirebaseEnv(projectRoot);

    assert.equal(result.passed, false);

    assert.deepEqual(
        result.missing,
        [
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
            "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
            "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
            "NEXT_PUBLIC_FIREBASE_APP_ID",
        ]
    );
});

test("validates complete Next.js Firebase environment configuration", () => {
    const projectRoot = createTempProject();

    fs.writeFileSync(
        path.join(projectRoot, ".env.local"),
        [
            "NEXT_PUBLIC_FIREBASE_API_KEY=test-key",
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project",
            "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test.firebasestorage.app",
            "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789",
            "NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef",
            "",
        ].join("\n"),
        "utf8"
    );

    const result =
        checkNextjsFirebaseEnv(projectRoot);

    assert.equal(result.passed, true);

    assert.equal(
        result.message,
        "Next.js Firebase environment configuration is valid"
    );
});