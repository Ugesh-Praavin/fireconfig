const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    checkReactCraFirebaseEnv,
} = require("../src/doctor/react-cra-env");

function createTempProject() {
    return fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-react-cra-doctor-"
        )
    );
}

test("detects missing React CRA Firebase environment configuration", () => {
    const projectRoot = createTempProject();

    const result =
        checkReactCraFirebaseEnv(
            projectRoot
        );

    assert.equal(result.valid, false);
    assert.equal(result.exists, false);
    assert.equal(result.missing.length, 6);
});

test("detects incomplete React CRA Firebase environment configuration", () => {
    const projectRoot = createTempProject();

    fs.writeFileSync(
        path.join(
            projectRoot,
            ".env.local"
        ),
        [
            "REACT_APP_FIREBASE_API_KEY=test-key",
            "REACT_APP_FIREBASE_PROJECT_ID=test-project",
            "",
        ].join("\n"),
        "utf8"
    );

    const result =
        checkReactCraFirebaseEnv(
            projectRoot
        );

    assert.equal(result.valid, false);
    assert.equal(result.exists, true);

    assert.deepEqual(
        result.missing,
        [
            "REACT_APP_FIREBASE_AUTH_DOMAIN",
            "REACT_APP_FIREBASE_STORAGE_BUCKET",
            "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
            "REACT_APP_FIREBASE_APP_ID",
        ]
    );
});

test("validates complete React CRA Firebase environment configuration", () => {
    const projectRoot = createTempProject();

    fs.writeFileSync(
        path.join(
            projectRoot,
            ".env.local"
        ),
        [
            "REACT_APP_FIREBASE_API_KEY=test-key",
            "REACT_APP_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com",
            "REACT_APP_FIREBASE_PROJECT_ID=test-project",
            "REACT_APP_FIREBASE_STORAGE_BUCKET=test.firebasestorage.app",
            "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789",
            "REACT_APP_FIREBASE_APP_ID=1:123456789:web:test",
            "",
        ].join("\n"),
        "utf8"
    );

    const result =
        checkReactCraFirebaseEnv(
            projectRoot
        );

    assert.equal(result.valid, true);
    assert.equal(result.exists, true);
    assert.deepEqual(result.missing, []);
});