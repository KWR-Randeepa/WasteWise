/**
 * utils/runOptimizer.js
 * ======================
 * Spawns the Python CVRP optimizer (python/optimizer.py) as a child process,
 * passes data via stdin, and resolves with the parsed JSON result.
 *
 * Communication contract:
 *  - Node → Python : JSON string written to child's stdin
 *  - Python → Node : JSON string written to child's stdout (and only that)
 *  - Python stderr is forwarded to Node's console.error for debugging
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

// Resolve the absolute path to optimizer.py relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const OPTIMIZER_PATH = path.join(__dirname, "..", "python", "optimizer.py");

/**
 * Run the Python CVRP optimizer.
 *
 * @param {{
 *   distance_matrix:   number[][],
 *   waste_sizes:       number[],
 *   truck_capacities:  number[],
 *   depot?:            number
 * }} payload - The data to pass to the optimizer
 *
 * @returns {Promise<{
 *   routes:         number[][],
 *   total_distance: number,
 *   dropped_nodes:  number[]
 * }>}
 */
export const runOptimizer = (payload) => {
  return new Promise((resolve, reject) => {
    // ── Determine the Python executable ──────────────────────────────────────
    // On Windows the command is usually "python"; on Linux/macOS "python3".
    const pythonCmd = process.platform === "win32" ? "python" : "python3";

    console.log(
      `[runOptimizer] Spawning: ${pythonCmd} ${OPTIMIZER_PATH}`
    );

    const child = spawn(pythonCmd, [OPTIMIZER_PATH], {
      stdio: ["pipe", "pipe", "pipe"], // stdin, stdout, stderr all piped
    });

    let stdoutBuffer = "";
    let stderrBuffer = "";

    // ── Collect stdout (the JSON result) ─────────────────────────────────────
    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString();
    });

    // ── Collect stderr (diagnostic logs from Python) ──────────────────────────
    child.stderr.on("data", (chunk) => {
      stderrBuffer += chunk.toString();
    });

    // ── Handle process close ──────────────────────────────────────────────────
    child.on("close", (code) => {
      if (stderrBuffer) {
        console.error("[optimizer.py stderr]:", stderrBuffer.trim());
      }

      if (code !== 0) {
        return reject(
          new Error(
            `optimizer.py exited with code ${code}. stderr: ${stderrBuffer.trim()}`
          )
        );
      }

      // Parse the JSON printed to stdout
      const raw = stdoutBuffer.trim();
      if (!raw) {
        return reject(
          new Error("optimizer.py produced no output. Check for Python errors.")
        );
      }

      let result;
      try {
        result = JSON.parse(raw);
      } catch (parseErr) {
        return reject(
          new Error(
            `Failed to parse optimizer.py output as JSON: "${raw}". Error: ${parseErr.message}`
          )
        );
      }

      // If Python returned an error object, propagate it
      if (result.error) {
        return reject(new Error(`optimizer.py error: ${result.error}`));
      }

      console.log(
        `[runOptimizer] Done. Total distance: ${result.total_distance}m, ` +
        `Dropped nodes: ${result.dropped_nodes?.length ?? 0}`
      );

      resolve(result);
    });

    // ── Handle spawn errors (e.g. Python not found) ───────────────────────────
    child.on("error", (err) => {
      if (err.code === "ENOENT") {
        reject(
          new Error(
            `Python executable '${pythonCmd}' not found. ` +
            `Please install Python 3 and ensure it is in your PATH.`
          )
        );
      } else {
        reject(new Error(`Failed to spawn optimizer.py: ${err.message}`));
      }
    });

    // ── Send the payload to Python via stdin ──────────────────────────────────
    const jsonPayload = JSON.stringify(payload);
    child.stdin.write(jsonPayload, "utf8");
    child.stdin.end(); // Signal EOF so Python's sys.stdin.read() returns
  });
};
