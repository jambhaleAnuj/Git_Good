# **Engineering Standard Operating Procedure (SOP): Git Version Control**  
**Version:** 1.1  
**Reference Material:** Philomatics Git Architecture Series  
**Audience:** Engineering Interns, Junior Developers, Senior Developers  

---

## **1. Objective & Philosophy**

This document outlines the standardized Git workflows for our engineering team.  
Our primary goal is to maintain a **clean, linear project history**.

A linear Git history:

- Simplifies **code reviews**
- Makes **debugging (e.g., git bisect)** easier
- Ensures a clear **audit trail** of changes

### **The Golden Rule**  
> **"Treat your commit history as part of your product."**  
It should be readable, organized, and free of unnecessary noise (e.g., “fix typo”, “merged main”).

---

## **2. Environment Configuration**

To ensure efficiency and consistency, configure the following Git aliases.  
These reduce keystrokes and enforce the correct workflows.

### **2.1 Recommended Aliases**

Run the following commands in your terminal:

```bash
# Status: Short format for quick scanning
git config --global alias.st "status -s"

# Checkout: Fast navigation
git config --global alias.co "checkout"

# Commit: Standard commit
git config --global alias.ci "commit"

# Pull: ENFORCES REBASE (Critical compliance step)
git config --global alias.pr "pull --rebase"

# Unstage: Quickly remove files from staging area
git config --global alias.rh "reset HEAD"
```

---

## **3. Standard Development Workflow**

All developers must follow the **Rebase Workflow** instead of a merge-based workflow.

---

### **3.1 Syncing with Remote (The “No-Merge” Policy)**

**Standard Command:**  
```bash
git pull --rebase
# or
git pr
```

**Forbidden Command:**  
```bash
git pull
```

#### **Why?**
- `git pull` creates **merge commits**, polluting the commit history.
- `git pull --rebase` lifts your local commits, updates with the remote, and replays your changes cleanly.

---

### **3.2 The Development Cycle**

**Create Branch:**
```bash
git checkout -b feature/ticket-id-description
```

**Work & Save:**
```bash
git add .
git commit -m "feat: description"
```

**Sync safely before pushing:**
```bash
git pull --rebase origin main
```

**Push to remote:**
```bash
git push -u origin feature/name
```

---

## **4. Advanced History Management: “Commit Hygiene”**

Before submitting code for review, clean up your commit history using **Interactive Rebase**.

```bash
git rebase -i HEAD~N
```

*(Where N is the number of commits you want to review.)*

### **4.1 Action Guide**

| Action  | Meaning & Usage |
|--------|------------------|
| **pick** | Keep commit unchanged |
| **reword** | Modify commit message |
| **squash** | Combine this commit with the previous one (Useful for merging "fix" commits) |
| **edit** | Pause rebase to modify code inside a commit |

### ⚠️ **Critical Warning**
**Never rebase commits already pushed to shared branches** (e.g., main, develop).  
Only rebase your **local feature branches**.

---

## **5. Correction Protocols: Reset vs. Revert**

Knowing how to undo a mistake is essential.  
The method depends on whether the commit was **pushed** or **not pushed**.

---

### **5.1 Local Undo: `git reset`**

Use when **your changes have NOT been pushed**.

#### **Soft Reset (Safe)**
```bash
git reset --soft HEAD~1
```
- Undo the last commit  
- Changes remain staged  
- Use when modifying the commit message or adding missing files

#### **Hard Reset (Destructive)**
```bash
git reset --hard HEAD~1
```
- Deletes commit **and all file changes**  
- Use only when you intentionally want to discard your work  

> ⚠️ **Use with extreme caution**

---

### **5.2 Public Undo: `git revert`**

Use when **your changes have already been pushed**.

```bash
git revert <commit-hash>
```

- Creates a new commit that reverses the old one
- Preserves commit history (important for teamwork)
- Does **not** break other developers' workflow

---

## **6. Conflict Resolution Protocols**

Conflicts occur when Git cannot automatically decide between two different changes.

---

### **6.1 Resolution Steps**

1. Git pauses rebase/merge and lists conflicting files.
2. Open the file and look for conflict markers:

```
<<<<<<< HEAD
(Local Code)
=======
(Remote Incoming Code)
>>>>>>> commit-hash
```

3. Choose the correct code and delete the markers.
4. Mark as resolved:
   ```bash
   git add <filename>
   ```

5. Continue the operation  
   - Rebasing:  
     ```bash
     git rebase --continue
     ```
   - Merging:  
     ```bash
     git commit
     ```

### **Emergency Abort**

If stuck or mistakes are made:

```bash
git rebase --abort
git merge --abort
```

---

## **7. Special Operations**

### **7.1 Cherry Picking**

Use to move a specific commit between branches without merging entire history.

```bash
git cherry-pick <commit-hash>
```

---

### **7.2 GitHub CLI Setup**

Create a GitHub repo directly from the terminal:

```bash
gh repo create --private --source=. --remote=origin
```

---

## **8. Summary Checklist for Pull Requests**

Before requesting a review, ensure:

- [ ] Code builds and runs locally  
- [ ] `git status` is clean  
- [ ] Synced with remote using `git pull --rebase`  
- [ ] Commit messages are descriptive and follow guidelines  
- [ ] No "WIP" or "fix" commits (squashed using `git rebase -i`)  

---

