const { detectFirebaseSDK } = require("../detectors/firebase-sdk");
const { installFirebaseSDK } = require("./firebase-sdk");

async function ensureFirebaseSDK(
    projectRoot,
    packageManager,
    {
        detectFn = detectFirebaseSDK,
        installFn = installFirebaseSDK,
    } = {}
) {
    const firebaseSDK = detectFn(projectRoot);

    if (firebaseSDK.installed) {
        return {
            success: true,
            installed: true,
            version: firebaseSDK.version,
        };
    }

    const installed = await installFn(
        packageManager
    );

    if (!installed) {
        return {
            success: false,
            installed: false,
        };
    }

    const updatedFirebaseSDK = detectFn(
        projectRoot
    );

    if (!updatedFirebaseSDK.installed) {
        return {
            success: false,
            installed: false,
        };
    }

    return {
        success: true,
        installed: true,
        version: updatedFirebaseSDK.version,
    };
}

module.exports = {
    ensureFirebaseSDK,
};