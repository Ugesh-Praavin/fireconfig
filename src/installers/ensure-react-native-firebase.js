const {
    detectReactNativeFirebase,
} = require("../detectors/react-native-firebase");

const {
    installReactNativeFirebase,
} = require("./react-native-firebase");

async function ensureReactNativeFirebase(
    projectRoot,
    packageManager,
    {
        detectFn =
        detectReactNativeFirebase,
        installFn =
        installReactNativeFirebase,
    } = {}
) {
    const firebase =
        detectFn(projectRoot);

    if (firebase.installed) {
        return {
            success: true,
            installed: true,
            version: firebase.version,
        };
    }

    const installed =
        await installFn(
            packageManager
        );

    if (!installed) {
        return {
            success: false,
            installed: false,
        };
    }

    const updatedFirebase =
        detectFn(projectRoot);

    if (!updatedFirebase.installed) {
        return {
            success: false,
            installed: false,
        };
    }

    return {
        success: true,
        installed: true,
        version:
            updatedFirebase.version,
    };
}

module.exports = {
    ensureReactNativeFirebase,
};