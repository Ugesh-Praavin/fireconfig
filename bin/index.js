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
const { selectFirebaseProject } = require("../src/ui/project-selector");
const { detectFirebaseSDK } = require("../src/detectors/firebase-sdk");
const { getFirebaseWebApps } = require("../src/firebase/apps");
const { getFirebaseSDKConfig } = require("../src/firebase/sdk-config");
const {
    generateFirebaseConfig,
} = require("../src/generators/firebase-config");
const { runDoctor } = require("../src/doctor");

const args = process.argv.slice(2);
const command = args[0];

const VERSION = "0.1.0";

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

async function init() {
    console.log("\n🔥 FireConfig\n");
    console.log("Detecting project...\n");

    // --------------------------------------------------
    // 1. Detect project
    // --------------------------------------------------

    const project = detectProject();

    if (project.type === "unknown") {
        console.log("❌ Could not detect a supported project.");
        console.log(`   ${project.reason}\n`);

        console.log("Supported projects:");
        console.log("  • React");
        console.log("  • Next.js");
        console.log("  • React Native");
        console.log("  • Expo");

        return false;
    }

    console.log(
        `✓ ${getProjectLabel(project.type)} project detected`
    );

    if (project.name) {
        console.log(`✓ Project name: ${project.name}`);
    }

    // --------------------------------------------------
    // 2. Detect package manager
    // --------------------------------------------------

    const packageManager = detectPackageManager();

    if (packageManager === "unknown") {
        console.log("⚠ Could not detect package manager");
    } else {
        console.log(`✓ ${packageManager} detected`);
    }

    // --------------------------------------------------
    // 3. Detect Firebase CLI
    // --------------------------------------------------

    let firebaseCLI = detectFirebaseCLI();

    if (firebaseCLI.installed) {
        console.log(
            `✓ Firebase CLI ${firebaseCLI.version} detected`
        );
    } else {
        console.log("⚠ Firebase CLI not detected");

        const installed = await installFirebaseCLI(
            packageManager
        );

        if (!installed) {
            return false;
        }

        // Re-detect after installation.
        firebaseCLI = detectFirebaseCLI();

        if (!firebaseCLI.installed) {
            console.log(
                "\n❌ Firebase CLI installation could not be verified."
            );

            return false;
        }

        console.log(
            `✓ Firebase CLI ${firebaseCLI.version} detected`
        );
    }

    // --------------------------------------------------
    // 4. Firebase authentication
    // --------------------------------------------------

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
            console.log(
                "Run 'firebase login' when you're ready.\n"
            );

            return false;
        }

        const loginSuccessful = runFirebaseLogin();

        if (!loginSuccessful) {
            return false;
        }

        auth = checkFirebaseAuth();

        if (!auth.authenticated) {
            console.log(
                "\n❌ Firebase authentication could not be verified."
            );

            return false;
        }

        console.log("✓ Firebase authentication verified");
    }

    // --------------------------------------------------
    // 5. Fetch Firebase projects
    // --------------------------------------------------

    console.log("\nFetching Firebase projects...");

    const firebaseProjects = getFirebaseProjects();

    if (!firebaseProjects.success) {
        console.log(
            "\n❌ Unable to fetch Firebase projects."
        );

        if (firebaseProjects.error) {
            console.log(`   ${firebaseProjects.error}`);
        }

        return false;
    }

    console.log(
        `✓ Found ${firebaseProjects.projects.length} Firebase project${firebaseProjects.projects.length === 1
            ? ""
            : "s"
        }`
    );

    // --------------------------------------------------
    // 6. Select Firebase project
    // --------------------------------------------------

    const selectedProject = await selectFirebaseProject(
        firebaseProjects.projects
    );

    if (!selectedProject) {
        return false;
    }

    console.log("\n✓ Firebase project selected");
    console.log(`  Name: ${selectedProject.displayName}`);
    console.log(`  ID:   ${selectedProject.projectId}`);

    // --------------------------------------------------
    // 7. Find Firebase Web App
    // --------------------------------------------------

    console.log("\nChecking Firebase Web Apps...");

    const webApps = await getFirebaseWebApps(
        selectedProject.projectId
    );

    if (!webApps.success) {
        console.log(
            "\n❌ Unable to retrieve Firebase Web Apps."
        );

        if (webApps.error) {
            console.log(`   ${webApps.error}`);
        }

        return false;
    }

    if (webApps.apps.length === 0) {
        console.log("\n⚠ No Firebase Web App found.");
        console.log(
            "Create a Web App in the Firebase Console and run FireConfig again."
        );

        return false;
    }

    console.log(
        `✓ Web App found: ${webApps.apps[0].displayName}`
    );

    const selectedWebApp = webApps.apps[0];

    // --------------------------------------------------
    // 8. Download Firebase SDK configuration
    // --------------------------------------------------

    console.log(
        "\nDownloading Firebase configuration..."
    );

    const sdkResult = await getFirebaseSDKConfig(
        selectedProject.projectId,
        selectedWebApp.appId
    );

    if (!sdkResult.success) {
        console.log(
            "\n❌ Unable to retrieve Firebase configuration."
        );

        if (sdkResult.error) {
            console.log(`   ${sdkResult.error}`);
        }

        return false;
    }

    console.log(
        "✓ Firebase configuration retrieved"
    );

    // --------------------------------------------------
    // 9. Check Firebase SDK
    // --------------------------------------------------

    const firebaseSDK = detectFirebaseSDK(
        process.cwd()
    );

    if (!firebaseSDK.installed) {
        console.log(
            "\n⚠ Firebase SDK is not installed."
        );

        console.log(
            `Run:\n\n  ${packageManager === "npm"
                ? "npm install firebase"
                : `${packageManager} add firebase`
            }\n`
        );

        return false;
    }

    console.log(
        `✓ Firebase SDK ${firebaseSDK.version} detected`
    );

    // --------------------------------------------------
    // 10. Generate configuration
    // --------------------------------------------------

    console.log(
        "\nGenerating Firebase configuration..."
    );

    const generated = generateFirebaseConfig(
        process.cwd(),
        sdkResult.config
    );

    if (!generated.success && generated.exists) {
        console.log(
            "\n⚠ Firebase configuration already exists."
        );

        console.log(
            `  ${path.relative(
                process.cwd(),
                generated.path
            )}`
        );

        console.log(
            "\nFireConfig will not overwrite it."
        );

        return false;
    }

    console.log(
        `✓ Created ${path.relative(
            process.cwd(),
            generated.path
        )}`
    );

    // --------------------------------------------------
    // Complete
    // --------------------------------------------------

    console.log(
        "\n🔥 Firebase configuration complete!"
    );

    console.log(
        "\nYour Firebase project is now connected."
    );

    return true;
}

function getProjectLabel(type) {
    const labels = {
        react: "React",
        nextjs: "Next.js",
        "react-native": "React Native",
        expo: "Expo",
    };

    return labels[type] || type;
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
            console.log(
                `❌ Unknown command: ${command}`
            );

            console.log(
                "Run 'fireconfig --help' to see available commands."
            );

            process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(
        "\n❌ FireConfig encountered an unexpected error."
    );

    console.error(`   ${error.message}`);

    process.exitCode = 1;
});