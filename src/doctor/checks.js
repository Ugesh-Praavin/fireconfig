const { detectProject } = require("../detectors/project");
const { detectPackageManager } = require("../detectors/package-manager");
const { detectFirebaseCLI } = require("../detectors/firebase-cli");
const { checkFirebaseAuth } = require("../detectors/firebase-auth");
const { detectFirebaseSDK } = require("../detectors/firebase-sdk");
const {
    checkFirebaseConfigFile,
} = require("./firebase-config");

function checkProject(projectRoot) {
    const project = detectProject(projectRoot);

    return {
        name: "Project",
        passed: project.type !== "unknown",
        message:
            project.type !== "unknown"
                ? `${project.type} project detected`
                : "Unsupported or unknown project",
        details: project,
    };
}

function checkPackageManager(projectRoot) {
    const packageManager =
        detectPackageManager(projectRoot);

    return {
        name: "Package manager",
        passed: packageManager !== "unknown",
        message:
            packageManager !== "unknown"
                ? `${packageManager} detected`
                : "Package manager not detected",
        details: packageManager,
    };
}

function checkFirebaseCLI(
    detectCLI = detectFirebaseCLI
) {
    const firebaseCLI = detectCLI();

    return {
        name: "Firebase CLI",
        passed: firebaseCLI.installed,
        message: firebaseCLI.installed
            ? `Firebase CLI ${firebaseCLI.version} detected`
            : "Firebase CLI not installed",
        details: firebaseCLI,
    };
}

function checkFirebaseAuthentication(
    checkAuth = checkFirebaseAuth
) {
    const auth = checkAuth();

    return {
        name: "Firebase authentication",
        passed: auth.authenticated,
        message: auth.authenticated
            ? "Firebase authentication detected"
            : "Firebase authentication required",
        details: auth,
    };
}

function checkFirebaseSDK(projectRoot) {
    const sdk = detectFirebaseSDK(projectRoot);

    return {
        name: "Firebase SDK",
        passed: sdk.installed,
        message: sdk.installed
            ? `Firebase SDK ${sdk.version} detected`
            : "Firebase SDK not installed",
        details: sdk,
    };
}

function checkFirebaseConfig(projectRoot) {
    const result =
        checkFirebaseConfigFile(projectRoot);

    return {
        name: "Firebase config",
        passed: result.passed,
        message: result.message,
        details: result,
    };
}

function runDoctorChecks(
    projectRoot = process.cwd(),
    dependencies = {}
) {
    const detectCLI =
        dependencies.detectFirebaseCLI ||
        detectFirebaseCLI;

    const checkAuth =
        dependencies.checkFirebaseAuth ||
        checkFirebaseAuth;

    return [
        checkProject(projectRoot),
        checkPackageManager(projectRoot),
        checkFirebaseCLI(detectCLI),
        checkFirebaseAuthentication(checkAuth),
        checkFirebaseSDK(projectRoot),
        checkFirebaseConfig(projectRoot),
    ];
}

module.exports = {
    runDoctorChecks,
};