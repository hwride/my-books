import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'

type Data = {
  userId?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { userId } = getAuth(req)
  res.status(200).json({ userId: userId ?? undefined })
}
