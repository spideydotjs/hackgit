# hackgit 👾

An interactive, clean, and minimal monochrome design tool to draw custom patterns and text directly onto your GitHub contribution heatmap calendar.

## Features

- **Interactive Heatmap Editor:** A 53-week × 7-day replica of the GitHub contribution calendar. Click and drag to draw or erase cells.
- **Draw Tools:** Switch between *Draw* (paint with intensity), *Erase* (reset cell to 0), and *Cycle* (rotate through 0–4 contribution levels).
- **Brush Intensity:** Choose from 4 contribution levels (1, 3, 6, or 10 commits per day) to design varying shades of green.
- **Text Drawer:** Enter any word or phrase and automatically render it onto the grid. Includes auto-centering and column offsets.
- **Preset Shapes:** Renders built-in pixel patterns, including a classic *Space Invader* or *Smiley Face*.
- **Conway's Game of Life:** Use the contribution calendar as an interactive Life simulator. Step through generations to observe cellular automata patterns.
- **Direct Local Commit (Server Actions):** Apply the planned contributions directly to your local Git repository in real-time.
- **Script Generation:** Generate and download fully-compatible, portable **Bash** (macOS/Linux) or **PowerShell** (Windows) scripts to execute the backdated commits on any other Git repository.
- **Import/Export:** Save your canvas layout as a JSON file and import it back to edit later.
- **Responsive & Dual Theme:** High-fidelity minimal monochrome UI supporting both Light and Dark mode options.

## Getting Started

### Prerequisites

Make sure you have Node.js and Git installed.

### Setup and Running

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```

3. **Open in Browser:**
   Go to [http://localhost:3000](http://localhost:3050) (or whichever port Next.js starts on) to start drawing!

## How It Works Under the Hood

The application calculates calendar coordinates relative to the Sunday of the week 52 weeks ago. When a commit is scheduled, `hackgit` writes a state update to a `data.json` file and commits it using backdated system timestamps (overriding the `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` environment variables).

Happy hacking! 🚀
