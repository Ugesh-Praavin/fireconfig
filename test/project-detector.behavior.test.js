const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    detectProject,
} = require("../src/detectors/project");

function createProject(packageJson) {
    const projectRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-project-")
    );

    fs.writeFileSync(
        path.join(projectRoot, "package.json"),
        JSON.stringify(packageJson, null, 2),
        "utf8"
    );

    return projectRoot;
}

test("detects React project", () => {
    const projectRoot = createProject({
        name: "test-react",
        dependencies: {
            react: "^19.0.0",
        },
    });

    const result = detectProject(projectRoot);

    assert.equal(result.type, "react");
});

test("detects Next.js project", () => {
    const projectRoot = createProject({
        name: "test-next",
        dependencies: {
            next: "^15.0.0",
            react: "^19.0.0",
        },
    });

    const result = detectProject(projectRoot);

    assert.equal(result.type, "nextjs");
});

test("detects React Native project", () => {
    const projectRoot = createProject({
        name: "test-native",
        dependencies: {
            "react-native": "^0.80.0",
        },
    });

    const result = detectProject(projectRoot);

    assert.equal(result.type, "react-native");
});

test("detects Expo project", () => {
    const projectRoot = createProject({
        name: "test-expo",
        dependencies: {
            expo: "^54.0.0",
            react: "^19.0.0",
        },
    });

    const result = detectProject(projectRoot);

    assert.equal(result.type, "expo");
});

test("returns unknown for unsupported project", () => {
    const projectRoot = createProject({
        name: "test-unknown",
        dependencies: {
            express: "^5.0.0",
        },
    });

    const result = detectProject(projectRoot);

    assert.equal(result.type, "unknown");
});
test("detects React + Vite project", () => {
    const projectRoot = createProject({
        name: "test-react-vite",
        dependencies: {
            react: "^19.0.0",
            vite: "^7.0.0",
        },
    });

    const result = detectProject(projectRoot);

    assert.equal(result.type, "react-vite");
});

test("detects React + Create React App project", () => {
    const projectRoot = createProject({
        name: "test-react-cra",
        dependencies: {
            react: "^19.0.0",
            "react-scripts": "^5.0.1",
        },
    });

    const result = detectProject(projectRoot);

    assert.equal(result.type, "react-cra");
});