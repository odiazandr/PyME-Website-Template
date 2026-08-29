import { z } from "zod";
import {
  E164PhoneSchema,
  IdentifierSchema,
  NonEmptyTextSchema,
  NullableHttpUrlSchema,
} from "./common.ts";
const DaySchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);
const TimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "must use 24-hour HH:MM format");
const HoursSchema = z
  .strictObject({
    day: DaySchema,
    closed: z.boolean(),
    opens: TimeSchema.nullable(),
    closes: TimeSchema.nullable(),
  })
  .superRefine((value, context) => {
    const hasTimes = value.opens !== null && value.closes !== null;
    if (value.closed === hasTimes)
      context.addIssue({
        code: "custom",
        message: "closed days have null times; open days require both times",
      });
    if (hasTimes && value.opens! >= value.closes!)
      context.addIssue({
        code: "custom",
        message: "same-day opening time must be before closing time",
      });
  });
export const LocationSchema = z.strictObject({
  id: IdentifierSchema,
  name: NonEmptyTextSchema,
  street: NonEmptyTextSchema,
  locality: NonEmptyTextSchema,
  region: NonEmptyTextSchema,
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "must be a five-digit Mexican postal code"),
  country: z.literal("MX"),
  phone: E164PhoneSchema.nullable(),
  mapUrl: NullableHttpUrlSchema,
  geo: z
    .strictObject({
      latitude: z.number().min(-90).max(90).nullable(),
      longitude: z.number().min(-180).max(180).nullable(),
    })
    .refine(
      ({ latitude, longitude }) => (latitude === null) === (longitude === null),
      "latitude and longitude must both be present or absent",
    ),
  hours: z
    .array(HoursSchema)
    .length(7)
    .refine(
      (items) => new Set(items.map(({ day }) => day)).size === 7,
      "hours must contain each weekday exactly once",
    ),
  approvedForPublication: z.boolean(),
});
export const LocationsSchema = z
  .array(LocationSchema)
  .min(1)
  .refine(
    (items) => new Set(items.map(({ id }) => id)).size === items.length,
    "location IDs must be unique",
  );
export type Location = z.infer<typeof LocationSchema>;
