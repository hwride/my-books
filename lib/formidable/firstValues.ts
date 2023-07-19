const querystringType = 'urlencoded'
const multipartType = 'multipart'

/**
 * This was copied from the formidable code, couldn't seem to export it as per the docs.
 */
const firstValues = (form: any, fields: any, exceptions: any = []) => {
  if (form.type !== querystringType && form.type !== multipartType) {
    return fields
  }

  return Object.fromEntries(
    Object.entries(fields).map(([key, value]: any) => {
      if (exceptions.includes(key)) {
        return [key, value]
      }
      return [key, value[0]]
    })
  )
}

export { firstValues }
