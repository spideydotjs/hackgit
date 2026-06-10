"use server";

import simpleGit from "simple-git";
import path from "path";
import fs from "fs/promises";
import moment from "moment";

export interface CommitDay {
  x: number; // week (0-52)
  y: number; // day (0-6)
  level: number; // 0-4
}

/**
 * Calculates start Sunday based on year selection
 */
const getStartSunday = (yearOpt: string) => {
  if (yearOpt === "current") {
    return moment().startOf("week").subtract(52, "weeks");
  } else {
    const yearNum = parseInt(yearOpt, 10);
    // GitHub contribution calendar for a past year begins on the Sunday of the week containing Jan 1st
    return moment().year(yearNum).month(0).date(1).startOf("week");
  }
};

export async function checkGitStatus() {
  try {
    const git = simpleGit();
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return { success: false, error: "This folder is not initialized as a Git repository." };
    }
    const status = await git.status();
    return {
      success: true,
      branch: status.current || "unknown",
      tracking: status.tracking || "none",
      modifiedCount: status.modified.length + status.not_added.length,
      isClean: status.isClean(),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to check Git status." };
  }
}

export async function applyCommits(commits: CommitDay[], yearOption: string = "current") {
  try {
    const git = simpleGit();
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return { success: false, error: "This folder is not initialized as a Git repository." };
    }

    const dataPath = path.join(process.cwd(), "data.json");
    const startSunday = getStartSunday(yearOption);

    // Filter commits with level > 0
    const activeCommits = commits.filter(c => c.level > 0);
    const levelToCommits = [0, 1, 3, 6, 10];
    
    // Prepare a list of all commit dates
    const commitDates: string[] = [];
    for (const c of activeCommits) {
      const cellDate = startSunday.clone().add(c.x, "weeks").add(c.y, "days").set({ hour: 12, minute: 0, second: 0 });
      const numCommits = levelToCommits[c.level] || 0;
      for (let i = 0; i < numCommits; i++) {
        const finalDate = cellDate.clone().add(i, "minutes").format();
        commitDates.push(finalDate);
      }
    }

    if (commitDates.length === 0) {
      return { success: false, error: "No commits selected to generate." };
    }

    console.log(`hackgit: Starting generation of ${commitDates.length} commits for option "${yearOption}"...`);

    for (let i = 0; i < commitDates.length; i++) {
      const dateStr = commitDates[i];
      const dataContent = JSON.stringify({ 
        date: dateStr, 
        commitIndex: i + 1, 
        totalCommits: commitDates.length,
        generator: "hackgit" 
      }, null, 2);
      
      await fs.writeFile(dataPath, dataContent, "utf-8");
      
      await git.add(dataPath);
      await git.commit(`hackgit: contribution ${i + 1}/${commitDates.length} on ${dateStr}`, {
        "--date": dateStr,
      });
    }

    console.log(`hackgit: Successfully completed ${commitDates.length} commits.`);
    return { success: true, count: commitDates.length };
  } catch (error: any) {
    console.error("hackgit: Error generating commits:", error);
    return { success: false, error: error.message || "Failed to generate commits." };
  }
}

/**
 * Validate GitHub Personal Access Token
 */
export async function validateGitHubToken(token: string) {
  if (!token || !token.trim()) {
    return { success: false, error: "Token is required." };
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        "Authorization": `token ${token.trim()}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "hackgit-app"
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return { 
        success: false, 
        error: `Authentication failed (Status ${response.status}). Please check your token.` 
      };
    }

    const userData = await response.json();
    return {
      success: true,
      user: {
        username: userData.login,
        name: userData.name || userData.login,
        email: userData.email || "",
        avatarUrl: userData.avatar_url
      }
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Network error while connecting to GitHub." };
  }
}

/**
 * Create a new repository on GitHub and push backdated commits
 */
export async function createGitHubRepoAndPush(
  token: string, 
  username: string, 
  email: string, 
  repoName: string, 
  commits: CommitDay[],
  yearOption: string = "current"
) {
  const cleanToken = token.trim();
  const cleanRepoName = repoName.trim().replace(/[^a-zA-Z0-9_\-\.]/g, "-");
  const tempDirName = `temp-repo-${Date.now()}`;
  const tempDirPath = path.join(process.cwd(), "scratch", tempDirName);

  try {
    // 1. Create the repository on GitHub
    console.log(`hackgit: Creating repository "${cleanRepoName}" on GitHub...`);
    const createRepoResponse = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        "Authorization": `token ${cleanToken}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "hackgit-app"
      },
      body: JSON.stringify({
        name: cleanRepoName,
        description: "GitHub contribution graph calendar generated by hackgit",
        private: false,
        auto_init: false
      })
    });

    if (!createRepoResponse.ok && createRepoResponse.status !== 422) {
      const errText = await createRepoResponse.text();
      return { 
        success: false, 
        error: `Failed to create GitHub repository. Status: ${createRepoResponse.status}. Details: ${errText}` 
      };
    }

    const isExistingRepo = createRepoResponse.status === 422;
    console.log(
      isExistingRepo 
        ? `hackgit: Repository already exists. Attempting to push to it.`
        : `hackgit: Successfully created repository "${cleanRepoName}".`
    );

    // 2. Prepare temporary workspace
    await fs.mkdir(tempDirPath, { recursive: true });
    console.log(`hackgit: Initialized temporary workspace at ${tempDirPath}`);

    const git = simpleGit(tempDirPath);
    await git.init();
    await git.checkoutLocalBranch("main");

    await git.addConfig("user.name", username);
    await git.addConfig("user.email", email || `${username}@users.noreply.github.com`);

    // 3. Generate backdated commits
    const startSunday = getStartSunday(yearOption);
    const activeCommits = commits.filter(c => c.level > 0);
    const levelToCommits = [0, 1, 3, 6, 10];
    
    const commitDates: string[] = [];
    for (const c of activeCommits) {
      const cellDate = startSunday.clone().add(c.x, "weeks").add(c.y, "days").set({ hour: 12, minute: 0, second: 0 });
      const numCommits = levelToCommits[c.level] || 0;
      for (let i = 0; i < numCommits; i++) {
        const finalDate = cellDate.clone().add(i, "minutes").format();
        commitDates.push(finalDate);
      }
    }

    if (commitDates.length === 0) {
      await fs.rm(tempDirPath, { recursive: true, force: true });
      return { success: false, error: "No commits selected to generate." };
    }

    console.log(`hackgit: Generating ${commitDates.length} commits in temporary workspace...`);
    const dataPath = path.join(tempDirPath, "data.json");

    for (let i = 0; i < commitDates.length; i++) {
      const dateStr = commitDates[i];
      const dataContent = JSON.stringify({ 
        date: dateStr, 
        commitIndex: i + 1, 
        totalCommits: commitDates.length,
        generator: "hackgit" 
      }, null, 2);
      
      await fs.writeFile(dataPath, dataContent, "utf-8");
      await git.add("data.json");
      await git.commit(`hackgit: contribution ${i + 1}/${commitDates.length} on ${dateStr}`, {
        "--date": dateStr,
      });
    }

    // 4. Push to remote repository
    console.log(`hackgit: Pushing to remote repository...`);
    const remoteUrl = `https://${cleanToken}@github.com/${username}/${cleanRepoName}.git`;
    
    await git.addRemote("origin", remoteUrl);
    await git.push("origin", "main", { "-u": null, "-f": null });

    // 5. Clean up temporary workspace
    await fs.rm(tempDirPath, { recursive: true, force: true });
    console.log(`hackgit: Cleaned up temporary workspace.`);

    return { 
      success: true, 
      repoUrl: `https://github.com/${username}/${cleanRepoName}`,
      isExisting: isExistingRepo
    };
  } catch (error: any) {
    console.error("hackgit: OAuth push failed:", error);
    try {
      await fs.rm(tempDirPath, { recursive: true, force: true });
    } catch (e) {}
    
    return { success: false, error: error.message || "Failed to create repository and push." };
  }
}
