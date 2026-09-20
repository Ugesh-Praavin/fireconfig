const fs = require("fs");
const path = require("path");

function generateReactNativeAndroidConfig(
    projectRoot,
    configContent
) {
    const configFile = path.join(
        projectRoot,
        "android",
        "app",
        "google-services.json"
    );

    const androidAppDir = path.dirname(
        configFile
    );

    if (!fs.existsSync(androidAppDir)) {
        return {
            success: false,
            exists: false,
            path: configFile,
            error:
                "React Native Android project directory not found.",
        };
    }

    try {
        fs.writeFileSync(
            configFile,
            configContent,
            {
                encoding: "utf8",
                flag: "wx",
            }
        );
    } catch (error) {
        if (error.code === "EEXIST") {
            return {
                success: false,
                exists: true,
                path: configFile,
            };
        }

        throw error;
    }

    return {
        success: true,
        exists: false,
        path: configFile,
    };
}

module.exports = {
    generateReactNativeAndroidConfig,
};