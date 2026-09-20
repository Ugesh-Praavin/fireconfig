const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    detectReactNativeFirebase,
} = require("../src/detectors/react-native-firebase");

function createProject(packageJson) {
    const projectRoot = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "fireconfig-rn-"
        )
    );

    fs.writeFileSync(
        path.join(
            projectRoot,
            "package.json"
        ),
        JSON.stringify(packageJson),
        "utf8"
    );

    return projectRoot;
}

test("detects React Native Firebase in dependencies", () => {
    const projectRoot =
        createProject({
            dependencies: {
                "@react-native-firebase/app":
                    "^26.4.0",
            },
        });

    const result =
        detectReactNativeFirebase(
            projectRoot
        );

    assert.equal(
        result.installed,
        true
    );

    assert.equal(
        result.version,
        "^26.4.0"
    );
});

test("detects React Native Firebase in devDependencies", () => {
    const projectRoot =
        createProject({
            devDependencies: {
                "@react-native-firebase/app":
                    "26.4.0",
            },
        });

    const result =
        detectReactNativeFirebase(
            projectRoot
        );

    assert.equal(
        result.installed,
        true
    );

    assert.equal(
        result.version,
        "26.4.0"
    );
});

test("detects missing React Native Firebase", () => {
    const projectRoot =
        createProject({
            dependencies: {},
        });

    const result =
        detectReactNativeFirebase(
            projectRoot
        );

    assert.equal(
        result.installed,
        false
    );

    assert.equal(
        result.version,
        null
    );
});

test("handles missing package.json", () => {
    const projectRoot =
        fs.mkdtempSync(
            path.join(
                os.tmpdir(),
                "fireconfig-rn-"
            )
        );

    const result =
        detectReactNativeFirebase(
            projectRoot
        );

    assert.equal(
        result.installed,
        false
    );

    assert.equal(
        result.version,
        null
    );
});