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

    return spawnSync(command, args, {
        stdio: "inherit",
    });
}

function getInstallCommand(packageManager) {
    switch (packageManager) {
        case "npm":
            return ["npm", ["install", "firebase"]];

        case "pnpm":
            return ["pnpm", ["add", "firebase"]];

        case "yarn":
            return ["yarn", ["add", "firebase"]];

        case "bun":
            return ["bun", ["add", "firebase"]];

        default:
            return null;
    }
}

async function installFirebaseSDK(
    packageManager,
    {
        confirmFn = confirm,
        runCommandFn = runCommand,
    } = {}
) {
    const installCommand =
        getInstallCommand(packageManager);

    if (!installCommand) {
        console.log(
            "\n❌ Unable to determine how to install Firebase SDK."
        );

        console.log(
            "Please install it manually:"
        );

        console.log(
            "  npm install firebase\n"
        );

        return false;
    }

    const [command, args] = installCommand;

    const shouldInstall = await confirmFn({
        message:
            "Firebase SDK is not installed. Would you like FireConfig to install it?",
        default: true,
    });

    if (!shouldInstall) {
        console.log(
            "\nSkipping Firebase SDK installation."
        );

        console.log("Run:");

        console.log(
            `  ${packageManager === "npm"
                ? "npm install firebase"
                : `${packageManager} add firebase`
            }`
        );

        console.log("\nThen run:");

        console.log(
            "  fireconfig init\n"
        );

        return false;
    }

    console.log(
        "\n🔥 Installing Firebase SDK...\n"
    );

    const result = runCommandFn(
        command,
        args
    );

    if (result.error) {
        console.log(
            "\n❌ Firebase SDK installation failed."
        );

        console.log(
            `   ${result.error.message}`
        );

        return false;
    }

    if (result.status !== 0) {
        console.log(
            "\n❌ Firebase SDK installation failed."
        );

        console.log(
            `   Exit code: ${result.status}`
        );

        return false;
    }

    console.log(
        "\n✓ Firebase SDK installation completed."
    );

    return true;
}

module.exports = {
    installFirebaseSDK,
};