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
import { checkGitStatus, applyCommits, CommitDay } from "./actions";

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
  const [activeTab, setActiveTab] = useState<"local" | "scripts" | "io">("local");

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
  
  // UI preferences
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [copiedBash, setCopiedBash] = useState(false);
  const [copiedPowerShell, setCopiedPowerShell] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  // Date alignment
  const startSunday = moment().startOf("week").subtract(52, "weeks");
  const today = moment();

  // Load theme preference on mount
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
      const result = await applyCommits(activeCells);
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
    <div className="flex-1 bg-zinc-50 text-zinc-900 font-sans transition-colors duration-200 dark:bg-black dark:text-zinc-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg">
              <GitCommit className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-mono">hackgit</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Replica GitHub Contribution Editor & Commit Planner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              How it works
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* HOW IT WORKS GUIDELINES */}
        {showHowTo && (
          <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-5 text-sm flex gap-4 leading-relaxed transition-all">
            <Info className="h-5 w-5 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">How hackgit works:</h3>
              <ol className="list-decimal pl-4 flex flex-col gap-1.5 text-zinc-600 dark:text-zinc-400">
                <li>
                  <strong>Draw:</strong> Choose a level intensity (shades of green) or tool type. Click and drag on the contribution matrix below to design your graph.
                </li>
                <li>
                  <strong>Type:</strong> Use the Text Tool in the panel to instantly write monospaced letters or numbers onto the calendar.
                </li>
                <li>
                  <strong>Apply:</strong> 
                  <ul className="list-disc pl-5 mt-1 flex flex-col gap-0.5">
                    <li><em>Locally:</em> Run commits directly into this local git repository via Server Actions.</li>
                    <li><em>Scripting:</em> Copy or download the generated Bash or PowerShell scripts to run inside any other git repository on your computer.</li>
                  </ul>
                </li>
                <li>
                  <strong>Push:</strong> Once commits are generated, run <code>git push origin main</code> to upload the commit history to your remote GitHub profile!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* WORKSPACE & CONTROLS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT COLUMN: HEATMAP GRID & LEGEND */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* HEATMAP CONTAINER */}
            <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 rounded-lg shadow-sm">
              <div className="flex flex-col">
                
                {/* Scrollable calendar view to preserve exact dimensions */}
                <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="min-w-[670px] flex flex-col items-center py-2 select-none">
                    
                    {/* MONTH LABELS ROW */}
                    <div 
                      className="relative h-4 mb-1 select-none text-[9px] text-zinc-400 dark:text-zinc-500 font-mono"
                      style={{
                        width: "666px"
                      }}
                    >
                      {monthLabels.map((lbl, idx) => (
                        <span
                          key={idx}
                          style={{ left: `${32 + lbl.colIndex * 12}px` }}
                          className="absolute whitespace-nowrap"
                        >
                          {lbl.text}
                        </span>
                      ))}
                    </div>

                    {/* GRAPH MATRIX AND WEEKDAYS */}
                    <div 
                      className="flex items-center"
                      style={{
                        width: "666px"
                      }}
                    >
                      {/* WEEKDAY LABELS (30px width) */}
                      <div 
                        className="grid grid-rows-7 text-[9px] text-zinc-400 dark:text-zinc-500 font-mono pr-2 select-none"
                        style={{
                          height: "82px",
                          gridTemplateRows: "repeat(7, 10px)",
                          gap: "2px",
                          width: "30px"
                        }}
                      >
                        <span></span>
                        <span className="leading-[10px] h-[10px] flex items-center">Mon</span>
                        <span></span>
                        <span className="leading-[10px] h-[10px] flex items-center">Wed</span>
                        <span></span>
                        <span className="leading-[10px] h-[10px] flex items-center">Fri</span>
                        <span></span>
                      </div>

                      {/* 53 COLUMNS X 7 ROWS FLAT GRID */}
                      <div 
                        className="grid grid-flow-col gap-[2px] relative cursor-crosshair select-none"
                        onMouseLeave={() => setIsDrawing(false)}
                        style={{
                          gridTemplateColumns: "repeat(53, 10px)",
                          gridTemplateRows: "repeat(7, 10px)",
                          width: "634px",
                          height: "82px"
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

                          // GitHub Color mapping classes
                          let cellColorClass = "";
                          if (isDarkMode) {
                            cellColorClass = 
                              val === 1 ? "bg-[#0e4429]" :
                              val === 2 ? "bg-[#006d32]" :
                              val === 3 ? "bg-[#26a641]" :
                              val === 4 ? "bg-[#39d353]" : "bg-[#161b22]";
                          } else {
                            cellColorClass = 
                              val === 1 ? "bg-[#9be9a8]" :
                              val === 2 ? "bg-[#40c463]" :
                              val === 3 ? "bg-[#30a14e]" :
                              val === 4 ? "bg-[#216e39]" : "bg-[#ebedf0]";
                          }

                          return (
                            <div
                              key={index}
                              onMouseDown={() => handleMouseDown(x, y)}
                              onMouseEnter={() => handleMouseEnter(x, y)}
                              className={`
                                w-[10px] h-[10px] rounded-[2px] border border-transparent 
                                transition-all duration-75 relative group
                                ${cellColorClass}
                                ${future ? "opacity-25 cursor-not-allowed border-dashed border-zinc-350 dark:border-zinc-800" : "hover:scale-110 hover:border-zinc-950 dark:hover:border-white"}
                              `}
                            >
                              {/* Custom Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap font-mono">
                                {future ? (
                                  "Future Date"
                                ) : (
                                  <>
                                    {commitsCount} commit{commitsCount !== 1 ? "s" : ""} on {cellDate.format("MMM DD, YYYY")}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* GRAPH FOOTER & LEGEND */}
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 mt-5 pt-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex gap-4">
                    <span>Active blocks: <strong>{activeCells.length}</strong></span>
                    <span>Total commits: <strong>{totalCommits}</strong></span>
                  </div>
                  
                  {/* COLOR KEY */}
                  <div className="flex items-center gap-[2px] text-[9px] font-mono">
                    <span className="mr-1 text-zinc-400">Less</span>
                    <div className={`w-[10px] h-[10px] rounded-[2px] ${isDarkMode ? "bg-[#161b22]" : "bg-[#ebedf0]"}`}></div>
                    <div className={`w-[10px] h-[10px] rounded-[2px] ${isDarkMode ? "bg-[#0e4429]" : "bg-[#9be9a8]"}`}></div>
                    <div className={`w-[10px] h-[10px] rounded-[2px] ${isDarkMode ? "bg-[#006d32]" : "bg-[#40c463]"}`}></div>
                    <div className={`w-[10px] h-[10px] rounded-[2px] ${isDarkMode ? "bg-[#26a641]" : "bg-[#30a14e]"}`}></div>
                    <div className={`w-[10px] h-[10px] rounded-[2px] ${isDarkMode ? "bg-[#39d353]" : "bg-[#216e39]"}`}></div>
                    <span className="ml-1 text-zinc-400">More</span>
                  </div>
                </div>

              </div>
            </div>

            {/* TAB CONFIGURE & ACTION PANELS */}
            <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 rounded-lg overflow-hidden">
              
              {/* TAB SELECTOR */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/30">
                <button
                  onClick={() => setActiveTab("local")}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider font-mono uppercase border-b-2 transition-all ${
                    activeTab === "local"
                      ? "border-black dark:border-white text-black dark:text-white bg-white dark:bg-zinc-950"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Local Repository
                </button>
                <button
                  onClick={() => setActiveTab("scripts")}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider font-mono uppercase border-b-2 transition-all ${
                    activeTab === "scripts"
                      ? "border-black dark:border-white text-black dark:text-white bg-white dark:bg-zinc-950"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Get Scripts
                </button>
                <button
                  onClick={() => setActiveTab("io")}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider font-mono uppercase border-b-2 transition-all ${
                    activeTab === "io"
                      ? "border-black dark:border-white text-black dark:text-white bg-white dark:bg-zinc-950"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Download className="h-3.5 w-3.5" />
                  Import / Export
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="p-6">
                
                {/* TAB 1: LOCAL DIRECT COMMIT */}
                {activeTab === "local" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-base font-semibold">Apply directly to this repository</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        This action will write backdated git commits directly to this project folder.
                      </p>
                    </div>

                    {/* LOCAL REPO STATUS */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Repo: <strong className="text-zinc-900 dark:text-zinc-100">hackgit</strong></span>
                        </div>
                        {gitStatus?.success ? (
                          <>
                            <div>Branch: <strong className="text-zinc-900 dark:text-zinc-100">{gitStatus.branch}</strong></div>
                            <div>Clean: <strong className="text-zinc-900 dark:text-zinc-100">{gitStatus.isClean ? "Yes" : "No (modified files exist)"}</strong></div>
                          </>
                        ) : (
                          <div className="text-red-500">{gitStatus?.error || "Checking git status..."}</div>
                        )}
                      </div>
                      <button
                        onClick={fetchGitStatus}
                        className="px-3 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 font-mono"
                      >
                        Refresh status
                      </button>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 rounded-md p-4 text-xs flex gap-3">
                      <Info className="h-4.5 w-4.5 shrink-0" />
                      <div className="flex flex-col gap-1">
                        <strong className="font-semibold">Important Notes:</strong>
                        <ul className="list-disc pl-4 flex flex-col gap-0.5">
                          <li>It is recommended to run this on a separate branch if you do not want to mix commits into your main development branch.</li>
                          <li>This process creates backdated empty/checkpoint files in <code>data.json</code> and commits them.</li>
                          <li>After committing, you will need to push changes to your GitHub remote.</li>
                        </ul>
                      </div>
                    </div>

                    {/* RUN COMMIT BUTTON */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleApplyCommits}
                        disabled={isCommitting || activeCells.length === 0}
                        className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-sm rounded-md transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
                      
                      {activeCells.length === 0 && (
                        <span className="text-xs text-zinc-500">Draw something on the grid above to start.</span>
                      )}
                    </div>

                    {/* STATUS MESSAGE */}
                    {commitMessage && (
                      <div className={`p-4 rounded-md border text-xs font-mono leading-relaxed ${
                        commitSuccess === true 
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400"
                          : commitSuccess === false
                          ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-400"
                          : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}>
                        {commitMessage}
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 2: EXPORT SCRIPTS */}
                {activeTab === "scripts" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-base font-semibold">Generate contribution scripts</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Copy or download these scripts to execute the contribution commits inside any target Git repository on your machine.
                      </p>
                    </div>

                    {activeCells.length === 0 ? (
                      <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        Please select cells on the heatmap grid first to generate scripts.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        
                        {/* BASH SCRIPT */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider uppercase font-mono text-zinc-500">Bash (macOS / Linux)</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => copyToClipboard(getBashScriptText(), "bash")}
                                className="flex items-center gap-1 px-2.5 py-1 text-[10px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded font-mono"
                              >
                                {copiedBash ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                {copiedBash ? "Copied" : "Copy"}
                              </button>
                              <button
                                onClick={() => downloadScriptFile(getBashScriptText(), "hackgit-commits.sh")}
                                className="flex items-center gap-1 px-2.5 py-1 text-[10px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded font-mono"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </button>
                            </div>
                          </div>
                          <pre className="p-4 bg-zinc-950 border border-zinc-900 rounded text-zinc-300 text-xs overflow-auto max-h-48 font-mono leading-relaxed select-all">
                            {getBashScriptText()}
                          </pre>
                        </div>

                        {/* POWERSHELL SCRIPT */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider uppercase font-mono text-zinc-500">PowerShell (Windows)</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => copyToClipboard(getPowerShellScriptText(), "powershell")}
                                className="flex items-center gap-1 px-2.5 py-1 text-[10px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded font-mono"
                              >
                                {copiedPowerShell ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                {copiedPowerShell ? "Copied" : "Copy"}
                              </button>
                              <button
                                onClick={() => downloadScriptFile(getPowerShellScriptText(), "hackgit-commits.ps1")}
                                className="flex items-center gap-1 px-2.5 py-1 text-[10px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded font-mono"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </button>
                            </div>
                          </div>
                          <pre className="p-4 bg-zinc-950 border border-zinc-900 rounded text-zinc-300 text-xs overflow-auto max-h-48 font-mono leading-relaxed select-all">
                            {getPowerShellScriptText()}
                          </pre>
                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* TAB 3: IMPORT/EXPORT JSON */}
                {activeTab === "io" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-base font-semibold">Import & Export Grid Data</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Save your contribution patterns to a JSON file to reload or share them later.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* EXPORT */}
                      <div className="border border-zinc-200 dark:border-zinc-900 p-5 rounded-md flex flex-col gap-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Export State</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                          Download the current grid selection as a JSON template file.
                        </p>
                        <button
                          onClick={handleExportJSON}
                          disabled={activeCells.length === 0}
                          className="w-full py-2 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download JSON Pattern
                        </button>
                      </div>

                      {/* IMPORT */}
                      <div className="border border-zinc-200 dark:border-zinc-900 p-5 rounded-md flex flex-col gap-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Import State</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                          Load a previously saved JSON pattern file back onto the grid.
                        </p>
                        <label className="w-full py-2 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer text-center">
                          <Upload className="h-3.5 w-3.5" />
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

          {/* RIGHT COLUMN: PAINT & PRESET CONTROLS */}
          <div className="flex flex-col gap-6">
            
            {/* PANEL: BRUSH & SHADE SELECTORS */}
            <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 rounded-lg shadow-sm flex flex-col gap-5">
              
              <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <h2 className="text-sm font-semibold tracking-wider uppercase font-mono">Tools & Shades</h2>
              </div>

              {/* TOOL SELECTOR */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-400">Brush Mode:</span>
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-md">
                  <button
                    onClick={() => setTool("pencil")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded ${
                      tool === "pencil"
                        ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Edit className="h-3 w-3" />
                    Draw
                  </button>
                  <button
                    onClick={() => setTool("eraser")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded ${
                      tool === "eraser"
                        ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Eraser className="h-3 w-3" />
                    Erase
                  </button>
                  <button
                    onClick={() => setTool("cycle")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded ${
                      tool === "cycle"
                        ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Cycle
                  </button>
                </div>
              </div>

              {/* BRUSH INTENSITY SELECTOR */}
              {tool !== "eraser" && (
                <div className="flex flex-col gap-2 transition-all">
                  <span className="text-xs font-bold text-zinc-400">Brush Intensity (Commits):</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((lvl) => {
                      const commits = [0, 1, 3, 6, 10][lvl];
                      let colorClass = "";
                      if (isDarkMode) {
                        colorClass = 
                          lvl === 1 ? "bg-[#0e4429]" :
                          lvl === 2 ? "bg-[#006d32]" :
                          lvl === 3 ? "bg-[#26a641]" : "bg-[#39d353]";
                      } else {
                        colorClass = 
                          lvl === 1 ? "bg-[#9be9a8]" :
                          lvl === 2 ? "bg-[#40c463]" :
                          lvl === 3 ? "bg-[#30a14e]" : "bg-[#216e39]";
                      }

                      return (
                        <button
                          key={lvl}
                          onClick={() => setBrushLevel(lvl)}
                          className={`
                            aspect-square rounded-[3px] border-2 transition-all flex flex-col items-center justify-center relative group
                            ${colorClass}
                            ${brushLevel === lvl 
                              ? "border-black dark:border-white scale-110 shadow-sm" 
                              : "border-transparent hover:scale-105"}
                          `}
                        >
                          <span className="text-[10px] font-bold text-white drop-shadow-md">{commits}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* PANEL: TEXT MAKER TOOL */}
            <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 rounded-lg shadow-sm flex flex-col gap-5">
              
              <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-2">
                <Type className="h-4 w-4" />
                <h2 className="text-sm font-semibold tracking-wider uppercase font-mono">Text Drawer</h2>
              </div>

              <div className="flex flex-col gap-4">
                
                {/* TEXT INPUT */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="text-input" className="text-xs font-bold text-zinc-400">Word / Phrase:</label>
                  <input
                    id="text-input"
                    type="text"
                    maxLength={15}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value.replace(/[^A-Za-z0-9\s!\-+?]/g, ""))}
                    placeholder="Enter text (e.g. HACK)"
                    className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-sm font-mono focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                  />
                  <span className="text-[9px] text-zinc-400">Supported: A-Z, 0-9, space, ! - + ?</span>
                </div>

                {/* TEXT COL OFFSET */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-400">Start Column Offset:</span>
                    <span className="font-mono text-zinc-950 dark:text-zinc-50">{textOffset}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, 53 - getTextWidth(textInput))}
                    value={textOffset}
                    disabled={autoCenter}
                    onChange={(e) => setTextOffset(parseInt(e.target.value, 10))}
                    className="w-full accent-black dark:accent-white disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                  
                  {/* AUTO CENTER TOGGLE */}
                  <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer mt-1 font-mono">
                    <input
                      type="checkbox"
                      checked={autoCenter}
                      onChange={(e) => setAutoCenter(e.target.checked)}
                      className="accent-black dark:accent-white rounded"
                    />
                    Auto-Center text ({getTextWidth(textInput)} cols wide)
                  </label>
                </div>

                <button
                  onClick={renderText}
                  disabled={!textInput.trim()}
                  className="w-full py-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded hover:opacity-90 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Render Word onto Grid
                </button>

              </div>

            </div>

            {/* PANEL: PRESETS & EASTER EGGS */}
            <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 rounded-lg shadow-sm flex flex-col gap-4">
              
              <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <h2 className="text-sm font-semibold tracking-wider uppercase font-mono">Preset Shapes</h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={drawSpaceInvader}
                  className="py-1.5 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-mono font-medium transition-colors"
                >
                  👾 Invader
                </button>
                <button
                  onClick={drawSmiley}
                  className="py-1.5 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-mono font-medium transition-colors"
                >
                  🙂 Smiley
                </button>
              </div>

              <div className="border-b border-zinc-100 dark:border-zinc-900 pb-1.5 pt-2 flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Grid Utilities</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={fillGrid}
                  className="py-1.5 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-mono font-medium transition-colors"
                >
                  ⬛ Fill All
                </button>
                <button
                  onClick={invertGrid}
                  className="py-1.5 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-mono font-medium transition-colors"
                >
                  🌓 Invert
                </button>
                <button
                  onClick={randomGrid}
                  className="py-1.5 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-mono font-medium transition-colors"
                >
                  🎲 Random
                </button>
                <button
                  onClick={clearGrid}
                  className="py-1.5 border border-zinc-200 dark:border-zinc-850 bg-rose-50/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear Grid
                </button>
              </div>

              {/* GAME OF LIFE SIMULATOR */}
              <div className="border-b border-zinc-100 dark:border-zinc-900 pb-1.5 pt-2 flex items-center gap-2">
                <Play className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Life Simulator</span>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-zinc-400 leading-relaxed leading-normal">
                  Treat the contribution calendar as a Conway's Game of Life board! Click the step button to run a step of the simulation.
                </p>
                <button
                  onClick={runGameOfLifeStep}
                  className="w-full py-1.5 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Play className="h-3 w-3" />
                  Simulate Step
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
