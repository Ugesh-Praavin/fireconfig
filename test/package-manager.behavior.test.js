const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    detectPackageManager,
} = require("../src/detectors/package-manager");

function createTempProject(files = []) {
    const projectRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-pm-")
    );

    for (const file of files) {
        fs.writeFileSync(
            path.join(projectRoot, file),
            "",
            "utf8"
        );
    }

    return projectRoot;
}

test("detects pnpm", () => {
    const projectRoot = createTempProject([
        "pnpm-lock.yaml",
    ]);

    assert.equal(
        detectPackageManager(projectRoot),
        "pnpm"
    );
});

test("detects yarn", () => {
    const projectRoot = createTempProject([
        "yarn.lock",
    ]);

    assert.equal(
        detectPackageManager(projectRoot),
        "yarn"
    );
});

test("detects bun with bun.lock", () => {
    const projectRoot = createTempProject([
        "bun.lock",
    ]);

    assert.equal(
        detectPackageManager(projectRoot),
        "bun"
    );
});

test("detects bun with bun.lockb", () => {
    const projectRoot = createTempProject([
        "bun.lockb",
    ]);

    assert.equal(
        detectPackageManager(projectRoot),
        "bun"
    );
});

test("detects npm", () => {
    const projectRoot = createTempProject([
        "package-lock.json",
    ]);

    assert.equal(
        detectPackageManager(projectRoot),
        "npm"
    );
});

test("returns unknown when no lockfile exists", () => {
    const projectRoot = createTempProject();

    assert.equal(
        detectPackageManager(projectRoot),
        "unknown"
    );
});