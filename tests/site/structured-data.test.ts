import assert from "node:assert/strict";
import { test } from "node:test";

import { serializeJsonLd } from "../../src/utils/structured-data.ts";

test("JSON-LD serialization cannot terminate its script element", () => {
  const serialized = serializeJsonLd({
    name: "</script><script>alert(1)</script>",
  });
  assert.doesNotMatch(serialized, /[<>&]/);
  assert.match(serialized, /\\u003c\/script\\u003e/);
});
