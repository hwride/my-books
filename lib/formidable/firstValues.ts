import formidable from 'formidable'

export type FieldsSingle = Record<string, string>

/**
 * Convert some formidable fields to have a single value rather than array of values.
 * By default formidable returns an array for all field values.
 */
export function convertFieldsToSingle(
  fields: formidable.Fields,
  ...fieldNames: string[]
): FieldsSingle {
  const singleFields: Record<string, string> = {}
  Object.entries(fields).map(([key, value]) => {
    if (fieldNames.includes(key)) {
      if (value == null) {
        throw new Error('Unexpected null value')
      }
      singleFields[key] = value[0]
    }
  })
  return singleFields
}
