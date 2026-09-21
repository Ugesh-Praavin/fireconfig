const fs = require("fs");
const path = require("path");

/**
 * Parses a single line from a .env file.
 * Returns null if the line is not a key=value assignment.
 * Otherwise returns { key, rawValue, unquotedValue, hasQuotes, quoteChar }.
 */
function parseEnvLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
        return null;
    }

    // Match KEY=VALUE strictly
    // Key cannot contain spaces, equals, or colons
    const match = line.match(/^(\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*=\s*)(.*)$/);
    if (!match) {
        return null;
    }

    const [, leadingSpace, key, separator, rawRemainder] = match;
    let value = rawRemainder;

    // Check if remainder is quoted
    let quoteChar = null;
    let unquotedValue = value;

    if (
        (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
        (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
        quoteChar = value[0];
        unquotedValue = value.slice(1, -1);
    } else {
        // Handle trailing comment if unquoted: e.g. FOO=bar # comment
        const commentIndex = value.search(/\s+#/);
        if (commentIndex !== -1) {
            unquotedValue = value.slice(0, commentIndex).trim();
        }
    }

    return {
        key,
        leadingSpace,
        separator,
        rawValue: value,
        unquotedValue,
        quoteChar,
    };
}

/**
 * Merges target environment variables into a project environment file.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @param {string} fileName - Env file name, default: ".env.local"
 * @param {Record<string, string>} variables - Key-value pairs to set
 * @param {object} options - Options
 * @param {Function} [options.confirmOverwrite] - Async callback (key, existingVal, newVal) => Promise<boolean>
 * @returns {Promise<{
 *   success: boolean,
 *   created: boolean,
 *   modified: boolean,
 *   path: string,
 *   conflicts: Array<{ key: string, existingValue: string, newValue: string, overwritten: boolean }>,
 *   skipped: string[],
 *   variables: Record<string, string>
 * }>}
 */
async function mergeEnvFile(
    projectRoot,
    fileName = ".env.local",
    variables = {},
    options = {}
) {
    const envPath = path.join(projectRoot, fileName);
    const confirmOverwrite =
        options.confirmOverwrite || (async () => false);

    const keysToProcess = Object.keys(variables);
    const conflicts = [];
    const skipped = [];
    const finalVariables = {};

    if (!fs.existsSync(envPath)) {
        // Case 1: File does not exist -> create it
        const lines = keysToProcess.map(
            (key) => `${key}=${variables[key]}`
        );
        lines.push(""); // Trailing newline

        fs.writeFileSync(envPath, lines.join("\n"), "utf8");

        for (const key of keysToProcess) {
            finalVariables[key] = variables[key];
        }

        return {
            success: true,
            created: true,
            modified: true,
            path: envPath,
            conflicts,
            skipped,
            variables: finalVariables,
        };
    }

    // File exists -> read and parse line by line
    const rawContent = fs.readFileSync(envPath, "utf8");
    const originalLines = rawContent.split(/\r?\n/);

    const processedKeys = new Set();
    const updatedLines = [];
    let hasModifications = false;

    for (let i = 0; i < originalLines.length; i++) {
        const line = originalLines[i];
        const parsed = parseEnvLine(line);

        if (!parsed || !(parsed.key in variables)) {
            // Unrelated variable, comment, or blank line -> keep exactly as-is
            updatedLines.push(line);
            if (parsed) {
                finalVariables[parsed.key] = parsed.unquotedValue;
            }
            continue;
        }

        const key = parsed.key;
        processedKeys.add(key);
        const existingVal = parsed.unquotedValue;
        const newVal = String(variables[key]);

        if (existingVal === newVal) {
            // Case 3: Same value -> do not touch
            updatedLines.push(line);
            finalVariables[key] = existingVal;
        } else {
            // Case 4: Conflict -> ask confirmation
            const shouldOverwrite = await confirmOverwrite(
                key,
                existingVal,
                newVal
            );

            conflicts.push({
                key,
                existingValue: existingVal,
                newValue: newVal,
                overwritten: Boolean(shouldOverwrite),
            });

            if (shouldOverwrite) {
                // Replace in place
                hasModifications = true;
                const quote = parsed.quoteChar || "";
                updatedLines.push(`${parsed.leadingSpace}${key}${parsed.separator}${quote}${newVal}${quote}`);
                finalVariables[key] = newVal;
            } else {
                // Case 5: User declined -> keep existing value
                skipped.push(key);
                updatedLines.push(line);
                finalVariables[key] = existingVal;
            }
        }
    }

    // Case 2: Append missing variables
    const missingKeys = keysToProcess.filter((k) => !processedKeys.has(k));
    if (missingKeys.length > 0) {
        hasModifications = true;

        // Ensure clean separation if file doesn't end with newline or has content
        while (
            updatedLines.length > 0 &&
            updatedLines[updatedLines.length - 1] === ""
        ) {
            updatedLines.pop();
        }

        if (updatedLines.length > 0) {
            updatedLines.push(""); // Add an empty line before appended section
        }

        for (const key of missingKeys) {
            updatedLines.push(`${key}=${variables[key]}`);
            finalVariables[key] = variables[key];
        }

        updatedLines.push(""); // Final trailing newline
    } else {
        // If no missing keys and ends with a blank line in original, preserve it
        if (
            rawContent.endsWith("\n") &&
            (updatedLines.length === 0 || updatedLines[updatedLines.length - 1] !== "")
        ) {
            updatedLines.push("");
        }
    }

    if (hasModifications) {
        fs.writeFileSync(envPath, updatedLines.join("\n"), "utf8");
    }

    return {
        success: true,
        created: false,
        modified: hasModifications,
        path: envPath,
        conflicts,
        skipped,
        variables: finalVariables,
    };
}

module.exports = {
    mergeEnvFile,
    parseEnvLine,
};
