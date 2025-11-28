# Git Developer Playbook: Advanced Workflows & Standards

**Purpose:** This document defines the standard operating procedures for development. It moves beyond "saving files" to managing a clean, linear, and professional project history.

---

## 1. The Daily Development Cycle

### Phase 1: Synchronization (Start of Day)

Never start coding on a stale branch. Always pull the latest changes from the remote server to avoid conflicts later.

```bash
# 1. Switch to the dev branch
git switch dev

# 2. Fetch changes (updates your local database without merging yet)
git fetch --all --prune

# 3. Pull changes (Fetch + Merge/Rebase)
# We use --rebase to keep history linear, avoiding "Merge branch 'dev'" commits.
git pull --rebase origin dev
```

### Phase 2: Feature Branching

Create a strictly named branch for your task.

```bash
# Syntax: type/ticket-id-description
git switch -c feat/add-user-authentication
```

### Phase 3: Surgical Staging (`git add -p`)

**Stop using `git add .` blindly.**
Use "Patch Mode" to review code as you stage it. This ensures you never accidentally commit debug code (`console.log`) or temporary files.

```bash
git add -p
```

- **Git:** "Stage this hunk?"
- **y:** Yes
- **n:** No
- **s:** Split (If the hunk is too big, split it into smaller parts)
- **e:** Edit (Manually edit the hunk before staging)

---

## 2. Commit Hygiene (The Art of History)

### The Commit Structure

We follow **Conventional Commits**. This allows us to auto-generate changelogs.

**Structure:** `type(scope): subject`

| Type         | Description                  | Example                                           |
| :----------- | :--------------------------- | :------------------------------------------------ |
| **feat**     | New feature                  | `feat(api): add endpoint for user profile`        |
| **fix**      | Bug fix                      | `fix(ui): resolve button misalignment on mobile`  |
| **docs**     | Documentation                | `docs(readme): update setup instructions`         |
| **refactor** | Code change, no logic change | `refactor(auth): simplify token validation logic` |
| **chore**    | Build/Tooling/Configs        | `chore(deps): upgrade lodash to v4.17`            |

### Amending (Fixing the last commit)

If you made a typo or forgot a file in your _most recent_ commit, do not create a "Fix typo" commit. Overwrite the previous one.

```bash
# 1. Stage the missing file or fix
git add missed-file.ts

# 2. Amend the commit (updates the hash and timestamp)
git commit --amend --no-edit
```

---

## 3. Advanced History Manipulation

### Interactive Rebase (`rebase -i`)

This is the most powerful tool for cleaning up your local history before pushing to the team.

**Scenario:** You have 5 "Work in Progress" commits. You want to combine them into 1 clean commit.

```bash
# Interactively rebase the last 5 commits
git rebase -i HEAD~5
```

**The Editor Opens:**
Change the command word at the start of the line:

1.  `pick` (Keep this commit)
2.  `squash` (Merge this into the one above it)
3.  `fixup` (Merge into above, but discard the log message)
4.  `drop` (Delete this commit entirely)

**Example:**

```text
pick 84c3d1 Add login form HTML
squash 4f1a2b Fix CSS padding
squash 99a1c2 Fix typo in label
```

_Result: One single clean commit containing all three changes._

[Image of Git branching and merging diagram]

### Cherry-Picking

Copy a specific commit from one branch to another without merging the whole branch.  
_Useful for: Moving a hotfix from `develop` to a `release` branch._

```bash
# 1. Be on the target branch
git switch release/v1.2

# 2. Pick the specific commit hash
git cherry-pick 9a2b3c4
```

---

## 4. Synchronization Strategy: Rebase vs. Merge

### The Rule

- **Public Branches (main/develop):** Use `Merge`.
- **Private/Feature Branches:** Use `Rebase`.

### How to Rebase (Update your branch)

While working on your feature, `main` has moved forward. You need those updates.

**The Wrong Way (Merge):**  
`git merge main` → Creates a "Merge branch 'main' into feat/..." commit. This is noise.

**The Right Way (Rebase):**  
Lift your changes up and replay them on top of the new main.

```bash
# 1. Make sure you have the latest main
git fetch origin main

# 2. Rebase your current branch onto it
git rebase origin/main
```

**If Conflicts Occur:**

1.  Git pauses. Open the conflicting files.
2.  Resolve the code.
3.  `git add resolved-file.js`
4.  `git rebase --continue` (Do NOT run `git commit`)

---

## 5. "Undo" Commands (Disaster Recovery)

### Reset (Moving the Timeline)

`git reset` moves your current state back to a specific commit. Know the modes:

| Mode      | Command                   | Working Directory       | Staged Area               | History  | Use Case                                                        |
| :-------- | :------------------------ | :---------------------- | :------------------------ | :------- | :-------------------------------------------------------------- |
| **Soft**  | `git reset --soft HEAD~1` | **Safe** (Changes kept) | **Safe** (Changes staged) | **Gone** | "I liked the code, but want to re-write the commit message."    |
| **Mixed** | `git reset HEAD~1`        | **Safe** (Changes kept) | **Unstaged**              | **Gone** | "I want to keep the code, but maybe split it into two commits." |
| **Hard**  | `git reset --hard HEAD~1` | **Deleted**             | **Deleted**               | **Gone** | "I messed up completely. Destroy the last commit."              |

### Reflog (The Safety Net)

If you `reset --hard` by mistake, or deleted a branch, Git remembers.

```bash
# Show the log of all your actions (even deleted ones)
git reflog

# Output:
# b3c1a2 HEAD@{0}: reset: moving to HEAD~1
# f9d2e1 HEAD@{1}: commit: The code I just deleted

# Recover the lost state
git reset --hard f9d2e1
```

---

## 6. Investigation & Debugging Tools

### Git Bisect (Find the bug automatically)

You have a bug. You know it wasn't there in v1.0, but it is there in v1.1. There are 50 commits between them.

```bash
git bisect start
git bisect bad            # Current version is bad
git bisect good v1.0      # v1.0 was good

# Git jumps to the middle commit. You test the app.
# If broken:
git bisect bad
# If working:
git bisect good

# Repeat until Git says: "Commit xxxxx is the first bad commit"
git bisect reset          # Finish
```

### Git Blame

See who wrote a specific line of code and in which commit.

```bash
# View file with author names per line
git blame -w src/app.js
# -w ignores whitespace changes (prevents blaming the person who just indented the file)
```

### Git Grep

Search for a string across the entire repository history or specific branches instantly (faster than IDE search).

```bash
# Search for "API_KEY" in all files
git grep "API_KEY"

# Search for "function login" in version 1.0 tag
git grep "function login" v1.0
```

---

## 7. Working with Remotes

### Cleaning Up

Over time, your local machine tracks branches that no longer exist on the server.

```bash
# Delete local branches that have been merged into main
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Prune remote tracking branches (removes origin/deleted-branch)
git fetch --prune
```

### Force Pushing (The Safe Way)

If you rebased or amended a commit that you already pushed, you must force push.  
**Standard Force Push (`-f`) is dangerous** because it overwrites work if a colleague pushed code to your branch while you were rebasing.

**Use `--force-with-lease`:**  
This checks "Has anyone else pushed to this branch?" If yes, it aborts. If no, it force pushes.

```bash
git push --force-with-lease origin feat/my-branch
```

---

## 7. Context Switching: Stash Like a Pro

When you need to switch tasks quickly (hotfix, urgent review) but your working directory is dirty, use **stash** instead of panic commits.

### Basic Stash Workflow

```bash
# Save your current work-in-progress with a message
git stash push -m "WIP: filter logic for billing report"

# List all stashes
git stash list

# Apply the most recent stash (keeps it in the stash list)
git stash apply

# Apply a specific stash
git stash apply stash@{2}

# Apply and remove in one go
git stash pop
```

### Stash Only Some Files

```bash
# Stash only matching files
git stash push -m "WIP: API route rework" src/api/

# Stash everything except staged changes (keep what you intend to commit)
git stash push --keep-index -m "WIP: preserve staged code"
```

### Clean-Up

```bash
# Drop a specific stash
git stash drop stash@{1}

# Remove all stashes
git stash clear
```

> **Rule:** Use stash for short-term context switching only. Long-running work should live on a dedicated feature branch with regular, clean commits.

---

## 13. Parallel Work: Worktrees (Advanced but Powerful)

If you need to work on multiple branches simultaneously without recloning the repo, use **git worktree**.

### Basic Usage

```bash
# From your main repo
git worktree add ../rmg-hotfix-branch hotfix/RMG-600-prod-auth-failure

# This creates a new directory with that branch checked out
cd ../rmg-hotfix-branch
# Work as usual here:
git status
git commit
```

### Clean-Up Worktrees

```bash
# List active worktrees
git worktree list

# Remove a worktree (after its branch is merged/deleted)
git worktree remove ../rmg-hotfix-branch
```

> **Rule:** Use worktrees when you want **two branches checked out at the same time** without juggling stashes and local changes.

---

## Conclusion

By following these advanced Git workflows and standards, you ensure a clean, maintainable, and professional codebase. This not only benefits individual developer but also enhances team collaboration and project longevity. Happy coding!

---

## Appendix: Quick Reference Commands

| Task                        | Command                                                                     |
| :-------------------------- | :-------------------------------------------------------------------------- |
| Sync with remote dev branch | `git switch dev && git fetch --all --prune && git pull --rebase origin dev` |
| Create feature branch       | `git switch -c feat/your-feature-name`                                      |
| Stage changes interactively | `git add -p`                                                                |
| Amend last commit           | `git add <file> && git commit --amend --no-edit`                            |
| Interactive rebase last N   | `git rebase -i HEAD~N`                                                      |
