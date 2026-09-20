const { spawnSync } = require("child_process");

function runFirebaseLogin() {
    console.log("\n🔥 Starting Firebase authentication...\n");

    let result;

    if (process.platform === "win32") {
        result = spawnSync(
            process.env.ComSpec || "cmd.exe",
            ["/d", "/s", "/c", "firebase", "login"],
            {
                stdio: "inherit",
                windowsHide: false,
            }
        );
    } else {
        result = spawnSync("firebase", ["login"], {
            stdio: "inherit",
        });
    }

    if (result.error) {
        console.log("\n❌ Firebase authentication failed.");
        console.log(`   ${result.error.message}`);
        return false;
    }

    if (result.status !== 0) {
        console.log("\n❌ Firebase authentication failed.");
        console.log(`   Exit code: ${result.status}`);
        return false;
    }

    console.log("\n✓ Firebase authentication completed.");

    return true;
}

module.exports = {
    runFirebaseLogin,
};