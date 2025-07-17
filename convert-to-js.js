import fs from "fs";
import path from "path";

function convertTsToJs(content) {
  // Remove TypeScript-specific imports
  content = content.replace(/import.*from.*["']@shared\/api["'];?\s*\n?/g, "");

  // Remove type annotations from function parameters
  content = content.replace(/(\w+):\s*\w+(\[\])?/g, "$1");

  // Remove interface definitions
  content = content.replace(/interface\s+\w+\s*{[^}]*}/g, "");

  // Remove type definitions
  content = content.replace(/type\s+\w+\s*=\s*[^;]+;/g, "");

  // Remove React.FC and other type annotations
  content = content.replace(/:\s*React\.FC<[^>]*>/g, "");
  content = content.replace(/:\s*\w+(\[\])?(?=\s*[=,)])/g, "");

  // Remove export type statements
  content = content.replace(/export\s+type\s+[^;]+;/g, "");

  // Remove generic type parameters
  content = content.replace(/<[^>]+>/g, "");

  // Remove as Type assertions
  content = content.replace(/\s+as\s+\w+/g, "");

  // Remove ? optional chaining on object properties in destructuring
  content = content.replace(/(\w+)\?\s*:/g, "$1:");

  return content;
}

function convertFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const jsContent = convertTsToJs(content);

  // Determine output path
  const outputPath = filePath.replace(
    /\.tsx?$/,
    filePath.endsWith(".tsx") ? ".jsx" : ".js",
  );

  fs.writeFileSync(outputPath, jsContent);
  console.log(`Converted ${filePath} -> ${outputPath}`);

  // Remove original TypeScript file
  fs.unlinkSync(filePath);
}

function findTsFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== "node_modules" && item !== "dist") {
        traverse(fullPath);
      } else if (item.endsWith(".ts") || item.endsWith(".tsx")) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Find and convert all TypeScript files
const tsFiles = findTsFiles(".");
console.log(`Found ${tsFiles.length} TypeScript files to convert:`);

tsFiles.forEach(convertFile);

console.log("TypeScript to JavaScript conversion complete!");
