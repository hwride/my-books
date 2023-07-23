import { ReplaceDateWithStrings } from '@/utils/typeUtils'
import { Book } from '@prisma/client'

export type BookSerializable = ReplaceDateWithStrings<Book>