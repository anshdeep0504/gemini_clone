import { NextRequest, NextResponse } from 'next/server'
import { storeOTP, getOTP, debugOTPStore } from '@/lib/otp-store'

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      success: true, 
      message: 'Test POST endpoint working',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid JSON in request body',
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }
}

// Test OTP storage and retrieval
export async function PUT(request: NextRequest) {
  try {
    const { phone, countryCode, otp } = await request.json()
    
    console.log('🧪 Testing OTP storage:')
    console.log(`   Phone: ${phone}`)
    console.log(`   Country Code: ${countryCode}`)
    console.log(`   OTP: ${otp}`)
    
    // Store OTP
    storeOTP(phone, countryCode, otp)
    console.log('✅ OTP stored')
    
    // Show store state
    debugOTPStore()
    
    // Retrieve OTP
    const retrieved = getOTP(phone, countryCode)
    console.log('🔍 Retrieved OTP:', retrieved)
    
    return NextResponse.json({
      success: true,
      stored: true,
      retrieved: retrieved,
      message: 'OTP storage test completed'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 