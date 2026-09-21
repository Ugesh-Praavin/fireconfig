#!/usr/bin/env node

const path = require("path");

const { detectProject } = require("../src/detectors/project");
const { detectPackageManager } = require("../src/detectors/package-manager");
const { detectFirebaseCLI } = require("../src/detectors/firebase-cli");
const { installFirebaseCLI } = require("../src/installers/firebase-cli");
const { checkFirebaseAuth } = require("../src/detectors/firebase-auth");
const { confirm } = require("@inquirer/prompts");
const { runFirebaseLogin } = require("../src/auth/firebase-login");
const { getFirebaseProjects } = require("../src/firebase/projects");
const { createFirebaseProject } = require("../src/firebase/project-create");
const { selectFirebaseProject, CREATE_PROJECT_SENTINEL } = require("../src/ui/project-selector");
const { selectFirebaseWebApp } = require("../src/ui/app-selector");
const { getFirebaseWebApps } = require("../src/firebase/apps");
const { createFirebaseWebApp } = require("../src/firebase/app-create");
const { getFirebaseSDKConfig } = require("../src/firebase/sdk-config");
const { getConfigurationStrategy } = require("../src/config/strategy");
const { ensureFirebaseSDK } = require("../src/installers/ensure-firebase-sdk");
const { runDoctor } = require("../src/doctor");
const { detectReactNativeAndroid } = require("../src/detectors/react-native-android");
const { ensureReactNativeFirebase } = require("../src/installers/ensure-react-native-firebase");
const { ensureAndroidFirebaseApp } = require("../src/firebase/android-app");
const { getFirebaseAndroidSDKConfig } = require("../src/firebase/android-sdk-config");
const { generateReactNativeAndroidConfig } = require("../src/generators/react-native-android");
const { mergeEnvFile } = require("../src/config/env-merger");
const { generateWebFirebaseConfig } = require("../src/generators/web-firebase-config");

// Prompts
const {
    confirmCreateFirebaseProject,
    confirmCreateNewFirebaseProject,
} = require("../src/prompts/create-project");
const { promptFirebaseProjectDetails } = require("../src/prompts/project-details");
const { confirmCreateFirebaseWebApp } = require("../src/prompts/create-app");
const { promptFirebaseWebAppDetails } = require("../src/prompts/app-details");
const { confirmEnvOverwrite } = require("../src/prompts/env-overwrite");
const { confirmConfigFileOverwrite } = require("../src/prompts/config-overwrite");

const args = process.argv.slice(2);
const command = args[0];

const VERSION = "0.3.0";

function showHelp() {
    console.log(`
🔥 FireConfig

Firebase configuration made simple.

Usage:
  fireconfig <command>

Commands:
  init       Configure Firebase
  doctor     Check Firebase setup
  --help     Show help
  --version  Show version
`);
}

function showVersion() {
    console.log(`FireConfig v${VERSION}`);
}

function getProjectLabel(type) {
    const labels = {
        react: "React",
        "react-vite": "React + Vite",
        "react-cra": "React + Create React App",
        nextjs: "Next.js",
        "react-native": "React Native",
        expo: "Expo",
    };

    return labels[type] || type;
}

/**
 * Prompts user for details and creates a Firebase project with explicit consent.
 */
async function createFirebaseProjectWithPrompt(dependencies = {}, options = {}) {
    const defaultConfirm = options.isNew
        ? confirmCreateNewFirebaseProject
        : confirmCreateFirebaseProject;

    const confirmCreate =
        (options.isNew && dependencies.confirmCreateNewFirebaseProject) ||
        dependencies.confirmCreateFirebaseProject ||
        dependencies.confirmCreate ||
        defaultConfirm;

    const promptDetails = dependencies.promptFirebaseProjectDetails || promptFirebaseProjectDetails;
    const createProject = dependencies.createFirebaseProject || createFirebaseProject;

    const shouldCreate = await confirmCreate();

    if (!shouldCreate) {
        console.log("\nFirebase project creation skipped.");
        console.log("Create a project in the Firebase Console and run FireConfig again.\n");
        return null;
    }

    const projectDetails = await promptDetails();
    console.log(`\nCreating Firebase project "${projectDetails.projectId}"...`);

    const creationResult = await createProject(
        projectDetails.projectId,
        projectDetails.displayName
    );

    if (!creationResult.success) {
        console.log("\n❌ Failed to create Firebase project.");
        console.log(`   ${creationResult.error}\n`);
        return null;
    }

    console.log(`✓ Firebase project "${projectDetails.projectId}" created successfully.`);
    return creationResult.project;
}

/**
 * Resolves or creates a Firebase project with explicit user consent.
 */
async function resolveFirebaseProject(dependencies = {}) {
    const getProjects = dependencies.getFirebaseProjects || getFirebaseProjects;
    const selectProject = dependencies.selectFirebaseProject || selectFirebaseProject;

    console.log("\nFetching Firebase projects...");

    const firebaseProjects = await getProjects();

    if (!firebaseProjects.success) {
        console.log("\n❌ Unable to fetch Firebase projects.");
        if (firebaseProjects.error) {
            console.log(`   ${firebaseProjects.error}`);
        }
        return null;
    }

    if (firebaseProjects.projects.length === 0) {
        console.log("⚠ No Firebase projects found.");
        return createFirebaseProjectWithPrompt(dependencies, { isNew: false });
    }

    console.log(
        `✓ Found ${firebaseProjects.projects.length} Firebase project${
            firebaseProjects.projects.length === 1 ? "" : "s"
        }`
    );

    const selectedProject = await selectProject(firebaseProjects.projects);

    if (selectedProject === CREATE_PROJECT_SENTINEL) {
        return createFirebaseProjectWithPrompt(dependencies, { isNew: true });
    }

    return selectedProject || null;
}

/**
 * Resolves or creates a Firebase Web App with explicit user consent.
 */
async function resolveFirebaseWebApp(projectId, defaultDisplayName, dependencies = {}) {
    const getWebApps = dependencies.getFirebaseWebApps || getFirebaseWebApps;
    const selectWebApp = dependencies.selectFirebaseWebApp || selectFirebaseWebApp;
    const confirmCreate = dependencies.confirmCreateFirebaseWebApp || confirmCreateFirebaseWebApp;
    const promptDetails = dependencies.promptFirebaseWebAppDetails || promptFirebaseWebAppDetails;
    const createApp = dependencies.createFirebaseWebApp || createFirebaseWebApp;
    const getSDKConfig = dependencies.getFirebaseSDKConfig || getFirebaseSDKConfig;

    console.log("\nChecking Firebase Web Apps...");

    const webApps = await getWebApps(projectId);

    if (!webApps.success) {
        console.log("\n❌ Unable to retrieve Firebase Web Apps.");
        if (webApps.error) {
            console.log(`   ${webApps.error}`);
        }
        return null;
    }

    let selectedWebApp = null;

    if (webApps.apps.length === 0) {
        console.log("⚠ No Firebase Web App found.");
        const shouldCreate = await confirmCreate();

        if (!shouldCreate) {
            console.log("\nFirebase Web App creation skipped.");
            console.log("Create a Web App in the Firebase Console and run FireConfig again.\n");
            return null;
        }

        const appDetails = await promptDetails(defaultDisplayName);
        console.log(`\nCreating Firebase Web App "${appDetails.displayName}"...`);

        // Record existing app IDs to identify the newly created app specifically
        const existingAppIds = new Set(webApps.apps.map((a) => a.appId));

        const creationResult = await createApp(projectId, appDetails.displayName);

        if (!creationResult.success) {
            console.log("\n❌ Failed to create Firebase Web App.");
            console.log(`   ${creationResult.error}\n`);
            return null;
        }

        // Re-fetch apps to retrieve the assigned appId and full configuration
        const reFetched = await getWebApps(projectId);
        if (!reFetched.success || !reFetched.apps.length) {
            console.log("\n❌ Unable to retrieve newly created Firebase Web App.");
            return null;
        }

        // Specifically identify the newly created app (do NOT blindly select apps[0])
        selectedWebApp =
            reFetched.apps.find(
                (a) => !existingAppIds.has(a.appId) && a.displayName === appDetails.displayName
            ) ||
            reFetched.apps.find((a) => !existingAppIds.has(a.appId)) ||
            reFetched.apps.find((a) => a.displayName === appDetails.displayName) ||
            reFetched.apps[reFetched.apps.length - 1];

        console.log(`✓ Firebase Web App created: ${selectedWebApp.displayName}`);
    } else {
        selectedWebApp = await selectWebApp(webApps.apps);
        if (!selectedWebApp) {
            return null;
        }
        console.log(`✓ Web App selected: ${selectedWebApp.displayName}`);
    }

    console.log("\nDownloading Firebase configuration...");
    const sdkResult = await getSDKConfig(projectId, selectedWebApp.appId);

    if (!sdkResult.success) {
        console.log("\n❌ Unable to retrieve Firebase configuration.");
        if (sdkResult.error) {
            console.log(`   ${sdkResult.error}`);
        }
        return null;
    }

    console.log("✓ Firebase configuration retrieved");
    return {
        app: selectedWebApp,
        config: sdkResult.config,
    };
}

/**
 * Configures environment variables and initialization for web frameworks.
 */
async function configureWebProject(projectRoot, strategy, sdkConfig, options = {}) {
    const envMerger = options.mergeEnvFile || mergeEnvFile;
    const configGenerator = options.generateWebFirebaseConfig || generateWebFirebaseConfig;
    const envConfirm = options.confirmEnvOverwrite || confirmEnvOverwrite;
    const fileConfirm = options.confirmConfigFileOverwrite || confirmConfigFileOverwrite;

    console.log("\nConfiguring Firebase environment...");

    const prefix = strategy.environment.prefix;
    const variables = {
        [`${prefix}API_KEY`]: sdkConfig.apiKey,
        [`${prefix}AUTH_DOMAIN`]: sdkConfig.authDomain,
        [`${prefix}PROJECT_ID`]: sdkConfig.projectId,
        [`${prefix}STORAGE_BUCKET`]: sdkConfig.storageBucket,
        [`${prefix}MESSAGING_SENDER_ID`]: sdkConfig.messagingSenderId,
        [`${prefix}APP_ID`]: sdkConfig.appId,
    };

    const envResult = await envMerger(
        projectRoot,
        strategy.environment.file,
        variables,
        {
            confirmOverwrite: envConfirm,
        }
    );

    if (envResult.created) {
        console.log(`✓ Created ${strategy.environment.file}`);
    } else if (envResult.modified) {
        console.log(`✓ Updated ${strategy.environment.file}`);
    } else {
        console.log(`✓ ${strategy.environment.file} is up to date`);
    }

    if (envResult.skipped.length > 0) {
        console.log(`  (Preserved existing values for: ${envResult.skipped.join(", ")})`);
    }

    console.log("\nGenerating Firebase initialization module...");

    const initResult = await configGenerator(projectRoot, {
        access: strategy.environment.access,
        prefix: strategy.environment.prefix,
        relativePath: strategy.initialization.path,
        confirmOverwrite: fileConfirm,
    });

    if (initResult.created) {
        console.log(`✓ Created ${strategy.initialization.path}`);
    } else if (initResult.modified) {
        console.log(`✓ Updated ${strategy.initialization.path}`);
    } else if (initResult.skipped) {
        console.log(`⚠ Preserved existing ${strategy.initialization.path}`);
    } else {
        console.log(`✓ ${strategy.initialization.path} is up to date`);
    }

    return true;
}

/**
 * Configures React Native Android project.
 */
async function configureReactNativeProject(projectRoot, packageManager, selectedProject) {
    const firebaseSDK = await ensureReactNativeFirebase(projectRoot, packageManager);

    if (!firebaseSDK.success) {
        return false;
    }

    console.log(`✓ Firebase SDK ${firebaseSDK.version} detected`);

    const android = detectReactNativeAndroid(projectRoot);

    if (!android.detected) {
        console.log("\n❌ Unable to detect the React Native Android application ID.");
        console.log("Make sure android/app/build.gradle contains an applicationId.\n");
        return false;
    }

    console.log(`✓ Android application ID detected: ${android.applicationId}`);

    const firebaseApp = ensureAndroidFirebaseApp(
        selectedProject.projectId,
        android.applicationId,
        selectedProject.displayName || android.applicationId
    );

    console.log(
        firebaseApp.created
            ? "✓ Firebase Android app created"
            : "✓ Existing Firebase Android app found"
    );

    const sdkConfig = getFirebaseAndroidSDKConfig(
        selectedProject.projectId,
        firebaseApp.appId
    );

    if (!sdkConfig.success) {
        console.log("\n❌ Unable to retrieve Firebase Android configuration.\n");
        return false;
    }

    const generated = generateReactNativeAndroidConfig(
        projectRoot,
        sdkConfig.content
    );

    if (!generated.success) {
        if (generated.exists) {
            console.log(
                `\n⚠ Firebase Android configuration already exists:\n   ${generated.path}\n`
            );
            return false;
        }

        console.log(
            `\n❌ ${generated.error || "Unable to generate Firebase Android configuration."}\n`
        );
        return false;
    }

    console.log(
        `✓ Firebase Android configuration generated:\n   ${generated.path}`
    );

    return true;
}

async function init() {
    console.log("\n🔥 FireConfig\n");
    console.log("Detecting project...\n");

    // 1. Detect project
    const project = detectProject();

    if (project.type === "unknown") {
        console.log("❌ Could not detect a supported project.");
        console.log(`   ${project.reason}\n`);
        console.log("Supported projects:");
        console.log("  • React");
        console.log("  • Next.js");
        console.log("  • React Native");
        console.log("  • Expo (coming soon)");
        return false;
    }

    if (project.type === "expo") {
        console.log("✓ Expo project detected");
        console.log("\n⚠ Firebase configuration for Expo is not implemented yet.");
        console.log("Stay tuned for a future release!\n");
        return false;
    }

    console.log(`✓ ${getProjectLabel(project.type)} project detected`);
    if (project.name) {
        console.log(`✓ Project name: ${project.name}`);
    }

    // 2. Detect package manager
    const packageManager = detectPackageManager();
    if (packageManager === "unknown") {
        console.log("⚠ Could not detect package manager");
    } else {
        console.log(`✓ ${packageManager} detected`);
    }

    // 3. Detect Firebase CLI
    let firebaseCLI = detectFirebaseCLI();
    if (firebaseCLI.installed) {
        console.log(`✓ Firebase CLI ${firebaseCLI.version} detected`);
    } else {
        console.log("⚠ Firebase CLI not detected");
        const installed = await installFirebaseCLI(packageManager);
        if (!installed) {
            return false;
        }

        firebaseCLI = detectFirebaseCLI();
        if (!firebaseCLI.installed) {
            console.log("\n❌ Firebase CLI installation could not be verified.");
            return false;
        }
        console.log(`✓ Firebase CLI ${firebaseCLI.version} detected`);
    }

    // 4. Firebase authentication
    let auth = checkFirebaseAuth();
    if (auth.authenticated) {
        console.log("✓ Firebase authentication detected");
    } else {
        console.log("⚠ Firebase authentication required");
        const shouldLogin = await confirm({
            message: "Would you like to sign in to Firebase?",
            default: true,
        });

        if (!shouldLogin) {
            console.log("\nFirebase authentication skipped.");
            console.log("Run 'firebase login' when you're ready.\n");
            return false;
        }

        const loginSuccessful = runFirebaseLogin();
        if (!loginSuccessful) {
            return false;
        }

        auth = checkFirebaseAuth();
        if (!auth.authenticated) {
            console.log("\n❌ Firebase authentication could not be verified.");
            return false;
        }
        console.log("✓ Firebase authentication verified");
    }

    // 5. Resolve Firebase project
    const selectedProject = await resolveFirebaseProject();
    if (!selectedProject) {
        return false;
    }

    console.log("\n✓ Firebase project selected");
    console.log(`  Name: ${selectedProject.displayName}`);
    console.log(`  ID:   ${selectedProject.projectId}`);

    // 6. Branch by platform
    if (project.type === "react-native") {
        const rnResult = await configureReactNativeProject(
            process.cwd(),
            packageManager,
            selectedProject
        );
        if (!rnResult) {
            return false;
        }
    } else {
        // Web Platform (React, React+Vite, React+CRA, Next.js)
        const strategy = getConfigurationStrategy(project.type, process.cwd());
        if (!strategy) {
            console.log(
                `\n✖ No Firebase configuration strategy is available for ${getProjectLabel(
                    project.type
                )}.`
            );
            return false;
        }

        if (project.type === "react" && strategy.environment && !strategy.environment.supported) {
            console.log("\n❌ Plain React project does not have a build tool configured to inject environment variables into the browser.");
            console.log(`   ${strategy.environment.reason}\n`);
            return false;
        }

        // Resolve Web App
        const defaultAppName = project.name || selectedProject.displayName || "Web App";
        const webAppResult = await resolveFirebaseWebApp(
            selectedProject.projectId,
            defaultAppName
        );

        if (!webAppResult) {
            return false;
        }

        // Ensure web Firebase SDK is installed
        const firebaseSDK = await ensureFirebaseSDK(process.cwd(), packageManager);
        if (!firebaseSDK.success) {
            return false;
        }

        console.log(`✓ Firebase SDK ${firebaseSDK.version} detected`);

        // Configure project (merger + initialization generator)
        const configured = await configureWebProject(
            process.cwd(),
            strategy,
            webAppResult.config
        );

        if (!configured) {
            return false;
        }
    }

    // Complete
    console.log("\n🔥 Firebase configuration complete!");
    console.log("Your Firebase project is now connected.\n");

    return true;
}

async function main() {
    switch (command) {
        case "init":
            await init();
            break;

        case "doctor":
            runDoctor();
            break;

        case "--version":
        case "-v":
            showVersion();
            break;

        case "--help":
        case "-h":
        case undefined:
            showHelp();
            break;

        default:
            console.log(`❌ Unknown command: ${command}`);
            console.log("Run 'fireconfig --help' to see available commands.");
            process.exitCode = 1;
    }
}

if (require.main === module) {
    main().catch((error) => {
        console.error("\n❌ FireConfig encountered an unexpected error.");
        console.error(`   ${error.message}`);
        process.exitCode = 1;
    });
}

module.exports = {
    init,
    main,
    resolveFirebaseProject,
    createFirebaseProjectWithPrompt,
    resolveFirebaseWebApp,
    configureWebProject,
    configureReactNativeProject,
    showHelp,
    showVersion,
    VERSION,
};