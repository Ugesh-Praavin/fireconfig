const { runDoctorChecks } = require("./checks");

function runDoctor() {
    console.log("\n🩺 FireConfig Doctor\n");

    const checks = runDoctorChecks();

    for (const check of checks) {
        const icon = check.passed ? "✓" : "✗";

        console.log(
            `${icon} ${check.name}: ${check.message}`
        );
    }

    const passed = checks.filter(
        (check) => check.passed
    ).length;

    const failed = checks.length - passed;

    console.log(
        `\n${passed}/${checks.length} checks passed.`
    );

    if (failed === 0) {
        console.log(
            "🔥 Firebase setup looks good!\n"
        );
    } else {
        console.log(
            `⚠ ${failed} check${failed === 1 ? "" : "s"
            } ${failed === 1 ? "needs" : "need"} attention.`
        );
    }

    return failed === 0;
}

module.exports = {
    runDoctor,
};