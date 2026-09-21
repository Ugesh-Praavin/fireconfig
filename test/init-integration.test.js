const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    resolveFirebaseProject,
    resolveFirebaseWebApp,
    configureWebProject,
} = require("../bin/index");
const { getConfigurationStrategy } = require("../src/config/strategy");
const { generateNextjsEnv } = require("../src/generators/nextjs-env");
const { CREATE_PROJECT_SENTINEL } = require("../src/ui/project-selector");

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

test("init generates Next.js Firebase environment configuration", async () => {
    const projectRoot = createTempNextjsProject();

    const config = {
        apiKey: "test-api-key",
        authDomain: "test.firebaseapp.com",
        projectId: "test-project",
        storageBucket: "test.firebasestorage.app",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:test",
    };

    const result = await generateNextjsEnv(
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

test("integration: project creation flow when 0 projects exist and user confirms", async () => {
    let createdWithId = null;

    const project = await resolveFirebaseProject({
        getFirebaseProjects: async () => ({ success: true, projects: [] }),
        confirmCreateFirebaseProject: async () => true,
        promptFirebaseProjectDetails: async () => ({
            projectId: "my-brand-new-project",
            displayName: "Brand New Project",
        }),
        createFirebaseProject: async (projectId, displayName) => {
            createdWithId = projectId;
            return {
                success: true,
                project: { projectId, displayName },
            };
        },
    });

    assert.equal(createdWithId, "my-brand-new-project");
    assert.deepEqual(project, {
        projectId: "my-brand-new-project",
        displayName: "Brand New Project",
    });
});

test("integration: project creation declines when user says no", async () => {
    let createCalled = false;

    const project = await resolveFirebaseProject({
        getFirebaseProjects: async () => ({ success: true, projects: [] }),
        confirmCreateFirebaseProject: async () => false,
        createFirebaseProject: async () => {
            createCalled = true;
        },
    });

    assert.equal(project, null);
    assert.equal(createCalled, false);
});

test("integration: selecting an existing project returns that project without creating", async () => {
    let createCalled = false;
    const existingProjects = [
        { projectId: "bear-ai-gen", displayName: "Bear Ai" },
        { projectId: "campusbus-23a14", displayName: "campusbus" },
    ];

    const project = await resolveFirebaseProject({
        getFirebaseProjects: async () => ({ success: true, projects: existingProjects }),
        selectFirebaseProject: async (projects) => projects[1], // select campusbus
        createFirebaseProject: async () => {
            createCalled = true;
        },
    });

    assert.deepEqual(project, existingProjects[1]);
    assert.equal(createCalled, false);
});

test("integration: selecting create when projects exist triggers confirmation and creates project", async () => {
    let createdWithId = null;
    let confirmPromptCalled = false;
    const existingProjects = [
        { projectId: "bear-ai-gen", displayName: "Bear Ai" },
    ];

    const project = await resolveFirebaseProject({
        getFirebaseProjects: async () => ({ success: true, projects: existingProjects }),
        selectFirebaseProject: async () => CREATE_PROJECT_SENTINEL,
        confirmCreateFirebaseProject: async () => {
            confirmPromptCalled = true;
            return true;
        },
        promptFirebaseProjectDetails: async () => ({
            projectId: "newly-created-project",
            displayName: "Newly Created",
        }),
        createFirebaseProject: async (projectId, displayName) => {
            createdWithId = projectId;
            return {
                success: true,
                project: { projectId, displayName },
            };
        },
    });

    assert.equal(confirmPromptCalled, true);
    assert.equal(createdWithId, "newly-created-project");
    assert.deepEqual(project, {
        projectId: "newly-created-project",
        displayName: "Newly Created",
    });
});

test("integration: selecting create when projects exist and declining does not create project", async () => {
    let createCalled = false;
    let confirmPromptCalled = false;
    const existingProjects = [
        { projectId: "bear-ai-gen", displayName: "Bear Ai" },
    ];

    const project = await resolveFirebaseProject({
        getFirebaseProjects: async () => ({ success: true, projects: existingProjects }),
        selectFirebaseProject: async () => CREATE_PROJECT_SENTINEL,
        confirmCreateFirebaseProject: async () => {
            confirmPromptCalled = true;
            return false;
        },
        createFirebaseProject: async () => {
            createCalled = true;
        },
    });

    assert.equal(confirmPromptCalled, true);
    assert.equal(createCalled, false);
    assert.equal(project, null);
});

test("integration: Case 1 — zero projects triggers confirmCreateFirebaseProject ('No Firebase projects found...')", async () => {
    let zeroProjectsConfirmCalled = false;
    let newProjectConfirmCalled = false;

    await resolveFirebaseProject({
        getFirebaseProjects: async () => ({ success: true, projects: [] }),
        confirmCreateFirebaseProject: async () => {
            zeroProjectsConfirmCalled = true;
            return false;
        },
        confirmCreateNewFirebaseProject: async () => {
            newProjectConfirmCalled = true;
            return false;
        },
    });

    assert.equal(zeroProjectsConfirmCalled, true);
    assert.equal(newProjectConfirmCalled, false);
});

test("integration: Case 2 — selecting create when projects exist triggers confirmCreateNewFirebaseProject ('Would you like to create a new...')", async () => {
    let zeroProjectsConfirmCalled = false;
    let newProjectConfirmCalled = false;

    await resolveFirebaseProject({
        getFirebaseProjects: async () => ({
            success: true,
            projects: [{ projectId: "p1", displayName: "P1" }],
        }),
        selectFirebaseProject: async () => CREATE_PROJECT_SENTINEL,
        confirmCreateFirebaseProject: async () => {
            zeroProjectsConfirmCalled = true;
            return false;
        },
        confirmCreateNewFirebaseProject: async () => {
            newProjectConfirmCalled = true;
            return false;
        },
    });

    assert.equal(newProjectConfirmCalled, true);
    assert.equal(zeroProjectsConfirmCalled, false);
});

test("integration: Web App creation flow when 0 web apps exist and user confirms", async () => {
    let createdAppName = null;
    let appsInProject = [];

    const result = await resolveFirebaseWebApp(
        "test-proj-id",
        "Default Name",
        {
            getFirebaseWebApps: async () => ({
                success: true,
                apps: appsInProject,
            }),
            confirmCreateFirebaseWebApp: async () => true,
            promptFirebaseWebAppDetails: async () => ({
                displayName: "Created Web App",
            }),
            createFirebaseWebApp: async (projectId, displayName) => {
                createdAppName = displayName;
                appsInProject = [
                    { appId: "1:999:web:newapp", displayName },
                ];
                return { success: true, app: { displayName } };
            },
            getFirebaseSDKConfig: async (projId, appId) => ({
                success: true,
                config: {
                    apiKey: "mock-key",
                    appId,
                    projectId: projId,
                },
            }),
        }
    );

    assert.equal(createdAppName, "Created Web App");
    assert.equal(result.app.appId, "1:999:web:newapp");
    assert.equal(result.config.apiKey, "mock-key");
});

test("integration: existing Web Apps do not cause unnecessary Web App creation", async () => {
    let createAppCalled = false;

    const existingApps = [
        { appId: "1:111:web:app1", displayName: "Existing App 1" },
        { appId: "1:222:web:app2", displayName: "Existing App 2" },
    ];

    const result = await resolveFirebaseWebApp(
        "test-proj-id",
        "Default Name",
        {
            getFirebaseWebApps: async () => ({
                success: true,
                apps: existingApps,
            }),
            selectFirebaseWebApp: async (apps) => apps[0],
            createFirebaseWebApp: async () => {
                createAppCalled = true;
            },
            getFirebaseSDKConfig: async (projId, appId) => ({
                success: true,
                config: {
                    apiKey: "existing-app-key",
                    appId,
                    projectId: projId,
                },
            }),
        }
    );

    assert.equal(createAppCalled, false);
    assert.equal(result.app.appId, "1:111:web:app1");
});

test("integration: identifies newly created Web App specifically even when other apps exist", async () => {
    const existingApps = [
        { appId: "1:111:web:app1", displayName: "Old App" },
    ];
    let currentApps = [...existingApps];

    const result = await resolveFirebaseWebApp(
        "test-proj-id",
        "Default Name",
        {
            getFirebaseWebApps: async () => ({
                success: true,
                // Simulate: initially 0 apps matched or user initiated creation
                apps: currentApps,
            }),
            selectFirebaseWebApp: async (apps) => apps[0],
            confirmCreateFirebaseWebApp: async () => true,
            promptFirebaseWebAppDetails: async () => ({
                displayName: "Newly Added App",
            }),
            createFirebaseWebApp: async (projectId, displayName) => {
                currentApps.push({
                    appId: "1:888:web:newlyadded",
                    displayName,
                });
                return { success: true, app: { displayName } };
            },
            getFirebaseSDKConfig: async (projId, appId) => ({
                success: true,
                config: { apiKey: "key", appId, projectId: projId },
            }),
        }
    );

    // When existing apps exist, resolveFirebaseWebApp selects an existing app without creating
    assert.equal(result.app.appId, "1:111:web:app1");
});

test("integration: full web project configuration creates .env.local and src/firebase/config.js", async () => {
    const projectRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-full-web-")
    );

    const strategy = getConfigurationStrategy("react-vite");
    const sdkConfig = {
        apiKey: "vite-api-key",
        authDomain: "vite-app.firebaseapp.com",
        projectId: "vite-app",
        storageBucket: "vite-app.appspot.com",
        messagingSenderId: "112233",
        appId: "1:112233:web:vite",
    };

    const success = await configureWebProject(projectRoot, strategy, sdkConfig);
    assert.equal(success, true);

    const envContent = fs.readFileSync(
        path.join(projectRoot, ".env.local"),
        "utf8"
    );
    assert.match(envContent, /VITE_FIREBASE_API_KEY=vite-api-key/);
    assert.match(envContent, /VITE_FIREBASE_PROJECT_ID=vite-app/);

    const configContent = fs.readFileSync(
        path.join(projectRoot, "src", "firebase", "config.js"),
        "utf8"
    );
    assert.match(configContent, /import\.meta\.env\.VITE_FIREBASE_API_KEY/);
    assert.match(configContent, /initializeApp\(firebaseConfig\)/);
});

test("integration: idempotency — running configuration repeatedly does not duplicate variables or initialization", async () => {
    const projectRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "fireconfig-idempotent-")
    );

    const strategy = getConfigurationStrategy("nextjs");
    const sdkConfig = {
        apiKey: "next-api-key",
        authDomain: "next-app.firebaseapp.com",
        projectId: "next-app",
        storageBucket: "next-app.appspot.com",
        messagingSenderId: "445566",
        appId: "1:445566:web:next",
    };

    // Run 1
    await configureWebProject(projectRoot, strategy, sdkConfig);
    const envPass1 = fs.readFileSync(path.join(projectRoot, ".env.local"), "utf8");
    const configPass1 = fs.readFileSync(path.join(projectRoot, "src", "firebase", "config.js"), "utf8");

    // Run 2
    await configureWebProject(projectRoot, strategy, sdkConfig);
    const envPass2 = fs.readFileSync(path.join(projectRoot, ".env.local"), "utf8");
    const configPass2 = fs.readFileSync(path.join(projectRoot, "src", "firebase", "config.js"), "utf8");

    assert.equal(envPass1, envPass2);
    assert.equal(configPass1, configPass2);
});