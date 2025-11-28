const { execSync } = require("child_process");
const fs = require("fs");

// Patterns for trivial commit messages (e.g., typos, minor updates)
const trivialPatterns = [
  // Typo/spelling related
  "fix typo",
  "typo",
  "fixed typo",
  "correct typo",
  "spelling",
  "correct spelling",
  "fixed spelling",
  "grammar",
  "fix grammar",

  // Minor/small changes
  "minor",
  "minor update",
  "minor fix",
  "minor change",
  "small fix",
  "small change",
  "tiny fix",
  "quick fix",
  "hotfix typo",

  // Formatting/whitespace
  "format",
  "formatting",
  "fix format",
  "adjust format",
  "fix formatting",
  "whitespace",
  "refactor whitespace",
  "fix whitespace",
  "indentation",
  "fix indentation",
  "lint",
  "linting",
  "fix lint",
  "prettier",
  "eslint fix",

  // Documentation trivial
  "update docs",
  "docs update",
  "readme update",
  "update readme",
  "comment",
  "add comment",
  "fix comment",
  "update comment",

  // Misc trivial
  "cleanup",
  "clean up",
  "tidy",
  "tidy up",
  "cosmetic",
  "nit",
  "nitpick",
  "oops",
  "wip",
  "temp",
  "test commit",
  "remove console.log",
  "remove log",
  "remove debug",
  "fix import",
  "unused import",
  "remove unused",
];

// Regex patterns for more flexible matching
const trivialRegexPatterns = [
  /^fix(ed|es|ing)?\s*(a\s+)?typo(s)?$/i, // "fix typo", "fixed typos", "fixing a typo"
  /^typo(s)?$/i, // just "typo" or "typos"
  /^minor(\s+\w+)?$/i, // "minor", "minor fix", "minor update"
  /^small(\s+\w+)?$/i, // "small", "small fix"
  /^quick(\s+\w+)?$/i, // "quick fix"
  /^wip$/i, // "WIP"
  /^temp$/i, // "temp"
  /^test$/i, // "test"
  /^\.+$/, // ".", "..", "..."
  /^-+$/, // "-", "--"
  /^update(d|s)?$/i, // just "update", "updated", "updates"
  /^fix(ed|es)?$/i, // just "fix", "fixed", "fixes"
  /^change(d|s)?$/i, // just "change", "changed", "changes"
  /^edit(ed|s)?$/i, // just "edit", "edited", "edits"
  /^oops!?$/i, // "oops", "oops!"
  /^fmt$/i, // "fmt"
  /^lint(ing)?$/i, // "lint", "linting"
  /^cleanup$/i, // "cleanup"
  /^refactor$/i, // just "refactor" without context
  /^stuff$/i, // "stuff"
  /^things$/i, // "things"
  /^misc$/i, // "misc"
  /^[a-z]$/i, // single letter commits
  /^\d+$/, // just numbers
];

// Helper function to get the commit message from the file passed by git
function getCommitMessage() {
  const commitMsgFile = process.argv[2];
  if (commitMsgFile && fs.existsSync(commitMsgFile)) {
    return fs.readFileSync(commitMsgFile, "utf-8").trim();
  }
  // Fallback for pre-commit hook (no message file)
  return "";
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
  const commitMessage = getCommitMessage();
  const diff = getStagedChanges();

  // If no commit message available, skip the check (running from pre-commit)
  if (!commitMessage) {
    process.exit(0);
  }

  // Check if the commit message is trivial (substring match)
  const isTrivialCommitMessage = trivialPatterns.some((pattern) =>
    commitMessage.toLowerCase().includes(pattern.toLowerCase())
  );

  // Check if the commit message matches any regex pattern
  const matchesTrivialRegex = trivialRegexPatterns.some((regex) =>
    regex.test(commitMessage.trim())
  );

  // Check if commit message is too short (likely not descriptive)
  const isTooShort = commitMessage.trim().length < 4;

  // If the commit message is trivial, block the commit and suggest amend
  if (isTrivialCommitMessage || matchesTrivialRegex || isTooShort) {
    console.log(
      '\n❌ ERROR: Trivial commit message detected: "' + commitMessage + '"'
    );
    console.log(
      "\n💡 This type of change should be included in a meaningful commit."
    );
    console.log(
      "Please use 'git commit --amend' to amend your previous commit instead."
    );
    console.log(
      "This keeps the git history clean by avoiding separate commits for typos/minor fixes.\n"
    );
    process.exit(1); // Prevent commit
  }

  // If no issues, allow the commit to proceed
  console.log("✅ Commit message is okay. Proceeding...");
  process.exit(0);
}

main();
