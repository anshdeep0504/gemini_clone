import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Gemini API...')
    
    const { prompt } = await request.json()
    
    // Check API key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.log('❌ No API key found')
      return NextResponse.json({
        success: false,
        error: 'NEXT_PUBLIC_GEMINI_API_KEY is not set'
      }, { status: 400 })
    }
    
    console.log('✅ API key found, testing connection...')
    
    // Test Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const result = await model.generateContent(prompt || 'Hello, can you respond with "API is working!"?')
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Gemini API test successful')
    
    return NextResponse.json({
      success: true,
      response: text,
      model: 'gemini-1.5-flash',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Gemini API test failed:', error)
    
    // Handle specific errors
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key. Please check your Gemini API key.'
      }, { status: 401 })
    }
    
    if (error.message?.includes('400') || error.message?.includes('403')) {
      return NextResponse.json({
        success: false,
        error: 'API access denied. Please check your API key and permissions.'
      }, { status: 403 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test Gemini API',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Gemini API test endpoint is available',
    instructions: 'Send a POST request with a "prompt" field to test the API'
  })
} 