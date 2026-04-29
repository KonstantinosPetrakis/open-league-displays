const fs = require("fs");
const { execSync } = require("child_process");

const dirs = [
  "./dist",
  "./dist-electron",
  "./distribute",
  "./public/images/high-res",
  "./public/images/loading-screen",
  "./public/images/thumbnails",
];

dirs.forEach((dir) => {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

  if (dir.includes("public/images")) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/.gitkeep`, "");
  }
});

console.log("Running Prisma migrations...");
execSync("npx prisma migrate reset", { stdio: "inherit" });
execSync("npx prisma db push", { stdio: "inherit" });

console.log("Reset complete!");
