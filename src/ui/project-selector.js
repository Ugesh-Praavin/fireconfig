const { select } = require("@inquirer/prompts");

async function selectFirebaseProject(projects) {
    if (!projects.length) {
        console.log("\n❌ No Firebase projects found.");
        return null;
    }

    const selectedProject = await select({
        message: "Select a Firebase project:",
        choices: projects.map((project) => ({
            name: `${project.displayName} (${project.projectId})`,
            value: project,
        })),
    });

    return selectedProject;
}

module.exports = {
    selectFirebaseProject,
};