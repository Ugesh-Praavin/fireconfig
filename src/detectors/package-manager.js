const fs = require("fs");
const path = require("path");

function detectPackageManager(projectRoot = process.cwd()) {
  if (
    fs.existsSync(
      path.join(projectRoot, "pnpm-lock.yaml")
    )
  ) {
    return "pnpm";
  }

  if (
    fs.existsSync(
      path.join(projectRoot, "yarn.lock")
    )
  ) {
    return "yarn";
  }

  if (
    fs.existsSync(
      path.join(projectRoot, "bun.lockb")
    ) ||
    fs.existsSync(
      path.join(projectRoot, "bun.lock")
    )
  ) {
    return "bun";
  }

  if (
    fs.existsSync(
      path.join(projectRoot, "package-lock.json")
    )
  ) {
    return "npm";
  }

  return "unknown";
}

module.exports = {
  detectPackageManager,
};