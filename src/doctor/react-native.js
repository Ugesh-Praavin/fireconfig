const fs = require("fs");
const path = require("path");

function checkReactNativeFirebaseConfig(
    projectRoot
) {
    const configFile = path.join(
        projectRoot,
        "android",
        "app",
        "google-services.json"
    );

    if (!fs.existsSync(configFile)) {
        return {
            passed: false,
            message:
                "React Native Firebase configuration not found",
            path: configFile,
        };
    }

    try {
        const config = JSON.parse(
            fs.readFileSync(
                configFile,
                "utf8"
            )
        );

        const projectId =
            config.project_info?.project_id;

        const packageName =
            config.client?.[0]
                ?.client_info
                ?.android_client_info
                ?.package_name;

        if (!projectId || !packageName) {
            return {
                passed: false,
                message:
                    "React Native Firebase configuration is incomplete",
                path: configFile,
            };
        }

        return {
            passed: true,
            message:
                "React Native Firebase Android configuration is valid",
            path: configFile,
            projectId,
            packageName,
        };
    } catch {
        return {
            passed: false,
            message:
                "React Native Firebase configuration is invalid",
            path: configFile,
        };
    }
}

module.exports = {
    checkReactNativeFirebaseConfig,
};