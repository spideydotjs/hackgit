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

export async function applyCommits(commits: CommitDay[]) {
  try {
    const git = simpleGit();
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return { success: false, error: "This folder is not initialized as a Git repository." };
    }

    const dataPath = path.join(process.cwd(), "data.json");
    
    // We will calculate dates matching the frontend grid
    // startSunday = Sunday of the week 52 weeks ago
    const startSunday = moment().startOf("week").subtract(52, "weeks");

    // Filter commits with level > 0
    const activeCommits = commits.filter(c => c.level > 0);
    
    const levelToCommits = [0, 1, 3, 6, 10];
    
    // Prepare a list of all commit dates
    const commitDates: string[] = [];
    for (const c of activeCommits) {
      const cellDate = startSunday.clone().add(c.x, "weeks").add(c.y, "days").set({ hour: 12, minute: 0, second: 0 });
      const numCommits = levelToCommits[c.level] || 0;
      for (let i = 0; i < numCommits; i++) {
        // Add a 1-minute increment to avoid exact same timestamp for multiple commits
        const finalDate = cellDate.clone().add(i, "minutes").format();
        commitDates.push(finalDate);
      }
    }

    if (commitDates.length === 0) {
      return { success: false, error: "No commits selected to generate." };
    }

    console.log(`hackgit: Starting generation of ${commitDates.length} commits...`);

    // Sequentially perform files changes and commits
    for (let i = 0; i < commitDates.length; i++) {
      const dateStr = commitDates[i];
      // Update data.json
      const dataContent = JSON.stringify({ 
        date: dateStr, 
        commitIndex: i + 1, 
        totalCommits: commitDates.length,
        generator: "hackgit" 
      }, null, 2);
      
      await fs.writeFile(dataPath, dataContent, "utf-8");
      
      // Git commit
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
