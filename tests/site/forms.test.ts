import assert from "node:assert/strict";
import { test } from "node:test";
import { activeForms, contactForm } from "../../src/config/forms.ts";

test("the default form uses provider-friendly machine names with localized labels", () => {
  assert.deepEqual(contactForm.fields, {
    name: "name",
    email: "email",
    message: "message",
  });
  assert.equal(contactForm.intakeClass, "basic_contact");
  assert.equal(contactForm.notificationRequired, true);
  assert.deepEqual(activeForms, [contactForm]);
});
