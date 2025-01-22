import type { AllFields, FormFields } from "./types/fields.js";
import { z, ZodSchema } from "zod";

function identifyFields(fields: AllFields[]): FormFields[] {
  const flattenedFields: FormFields[] = [];
  fields.forEach((f) => {
    if (f.element === "fieldset" || f.element === "columns") {
      flattenedFields.push(...identifyFields(f.fields));
    } else {
      flattenedFields.push(f);
    }
  });
  return flattenedFields;
}

function generateFieldValidation(field: FormFields): ZodSchema {
  let typeConstraint: ZodSchema;
  if (field.element === "input" && field.fieldType === "number") {
    typeConstraint = z.number({ coerce: true });
    if (field.min) {
      typeConstraint = (typeConstraint as z.ZodNumber).min(field.min);
    }
    if (field.max) {
      typeConstraint = (typeConstraint as z.ZodNumber).max(field.max);
    }
  } else {
    typeConstraint = z.string();
    if (field.element === "input" && field.pattern) {
      typeConstraint = (typeConstraint as z.ZodString).regex(
        new RegExp(field.pattern)
      );
    }
    if (field.element === "input") {
      if (field.fieldType === "email") {
        typeConstraint = (typeConstraint as z.ZodString).regex(/.+@.+/);
      }

      if (field.min) {
        typeConstraint = (typeConstraint as z.ZodString).min(field.min);
      }
      if (field.max) {
        typeConstraint = (typeConstraint as z.ZodString).max(field.max);
      }
    }
  }

  if (!field.required) {
    return typeConstraint.optional();
  }
  return typeConstraint;
}

export function generateValidator(fields: AllFields[]): ZodSchema {
  const formFields = identifyFields(fields).map((f) => {
    return {
      name: f.name,
      fieldType: generateFieldValidation(f),
    };
  }) as { name: string; fieldType: ZodSchema }[];
  return z.object(
    Object.fromEntries(formFields.map((field) => [field.name, field.fieldType]))
  );
}
