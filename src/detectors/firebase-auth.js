const { spawnSync } = require("child_process");

function runFirebaseAuthCommand() {
    if (process.platform === "win32") {
        return spawnSync(
            process.env.ComSpec || "cmd.exe",
            ["/d", "/s", "/c", "firebase", "login:list"],
            {
                encoding: "utf8",
                windowsHide: true,
            }
        );
    }

    return spawnSync(
        "firebase",
        ["login:list"],
        {
            encoding: "utf8",
            windowsHide: true,
        }
    );
}

function checkFirebaseAuth(
    commandRunner = runFirebaseAuthCommand
) {
    const result = commandRunner();

    if (result.error || result.status !== 0) {
        return {
            authenticated: false,
        };
    }

    const output =
        `${result.stdout || ""}\n${result.stderr || ""}`;

    const authenticated =
        /Logged in as\s+\S+/i.test(output);

    return {
        authenticated,
    };
}

module.exports = {
    checkFirebaseAuth,
};