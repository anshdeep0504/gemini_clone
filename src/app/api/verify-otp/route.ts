import { NextRequest, NextResponse } from 'next/server'
import { getOTP, removeOTP, debugOTPStore, otpStore } from '@/lib/otp-store'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Verify OTP request received')
    
    // Check if request has body
    const contentType = request.headers.get('content-type')
    console.log('🔍 Content-Type:', contentType)
    
    if (!contentType || !contentType.includes('application/json')) {
      console.log('❌ Invalid content type:', contentType)
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    const body = await request.json()
    console.log('🔍 Request body:', body)
    
    const { phone, countryCode, otp } = body

    // Validate required fields
    if (!phone || !countryCode || !otp) {
      console.log('❌ Missing required fields:', { phone, countryCode, otp })
      return NextResponse.json(
        { error: 'Phone, countryCode, and otp are required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Verification attempt:`)
    console.log(`   Raw Phone: "${phone}"`)
    console.log(`   Raw Country Code: "${countryCode}"`)
    console.log(`   OTP: "${otp}"`)
    console.log(`   Phone length: ${phone.length}`)
    console.log(`   Country code length: ${countryCode.length}`)
    
    const storedData = getOTP(phone, countryCode)
    console.log(`   Stored Data:`, storedData)
    
    // Debug: show all stored OTPs
    debugOTPStore()

    if (!storedData) {
      console.log(`❌ No stored OTP found for ${countryCode}${phone}`)
      console.log(`   Available keys in store:`)
      Object.keys(otpStore).forEach(key => {
        console.log(`     "${key}"`)
      })
      return NextResponse.json(
        { error: 'OTP not found or expired' },
        { status: 400 }
      )
    }

    // Check if OTP is expired (10 minutes)
    const now = Date.now()
    const otpAge = now - storedData.timestamp
    const tenMinutes = 10 * 60 * 1000

    if (otpAge > tenMinutes) {
      removeOTP(phone, countryCode)
      console.log(`❌ OTP expired for ${countryCode}${phone}`)
      return NextResponse.json(
        { error: 'OTP expired' },
        { status: 400 }
      )
    }

    // Simulate verification delay
    const simulateVerification = () => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log(`🔍 Verifying OTP for ${countryCode}${phone}...`)
          resolve()
        }, 1000) // Simulate 1 second delay
      })
    }

    // Simulate the verification process
    await simulateVerification()

    // Verify OTP
    console.log(`   Stored OTP: "${storedData.otp}"`)
    console.log(`   Provided OTP: "${otp}"`)
    console.log(`   Match: ${storedData.otp === otp}`)
    console.log(`   Stored OTP length: ${storedData.otp.length}`)
    console.log(`   Provided OTP length: ${otp.length}`)

    if (storedData.otp !== otp) {
      console.log(`❌ Invalid OTP attempt for ${countryCode}${phone}`)
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Clear OTP after successful verification
    removeOTP(phone, countryCode)
    
    console.log(`✅ OTP verified successfully for ${countryCode}${phone}`)

    return NextResponse.json({ 
      success: true,
      message: 'OTP verified successfully',
      simulated: true
    })

  } catch (error) {
    console.error('❌ Error verifying OTP:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 