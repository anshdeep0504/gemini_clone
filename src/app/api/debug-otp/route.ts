import { NextRequest, NextResponse } from 'next/server'
import { otpStore, debugOTPStore, storeOTP, getOTP } from '@/lib/otp-store'

export async function GET() {
  try {
    const storeData: Array<{ key: string; otp: string; timestamp: string; age: number; phone: string; countryCode: string }> = []
    
    Object.entries(otpStore).forEach(([key, value]) => {
      const age = Date.now() - value.timestamp
      storeData.push({
        key,
        otp: value.otp,
        timestamp: new Date(value.timestamp).toLocaleString(),
        age: Math.floor(age / 1000), // age in seconds
        phone: value.phone,
        countryCode: value.countryCode
      })
    })

    return NextResponse.json({
      success: true,
      storeSize: Object.keys(otpStore).length,
      storeData,
      currentTime: new Date().toLocaleString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone, countryCode, otp } = await request.json()
    
    const key = `${countryCode}${phone}`
    const storedData = otpStore[key]
    
    // Log debug info
    console.log('🔍 Debug OTP Request:')
    console.log(`   Phone: ${phone}`)
    console.log(`   Country Code: ${countryCode}`)
    console.log(`   Key: ${key}`)
    console.log(`   Provided OTP: ${otp}`)
    console.log(`   Has Stored Data: ${!!storedData}`)
    if (storedData) {
      console.log(`   Stored OTP: ${storedData.otp}`)
      console.log(`   Match: ${storedData.otp === otp}`)
    }
    debugOTPStore()
    
    return NextResponse.json({
      success: true,
      key,
      hasStoredData: !!storedData,
      storedData: storedData ? {
        otp: storedData.otp,
        timestamp: new Date(storedData.timestamp).toLocaleString(),
        age: Math.floor((Date.now() - storedData.timestamp) / 1000),
        phone: storedData.phone,
        countryCode: storedData.countryCode
      } : null,
      providedOTP: otp,
      match: storedData ? storedData.otp === otp : false
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to debug OTP' },
      { status: 500 }
    )
  }
}

// Manual OTP storage test
export async function PUT(request: NextRequest) {
  try {
    const { phone, countryCode, otp } = await request.json()
    
    console.log('🧪 Manual OTP storage test:')
    console.log(`   Phone: ${phone}`)
    console.log(`   Country Code: ${countryCode}`)
    console.log(`   OTP: ${otp}`)
    
    // Store OTP
    storeOTP(phone, countryCode, otp)
    
    // Show store state
    debugOTPStore()
    
    // Retrieve OTP
    const retrieved = getOTP(phone, countryCode)
    
    return NextResponse.json({
      success: true,
      stored: true,
      retrieved: retrieved,
      message: 'Manual OTP storage test completed'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Manual test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 