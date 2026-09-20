const { spawnSync } = require("child_process");

function checkFirebaseAuth() {
    let result;

    if (process.platform === "win32") {
        result = spawnSync(
            process.env.ComSpec || "cmd.exe",
            ["/d", "/s", "/c", "firebase", "login:list"],
            {
                encoding: "utf8",
                windowsHide: true,
            }
        );
    } else {
        result = spawnSync("firebase", ["login:list"], {
            encoding: "utf8",
            windowsHide: true,
        });
    }

    if (result.error || result.status !== 0) {
        return {
            authenticated: false,
        };
    }

    const output = `${result.stdout || ""}\n${result.stderr || ""}`;

    const authenticated =
        /Logged in as\s+\S+/i.test(output);

    return {
        authenticated,
    };
}

module.exports = {
    checkFirebaseAuth,
};