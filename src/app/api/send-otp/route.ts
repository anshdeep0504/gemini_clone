import { NextRequest, NextResponse } from 'next/server'
import { storeOTP, debugOTPStore } from '@/lib/otp-store'

export async function POST(request: NextRequest) {
  try {
    console.log('📱 Send OTP request received')
    
    // Check if request has body
    const contentType = request.headers.get('content-type')
    console.log('📱 Content-Type:', contentType)
    
    if (!contentType || !contentType.includes('application/json')) {
      console.log('❌ Invalid content type:', contentType)
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    const body = await request.json()
    console.log('📱 Request body:', body)
    
    const { phone, countryCode } = body

    // Validate required fields
    if (!phone || !countryCode) {
      console.log('❌ Missing required fields:', { phone, countryCode })
      return NextResponse.json(
        { error: 'Phone and countryCode are required' },
        { status: 400 }
      )
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    console.log(`📱 Sending OTP:`)
    console.log(`   Raw Phone: "${phone}"`)
    console.log(`   Raw Country Code: "${countryCode}"`)
    console.log(`   Generated OTP: "${otp}"`)
    console.log(`   Phone length: ${phone.length}`)
    console.log(`   Country code length: ${countryCode.length}`)

    // Store OTP for verification
    console.log('💾 About to store OTP...')
    storeOTP(phone, countryCode, otp)
    console.log('💾 OTP stored successfully')
    
    // Debug: show current store state
    console.log('🔍 Store state after storing:')
    debugOTPStore()

    // Simulate OTP sending with setTimeout
    const simulateOTPSending = () => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log(`📱 Simulated SMS sent to ${countryCode}${phone}`)
          console.log(`🔐 OTP Code: ${otp}`)
          console.log(`⏰ Valid for 10 minutes`)
          resolve()
        }, 2000) // Simulate 2 second delay
      })
    }

    // Simulate the OTP sending process
    await simulateOTPSending()

    return NextResponse.json({ 
      success: true, 
      messageId: 'simulated',
      otp: otp, // Include OTP for demo purposes
      message: 'OTP sent successfully (simulated)',
      simulated: true
    })

  } catch (error) {
    console.error('❌ Error in send-otp:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 