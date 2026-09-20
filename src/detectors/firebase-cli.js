const { spawnSync } = require("child_process");

function detectFirebaseCLI() {
    let result;

    if (process.platform === "win32") {
        result = spawnSync(
            process.env.ComSpec || "cmd.exe",
            ["/d", "/s", "/c", "firebase", "--version"],
            {
                encoding: "utf8",
                windowsHide: true,
            }
        );
    } else {
        result = spawnSync("firebase", ["--version"], {
            encoding: "utf8",
            windowsHide: true,
        });
    }

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