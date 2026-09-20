const { spawnSync } = require("child_process");

function runFirebaseVersionCommand() {
    if (process.platform === "win32") {
        return spawnSync(
            process.env.ComSpec || "cmd.exe",
            ["/d", "/s", "/c", "firebase", "--version"],
            {
                encoding: "utf8",
                windowsHide: true,
            }
        );
    }

    return spawnSync(
        "firebase",
        ["--version"],
        {
            encoding: "utf8",
            windowsHide: true,
        }
    );
}

function detectFirebaseCLI(
    commandRunner = runFirebaseVersionCommand
) {
    const result = commandRunner();

    if (result.error || result.status !== 0) {
        return {
            installed: false,
            version: null,
        };
    }

    const version = result.stdout.trim();

    return {
        installed: true,
        version,
    };
}

module.exports = {
    detectFirebaseCLI,
};