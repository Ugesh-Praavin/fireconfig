const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    checkReactViteFirebaseEnv,
} = require("../src/doctor/react-vite-env");
const {
    checkFirebaseConfigFile,
} = require("../src/doctor/firebase-config");

function createTempProject() {
    return fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-vite-doctor-")
    );
}

test("detects missing React Vite Firebase environment configuration", () => {
    const projectRoot = createTempProject();

    const result = checkReactViteFirebaseEnv(projectRoot);

    assert.equal(result.passed, false);
    assert.equal(
        result.message,
        "React Vite Firebase environment configuration not found"
    );

    assert.deepEqual(result.missing, [
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID",
    ]);
});

test("detects incomplete React Vite Firebase environment configuration", () => {
    const projectRoot = createTempProject();

    fs.writeFileSync(
        path.join(projectRoot, ".env.local"),
        [
            "VITE_FIREBASE_API_KEY=test-key",
            "VITE_FIREBASE_PROJECT_ID=test-project",
            "",
        ].join("\n"),
        "utf8"
    );

    const result = checkReactViteFirebaseEnv(projectRoot);

    assert.equal(result.passed, false);
    assert.deepEqual(result.missing, [
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID",
    ]);
});

test("validates complete React Vite Firebase environment configuration", () => {
    const projectRoot = createTempProject();

    fs.writeFileSync(
        path.join(projectRoot, ".env.local"),
        [
            "VITE_FIREBASE_API_KEY=test-key",
            "VITE_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com",
            "VITE_FIREBASE_PROJECT_ID=test-project",
            "VITE_FIREBASE_STORAGE_BUCKET=test.firebasestorage.app",
            "VITE_FIREBASE_MESSAGING_SENDER_ID=123456789",
            "VITE_FIREBASE_APP_ID=1:123456789:web:abcdef",
            "",
        ].join("\n"),
        "utf8"
    );

    const result = checkReactViteFirebaseEnv(projectRoot);

    assert.equal(result.passed, true);
    assert.equal(
        result.message,
        "React Vite Firebase environment configuration is valid"
    );
});

test("flags syntax disagreement when Vite config uses process.env instead of import.meta.env", () => {
    const projectRoot = createTempProject();
    const firebaseDir = path.join(projectRoot, "src", "firebase");
    fs.mkdirSync(firebaseDir, { recursive: true });

    // Config wrongly uses process.env for Vite
    fs.writeFileSync(
        path.join(firebaseDir, "config.js"),
        `const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};`,
        "utf8"
    );

    const result = checkFirebaseConfigFile(
        projectRoot,
        "import.meta.env",
        "VITE_FIREBASE_"
    );

    assert.equal(result.passed, false);
    assert.match(result.message, /detected framework requires 'import\.meta\.env'/);
});

test("validates config syntax agreement when matching framework access", () => {
    const projectRoot = createTempProject();
    const firebaseDir = path.join(projectRoot, "src", "firebase");
    fs.mkdirSync(firebaseDir, { recursive: true });

    fs.writeFileSync(
        path.join(firebaseDir, "config.js"),
        `const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};`,
        "utf8"
    );

    const result = checkFirebaseConfigFile(
        projectRoot,
        "import.meta.env",
        "VITE_FIREBASE_"
    );

    assert.equal(result.passed, true);
    assert.equal(result.message, "Firebase configuration is valid");
});
