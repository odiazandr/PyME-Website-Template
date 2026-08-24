import { ZodError } from "zod";
try {
  await import("../src/data/index.ts");
  await import("../src/config/site.ts");
  console.log("DATA VALIDATION: PASSED");
} catch (error) {
  console.error("DATA VALIDATION: FAILED");
  if (error instanceof ZodError) {
    for (const issue of error.issues)
      console.error(`- ${issue.path.join(".") || "root"}: ${issue.message}`);
  } else {
    console.error(
      `- ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  process.exitCode = 1;
}
