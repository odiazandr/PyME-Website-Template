import { readFileSync } from "node:fs";
import {
  OperationsReadinessSchema,
  type OperationsReadiness,
} from "../../src/schemas/operations-readiness.ts";
import { ROOT } from "./validation.ts";

export const OPERATIONS_READINESS_PATH = `${ROOT}operations-readiness.json`;

export const loadOperationsReadiness = (): OperationsReadiness =>
  OperationsReadinessSchema.parse(
    JSON.parse(readFileSync(OPERATIONS_READINESS_PATH, "utf8")),
  );
