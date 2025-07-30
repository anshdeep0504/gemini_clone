import { GoogleGenerativeAI } from '@google/generative-ai'

// Configuration for throttling and delays
const THROTTLE_CONFIG = {
  // Base delay for "thinking" simulation
  THINKING_DELAY: 800,
  // Minimum delay between API calls
  MIN_API_DELAY: 1000,
  // Maximum delay for quota retries
  MAX_QUOTA_DELAY: 30000,
  // Progressive response chunk size
  CHUNK_SIZE: 50,
  // Progressive response delay between chunks
  CHUNK_DELAY: 100
}

// Generate a fallback response when API is completely unavailable
function generateFallbackResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
    return "Hello! I'm here to help you. How can I assist you today?"
  }
  
  if (lowerPrompt.includes('help')) {
    return "I'm here to help! What would you like to know about?"
  }
  
  if (lowerPrompt.includes('weather')) {
    return "I can't check real-time weather, but you can use weather apps or websites for current conditions."
  }
  
  if (lowerPrompt.includes('time')) {
    return `The current time is ${new Date().toLocaleTimeString()}.`
  }
  
  if (lowerPrompt.includes('date')) {
    return `Today is ${new Date().toLocaleDateString()}.`
  }
  
  if (lowerPrompt.includes('math') || lowerPrompt.includes('calculate')) {
    return "I can help with basic math! Try asking me to calculate something specific."
  }
  
  if (lowerPrompt.includes('code') || lowerPrompt.includes('programming')) {
    return "I can help with programming questions! What language or framework are you working with?"
  }
  
  if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is')) {
    return "I'd be happy to explain that! Could you provide more specific details about what you'd like me to explain?"
  }
  
  // Generic helpful response
  return "That's an interesting question! I'd be happy to help you with that. Could you provide more details so I can give you a better answer?"
}

// Enhanced throttling function with progressive response simulation
export async function generateResponseWithThrottling(
  prompt: string, 
  options: {
    enableProgressiveResponse?: boolean
    customThinkingDelay?: number
    maxRetries?: number
  } = {}
): Promise<string> {
  const {
    enableProgressiveResponse = false,
    customThinkingDelay = THROTTLE_CONFIG.THINKING_DELAY,
    maxRetries = 5
  } = options

  // Simulate AI "thinking" time
  console.log(`🧠 Simulating AI thinking for ${customThinkingDelay}ms...`)
  await new Promise(resolve => setTimeout(resolve, customThinkingDelay))

  // Get the actual response
  const response = await generateResponseWithRetry(prompt, maxRetries)

  // If progressive response is enabled and response is long enough
  if (enableProgressiveResponse && response.length > THROTTLE_CONFIG.CHUNK_SIZE) {
    return simulateProgressiveResponse(response)
  }

  return response
}

// Simulate progressive response by chunking the text
function simulateProgressiveResponse(fullResponse: string): string {
  const chunks = []
  for (let i = 0; i < fullResponse.length; i += THROTTLE_CONFIG.CHUNK_SIZE) {
    chunks.push(fullResponse.slice(i, i + THROTTLE_CONFIG.CHUNK_SIZE))
  }
  
  // For now, return the full response but log the chunking
  console.log(`📝 Progressive response: ${chunks.length} chunks of ~${THROTTLE_CONFIG.CHUNK_SIZE} characters each`)
  return fullResponse
}

// Enhanced delay calculation based on response complexity
function calculateThinkingDelay(prompt: string): number {
  const wordCount = prompt.split(' ').length
  const hasComplexKeywords = /(explain|analyze|compare|describe|how|why)/i.test(prompt)
  const hasCodeKeywords = /(code|program|function|class|algorithm)/i.test(prompt)
  
  let baseDelay = THROTTLE_CONFIG.THINKING_DELAY
  
  // Adjust delay based on prompt complexity
  if (wordCount > 50) baseDelay += 500
  if (hasComplexKeywords) baseDelay += 300
  if (hasCodeKeywords) baseDelay += 400
  
  return Math.min(baseDelay, 3000) // Cap at 3 seconds
}

export async function generateResponse(
  prompt: string,
  images?: string[],
  onChunk?: (chunk: string) => void,
  onComplete?: (fullResponse: string) => void
): Promise<string> {
  try {
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || localStorage.getItem('gemini_api_key')
    
    if (!apiKey) {
      console.log('⚠️ No API key found, using mock response')
      const mockResponse = `This is a mock response for: "${prompt}". To get real AI responses, please configure your Gemini API key in the settings.`
      
      // Simulate streaming
      if (onChunk) {
        const words = mockResponse.split(' ')
        for (const word of words) {
          onChunk(word + ' ')
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
      
      if (onComplete) {
        onComplete(mockResponse)
      }
      
      return mockResponse
    }

    // Use real Gemini API
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-flash' 
    })

    // Prepare content parts
    const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = []
    
    // Add text prompt
    contentParts.push({ text: prompt })
    
    // Add images if provided
    if (images && images.length > 0) {
      for (const imageUrl of images) {
        try {
          const response = await fetch(imageUrl)
          const arrayBuffer = await response.arrayBuffer()
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
          
          // Determine MIME type from URL or default to jpeg
          const mimeType = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] === '.png' ? 'image/png' : 'image/jpeg'
          
          contentParts.push({
            inlineData: {
              mimeType,
              data: base64
            }
          })
        } catch (error: unknown) {
          console.error('Failed to process image:', error)
        }
      }
    }

    // Generate content
    const result = await model.generateContent(contentParts)
    const response = await result.response
    const text = response.text()
    
    // Handle streaming if callback provided
    if (onChunk) {
      const words = text.split(' ')
      for (const word of words) {
        onChunk(word + ' ')
        await new Promise(resolve => setTimeout(resolve, 30))
      }
    }
    
    if (onComplete) {
      onComplete(text)
    }
    
    return text
    
  } catch (error: unknown) {
    console.error('Error generating response:', error)
    
    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key not valid')) {
      throw new Error('Invalid API key. Please check your Gemini API key.')
    }
    
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      throw new Error('API quota exceeded. Please try again later.')
    }
    
    if (errorMessage.includes('overloaded') || errorMessage.includes('503')) {
      throw new Error('API is currently overloaded. Please try again later.')
    }
    
    throw new Error(`Failed to generate response: ${errorMessage}`)
  }
}

// Enhanced retry mechanism that keeps trying for quota issues
export async function generateResponseWithRetry(prompt: string, maxRetries: number = 5): Promise<string> {
  let attempt = 1
  const maxQuotaRetries = 10 // More retries for quota issues
  
  while (attempt <= maxQuotaRetries) {
    try {
      return await generateResponse(prompt)
    } catch (error: any) {
      console.log(`Attempt ${attempt}/${maxQuotaRetries} failed:`, error.message)
      
      // If it's a quota exceeded error, keep retrying with increasing delays
      if (error.message === 'QUOTA_EXCEEDED_RETRY' || error.message?.includes('quota') || error.message?.includes('429')) {
        const waitTime = Math.min(2000 * attempt, THROTTLE_CONFIG.MAX_QUOTA_DELAY) // Wait 2s, 4s, 6s... up to 30s max
        console.log(`💰 Quota exceeded, waiting ${waitTime}ms before retry ${attempt}/${maxQuotaRetries}...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        attempt++
        continue
      }
      
      // If it's a 503 overload error, wait before retrying
      if (error.message?.includes('overloaded') || error.message?.includes('503')) {
        if (attempt <= maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff, max 5s
          console.log(`Waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          attempt++
          continue
        }
      }
      
      // For other errors, don't retry beyond maxRetries
      if (attempt <= maxRetries) {
        attempt++
        continue
      }
      
      // If we've exhausted all retries, use fallback
      console.log('All retry attempts failed, using fallback response')
      return generateFallbackResponse(prompt)
    }
  }
  
  // If we've exhausted all quota retries, use fallback
  console.log('All quota retry attempts failed, using fallback response')
  return generateFallbackResponse(prompt)
} 