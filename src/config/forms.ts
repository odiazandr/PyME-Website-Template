import { features } from "./features.ts";

export const intakeClasses = [
  "basic_contact",
  "appointment_request",
  "restricted",
] as const;

export type IntakeClass = (typeof intakeClasses)[number];

type ManagedForm = {
  name: string;
  intakeClass: IntakeClass;
  fields: Readonly<Record<string, string>>;
  notificationRequired: boolean;
};

const permittedFields: Record<IntakeClass, readonly string[] | null> = {
  basic_contact: ["name", "email", "phone", "message"],
  appointment_request: [
    "name",
    "email",
    "phone",
    "message",
    "appointment_subject",
    "preferred_date",
    "preferred_time",
  ],
  // Restricted data needs a reviewed backend or CRM architecture. It is never
  // a valid static-provider form, so its declaration fails during startup.
  restricted: null,
};

const assertManagedForm = (form: ManagedForm): void => {
  const permitted = permittedFields[form.intakeClass];
  if (permitted === null)
    throw new Error(
      `${form.name} is restricted and cannot use the static form provider`,
    );

  const fields = Object.values(form.fields);
  if (fields.length === 0 || new Set(fields).size !== fields.length)
    throw new Error(`${form.name} must declare unique provider field names`);
  for (const field of fields) {
    if (!permitted.includes(field))
      throw new Error(
        `${field} is not permitted for ${form.intakeClass} intake on ${form.name}`,
      );
  }
};

export const contactForm = {
  name: "contacto",
  intakeClass: "basic_contact",
  fields: {
    name: "name",
    email: "email",
    message: "message",
  },
  notificationRequired: true,
} as const satisfies ManagedForm;

export const managedForms = [contactForm] as const;
export const activeForms = features.contactForm ? managedForms : [];

for (const form of managedForms) assertManagedForm(form);
