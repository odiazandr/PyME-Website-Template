import { ZodError } from "zod";

// Installed with `node --import` so that it is evaluated before the entry
// module. `src/data/index.ts` parses every canonical domain at module scope, so
// a schema violation in src/data surfaces as an uncaught error during import,
// before any line of the script itself runs. Without this guard the operator
// running one of the diagnostic commands gets a Node stack trace naming a
// barrel module they did not edit; with it they get the same structured finding
// that validate:data reports, which is what the specification promises.
process.on("uncaughtException", (error: unknown) => {
  if (error instanceof ZodError) {
    console.error("DATA CONTRACT: FAILED");
    for (const issue of error.issues) {
      console.error(`- ${issue.path.join(".") || "root"}: ${issue.message}`);
    }
    console.error(
      "- canonical data failed its schema; run `npm run validate:data` for the full report",
    );
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});
