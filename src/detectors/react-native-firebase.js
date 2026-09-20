const fs = require("fs");
const path = require("path");

function detectReactNativeFirebase(
    projectRoot
) {
    const packageJsonPath =
        path.join(
            projectRoot,
            "package.json"
        );

    if (!fs.existsSync(packageJsonPath)) {
        return {
            installed: false,
            version: null,
        };
    }

    const packageJson =
        JSON.parse(
            fs.readFileSync(
                packageJsonPath,
                "utf8"
            )
        );

    const dependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
    };

    const version =
        dependencies[
        "@react-native-firebase/app"
        ];

    if (!version) {
        return {
            installed: false,
            version: null,
        };
    }

    return {
        installed: true,
        version,
    };
}

module.exports = {
    detectReactNativeFirebase,
};