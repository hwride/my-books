import { FormEvent, FormHTMLAttributes } from 'react'

/**
 * A progressively enhanced form. Allows the form to work without JS. If
 * JS is enabled will disable default behaviour and make a fetch request with
 * the form data as a JSON object.
 */
export function Form<ReturnData>({
  method,
  action,
  children,
  parseResponseJson = true,
  onSubmit,
  isUpdatePending,
  setIsUpdatePending,
  onSuccess,
  onError,
  ...rest
}: FormHTMLAttributes<HTMLFormElement> & {
  parseResponseJson?: boolean
  isUpdatePending: boolean
  setIsUpdatePending: (isUpdatePending: boolean) => void
  // Will wait for onSuccess or onError to finish before declaring update as no longer pending.
  onSuccess: (data: ReturnData) => void | Promise<any>
  onError: (data: any) => void | Promise<any>
}) {
  async function onSubmitInner(e: FormEvent<HTMLFormElement>) {
    // Block default form behaviour as we're going to do it in JS instead.
    e.preventDefault()

    setIsUpdatePending(true)

    // Read all data from the form and convert to a JS object.
    const form = e.currentTarget
    const data = new FormData(form)
    const formDataKeys = Array.from(data.keys())
    const body: Record<string, string> = {
      returnCreated: 'true',
    }
    for (const key of formDataKeys) {
      const val = data.get(key)
      if (typeof val === 'string') {
        body[key] = val
      }
    }

    // Make form request.
    const options = {
      method: form.method,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    }
    const r = await fetch(form.action, options)

    if (r.ok) {
      const data = parseResponseJson ? await r.json() : undefined
      await onSuccess(data)
    } else {
      await onError(data)
    }

    setIsUpdatePending(false)
  }

  return (
    <form method={method} action={action} onSubmit={onSubmitInner} {...rest}>
      {children}
    </form>
  )
}
