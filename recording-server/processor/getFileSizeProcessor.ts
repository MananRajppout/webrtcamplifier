import fs from "fs";
import path from "path";

/**
 * Function to get the file size in bytes from a local file path.
 * @param filePath - The local file path.
 * @returns The file size in bytes.
 * @throws Error if the file does not exist or cannot be accessed.
 */
export function getFileSize(filePath: string): number {
  try {
    // Resolve the absolute path
    const resolvedPath = path.resolve(filePath);

    // Get the file stats
    const stats = fs.statSync(resolvedPath);

    // Return the size in bytes
    return stats.size;
  } catch (error) {
    return 0;
  }
}
