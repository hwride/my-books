import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'
import { getAuth } from '@clerk/nextjs/server'

export type NextApiRequestAuthed = NextApiRequest & {
  userId: string
}

export function getAuthRouter<ResponseData = any>() {
  // Our middleware below will guarantee the userId exists, otherwise never pass on control to subsequent middleware.
  // We can therefore pass in NextApiRequestAuthed as our request type to createRouter.
  const router = createRouter<
    NextApiRequestAuthed,
    NextApiResponse<ResponseData>
  >()
  router.use(async (req, res, next) => {
    const auth = getAuth(req)
    if (auth.userId == null) {
      return res.status(400)
    }
    req.userId = auth.userId
    await next()
  })
  return router
}
