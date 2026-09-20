const { spawnSync } = require("child_process");
const { confirm } = require("@inquirer/prompts");

function runCommand(command, args) {
    if (process.platform === "win32") {
        return spawnSync(
            process.env.ComSpec || "cmd.exe",
            ["/d", "/s", "/c", command, ...args],
            {
                stdio: "inherit",
                windowsHide: false,
            }
        );
    }

    return spawnSync(
        command,
        args,
        {
            stdio: "inherit",
        }
    );
}

function getInstallCommand(
    packageManager
) {
    switch (packageManager) {
        case "npm":
            return [
                "npm",
                [
                    "install",
                    "@react-native-firebase/app",
                ],
            ];

        case "pnpm":
            return [
                "pnpm",
                [
                    "add",
                    "@react-native-firebase/app",
                ],
            ];

        case "yarn":
            return [
                "yarn",
                [
                    "add",
                    "@react-native-firebase/app",
                ],
            ];

        case "bun":
            return [
                "bun",
                [
                    "add",
                    "@react-native-firebase/app",
                ],
            ];

        default:
            return null;
    }
}

async function installReactNativeFirebase(
    packageManager,
    {
        confirmFn = confirm,
        runCommandFn = runCommand,
    } = {}
) {
    const installCommand =
        getInstallCommand(
            packageManager
        );

    if (!installCommand) {
        console.log(
            "\n❌ Unable to determine how to install React Native Firebase."
        );

        console.log(
            "Please install it manually:"
        );

        console.log(
            "  npm install @react-native-firebase/app\n"
        );

        return false;
    }

    const [command, args] =
        installCommand;

    const shouldInstall =
        await confirmFn({
            message:
                "React Native Firebase is not installed. Would you like FireConfig to install it?",
            default: true,
        });

    if (!shouldInstall) {
        console.log(
            "\nSkipping React Native Firebase installation."
        );

        console.log("Run:");

        console.log(
            `  ${packageManager === "npm"
                ? "npm install @react-native-firebase/app"
                : `${packageManager} add @react-native-firebase/app`
            }`
        );

        console.log("\nThen run:");

        console.log(
            "  fireconfig init\n"
        );

        return false;
    }

    console.log(
        "\n🔥 Installing React Native Firebase...\n"
    );

    const result =
        runCommandFn(
            command,
            args
        );

    if (result.error) {
        console.log(
            "\n❌ React Native Firebase installation failed."
        );

        console.log(
            `   ${result.error.message}`
        );

        return false;
    }

    if (result.status !== 0) {
        console.log(
            "\n❌ React Native Firebase installation failed."
        );

        console.log(
            `   Exit code: ${result.status}`
        );

        return false;
    }

    console.log(
        "\n✓ React Native Firebase installation completed."
    );

    return true;
}

module.exports = {
    installReactNativeFirebase,
};