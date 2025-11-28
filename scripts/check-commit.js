const { execSync } = require("child_process");
const fs = require("fs");

// Patterns for trivial commit messages (e.g., typos, minor updates)
const trivialPatterns = [
  "fix typo",
  "minor update",
  "update docs",
  "correct spelling",
  "adjust format",
  "refactor whitespace",
];

// Helper function to get the last commit message
function getLastCommitMessage() {
  const commitMsg = execSync("git log -1 --pretty=%B").toString().trim();
  return commitMsg;
}

// Helper function to get the staged changes in diff format
function getStagedChanges() {
  const diff = execSync("git diff --cached").toString().trim();
  return diff;
}

// Function to check for trivial changes in the diff (e.g., whitespace changes or docs updates)
function isTrivialChange(diff) {
  // Check for whitespace or documentation changes (can be customized)
  return diff.match(/(\s{2,}|^\+.*\.(md|txt|rst)$)/);
}

// Main logic
function main() {
  const commitMessage = getLastCommitMessage();
  const diff = getStagedChanges();

  // Check if the commit message is trivial
  const isTrivialCommitMessage = trivialPatterns.some((pattern) =>
    commitMessage.toLowerCase().includes(pattern)
  );

  // If the commit message is trivial and the changes are trivial, block the commit
  if (isTrivialCommitMessage && isTrivialChange(diff)) {
    console.log(
      "ERROR: It seems like you're committing trivial changes (fixing typos, docs, etc.)."
    );
    console.log(
      "Please use 'git commit --amend' to amend your previous commit."
    );
    process.exit(1); // Prevent commit
  }

  // If no issues, allow the commit to proceed
  console.log("Commit message and changes are okay. Proceeding...");
  process.exit(0);
}

main();
