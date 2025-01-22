import {z} from "zod";
import { BasePersistedSchema, FieldValue, OmitForCreateSchema } from "./base";

export const ContactSchema = BasePersistedSchema.extend({
  state: z.enum(["active", "inactive"]),
  name: z.string().min(1),
  type: z.string().min(1),
  fields: z.record(FieldValue),
}).strict();
export type ContactType = z.infer<typeof ContactSchema>;

export const NewContactSchema = ContactSchema.omit(OmitForCreateSchema).strict();
export type NewContactType = z.infer<typeof NewContactSchema>;