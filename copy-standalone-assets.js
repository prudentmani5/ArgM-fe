const fs = require("fs");
const path = require("path");

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;

  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy .next/static → .next/standalone/.next/static
copyRecursiveSync(".next/static", ".next/standalone/.next/static");

// Copy public → .next/standalone/public
copyRecursiveSync("public", ".next/standalone/public");

console.log("✔ Static assets copied for standalone server.");
