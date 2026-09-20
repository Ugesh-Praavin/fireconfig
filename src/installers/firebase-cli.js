const { spawnSync } = require("child_process");
const { confirm } = require("@inquirer/prompts");

function runCommand(command, args) {
    if (process.platform === "win32") {
        // npm/pnpm/yarn/bun are commonly .cmd shims on Windows.
        // We invoke cmd.exe explicitly instead of enabling shell execution
        // for an arbitrary command.
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
            return ["npm", ["install", "-g", "firebase-tools"]];

        case "pnpm":
            return ["pnpm", ["add", "-g", "firebase-tools"]];

        case "yarn":
            return ["yarn", ["global", "add", "firebase-tools"]];

        case "bun":
            return ["bun", ["add", "-g", "firebase-tools"]];

        default:
            return null;
    }
}

async function installFirebaseCLI(packageManager) {
    const installCommand = getInstallCommand(packageManager);

    if (!installCommand) {
        console.log("\n❌ Unable to determine how to install Firebase CLI.");
        console.log("Please install it manually:");
        console.log("  npm install -g firebase-tools\n");
        return false;
    }

    const [command, args] = installCommand;

    const shouldInstall = await confirm({
        message: "Would you like FireConfig to install Firebase CLI?",
        default: true,
    });

    if (!shouldInstall) {
        console.log("\nSkipping Firebase CLI installation.");
        console.log("Run:");
        console.log("  npm install -g firebase-tools");
        console.log("\nThen run:");
        console.log("  fireconfig init\n");
        return false;
    }

    console.log("\n🔥 Installing Firebase CLI...\n");

    const result = runCommand(command, args);

    if (result.error) {
        console.log("\n❌ Firebase CLI installation failed.");
        console.log(`   ${result.error.message}`);
        console.log("\nTry installing it manually:");
        console.log("  npm install -g firebase-tools\n");
        return false;
    }

    if (result.status !== 0) {
        console.log("\n❌ Firebase CLI installation failed.");
        console.log(`   Exit code: ${result.status}`);
        console.log("\nTry installing it manually:");
        console.log("  npm install -g firebase-tools\n");
        return false;
    }

    console.log("\n✓ Firebase CLI installation completed.");

    return true;
}

module.exports = {
    installFirebaseCLI,
};