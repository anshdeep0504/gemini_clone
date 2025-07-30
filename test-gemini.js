// Test script to verify Gemini API key
const testGeminiAPI = async () => {
  console.log('🧪 Testing Gemini API configuration...')
  
  try {
    // Test 1: Check if API key is set
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    console.log('📋 API Key Status:', apiKey ? '✅ Set' : '❌ Not set')
    
    if (!apiKey) {
      console.log('💡 To set API key:')
      console.log('   1. Create .env.local file')
      console.log('   2. Add: NEXT_PUBLIC_GEMINI_API_KEY=your_key_here')
      console.log('   3. Restart the development server')
      return
    }
    
    // Test 2: Try to make a simple API call
    const response = await fetch('/api/test-gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Hello, can you respond with "API is working!"?'
      })
    })
    
    const result = await response.json()
    console.log('🔍 API Test Result:', result)
    
    if (result.success) {
      console.log('✅ Gemini API is working correctly!')
    } else {
      console.log('❌ API test failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testGeminiAPI()
} 