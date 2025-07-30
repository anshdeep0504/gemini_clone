import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Mock response for testing
    const mockResponse = {
      text: () => `This is a test response for: "${prompt}"`,
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: `This is a test response for: "${prompt}"`
                }
              ]
            }
          }
        ]
      }
    }

    return NextResponse.json({ 
      success: true, 
      response: mockResponse.text(),
      model: 'gemini-1.5-flash'
    })

  } catch (error: unknown) {
    console.error('Test Gemini API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Gemini API test endpoint is available',
    instructions: 'Send a POST request with a "prompt" field to test the API'
  })
} 