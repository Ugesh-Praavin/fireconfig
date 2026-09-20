const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    runDoctorChecks,
} = require("../src/doctor/checks");

function createTempProject({
    config = null,
    lockfile = "package-lock.json",
    firebase = true,
} = {}) {
    const projectRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-doctor-")
    );

    const packageJson = {
        name: "doctor-test",
        dependencies: {
            react: "^19.0.0",
        },
    };

    if (firebase) {
        packageJson.dependencies.firebase =
            "^12.19.0";
    }

    fs.writeFileSync(
        path.join(projectRoot, "package.json"),
        JSON.stringify(packageJson, null, 2),
        "utf8"
    );

    if (lockfile) {
        fs.writeFileSync(
            path.join(projectRoot, lockfile),
            "",
            "utf8"
        );
    }

    if (config !== null) {
        const firebaseDirectory = path.join(
            projectRoot,
            "src",
            "firebase"
        );

        fs.mkdirSync(firebaseDirectory, {
            recursive: true,
        });

        fs.writeFileSync(
            path.join(firebaseDirectory, "config.js"),
            config,
            "utf8"
        );
    }

    return projectRoot;
}

const validConfig = `
const firebaseConfig = {
    "apiKey": "test-api-key",
    "authDomain": "test.firebaseapp.com",
    "projectId": "test-project",
    "storageBucket": "test.firebasestorage.app",
    "messagingSenderId": "123456789",
    "appId": "1:123456789:web:test"
};
`;

const incompleteConfig = `
const firebaseConfig = {
    "apiKey": "test-api-key",
    "projectId": "test-project"
};
`;

test("doctor passes project-specific checks for a healthy project", () => {
    const projectRoot = createTempProject({
        config: validConfig,
    });

    const checks = runDoctorChecks(projectRoot, {
        detectFirebaseCLI: () => ({
            installed: true,
            version: "15.30.2",
        }),
        checkFirebaseAuth: () => ({
            authenticated: true,
        }),
    });

    const project = checks.find(
        (check) => check.name === "Project"
    );

    const packageManager = checks.find(
        (check) => check.name === "Package manager"
    );

    const sdk = checks.find(
        (check) => check.name === "Firebase SDK"
    );

    const firebaseConfig = checks.find(
        (check) => check.name === "Firebase config"
    );

    assert.equal(project.passed, true);
    assert.equal(packageManager.passed, true);
    assert.equal(sdk.passed, true);
    assert.equal(firebaseConfig.passed, true);
});

test("doctor detects missing Firebase config", () => {
    const projectRoot = createTempProject();

    const checks = runDoctorChecks(projectRoot, {
        detectFirebaseCLI: () => ({
            installed: true,
            version: "15.30.2",
        }),
        checkFirebaseAuth: () => ({
            authenticated: true,
        }),
    });
    const firebaseConfig = checks.find(
        (check) => check.name === "Firebase config"
    );

    assert.equal(firebaseConfig.passed, false);
    assert.equal(
        firebaseConfig.message,
        "Firebase configuration not found"
    );
});

test("doctor detects incomplete Firebase config", () => {
    const projectRoot = createTempProject({
        config: incompleteConfig,
    });

    const checks = runDoctorChecks(projectRoot, {
        detectFirebaseCLI: () => ({
            installed: true,
            version: "15.30.2",
        }),
        checkFirebaseAuth: () => ({
            authenticated: true,
        }),
    });
    const firebaseConfig = checks.find(
        (check) => check.name === "Firebase config"
    );

    assert.equal(firebaseConfig.passed, false);
    assert.equal(
        firebaseConfig.message,
        "Firebase configuration is incomplete"
    );
});