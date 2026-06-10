"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import moment from "moment";
import {
  GitCommit,
  Terminal,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Play,
  Edit,
  Eraser,
  Type,
  HelpCircle,
  Sun,
  Moon,
  Sparkles,
  Check,
  Copy,
  Info,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { checkGitStatus, applyCommits, CommitDay, validateGitHubToken, createGitHubRepoAndPush } from "./actions";

// 5x5 / 5x3 character matrices for drawing text on the 7-row grid (placed on rows 1-5, leaving rows 0 and 6 as padding)
const font: Record<string, number[][]> = {
  A: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
  ],
  B: [
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
  ],
  C: [
    [0, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [0, 1, 1, 1],
  ],
  D: [
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
  ],
  E: [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  F: [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ],
  G: [
    [0, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 1, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 1],
  ],
  H: [
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
  ],
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  J: [
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  K: [
    [1, 0, 0, 1],
    [1, 0, 1, 0],
    [1, 1, 0, 0],
    [1, 0, 1, 0],
    [1, 0, 0, 1],
  ],
  L: [
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  N: [
    [1, 0, 0, 1],
    [1, 1, 0, 1],
    [1, 0, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
  ],
  O: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  P: [
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ],
  Q: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
  ],
  R: [
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
    [1, 0, 1, 0],
    [1, 0, 0, 1],
  ],
  S: [
    [0, 1, 1, 1],
    [1, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 1],
    [1, 1, 1, 0],
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  U: [
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  V: [
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
  ],
  W: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ],
  X: [
    [1, 0, 0, 1],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
  ],
  Y: [
    [1, 0, 0, 1],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  Z: [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  " ": [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  "1": [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  "2": [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
  ],
  "3": [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  "4": [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  "5": [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  "6": [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  "7": [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  "8": [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  "9": [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  "0": [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  "!": [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  "-": [
    [0, 0, 0],
    [0, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
  ],
  "+": [
    [0, 0, 0],
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
  "?": [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 1],
    [0, 0, 0],
    [0, 1, 0],
  ],
};

const spaceInvader = [
  [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
];

const smileyFace = [
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [0, 1, 0, 1, 1, 1, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
];

export default function HackGitHome() {
  const [grid, setGrid] = useState<Record<string, number>>({});
  const [tool, setTool] = useState<"pencil" | "eraser" | "cycle">("pencil");
  const [brushLevel, setBrushLevel] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Text rendering states
  const [textInput, setTextInput] = useState("HACK");
  const [textOffset, setTextOffset] = useState(15);
  const [autoCenter, setAutoCenter] = useState(true);

  // Tab management
  const [activeTab, setActiveTab] = useState<"local" | "github" | "scripts" | "io">("github");

  // Local repo git status
  const [gitStatus, setGitStatus] = useState<{
    success: boolean;
    branch?: string;
    tracking?: string;
    modifiedCount?: number;
    isClean?: boolean;
    error?: string;
  } | null>(null);

  // Commit process states
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState<boolean | null>(null);
  const [commitMessage, setCommitMessage] = useState("");

  // GitHub integration states
  const [ghToken, setGhToken] = useState("");
  const [ghUser, setGhUser] = useState<{
    username: string;
    name: string;
    email: string;
    avatarUrl: string;
  } | null>(null);
  const [ghRepoName, setGhRepoName] = useState("hackgit-contributions");
  const [isGHAuthenticating, setIsGHAuthenticating] = useState(false);
  const [isGHPushing, setIsGHPushing] = useState(false);
  const [ghPushResult, setGhPushResult] = useState<{
    success: boolean;
    repoUrl?: string;
    isExisting?: boolean;
    error?: string;
  } | null>(null);
  
  // UI preferences
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [copiedBash, setCopiedBash] = useState(false);
  const [copiedPowerShell, setCopiedPowerShell] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  // Year Selection
  const [selectedYear, setSelectedYear] = useState<string>("current");

  const getStartSunday = useCallback((yearOpt: string) => {
    if (yearOpt === "current") {
      return moment().startOf("week").subtract(52, "weeks");
    } else {
      const yearNum = parseInt(yearOpt, 10);
      return moment().year(yearNum).month(0).date(1).startOf("week");
    }
  }, []);

  // Date alignment
  const startSunday = getStartSunday(selectedYear);
  const today = moment();

  // Load theme preference and GitHub session on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || 
                   (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    fetchGitStatus();

    // Retrieve saved GitHub session
    const savedToken = localStorage.getItem("gh_token");
    const savedUser = localStorage.getItem("gh_user");
    if (savedToken) setGhToken(savedToken);
    if (savedUser) {
      try {
        setGhUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const fetchGitStatus = async () => {
    const status = await checkGitStatus();
    setGitStatus(status);
  };

  const handleGHAuthenticate = async () => {
    if (!ghToken.trim()) return;
    setIsGHAuthenticating(true);
    try {
      const result = await validateGitHubToken(ghToken);
      if (result.success && result.user) {
        setGhUser(result.user);
        localStorage.setItem("gh_token", ghToken.trim());
        localStorage.setItem("gh_user", JSON.stringify(result.user));
      } else {
        alert(result.error || "Failed to authenticate with GitHub.");
      }
    } catch (e: any) {
      alert(e.message || "An error occurred during authentication.");
    } finally {
      setIsGHAuthenticating(false);
    }
  };

  const handleGHDisconnect = () => {
    setGhToken("");
    setGhUser(null);
    localStorage.removeItem("gh_token");
    localStorage.removeItem("gh_user");
    setGhPushResult(null);
  };

  const handleGHPush = async () => {
    if (!ghUser || !ghToken || activeCells.length === 0) return;
    setIsGHPushing(true);
    setGhPushResult(null);
    try {
      const result = await createGitHubRepoAndPush(
        ghToken,
        ghUser.username,
        ghUser.email,
        ghRepoName,
        activeCells,
        selectedYear
      );
      setGhPushResult(result);
    } catch (e: any) {
      setGhPushResult({ success: false, error: e.message || "Failed to push commits to GitHub." });
    } finally {
      setIsGHPushing(false);
    }
  };

  // Check if cell corresponds to a future date
  const isFutureDate = useCallback((x: number, y: number) => {
    const cellDate = startSunday.clone().add(x, "weeks").add(y, "days");
    return cellDate.isAfter(today, "day");
  }, [startSunday, today]);

  // Cell interaction
  const handleCellAction = useCallback((x: number, y: number, isDragStart = false) => {
    if (isFutureDate(x, y)) return; // Disable painting future dates
    
    const key = `${x},${y}`;
    const currentVal = grid[key] || 0;

    setGrid((prev) => {
      const next = { ...prev };
      if (tool === "pencil") {
        next[key] = brushLevel;
      } else if (tool === "eraser") {
        next[key] = 0;
      } else if (tool === "cycle") {
        if (isDragStart) {
          next[key] = (currentVal + 1) % 5;
        } else {
          // In drag mode, behave like pencil
          next[key] = brushLevel;
        }
      }
      // Clean up keys with value 0
      if (next[key] === 0) {
        delete next[key];
      }
      return next;
    });
  }, [grid, tool, brushLevel, isFutureDate]);

  const handleMouseDown = (x: number, y: number) => {
    setIsDrawing(true);
    handleCellAction(x, y, true);
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (isDrawing) {
      handleCellAction(x, y, false);
    }
  };

  // Set up global mouseup listener to terminate drawing
  useEffect(() => {
    const handleMouseUp = () => setIsDrawing(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Presets & Templates
  const clearGrid = () => setGrid({});
  
  const fillGrid = () => {
    const newGrid: Record<string, number> = {};
    for (let x = 0; x < 53; x++) {
      for (let y = 0; y < 7; y++) {
        if (!isFutureDate(x, y)) {
          newGrid[`${x},${y}`] = brushLevel;
        }
      }
    }
    setGrid(newGrid);
  };

  const invertGrid = () => {
    const newGrid: Record<string, number> = {};
    for (let x = 0; x < 53; x++) {
      for (let y = 0; y < 7; y++) {
        if (!isFutureDate(x, y)) {
          const currentLevel = grid[`${x},${y}`] || 0;
          const inverted = 4 - currentLevel;
          if (inverted > 0) {
            newGrid[`${x},${y}`] = inverted;
          }
        }
      }
    }
    setGrid(newGrid);
  };

  const randomGrid = () => {
    const newGrid: Record<string, number> = {};
    for (let x = 0; x < 53; x++) {
      for (let y = 0; y < 7; y++) {
        if (!isFutureDate(x, y) && Math.random() > 0.4) {
          newGrid[`${x},${y}`] = Math.floor(Math.random() * 4) + 1;
        }
      }
    }
    setGrid(newGrid);
  };

  // Conway's Game of Life
  const runGameOfLifeStep = () => {
    const newGrid: Record<string, number> = {};
    const dirs = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (let x = 0; x < 53; x++) {
      for (let y = 0; y < 7; y++) {
        if (isFutureDate(x, y)) continue;

        const key = `${x},${y}`;
        const currentLevel = grid[key] || 0;
        
        let neighbors = 0;
        dirs.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < 53 && ny >= 0 && ny < 7) {
            const neighborLevel = grid[`${nx},${ny}`] || 0;
            if (neighborLevel > 0) neighbors++;
          }
        });
        
        if (currentLevel > 0) {
          if (neighbors === 2 || neighbors === 3) {
            newGrid[key] = currentLevel; // survives
          }
        } else {
          if (neighbors === 3) {
            newGrid[key] = 2; // reproduces (shades level 2)
          }
        }
      }
    }
    setGrid(newGrid);
  };

  // Draw Space Invader
  const drawSpaceInvader = () => {
    const newGrid = { ...grid };
    const startX = 21; // Center on X axis
    const startY = 0;  // Center on Y axis
    
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 11; c++) {
        const x = startX + c;
        const y = startY + r;
        if (spaceInvader[r][c] === 1 && !isFutureDate(x, y)) {
          newGrid[`${x},${y}`] = brushLevel;
        }
      }
    }
    setGrid(newGrid);
  };

  // Draw Smiley
  const drawSmiley = () => {
    const newGrid = { ...grid };
    const startX = 22; // Center on X axis
    const startY = 0;  // Center on Y axis
    
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 9; c++) {
        const x = startX + c;
        const y = startY + r;
        if (smileyFace[r][c] === 1 && !isFutureDate(x, y)) {
          newGrid[`${x},${y}`] = brushLevel;
        }
      }
    }
    setGrid(newGrid);
  };

  // Calculate text width
  const getTextWidth = useCallback((text: string) => {
    const uppercaseText = text.toUpperCase();
    let width = 0;
    for (let i = 0; i < uppercaseText.length; i++) {
      const char = uppercaseText[i];
      const matrix = font[char] || font[" "];
      width += matrix[0].length + 1; // char width + 1 column spacing
    }
    return width > 0 ? width - 1 : 0;
  }, []);

  // Update offset automatically if auto-center is active
  useEffect(() => {
    if (autoCenter) {
      const width = getTextWidth(textInput);
      const centerOffset = Math.max(0, Math.floor((53 - width) / 2));
      setTextOffset(centerOffset);
    }
  }, [textInput, autoCenter, getTextWidth]);

  // Render Text
  const renderText = () => {
    const newGrid = { ...grid };
    let currentX = textOffset;
    
    const uppercaseText = textInput.toUpperCase();
    for (let i = 0; i < uppercaseText.length; i++) {
      const char = uppercaseText[i];
      const matrix = font[char] || font[" "];
      const charWidth = matrix[0].length;
      
      if (currentX + charWidth > 53) break;
      
      // Render inside rows 1-5 (centered vertically on the 7 rows)
      for (let r = 0; r < 5; r++) {
        const y = r + 1;
        for (let c = 0; c < charWidth; c++) {
          const x = currentX + c;
          if (matrix[r][c] === 1 && !isFutureDate(x, y)) {
            newGrid[`${x},${y}`] = brushLevel;
          }
        }
      }
      currentX += charWidth + 1; // space after character
    }
    
    setGrid(newGrid);
  };

  // Commit operations summary
  const getCommitDetails = () => {
    const activeCells: CommitDay[] = [];
    let totalCommits = 0;
    const levelToCommits = [0, 1, 3, 6, 10];

    Object.entries(grid).forEach(([key, level]) => {
      const [xStr, yStr] = key.split(",");
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);
      if (level > 0 && !isFutureDate(x, y)) {
        activeCells.push({ x, y, level });
        totalCommits += levelToCommits[level] || 0;
      }
    });

    return { activeCells, totalCommits };
  };

  const { activeCells, totalCommits } = getCommitDetails();

  // Apply commits locally using server action
  const handleApplyCommits = async () => {
    if (activeCells.length === 0) return;
    setIsCommitting(true);
    setCommitSuccess(null);
    setCommitMessage("Connecting to local git and generating commits...");

    try {
      const result = await applyCommits(activeCells, selectedYear);
      if (result.success) {
        setCommitSuccess(true);
        setCommitMessage(`Successfully applied ${result.count} backdated commits to your local repository! Check git log.`);
        fetchGitStatus();
      } else {
        setCommitSuccess(false);
        setCommitMessage(`Error: ${result.error}`);
      }
    } catch (e: any) {
      setCommitSuccess(false);
      setCommitMessage(`Error: ${e.message || "An unexpected error occurred."}`);
    } finally {
      setIsCommitting(false);
    }
  };

  // Script Generators
  const getBashScriptText = () => {
    const list: { date: string; count: number }[] = [];
    const levelToCommits = [0, 1, 3, 6, 10];

    activeCells.forEach((cell) => {
      const cellDate = startSunday.clone().add(cell.x, "weeks").add(cell.y, "days").set({ hour: 12, minute: 0, second: 0 }).format("YYYY-MM-DDTHH:mm:ss");
      const count = levelToCommits[cell.level] || 0;
      if (count > 0) {
        list.push({ date: cellDate, count });
      }
    });

    let script = `#!/usr/bin/env bash
# ==============================================================================
# hackgit - GitHub Contribution Generator Bash Script
# Generated on: ${new Date().toLocaleString()}
# ==============================================================================

set -e

# Verify in Git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Error: This script must be run inside an initialized Git repository!"
  exit 1
fi

echo "🚀 hackgit: Generating ${totalCommits} backdated commits..."

DATA_FILE="data.json"
echo "{}" > "$DATA_FILE"

make_commits() {
  local date=$1
  local count=$2
  
  for ((i=1; i<=count; i++)); do
    # Format JSON update to ensure file state changes
    echo "{\\"date\\": \\"$date\\", \\"commitIndex\\": $i, \\"generator\\": \\"hackgit\\"}" > "$DATA_FILE"
    git add "$DATA_FILE"
    
    # Commit with backdated timestamp (using environment overrides for author/committer)
    GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "hackgit contribution $i on $date" --quiet
  done
}

`;

    list.forEach((c) => {
      script += `make_commits "${c.date}" ${c.count}\n`;
    });

    script += `
echo "✅ hackgit: Finished generating ${totalCommits} commits!"
echo "👉 Run 'git push origin main' (or your current branch) to update your GitHub calendar."
`;
    return script;
  };

  const getPowerShellScriptText = () => {
    const list: { date: string; count: number }[] = [];
    const levelToCommits = [0, 1, 3, 6, 10];

    activeCells.forEach((cell) => {
      const cellDate = startSunday.clone().add(cell.x, "weeks").add(cell.y, "days").set({ hour: 12, minute: 0, second: 0 }).format("YYYY-MM-DDTHH:mm:ss");
      const count = levelToCommits[cell.level] || 0;
      if (count > 0) {
        list.push({ date: cellDate, count });
      }
    });

    let script = `# ==============================================================================
# hackgit - GitHub Contribution Generator PowerShell Script
# Generated on: ${new Date().toLocaleString()}
# ==============================================================================

# Verify in Git repo
if (-not (git rev-parse --is-inside-work-tree 2>$null)) {
    Write-Error "❌ Error: This script must be run inside an initialized Git repository!"
    exit 1
}

Write-Host "🚀 hackgit: Generating ${totalCommits} backdated commits..." -ForegroundColor Green

$dataFile = "data.json"
Set-Content -Path $dataFile -Value "{}"

function Make-Commits($date, $count) {
    for ($i = 1; $i -le $count; $i++) {
        $json = @{
            date = $date
            commitIndex = $i
            generator = "hackgit"
        } | ConvertTo-Json -Compress
        
        Set-Content -Path $dataFile -Value $json
        git add $dataFile
        
        # Override Git dates via Environment
        $env:GIT_AUTHOR_DATE = $date
        $env:GIT_COMMITTER_DATE = $date
        
        git commit -m "hackgit contribution $i on $date" --quiet
    }
}

`;

    list.forEach((c) => {
      script += `Make-Commits "${c.date}" ${c.count}\n`;
    });

    script += `
# Clean up env
Remove-Item Env:\\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:\\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Host "✅ hackgit: Finished generating ${totalCommits} commits!" -ForegroundColor Green
Write-Host "👉 Run 'git push origin <branch>' to push commits." -ForegroundColor Green
`;
    return script;
  };

  const copyToClipboard = (text: string, type: "bash" | "powershell") => {
    navigator.clipboard.writeText(text);
    if (type === "bash") {
      setCopiedBash(true);
      setTimeout(() => setCopiedBash(false), 2000);
    } else {
      setCopiedPowerShell(true);
      setTimeout(() => setCopiedPowerShell(false), 2000);
    }
  };

  const downloadScriptFile = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Import/Export Grid JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(grid));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hackgit-pattern-${moment().format("YYYY-MM-DD")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          // Simple validation: make sure keys match "x,y" and values are numbers
          const validated: Record<string, number> = {};
          Object.entries(parsed).forEach(([key, val]) => {
            if (/^\d+,\d+$/.test(key) && typeof val === "number" && val >= 0 && val <= 4) {
              if (val > 0) validated[key] = val;
            }
          });
          setGrid(validated);
        } catch (err) {
          alert("Invalid pattern JSON file.");
        }
      };
    }
  };

  // Month rendering labels above the contribution grid
  const getMonthHeaderLabels = () => {
    const labels: { text: string; colIndex: number }[] = [];
    let prevMonth = -1;

    for (let x = 0; x < 53; x++) {
      const currentWeekDate = startSunday.clone().add(x, "weeks");
      const currentMonth = currentWeekDate.month();

      if (currentMonth !== prevMonth) {
        labels.push({
          text: currentWeekDate.format("MMM"),
          colIndex: x,
        });
        prevMonth = currentMonth;
      }
    }
    return labels;
  };

  const monthLabels = getMonthHeaderLabels();

  return (
    <div className="dark flex-1 bg-black text-zinc-50 font-sans py-7 px-7 select-none min-h-screen flex flex-col justify-start">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-5 w-full">
        
        {/* HEADER SECTION */}
        <header className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-black rounded">
              <GitCommit className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight font-mono text-white leading-none">hackgit</h1>
              <p className="text-[13px] text-zinc-400 mt-0.5">
                Replica GitHub Contribution Editor & Commit Planner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm border border-zinc-800 rounded hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-zinc-100 font-mono"
            >
              <HelpCircle className="h-4 w-4" />
              How it works
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 border border-zinc-800 rounded hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-zinc-100"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* HOW IT WORKS GUIDELINES */}
        {showHowTo && (
          <div className="bg-zinc-950 border border-zinc-900 rounded p-5 text-sm flex gap-4 leading-relaxed transition-all">
            <Info className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-zinc-200 text-sm">How hackgit works:</h3>
              <ol className="list-decimal pl-5 flex flex-col gap-1.5 text-zinc-400">
                <li>
                  <strong>Draw:</strong> Choose brush level and drag on the calendar grid to draw your contribution pattern.
                </li>
                <li>
                  <strong>Type:</strong> Use the Text Drawer below to automatically render words onto the calendar.
                </li>
                <li>
                  <strong>Apply:</strong> Connect your token to push directly to a new repository, apply to local repo, or download scripts.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* HEATMAP CONTAINER (Full Width) */}
        <div className="border border-zinc-900 bg-zinc-955 p-5 rounded-lg shadow-sm">
          <div className="flex flex-col gap-3">
            
            {/* HEATMAP HEADER (Year Selector, Invert, Clear) */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <span className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-400">Contribution Calendar</span>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={invertGrid}
                  className="px-3 py-1.5 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 rounded text-sm font-mono text-zinc-300 hover:text-white transition-colors"
                >
                  Invert
                </button>
                <button
                  onClick={clearGrid}
                  className="px-3 py-1.5 border border-rose-900 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 rounded text-sm font-mono transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>

                <div className="h-5 border-r border-zinc-800 mx-2"></div>

                <label htmlFor="year-select" className="text-sm text-zinc-500 font-mono">Year:</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-2.5 py-1.5 border border-zinc-800 bg-zinc-900 rounded text-sm font-mono focus:outline-none focus:border-zinc-700 text-white cursor-pointer"
                >
                  <option value="current">Last 12 Months</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>

            {/* Scrollable calendar view to preserve exact dimensions */}
            <div className="overflow-x-auto pb-1.5 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin">
              <div className="min-w-[800px] flex flex-col items-center select-none">
                
                {/* MONTH LABELS ROW */}
                <div 
                  className="relative h-5 select-none text-[12px] text-zinc-500 font-mono"
                  style={{ width: "776px" }}
                >
                  {monthLabels.map((lbl, idx) => (
                    <span
                      key={idx}
                      style={{ left: `${36 + lbl.colIndex * 14}px` }}
                      className="absolute whitespace-nowrap"
                    >
                      {lbl.text}
                    </span>
                  ))}
                </div>

                {/* GRAPH MATRIX AND WEEKDAYS */}
                <div className="flex items-center" style={{ width: "776px" }}>
                  {/* WEEKDAY LABELS (36px width) */}
                  <div 
                    className="grid grid-rows-7 text-[12px] text-zinc-500 font-mono pr-3 select-none"
                    style={{
                      height: "96px",
                      gridTemplateRows: "repeat(7, 12px)",
                      gap: "2px",
                      width: "36px"
                    }}
                  >
                    <span></span>
                    <span className="leading-[12px] h-[12px] flex items-center">Mon</span>
                    <span></span>
                    <span className="leading-[12px] h-[12px] flex items-center">Wed</span>
                    <span></span>
                    <span className="leading-[12px] h-[12px] flex items-center">Fri</span>
                    <span></span>
                  </div>

                  {/* 53 COLUMNS X 7 ROWS FLAT GRID */}
                  <div 
                    className="grid grid-flow-col gap-[2px] relative cursor-crosshair select-none"
                    onMouseLeave={() => setIsDrawing(false)}
                    style={{
                      gridTemplateColumns: "repeat(53, 12px)",
                      gridTemplateRows: "repeat(7, 12px)",
                      width: "740px",
                      height: "96px"
                    }}
                  >
                    {Array.from({ length: 53 * 7 }).map((_, index) => {
                      const x = Math.floor(index / 7);
                      const y = index % 7;
                      const key = `${x},${y}`;
                      const val = grid[key] || 0;
                      const future = isFutureDate(x, y);
                      const cellDate = startSunday.clone().add(x, "weeks").add(y, "days");
                      const commitsCount = [0, 1, 3, 6, 10][val];

                      let cellColorClass = 
                        val === 1 ? "bg-[#0e4429]" :
                        val === 2 ? "bg-[#006d32]" :
                        val === 3 ? "bg-[#26a641]" :
                        val === 4 ? "bg-[#39d353]" : "bg-[#161b22]";

                      return (
                        <div
                          key={index}
                          onMouseDown={() => handleMouseDown(x, y)}
                          onMouseEnter={() => handleMouseEnter(x, y)}
                          className={`
                            w-[12px] h-[12px] rounded-[2px] border border-transparent 
                            transition-all duration-75 relative group
                            ${cellColorClass}
                            ${future ? "opacity-25 cursor-not-allowed border-dashed border-zinc-850" : "hover:scale-110 hover:border-white"}
                          `}
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 hidden group-hover:block z-30 bg-zinc-900 text-white text-sm px-3 py-2 rounded shadow-md whitespace-nowrap font-mono">
                            {future ? "Future Date" : `${commitsCount} commit${commitsCount !== 1 ? "s" : ""} on ${cellDate.format("MMM DD, YYYY")}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* GRAPH FOOTER & LEGEND */}
            <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-sm text-zinc-400">
              <div className="flex gap-5">
                <span>Active: <strong>{activeCells.length}</strong></span>
                <span>Commits: <strong>{totalCommits}</strong></span>
              </div>
              
              {/* COLOR KEY */}
              <div className="flex items-center gap-[4px] font-mono text-[12px]">
                <span className="mr-1 text-zinc-500">Less</span>
                <div className="w-[12px] h-[12px] rounded-[2px] bg-[#161b22]"></div>
                <div className="w-[12px] h-[12px] rounded-[2px] bg-[#0e4429]"></div>
                <div className="w-[12px] h-[12px] rounded-[2px] bg-[#006d32]"></div>
                <div className="w-[12px] h-[12px] rounded-[2px] bg-[#26a641]"></div>
                <div className="w-[12px] h-[12px] rounded-[2px] bg-[#39d353]"></div>
                <span className="ml-1 text-zinc-500">More</span>
              </div>
            </div>

          </div>
        </div>

        {/* 4-COLUMN CONTROL PANEL LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          
          {/* COLUMN 1: BRUSH TOOLS */}
          <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-lg shadow-sm flex flex-col gap-5">
            <div className="border-b border-zinc-900 pb-2 flex items-center gap-2.5">
              <Edit className="h-5 w-5 text-zinc-400" />
              <h2 className="text-sm font-semibold tracking-wider uppercase font-mono text-zinc-200">Brush Tools</h2>
            </div>

            {/* BRUSH MODE */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[13px] font-bold text-zinc-400">Brush Mode:</span>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-900/60 p-1.5 rounded">
                <button
                  onClick={() => setTool("pencil")}
                  className={`flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold rounded ${
                    tool === "pencil" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <Edit className="h-4 w-4" />
                  Draw
                </button>
                <button
                  onClick={() => setTool("eraser")}
                  className={`flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold rounded ${
                    tool === "eraser" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <Eraser className="h-4 w-4" />
                  Erase
                </button>
                <button
                  onClick={() => setTool("cycle")}
                  className={`flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold rounded ${
                    tool === "cycle" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <RefreshCw className="h-4 w-4" />
                  Cycle
                </button>
              </div>
            </div>

            {/* BRUSH INTENSITY */}
            {tool !== "eraser" && (
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] font-bold text-zinc-400">Brush Shade (Intensity):</span>
                <div className="grid grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4].map((lvl) => {
                    const commits = [0, 1, 3, 6, 10][lvl];
                    const colorClass = 
                      lvl === 1 ? "bg-[#0e4429]" :
                      lvl === 2 ? "bg-[#006d32]" :
                      lvl === 3 ? "bg-[#26a641]" : "bg-[#39d353]";

                    return (
                      <button
                        key={lvl}
                        onClick={() => setBrushLevel(lvl)}
                        className={`
                          py-2 rounded border transition-all flex items-center justify-center font-mono text-[12px] font-bold text-white
                          ${colorClass}
                          ${brushLevel === lvl ? "border-white scale-105 shadow" : "border-transparent hover:scale-102"}
                        `}
                      >
                        {commits}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: TEXT DRAWER */}
          <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-lg shadow-sm flex flex-col gap-5">
            <div className="border-b border-zinc-900 pb-2 flex items-center gap-2.5">
              <Type className="h-5 w-5 text-zinc-400" />
              <h2 className="text-sm font-semibold tracking-wider uppercase font-mono text-zinc-200">Text Drawer</h2>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* WORD INPUT */}
              <div className="flex flex-col gap-2">
                <label htmlFor="text-input" className="text-[13px] font-bold text-zinc-400">Word / Phrase:</label>
                <input
                  id="text-input"
                  type="text"
                  maxLength={15}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value.replace(/[^A-Za-z0-9\s!\-+?]/g, ""))}
                  placeholder="Enter text (e.g. HACK)"
                  className="px-3 py-2 border border-zinc-800 bg-zinc-900 rounded text-sm font-mono focus:outline-none focus:border-zinc-700 text-white"
                />
                <span className="text-[12px] text-zinc-500 font-mono">A-Z, 0-9, space, ! - + ?</span>
              </div>

              {/* OFFSET SLIDER */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-bold text-zinc-400">Start Column:</span>
                  <span className="font-mono text-zinc-300">{textOffset}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, 53 - getTextWidth(textInput))}
                  value={textOffset}
                  disabled={autoCenter}
                  onChange={(e) => setTextOffset(parseInt(e.target.value, 10))}
                  className="w-full accent-white disabled:opacity-30 disabled:cursor-not-allowed"
                />
                
                {/* AUTO CENTER */}
                <label className="flex items-center gap-2.5 text-[12px] text-zinc-500 cursor-pointer mt-0.5 font-mono">
                  <input
                    type="checkbox"
                    checked={autoCenter}
                    onChange={(e) => setAutoCenter(e.target.checked)}
                    className="accent-white rounded"
                  />
                  Auto-Center ({getTextWidth(textInput)} cols wide)
                </label>
              </div>

              {/* RENDER BUTTON */}
              <button
                onClick={renderText}
                disabled={!textInput.trim()}
                className="w-full py-2.5 bg-white text-black rounded hover:opacity-90 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4" />
                Render onto Grid
              </button>
            </div>
          </div>

          {/* COLUMN 3: PRESET SHAPES */}
          <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-lg shadow-sm flex flex-col gap-5">
            <div className="border-b border-zinc-900 pb-2 flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-zinc-400" />
              <h2 className="text-sm font-semibold tracking-wider uppercase font-mono text-zinc-200">Preset Shapes</h2>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-zinc-400">Presets & Actions:</span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={drawSpaceInvader}
                  className="py-1.5 border border-zinc-800 rounded hover:bg-zinc-900 text-[12px] font-mono text-zinc-300 hover:text-white"
                >
                  Invader
                </button>
                <button
                  onClick={drawSmiley}
                  className="py-1.5 border border-zinc-800 rounded hover:bg-zinc-900 text-[12px] font-mono text-zinc-300 hover:text-white"
                >
                  Smiley
                </button>
                <button
                  onClick={fillGrid}
                  className="py-1.5 border border-zinc-800 rounded hover:bg-zinc-900 text-[12px] font-mono text-zinc-300 hover:text-white"
                >
                  Fill All
                </button>
                <button
                  onClick={randomGrid}
                  className="py-1.5 border border-zinc-800 rounded hover:bg-zinc-900 text-[12px] font-mono text-zinc-300 hover:text-white"
                >
                  Random
                </button>
              </div>

              {/* GAME OF LIFE SIMULATOR */}
              <div className="flex flex-col gap-2 pt-2.5 border-t border-zinc-900">
                <span className="text-[13px] font-bold text-zinc-400">Game of Life Simulator:</span>
                <p className="text-[12px] text-zinc-500 leading-normal">
                  Simulate Conway's Game of Life on grid.
                </p>
                <button
                  onClick={runGameOfLifeStep}
                  className="w-full py-1.5 border border-zinc-800 rounded hover:bg-zinc-900 text-[12px] font-mono text-zinc-300 hover:text-white flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Simulate Step
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN 4: ACTION PANEL */}
          <div className="border border-zinc-900 bg-zinc-955 rounded-lg shadow-sm flex flex-col overflow-hidden min-h-[396px]">
            
            {/* MINI TABS */}
            <div className="flex border-b border-zinc-900 bg-zinc-900/30 text-[12px] font-mono uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("github")}
                className={`flex-1 py-2.5 font-bold transition-all relative border-r border-zinc-900 ${
                  activeTab === "github" ? "text-emerald-400 bg-zinc-950" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                GitHub Push
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("local")}
                className={`flex-1 py-2.5 font-bold transition-all border-r border-zinc-900 ${
                  activeTab === "local" ? "text-white bg-zinc-955" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Local Apply
              </button>
              <button
                onClick={() => setActiveTab("scripts")}
                className={`flex-1 py-2.5 font-bold transition-all border-r border-zinc-900 ${
                  activeTab === "scripts" ? "text-white bg-zinc-955" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Scripts
              </button>
              <button
                onClick={() => setActiveTab("io")}
                className={`flex-1 py-2.5 font-bold transition-all ${
                  activeTab === "io" ? "text-white bg-zinc-955" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                JSON
              </button>
            </div>

            {/* TAB CONTENT (COMPACTED) */}
            <div className="p-5 flex-1 flex flex-col justify-start">
              
              {/* TAB: GITHUB DIRECT PUSH */}
              {activeTab === "github" && (
                <div className="flex flex-col gap-3.5 flex-1">
                  <div className="flex flex-col">
                    <h3 className="text-[12px] font-semibold text-zinc-200 font-mono uppercase tracking-wide">GitHub Push</h3>
                    <p className="text-[10px] text-zinc-500">
                      Creates a repo on your profile and pushes the backdated commits to it.
                    </p>
                  </div>

                  {!ghUser ? (
                    <div className="flex flex-col gap-3.5 flex-1 justify-center">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="gh-token-input" className="text-[12px] font-bold text-zinc-400">
                          Personal Access Token (PAT):
                        </label>
                        <input
                          id="gh-token-input"
                          type="password"
                          value={ghToken}
                          onChange={(e) => setGhToken(e.target.value)}
                          placeholder="ghp_xxxx"
                          className="px-3 py-2 border border-zinc-800 bg-zinc-900 rounded text-sm font-mono focus:outline-none focus:border-zinc-700 text-white"
                        />
                        <p className="text-[11px] text-zinc-500 leading-normal mt-0.5">
                          Create a token with the <strong className="text-zinc-400">repo</strong> scope. Use <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">github.com/settings/tokens</a>.
                        </p>
                      </div>

                      <button
                        onClick={handleGHAuthenticate}
                        disabled={isGHAuthenticating || !ghToken.trim()}
                        className="w-full py-2 bg-white text-black font-semibold text-sm rounded hover:opacity-90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {isGHAuthenticating ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Connect GitHub
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5 flex-1">
                      {/* USER PROFILE INFO */}
                      <div className="flex items-center justify-between border border-zinc-900 p-2.5 rounded bg-zinc-900/40">
                        <div className="flex items-center gap-2.5">
                          {ghUser.avatarUrl ? (
                            <img src={ghUser.avatarUrl} alt={ghUser.name} className="w-7 h-7 rounded-full border border-zinc-850" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[12px] font-bold text-white">
                              {ghUser.username.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-[12px] font-semibold text-zinc-200 leading-none">{ghUser.name}</span>
                            <span className="text-[11px] font-mono text-zinc-500 mt-0.5">@{ghUser.username}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleGHDisconnect}
                          className="text-[11px] font-mono text-rose-455 hover:underline"
                        >
                          Disconnect
                        </button>
                      </div>

                      {/* REPO CONFIG */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="gh-repo-input" className="text-[12px] font-bold text-zinc-400">Repository Name:</label>
                        <input
                          id="gh-repo-input"
                          type="text"
                          value={ghRepoName}
                          onChange={(e) => setGhRepoName(e.target.value.replace(/[^a-zA-Z0-9_\-\.]/g, "-"))}
                          placeholder="hackgit-contributions"
                          className="px-3 py-1.5 border border-zinc-800 bg-zinc-900 rounded text-sm font-mono focus:outline-none focus:border-zinc-700 text-white"
                        />
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          github.com/{ghUser.username}/{ghRepoName || "repo"}
                        </p>
                      </div>

                      {/* PUSH BUTTON */}
                      <button
                        onClick={handleGHPush}
                        disabled={isGHPushing || activeCells.length === 0}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isGHPushing ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Pushing...
                          </>
                        ) : (
                          <>
                            <GitCommit className="h-4 w-4" />
                            Push {totalCommits} Commits
                          </>
                        )}
                      </button>

                      {/* PUSH RESULT MESSAGE */}
                      {ghPushResult && (
                        <div className={`p-2.5 rounded border text-[12px] leading-relaxed ${
                          ghPushResult.success 
                            ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400"
                            : "bg-rose-950/20 border-rose-900/50 text-rose-400"
                        }`}>
                          {ghPushResult.success ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-bold flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                Done! Pushed to GitHub.
                              </span>
                              <span className="text-[9px] text-zinc-400">
                                ⚠️ Note: It takes 3-10 mins for GitHub to index commits.
                              </span>
                              <a
                                href={ghPushResult.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:no-underline font-mono text-[11px] text-white"
                              >
                                View Repo
                              </a>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-bold">Push Failed:</span>
                              <span className="font-mono text-[9px]">{ghPushResult.error}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: LOCAL DIRECT COMMIT */}
              {activeTab === "local" && (
                <div className="flex flex-col gap-3.5 flex-1">
                  <div className="flex flex-col">
                    <h3 className="text-[12px] font-semibold text-zinc-200 font-mono uppercase tracking-wide">Local Apply</h3>
                    <p className="text-[10px] text-zinc-500">
                      Writes commits directly into this local folder.
                    </p>
                  </div>

                  {/* LOCAL REPO STATUS */}
                  <div className="bg-zinc-900/40 border border-zinc-900 rounded p-2 flex items-center justify-between">
                    <div className="flex flex-col gap-1 font-mono text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Repo: <strong>hackgit</strong></span>
                      </div>
                      {gitStatus?.success ? (
                        <>
                          <div>Branch: <strong>{gitStatus.branch}</strong></div>
                          <div>Clean: <strong>{gitStatus.isClean ? "Yes" : "No"}</strong></div>
                        </>
                      ) : (
                        <div className="text-rose-500">{gitStatus?.error || "Checking git..."}</div>
                      )}
                    </div>
                    <button
                      onClick={fetchGitStatus}
                      className="px-2.5 py-1 text-[10px] border border-zinc-800 rounded hover:bg-zinc-900 font-mono text-zinc-400 hover:text-white"
                    >
                      Refresh
                    </button>
                  </div>

                  {/* RUN COMMIT BUTTON */}
                  <button
                    onClick={handleApplyCommits}
                    disabled={isCommitting || activeCells.length === 0}
                    className="w-full py-2 bg-white text-black font-semibold text-sm rounded transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCommitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Committing...
                      </>
                    ) : (
                      <>
                        <GitCommit className="h-4 w-4" />
                        Apply {totalCommits} Commits
                      </>
                    )}
                  </button>
                  
                  {commitMessage && (
                    <div className={`p-2 rounded border text-[10px] font-mono leading-relaxed max-h-20 overflow-y-auto ${
                      commitSuccess === true 
                        ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400"
                        : commitSuccess === false
                        ? "bg-rose-950/20 border-rose-900/50 text-rose-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}>
                      {commitMessage}
                    </div>
                  )}

                  <div className="text-[9px] text-zinc-500 leading-normal border-t border-zinc-900 pt-2 flex flex-col gap-1">
                    <span>• Writes backdated commits using <code>data.json</code>.</span>
                    <span>• Commits on a separate branch are recommended.</span>
                  </div>
                </div>
              )}

              {/* TAB: EXPORT SCRIPTS */}
              {activeTab === "scripts" && (
                <div className="flex flex-col gap-3.5 flex-1">
                  <div className="flex flex-col">
                    <h3 className="text-[12px] font-semibold text-zinc-200 font-mono uppercase tracking-wide">Export Scripts</h3>
                    <p className="text-[10px] text-zinc-505">
                      Copy scripts to run on another repository.
                    </p>
                  </div>

                  {activeCells.length === 0 ? (
                    <div className="border border-dashed border-zinc-900 rounded p-5 text-center text-[11px] text-zinc-500 flex-1 flex items-center justify-center">
                      Select cells on the calendar grid first.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 flex-1">
                      
                      {/* BASH SCRIPT CONTAINER */}
                      <div className="flex flex-col gap-1 border border-zinc-900 rounded p-2 bg-zinc-900/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-zinc-500">Bash (Mac/Linux)</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => copyToClipboard(getBashScriptText(), "bash")}
                              className="px-1.5 py-0.5 text-[10px] border border-zinc-800 hover:bg-zinc-900 rounded font-mono text-zinc-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedBash ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              Copy
                            </button>
                            <button
                              onClick={() => downloadScriptFile(getBashScriptText(), "hackgit-commits.sh")}
                              className="px-1.5 py-0.5 text-[10px] border border-zinc-800 hover:bg-zinc-900 rounded font-mono text-zinc-400 hover:text-white flex items-center gap-1"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Save
                            </button>
                          </div>
                        </div>
                        <pre className="p-1 bg-zinc-955 border border-zinc-900 rounded text-zinc-400 text-[10px] overflow-auto max-h-16 font-mono leading-relaxed font-semibold">
                          {getBashScriptText().substring(0, 80)}...
                        </pre>
                      </div>

                      {/* POWERSHELL SCRIPT CONTAINER */}
                      <div className="flex flex-col gap-1 border border-zinc-900 rounded p-2 bg-zinc-900/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-zinc-500">PowerShell (Win)</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => copyToClipboard(getPowerShellScriptText(), "powershell")}
                              className="px-1.5 py-0.5 text-[10px] border border-zinc-800 hover:bg-zinc-900 rounded font-mono text-zinc-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedPowerShell ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              Copy
                            </button>
                            <button
                              onClick={() => downloadScriptFile(getPowerShellScriptText(), "powershell")}
                              className="px-1.5 py-0.5 text-[10px] border border-zinc-850 hover:bg-zinc-900 rounded font-mono text-zinc-400 hover:text-white flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Save
                            </button>
                          </div>
                        </div>
                        <pre className="p-1 bg-zinc-955 border border-zinc-900 rounded text-zinc-400 text-[10px] overflow-auto max-h-16 font-mono leading-relaxed font-semibold">
                          {getPowerShellScriptText().substring(0, 80)}...
                        </pre>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* TAB: IMPORT/EXPORT JSON */}
              {activeTab === "io" && (
                <div className="flex flex-col gap-3.5 flex-1">
                  <div className="flex flex-col">
                    <h3 className="text-[12px] font-semibold text-zinc-200 font-mono uppercase tracking-wide">Import/Export JSON</h3>
                    <p className="text-[10px] text-zinc-505 font-mono">
                      Save/load contribution patterns as files.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2.5 flex-1 justify-center font-semibold">
                    {/* EXPORT */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={handleExportJSON}
                        disabled={activeCells.length === 0}
                        className="w-full py-1.5 border border-zinc-800 rounded hover:bg-zinc-900 transition-colors text-[11px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-200"
                      >
                        <Download className="h-4 w-4" />
                        Download JSON Pattern
                      </button>
                    </div>

                    {/* IMPORT */}
                    <div className="flex flex-col gap-1.5">
                      <label className="w-full py-1.5 border border-zinc-800 rounded hover:bg-zinc-900 transition-colors text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-center text-zinc-200 font-semibold">
                        <Upload className="h-4 w-4" />
                        <span>Upload JSON Pattern</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJSON}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
