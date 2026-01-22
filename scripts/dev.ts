import { spawn } from "bun";

console.log("Starting API and Web servers...");
console.log("API: http://localhost:3001");
console.log("Web: http://localhost:5173");

const apiProcess = spawn({
  cmd: ["bun", "run", "--filter", "api", "dev"],
  stdout: "inherit",
  stderr: "inherit",
});

const webProcess = spawn({
  cmd: ["bun", "run", "--filter", "web", "dev"],
  stdout: "inherit",
  stderr: "inherit",
});

// Handle cleanup on exit
process.on("SIGINT", () => {
  apiProcess.kill();
  webProcess.kill();
  process.exit(0);
});

// Keep the script running
await Promise.all([apiProcess.exited, webProcess.exited]);

