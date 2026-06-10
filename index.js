import moment from "moment";
import jsonfile from "jsonfile";
import simpleGit from "simple-git";

const path = "./data.json";
const git = simpleGit();

// original commit function
const markCommit = (x, y) => {
  const date = moment()
    .subtract(1, "y") // go back 1 year
    .add(x, "w")
    .add(y, "d")
    .set({ hour: 12 }) // ensure it's during the day
    .format();

  const data = { date };

  jsonfile.writeFile(path, data, () => {
    git
      .add([path])
      .commit(date, { "--date": date })
      .then(() => console.log(`✅ Commit on ${date}`))
      .catch(console.error);
  });
};

// generate commits
const generateGraph = async () => {
  for (let week = 0; week < 52; week++) {
    for (let day = 0; day < 7; day++) {
      const chance = Math.random();
      const commitsToday = chance > 0.8 ? 0 : Math.floor(Math.random() * 3); // 0–2 commits, ~20% empty

      for (let c = 0; c < commitsToday; c++) {
        await new Promise((res) => setTimeout(res, 100)); // tiny delay to avoid overlap
        markCommit(week, day);
      }
    }
  }
};

generateGraph();
