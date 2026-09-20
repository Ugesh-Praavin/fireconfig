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
function createTempReactCraProject({
    env = null,
} = {}) {
    const projectRoot = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-react-cra-doctor-"
        )
    );

    const packageJson = {
        name: "react-cra-doctor-test",
        dependencies: {
            react: "^19.0.0",
            "react-scripts": "^5.0.1",
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

    if (env !== null) {
        fs.writeFileSync(
            path.join(projectRoot, ".env.local"),
            env,
            "utf8"
        );
    }

    return projectRoot;
}
function createTempNextjsProject({
    env = null,
} = {}) {
    const projectRoot = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-nextjs-doctor-"
        )
    );

    const packageJson = {
        name: "nextjs-doctor-test",
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

    if (env !== null) {
        fs.writeFileSync(
            path.join(projectRoot, ".env.local"),
            env,
            "utf8"
        );
    }

    return projectRoot;
}
function createTempReactNativeProject({
    firebase = true,
    googleServices = true,
} = {}) {
    const projectRoot = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-react-native-doctor-"
        )
    );

    const packageJson = {
        name: "react-native-doctor-test",
        dependencies: {
            react: "^19.0.0",
            "react-native": "0.87.1",
        },
    };

    if (firebase) {
        packageJson.dependencies[
            "@react-native-firebase/app"
        ] = "^26.4.0";
    }

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

    const androidAppDirectory = path.join(
        projectRoot,
        "android",
        "app"
    );

    fs.mkdirSync(androidAppDirectory, {
        recursive: true,
    });

    fs.writeFileSync(
        path.join(
            androidAppDirectory,
            "build.gradle"
        ),
        `
android {
    defaultConfig {
        applicationId "com.fireconfig.doctortest"
    }
}
`,
        "utf8"
    );

    if (googleServices) {
        fs.writeFileSync(
            path.join(
                androidAppDirectory,
                "google-services.json"
            ),
            JSON.stringify({
                project_info: {
                    project_id: "test-project",
                },
                client: [
                    {
                        client_info: {
                            android_client_info: {
                                package_name:
                                    "com.fireconfig.doctortest",
                            },
                        },
                    },
                ],
            }),
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
test("doctor validates Next.js Firebase environment configuration", () => {
    const projectRoot = createTempNextjsProject({
        env: [
            "NEXT_PUBLIC_FIREBASE_API_KEY=test-key",
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project",
            "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test.firebasestorage.app",
            "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789",
            "NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:test",
            "",
        ].join("\n"),
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

    const firebaseConfig = checks.find(
        (check) => check.name === "Firebase config"
    );

    assert.equal(project.passed, true);
    assert.equal(
        project.details.type,
        "nextjs"
    );

    assert.equal(
        firebaseConfig.passed,
        true
    );

    assert.equal(
        firebaseConfig.message,
        "Next.js Firebase environment configuration is valid"
    );
});

test("doctor detects missing Next.js Firebase environment configuration", () => {
    const projectRoot =
        createTempNextjsProject();

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

    assert.equal(
        firebaseConfig.passed,
        false
    );

    assert.equal(
        firebaseConfig.message,
        "Next.js Firebase environment configuration not found"
    );
});
test("doctor validates React CRA Firebase environment configuration", () => {
    const projectRoot =
        createTempReactCraProject({
            env: [
                "REACT_APP_FIREBASE_API_KEY=test-key",
                "REACT_APP_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com",
                "REACT_APP_FIREBASE_PROJECT_ID=test-project",
                "REACT_APP_FIREBASE_STORAGE_BUCKET=test.firebasestorage.app",
                "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789",
                "REACT_APP_FIREBASE_APP_ID=1:123456789:web:test",
                "",
            ].join("\n"),
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

    const firebaseConfig = checks.find(
        (check) => check.name === "Firebase config"
    );

    assert.equal(project.passed, true);
    assert.equal(
        project.details.type,
        "react-cra"
    );

    assert.equal(
        firebaseConfig.passed,
        true
    );
});
test("doctor detects missing React CRA Firebase environment configuration", () => {
    const projectRoot =
        createTempReactCraProject();

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

    const firebaseConfig = checks.find(
        (check) => check.name === "Firebase config"
    );

    assert.equal(project.passed, true);
    assert.equal(
        project.details.type,
        "react-cra"
    );

    assert.equal(
        firebaseConfig.passed,
        false
    );
});

test("doctor validates React Native Firebase configuration", () => {
    const projectRoot =
        createTempReactNativeProject();

    const checks = runDoctorChecks(
        projectRoot,
        {
            detectFirebaseCLI: () => ({
                installed: true,
                version: "15.30.2",
            }),
            checkFirebaseAuth: () => ({
                authenticated: true,
            }),
        }
    );

    const project = checks.find(
        (check) => check.name === "Project"
    );

    const sdk = checks.find(
        (check) => check.name === "Firebase SDK"
    );

    const firebaseConfig = checks.find(
        (check) => check.name === "Firebase config"
    );

    assert.equal(project.passed, true);
    assert.equal(
        project.message,
        "react-native project detected"
    );

    assert.equal(sdk.passed, true);

    assert.equal(
        firebaseConfig.passed,
        true
    );
});