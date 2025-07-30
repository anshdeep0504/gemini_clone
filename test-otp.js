// Simple test script to verify OTP storage
const testOTPStorage = async () => {
  console.log('🧪 Testing OTP storage...')
  
  const testData = {
    phone: '1234567890',
    countryCode: '+1',
    otp: '123456'
  }
  
  try {
    // Test storing OTP
    const storeResponse = await fetch('http://localhost:3000/api/test', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    const storeResult = await storeResponse.json()
    console.log('📊 Store test result:', storeResult)
    
    // Test sending OTP
    const sendResponse = await fetch('http://localhost:3000/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: '8527400723',
        countryCode: '+1'
      })
    })
    
    const sendResult = await sendResponse.json()
    console.log('📱 Send OTP result:', sendResult)
    
    // Wait a moment then test verification
    setTimeout(async () => {
      const verifyResponse = await fetch('http://localhost:3000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: '8527400723',
          countryCode: '+1',
          otp: sendResult.otp
        })
      })
      
      const verifyResult = await verifyResponse.json()
      console.log('🔍 Verify OTP result:', verifyResult)
    }, 3000)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testOTPStorage()
} 