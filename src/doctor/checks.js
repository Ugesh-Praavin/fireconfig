const path = require("path");
const fs = require("fs");
const { detectProject } = require("../detectors/project");
const { detectPackageManager } = require("../detectors/package-manager");
const { detectFirebaseCLI } = require("../detectors/firebase-cli");
const { checkFirebaseAuth } = require("../detectors/firebase-auth");
const { detectFirebaseSDK } = require("../detectors/firebase-sdk");
const { checkFirebaseConfigFile } = require("./firebase-config");
const { checkNextjsFirebaseEnv } = require("./nextjs-env");
const { checkReactCraFirebaseEnv } = require("./react-cra-env");
const { checkReactViteFirebaseEnv } = require("./react-vite-env");
const { detectReactNativeFirebase } = require("../detectors/react-native-firebase");
const { checkReactNativeFirebaseConfig } = require("./react-native");

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
    const project = detectProject(projectRoot);

    const sdk =
        project.type === "react-native"
            ? detectReactNativeFirebase(projectRoot)
            : detectFirebaseSDK(projectRoot);

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
    const project = detectProject(projectRoot);
    const configPath = path.join(projectRoot, "src", "firebase", "config.js");
    const hasConfigJs = fs.existsSync(configPath);

    let result;

    switch (project.type) {
        case "nextjs": {
            const envRes = checkNextjsFirebaseEnv(projectRoot);
            if (!envRes.passed) {
                result = envRes;
                break;
            }
            if (hasConfigJs) {
                const initRes = checkFirebaseConfigFile(
                    projectRoot,
                    "process.env",
                    "NEXT_PUBLIC_FIREBASE_"
                );
                if (!initRes.passed) {
                    result = initRes;
                    break;
                }
            }
            result = envRes;
            break;
        }

        case "react-vite": {
            const envRes = checkReactViteFirebaseEnv(projectRoot);
            if (!envRes.passed) {
                result = envRes;
                break;
            }
            if (hasConfigJs) {
                const initRes = checkFirebaseConfigFile(
                    projectRoot,
                    "import.meta.env",
                    "VITE_FIREBASE_"
                );
                if (!initRes.passed) {
                    result = initRes;
                    break;
                }
            }
            result = envRes;
            break;
        }

        case "react-cra": {
            const envRes = checkReactCraFirebaseEnv(projectRoot);
            if (!envRes.passed) {
                result = envRes;
                break;
            }
            if (hasConfigJs) {
                const initRes = checkFirebaseConfigFile(
                    projectRoot,
                    "process.env",
                    "REACT_APP_FIREBASE_"
                );
                if (!initRes.passed) {
                    result = initRes;
                    break;
                }
            }
            result = envRes;
            break;
        }

        case "react": {
            // Check both env and config if env exists; otherwise check config file
            const envPath = path.join(projectRoot, ".env.local");
            if (fs.existsSync(envPath)) {
                const envRes = checkReactCraFirebaseEnv(projectRoot);
                if (!envRes.passed) {
                    result = envRes;
                    break;
                }
                if (hasConfigJs) {
                    const initRes = checkFirebaseConfigFile(
                        projectRoot,
                        "process.env",
                        "REACT_APP_FIREBASE_"
                    );
                    if (!initRes.passed) {
                        result = initRes;
                        break;
                    }
                }
                result = envRes;
            } else {
                result = checkFirebaseConfigFile(projectRoot);
            }
            break;
        }

        case "react-native":
            result = checkReactNativeFirebaseConfig(projectRoot);
            break;

        default:
            return {
                name: "Firebase config",
                passed: false,
                message: "Firebase configuration strategy not implemented",
                details: {
                    projectType: project.type,
                },
            };
    }

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