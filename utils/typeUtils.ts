// Helper type to replace Date with string on a type.
// Useful because we need to convert the Date's on our Primsa types to strings
// so we can return them from our Next.js route handlers without error.
export type ReplaceDateWithStrings<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K]
}
