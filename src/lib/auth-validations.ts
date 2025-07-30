import { z } from 'zod'

export const phoneSchema = z.object({
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits')
})

export const otpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only digits')
})

export type PhoneFormData = z.infer<typeof phoneSchema>
export type OTPFormData = z.infer<typeof otpSchema> 