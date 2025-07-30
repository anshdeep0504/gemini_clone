import { z } from 'zod'

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message is too long'),
})

export type MessageFormData = z.infer<typeof messageSchema>

export const userSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  email: z.string().email('Invalid email address'),
})

export type UserFormData = z.infer<typeof userSchema> 