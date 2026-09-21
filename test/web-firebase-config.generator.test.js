const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    generateWebFirebaseConfig,
} = require("../src/generators/web-firebase-config");

function createTempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), "fireconfig-web-cfg-"));
}

test("generates web Firebase config with Next.js environment access", async () => {
    const dir = createTempDir();
    const result = await generateWebFirebaseConfig(dir, {
        access: "process.env",
        prefix: "NEXT_PUBLIC_FIREBASE_",
    });

    assert.equal(result.success, true);
    assert.equal(result.created, true);

    const content = fs.readFileSync(result.path, "utf8");
    assert.match(content, /process\.env\.NEXT_PUBLIC_FIREBASE_API_KEY/);
    assert.match(content, /process\.env\.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN/);
    assert.match(content, /process\.env\.NEXT_PUBLIC_FIREBASE_PROJECT_ID/);
    assert.match(content, /initializeApp\(firebaseConfig\)/);
    assert.match(content, /getApps\(\)\.length > 0/);
});

test("generates web Firebase config with Vite environment access", async () => {
    const dir = createTempDir();
    const result = await generateWebFirebaseConfig(dir, {
        access: "import.meta.env",
        prefix: "VITE_FIREBASE_",
    });

    assert.equal(result.success, true);
    const content = fs.readFileSync(result.path, "utf8");
    assert.match(content, /import\.meta\.env\.VITE_FIREBASE_API_KEY/);
    assert.match(content, /import\.meta\.env\.VITE_FIREBASE_PROJECT_ID/);
});

test("generates web Firebase config with CRA environment access", async () => {
    const dir = createTempDir();
    const result = await generateWebFirebaseConfig(dir, {
        access: "process.env",
        prefix: "REACT_APP_FIREBASE_",
    });

    assert.equal(result.success, true);
    const content = fs.readFileSync(result.path, "utf8");
    assert.match(content, /process\.env\.REACT_APP_FIREBASE_API_KEY/);
    assert.match(content, /process\.env\.REACT_APP_FIREBASE_PROJECT_ID/);
});

test("never embeds raw secret/credential values in the generated config", async () => {
    const dir = createTempDir();
    const result = await generateWebFirebaseConfig(dir, {
        access: "process.env",
        prefix: "NEXT_PUBLIC_FIREBASE_",
    });

    const content = fs.readFileSync(result.path, "utf8");
    assert.doesNotMatch(content, /"AIza[0-9A-Za-z-_]{35}"/);
    assert.doesNotMatch(content, /apiKey:\s*["'][^"']+["']/);
});

test("idempotency: repeated generation with identical configuration does not modify file", async () => {
    const dir = createTempDir();
    const first = await generateWebFirebaseConfig(dir, {
        access: "import.meta.env",
        prefix: "VITE_FIREBASE_",
    });
    assert.equal(first.created, true);
    assert.equal(first.modified, true);

    const second = await generateWebFirebaseConfig(dir, {
        access: "import.meta.env",
        prefix: "VITE_FIREBASE_",
    });
    assert.equal(second.created, false);
    assert.equal(second.modified, false);
    assert.equal(second.skipped, false);
});

test("prompts and preserves existing custom file when overwrite is declined", async () => {
    const dir = createTempDir();
    const configPath = path.join(dir, "src", "firebase", "config.js");
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, "// My custom firebase setup\n", "utf8");

    let promptCalled = false;
    const result = await generateWebFirebaseConfig(dir, {
        access: "process.env",
        prefix: "NEXT_PUBLIC_FIREBASE_",
        confirmOverwrite: async () => {
            promptCalled = true;
            return false;
        },
    });

    assert.equal(promptCalled, true);
    assert.equal(result.skipped, true);
    assert.equal(result.modified, false);
    const content = fs.readFileSync(configPath, "utf8");
    assert.equal(content, "// My custom firebase setup\n");
});

test("overwrites existing file when user confirms", async () => {
    const dir = createTempDir();
    const configPath = path.join(dir, "src", "firebase", "config.js");
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, "// Outdated setup\n", "utf8");

    const result = await generateWebFirebaseConfig(dir, {
        access: "process.env",
        prefix: "NEXT_PUBLIC_FIREBASE_",
        confirmOverwrite: async () => true,
    });

    assert.equal(result.modified, true);
    assert.equal(result.skipped, false);
    const content = fs.readFileSync(configPath, "utf8");
    assert.match(content, /process\.env\.NEXT_PUBLIC_FIREBASE_API_KEY/);
});
