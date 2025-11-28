# Git Best Practices & Commands

This documentation summarizes essential Git workflows, best practices, and command-line tips to help you master version control, keep your history clean, and work efficiently. It is based on the Philomatics Git playlist.

---

## 1. The Golden Rule of Pulling Changes
**Topic:** *Why you should generally avoid `git pull`*

The standard `git pull` command is often discouraged in collaborative workflows because it creates unnecessary merge commits, cluttering the project history.

### The Problem with `git pull`
When you run `git pull`, Git fetches changes from the remote and immediately tries to **merge** them into your local branch. If your local history and the remote history have diverged (i.e., both have new commits), Git creates a "merge commit" to join them.
* **Result:** A messy, non-linear history full of "Merge branch 'main' of..." commits.
* **Impact:** Harder to debug and navigate the project history.

### The Solution: `git pull --rebase`
Instead of merging, use rebase. This command fetches the remote changes, temporarily sets your local commits aside, updates your branch to match the remote, and then replays your local commits on top.

* **Command:** `git pull --rebase`
* **Benefit:** Keeps history linear and clean, as if you wrote your code *after* the latest remote changes were pushed.

**Pro Tip:** If you encounter conflicts during this process:
1.  Fix the conflicts manually.
2.  Run `git rebase --continue`.
3.  If you want to stop and go back to how things were, run `git rebase --abort`.

---

## 2. Understanding & Using Git Rebase
**Topic:** *Rebasing vs. Merging*

Rebasing is the process of moving or combining a sequence of commits to a new base commit. It is primarily used to maintain a linear project history.

### Workflow: Updating a Feature Branch
When working on a feature branch (e.g., `feature/login`) while others merge into `main`, your branch gets outdated.
* **Option A (Merge):** Merging `main` into your branch creates a merge commit every time you update.
* **Option B (Rebase):** `git rebase main` rewrites your branch history so it appears to branch off the *latest* `main` commit.

### The Golden Rule of Rebasing
> **WARNING:** Never rebase commits that you have already pushed to a shared remote repository.

* Rebasing changes commit hashes. If you rebase pushed commits, you diverge from the remote history, causing massive headaches for teammates who have pulled those commits.
* **Check before rebasing:** Run `git branch -a` to ensure your branch isn't already pushed/shared, or verify you are the only one working on it.

---

## 3. Mastering Interactive Rebase
**Topic:** *Cleaning up history with `rebase -i`*

Interactive rebase is a powerful tool to clean up your local history *before* merging it into the main codebase.

* **Command:** `git rebase -i HEAD~N` (where N is the number of commits to review)
* **Or:** `git rebase -i [commit-hash]`

### Common Operations
When the interactive editor opens, you can change the command next to each commit:
* **Pick:** Keep the commit as is.
* **Reword:** Change the commit message.
* **Edit:** Pause the rebase at this commit to make changes to files (e.g., remove debug logs).
    * *After editing files:* `git add .` -> `git commit --amend` -> `git rebase --continue`.
* **Squash:** Combine this commit with the previous one. Useful for merging "wip" or "fix typo" commits into a single meaningful commit.
* **Drop:** Delete the commit entirely.

**How to Split a Commit:**
1.  Mark the commit as **edit** in interactive mode.
2.  Run `git reset HEAD~1` to unstage changes.
3.  Commit files individually (`git add file1`, `git commit`, `git add file2`, `git commit`).
4.  Run `git rebase --continue`.

---

## 4. Resolving Merge Conflicts
**Topic:** *Handling conflicts without fear*

Conflicts occur when Git cannot automatically reconcile differences between two branches (e.g., the same line was changed differently in both).

### How to Handle Them
1.  **Identify:** Git will pause and tell you which files have conflicts.
2.  **Edit:** Open the file. Look for conflict markers:
    ```text
    <<<<<<< HEAD
    (Your changes)
    =======
    (Incoming changes)
    >>>>>>> branch-name
    ```
3.  **Resolve:** Manually edit the code to keep what is correct (often a mix of both). Remove the marker lines (`<<<<`, `====`, `>>>>`).
4.  **Finalize:**
    * Run `git add [filename]` to mark it as resolved.
    * If merging: `git commit`.
    * If rebasing: `git rebase --continue`.

**Abort:** If you get overwhelmed, run `git merge --abort` or `git rebase --abort` to undo the attempt.

---

## 5. Essential Git Aliases & Workflow Tips
**Topic:** *Speeding up your workflow*

Optimizing your workflow reduces friction. You can add aliases to your global config (`~/.gitconfig`) or run `git config --global alias.[name] [command]`.

### Recommended Aliases

| Alias | Command | Description |
| :--- | :--- | :--- |
| `st` | `status -s` | Short, concise status output. |
| `co` | `checkout` | Switch branches quickly. |
| `ci` | `commit` | Commit changes. |
| `cod` | `checkout .` | **Dangerous:** Discards all changes in the working directory (restores to last commit). |
| `rh` | `reset HEAD` | Unstages all changes (removes them from the "to be committed" area). |
| `pr` | `pull --rebase` | The superior way to pull changes. |
| `amend`| `commit --amend --no-edit -a` | Quickly adds current changes to the previous commit without changing the message. |

### Configuration Tips
* **Change Default Editor:** If you prefer VS Code over Vim/Nano:
    `git config --global core.editor "code --wait"`
* **Clean Untracked Files:** `git clean -df` removes all untracked files and directories (use with caution!).

---

## 6. Useful "Hacks" & Specific Commands

### Cherry Picking
* **Use Case:** You need a specific commit (e.g., a hotfix) from a teammate's branch, but you don't want to merge their entire incomplete branch.
* **Command:** `git cherry-pick [commit-hash]`
* **Result:** Copies the changes from that specific commit and applies them to your current branch as a new commit.

### GitHub CLI Repo Creation
Instead of creating a repo on the website and then linking it, use the GitHub CLI (`gh`).
* **Command:** `gh repo create --private --source=. --remote=origin`
* **Workflow:** This creates a private repo on GitHub from your current folder and sets the remote origin in one step.
* **Alias Idea:** Combine creating, pushing, and opening the browser into one shell function:
    `gh repo create ... && git push -u --all && gh browse`

---

## Summary Checklist

* [ ] **Start:** `git init` / `gh repo create`
* [ ] **Save:** `git add .` + `git commit`
* [ ] **Sync:** `git pull --rebase` (Avoid `git pull`)
* [ ] **Clean History:** `git rebase -i` (Squash/Fix commits before pushing)
* [ ] **Emergency Undo:** `git rebase --abort` / `git merge --abort`