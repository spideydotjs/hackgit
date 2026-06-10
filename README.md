# hackgit

An interactive, clean, and minimal monochrome design tool to draw custom patterns and text directly onto your GitHub contribution heatmap calendar.

---

## Setup and Running

### Prerequisites

Make sure you have Node.js and Git installed on your system.

### Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```

3. **Open in Browser:**
   Open your browser and navigate to http://localhost:3000 to start using the tool.

---

## Feature Guide and Usage Instructions

### 1. Interactive Heatmap Grid
The core canvas is a replica of the GitHub contribution calendar showing 53 weeks (7 rows per week, starting on Sunday).
* **Drawing:** Hover, click, or click-and-drag over cells to draw contributions.
* **Cell Tooltips:** Hovering over any cell displays the date and the number of commits scheduled for that day.
* **Clear Grid:** Click the Clear button at the top-right of the calendar header to reset all cells to zero commits.
* **Invert Grid:** Click the Invert button at the top-right of the calendar header to reverse all cells (e.g., empty cells become maximum intensity, painted cells become empty).
* **Year Selector:** Select a specific calendar year or default to "Last 12 Months" from the dropdown in the calendar header.

### 2. Brush Tools (Column 1)
Customize your drawing interaction:
* **Draw Mode:** Paints cells with the currently selected intensity.
* **Erase Mode:** Resets painted cells back to zero commits.
* **Cycle Mode:** Rotates through intensity levels on click (0, 1, 2, 3, 4, then back to 0).
* **Brush Shade (Intensity):** Select the commit weight for your brush:
  * Intensity 1: 1 commit per day
  * Intensity 2: 3 commits per day
  * Intensity 3: 6 commits per day
  * Intensity 4: 10 commits per day

### 3. Text Drawer (Column 2)
Automatically render words or phrases as contribution pixels on the calendar.
* **Enter Text:** Type a phrase in the input box (up to 15 characters). Supported characters include A-Z, 0-9, spaces, and special symbols `!`, `-`, `+`, `?`.
* **Start Column Offset:** Use the slider to choose the horizontal column index where your text should begin drawing.
* **Auto-Center:** Check the auto-center option to automatically position the rendered text in the middle of the calendar grid.
* **Render:** Click "Render onto Grid" to convert the text to contribution cells.

### 4. Preset Shapes (Column 3)
* **Built-in Presets:** Click "Invader" or "Smiley" to draw predefined pixel patterns onto the calendar.
* **Fill All:** Click "Fill All" to paint the entire calendar grid with the current brush intensity.
* **Random:** Click "Random" to generate random noise contributions across the calendar.
* **Conway's Game of Life Simulator:**
  1. Draw a custom pattern or select a preset on the grid.
  2. Click the "Simulate Step" button to compute and show the next generation of cells according to Conway's Game of Life rules.

### 5. Action Panel Options (Column 4)
This column offers multiple methods to apply the contribution pattern to your actual GitHub profile.

#### Tab A: GitHub Push (Recommended)
Pushes commits directly to a new remote repository on your GitHub account.
1. **Token Generation:** Generate a GitHub Personal Access Token (PAT) with `repo` scope by visiting https://github.com/settings/tokens.
2. **Connect Account:** Paste the PAT and click "Connect GitHub".
3. **Repository Sizing:** Enter your desired repository name (defaults to `hackgit-contributions`).
4. **Push:** Click "Push Commits". A public or private repository will be automatically created under your GitHub username, and empty backdated commits representing the pattern will be pushed.
5. **Note:** It can take between 3 to 10 minutes for GitHub's cache to index your new repository and render the contributions on your public profile calendar.

#### Tab B: Local Apply
Applies commits directly into the local repository folder of this project.
1. **Refresh Status:** Check the current branch status of the project directory.
2. **Apply:** Click "Apply Commits" to trigger Server Actions. The system will create backdated git commits modifying `data.json` locally.
3. **Recommendation:** Run this on a separate branch to keep your main development history clean.

#### Tab C: Export Scripts
Generate scripts to apply commits manually inside any other local Git repository.
* **Bash Script:** Copy or save the `.sh` file for macOS or Linux environments.
* **PowerShell Script:** Copy or save the `.ps1` file for Windows environments.
* **Execution:** Open a terminal inside the target repository and run the downloaded script to execute the backdated git commits.

#### Tab D: Import/Export JSON
Save or load contribution pattern templates:
* **Export JSON:** Download the current grid state as a JSON file.
* **Import JSON:** Upload a saved pattern JSON file to restore the grid layout.

---

## Technical Details

The application calculates calendar coordinates relative to the Sunday of the week 52 weeks ago. When commits are applied, `hackgit` writes empty modifications to a file and commits them while overriding `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` to backdate the contributions.
