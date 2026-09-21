const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { mergeEnvFile, parseEnvLine } = require("../src/config/env-merger");

function createTempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), "fireconfig-env-test-"));
}

test("1. creates missing .env.local with provided variables", async () => {
    const dir = createTempDir();
    const result = await mergeEnvFile(dir, ".env.local", {
        FOO: "bar",
        BAZ: "qux",
    });

    assert.equal(result.success, true);
    assert.equal(result.created, true);
    assert.equal(result.modified, true);

    const content = fs.readFileSync(path.join(dir, ".env.local"), "utf8");
    assert.match(content, /^FOO=bar/m);
    assert.match(content, /^BAZ=qux/m);
});

test("2. adds missing Firebase variables to an existing .env.local", async () => {
    const dir = createTempDir();
    const envFile = path.join(dir, ".env.local");
    fs.writeFileSync(envFile, "DATABASE_URL=postgres://localhost\n", "utf8");

    const result = await mergeEnvFile(dir, ".env.local", {
        NEXT_PUBLIC_FIREBASE_API_KEY: "abc123xyz",
    });

    assert.equal(result.success, true);
    assert.equal(result.created, false);
    assert.equal(result.modified, true);

    const content = fs.readFileSync(envFile, "utf8");
    assert.match(content, /DATABASE_URL=postgres:\/\/localhost/);
    assert.match(content, /NEXT_PUBLIC_FIREBASE_API_KEY=abc123xyz/);
});

test("3. preserves unrelated variables", async () => {
    const dir = createTempDir();
    const envFile = path.join(dir, ".env.local");
    fs.writeFileSync(
        envFile,
        "PORT=3000\nSECRET_KEY=supersecret\nOTHER_FLAG=true\n",
        "utf8"
    );

    await mergeEnvFile(dir, ".env.local", {
        VITE_FIREBASE_API_KEY: "vitekey",
    });

    const content = fs.readFileSync(envFile, "utf8");
    assert.match(content, /PORT=3000/);
    assert.match(content, /SECRET_KEY=supersecret/);
    assert.match(content, /OTHER_FLAG=true/);
    assert.match(content, /VITE_FIREBASE_API_KEY=vitekey/);
});

test("4. preserves comments and blank lines", async () => {
    const dir = createTempDir();
    const envFile = path.join(dir, ".env.local");
    const initial = "# Global settings\nPORT=3000\n\n# Database settings\nDB=sqlite\n";
    fs.writeFileSync(envFile, initial, "utf8");

    await mergeEnvFile(dir, ".env.local", {
        FIREBASE_KEY: "123",
    });

    const content = fs.readFileSync(envFile, "utf8");
    assert.ok(content.includes("# Global settings"));
    assert.ok(content.includes("# Database settings"));
    assert.match(content, /PORT=3000/);
    assert.match(content, /DB=sqlite/);
    assert.match(content, /FIREBASE_KEY=123/);
});

test("5. idempotency: does not rewrite or duplicate existing identical Firebase variables", async () => {
    const dir = createTempDir();
    const envFile = path.join(dir, ".env.local");
    const initial = "VITE_FIREBASE_API_KEY=already-there\n";
    fs.writeFileSync(envFile, initial, "utf8");

    const result = await mergeEnvFile(dir, ".env.local", {
        VITE_FIREBASE_API_KEY: "already-there",
    });

    assert.equal(result.modified, false);
    const content = fs.readFileSync(envFile, "utf8");
    assert.equal(content, initial);

    // Running again does not duplicate
    const secondResult = await mergeEnvFile(dir, ".env.local", {
        VITE_FIREBASE_API_KEY: "already-there",
    });
    assert.equal(secondResult.modified, false);
    const secondContent = fs.readFileSync(envFile, "utf8");
    assert.equal(secondContent, initial);
});

test("6. detects conflicting Firebase values and prompts confirmation", async () => {
    const dir = createTempDir();
    const envFile = path.join(dir, ".env.local");
    fs.writeFileSync(
        envFile,
        "NEXT_PUBLIC_FIREBASE_API_KEY=old-key\n",
        "utf8"
    );

    let promptCalled = false;
    let promptArgs = null;

    await mergeEnvFile(
        dir,
        ".env.local",
        { NEXT_PUBLIC_FIREBASE_API_KEY: "new-key" },
        {
            confirmOverwrite: async (key, existingVal, newVal) => {
                promptCalled = true;
                promptArgs = { key, existingVal, newVal };
                return false;
            },
        }
    );

    assert.equal(promptCalled, true);
    assert.deepEqual(promptArgs, {
        key: "NEXT_PUBLIC_FIREBASE_API_KEY",
        existingVal: "old-key",
        newVal: "new-key",
    });
});

test("7. replaces conflicting values when confirmation returns true", async () => {
    const dir = createTempDir();
    const envFile = path.join(dir, ".env.local");
    fs.writeFileSync(
        envFile,
        "NEXT_PUBLIC_FIREBASE_API_KEY=old-key\nOTHER_VAL=keep\n",
        "utf8"
    );

    const result = await mergeEnvFile(
        dir,
        ".env.local",
        { NEXT_PUBLIC_FIREBASE_API_KEY: "new-key" },
        {
            confirmOverwrite: async () => true,
        }
    );

    assert.equal(result.modified, true);
    assert.equal(result.conflicts.length, 1);
    assert.equal(result.conflicts[0].overwritten, true);

    const content = fs.readFileSync(envFile, "utf8");
    assert.match(content, /NEXT_PUBLIC_FIREBASE_API_KEY=new-key/);
    assert.match(content, /OTHER_VAL=keep/);
});

test("8. preserves conflicting values when confirmation returns false", async () => {
    const dir = createTempDir();
    const envFile = path.join(dir, ".env.local");
    fs.writeFileSync(
        envFile,
        "NEXT_PUBLIC_FIREBASE_API_KEY=old-key\nOTHER_VAL=keep\n",
        "utf8"
    );

    const result = await mergeEnvFile(
        dir,
        ".env.local",
        { NEXT_PUBLIC_FIREBASE_API_KEY: "new-key" },
        {
            confirmOverwrite: async () => false,
        }
    );

    assert.equal(result.modified, false);
    assert.equal(result.conflicts.length, 1);
    assert.equal(result.conflicts[0].overwritten, false);
    assert.deepEqual(result.skipped, ["NEXT_PUBLIC_FIREBASE_API_KEY"]);

    const content = fs.readFileSync(envFile, "utf8");
    assert.match(content, /NEXT_PUBLIC_FIREBASE_API_KEY=old-key/);
    assert.match(content, /OTHER_VAL=keep/);
});

test("9. handles malformed/edge-case env lines safely", () => {
    assert.equal(parseEnvLine(""), null);
    assert.equal(parseEnvLine("   "), null);
    assert.equal(parseEnvLine("# just a comment"), null);
    assert.equal(parseEnvLine("NOT_AN_ASSIGNMENT"), null);

    const parsedQuoted = parseEnvLine('KEY="value with spaces"');
    assert.equal(parsedQuoted.key, "KEY");
    assert.equal(parsedQuoted.unquotedValue, "value with spaces");

    const parsedSingle = parseEnvLine("KEY='single quoted'");
    assert.equal(parsedSingle.key, "KEY");
    assert.equal(parsedSingle.unquotedValue, "single quoted");

    const parsedWithComment = parseEnvLine("KEY=val # trailing comment");
    assert.equal(parsedWithComment.key, "KEY");
    assert.equal(parsedWithComment.unquotedValue, "val");
});

test("10. does not match similarly named variables incorrectly", async () => {
    const dir = createTempDir();
    const envFile = path.join(dir, ".env.local");
    fs.writeFileSync(
        envFile,
        "MY_NEXT_PUBLIC_FIREBASE_API_KEY_BACKUP=backup-val\n",
        "utf8"
    );

    let promptCalled = false;
    await mergeEnvFile(
        dir,
        ".env.local",
        { NEXT_PUBLIC_FIREBASE_API_KEY: "actual-val" },
        {
            confirmOverwrite: async () => {
                promptCalled = true;
                return true;
            },
        }
    );

    // Should NOT have triggered a conflict prompt on MY_..._BACKUP
    assert.equal(promptCalled, false);

    const content = fs.readFileSync(envFile, "utf8");
    assert.match(
        content,
        /MY_NEXT_PUBLIC_FIREBASE_API_KEY_BACKUP=backup-val/
    );
    assert.match(
        content,
        /^NEXT_PUBLIC_FIREBASE_API_KEY=actual-val/m
    );
});

test("11. never creates .env.local2 or numbered files", async () => {
    const dir = createTempDir();
    const envFile = path.join(dir, ".env.local");
    fs.writeFileSync(envFile, "EXISTING=true\n", "utf8");

    await mergeEnvFile(dir, ".env.local", { FOO: "bar" });

    assert.equal(fs.existsSync(path.join(dir, ".env.local2")), false);
    assert.equal(fs.existsSync(path.join(dir, ".env.local.bak")), false);
});
