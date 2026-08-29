import { existsSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

export type FileUpdate = { path: string; contents: string };

export type FileTransactionOperations = {
  exists: (path: string) => boolean;
  write: (path: string, contents: string) => void;
  rename: (from: string, to: string) => void;
  remove: (path: string) => void;
};

const nodeOperations: FileTransactionOperations = {
  exists: existsSync,
  write: (path, contents) => writeFileSync(path, contents, "utf8"),
  rename: renameSync,
  remove: (path) => rmSync(path, { force: true }),
};

// A multi-file rename cannot be one filesystem-atomic operation. This protocol
// first stages every new file, then moves originals aside, then commits staged
// files. Any failure before completion restores every original that was moved.
// It deliberately leaves no partially initialized canonical owner after a
// normal filesystem error.
export const commitFileTransaction = (
  updates: FileUpdate[],
  operations: FileTransactionOperations = nodeOperations,
  transactionId = randomUUID(),
): void => {
  const entries = updates.map((update) => ({
    ...update,
    temporary: `${update.path}.pyme-init-${transactionId}.tmp`,
    backup: `${update.path}.pyme-init-${transactionId}.bak`,
  }));

  try {
    for (const entry of entries)
      operations.write(entry.temporary, entry.contents);
    for (const entry of entries) operations.rename(entry.path, entry.backup);
    for (const entry of entries) operations.rename(entry.temporary, entry.path);
  } catch (error) {
    // Restore in reverse order so a failure in a later target cannot leave an
    // earlier target committed while its original still exists as a backup.
    for (const entry of [...entries].reverse()) {
      try {
        if (operations.exists(entry.backup)) {
          if (operations.exists(entry.path)) operations.remove(entry.path);
          operations.rename(entry.backup, entry.path);
        }
      } catch {
        // Preserve the original write/rename failure. A remaining backup is a
        // recoverable artifact rather than a reason to destroy more data.
      }
      try {
        if (operations.exists(entry.temporary))
          operations.remove(entry.temporary);
      } catch {
        // As above, leave a recoverable staged file rather than hiding the
        // primary failure with cleanup noise.
      }
    }
    throw error;
  }

  for (const entry of entries) operations.remove(entry.backup);
};
