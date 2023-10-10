const fs = require("fs");

// Define the new dependency line
const newDependency = '"@bot_cast/shared": "file:../shared"';

// Specify the path to your package.json file
const packageJsonPath = "./package.json"; // Adjust the path as needed

// Read the package.json file
fs.readFile(packageJsonPath, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading ${packageJsonPath}: ${err}`);
    process.exit(1);
  }

  // Replace the old dependency with the new one using a regular expression
  const updatedData = data.replace(
    /"@bot_cast\/shared": "[^"]*"/,
    newDependency
  );

  // Write the updated package.json back to the file
  fs.writeFile(packageJsonPath, updatedData, "utf8", (writeErr) => {
    if (writeErr) {
      console.error(`Error writing ${packageJsonPath}: ${writeErr}`);
      process.exit(1);
    }

    console.log(
      `Updated ${packageJsonPath}: Replaced old dependency with ${newDependency}`
    );
  });
});
