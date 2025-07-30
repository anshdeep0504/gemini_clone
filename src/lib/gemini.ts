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

export async function generateResponse(prompt: string): Promise<string> {
  // Only run on client side
  if (typeof window === 'undefined') {
    throw new Error('API calls must be made from the client side')
  }

  // Check API key - try environment variable first, then localStorage
  let API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (!API_KEY) {
    // Try to get from localStorage as fallback
    const localKey = localStorage.getItem('gemini_api_key')
    API_KEY = localKey || undefined
  }
  
  if (!API_KEY) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables or localStorage')
  }

  try {
    console.log('🔑 Using Gemini API key:', API_KEY ? '✅ Set' : '❌ Not set')
    
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Add minimum delay between API calls to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, THROTTLE_CONFIG.MIN_API_DELAY))
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error: any) {
    console.error('Error generating response:', error)
    
    // Handle specific API key errors
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      throw new Error('Invalid API key. Please check your Gemini API key in .env.local or Settings')
    }
    
    // Handle 503 overload error
    if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      throw new Error('Gemini API is currently overloaded. Please try again in a few minutes.')
    }
    
    // Handle rate limiting
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please wait a moment before trying again.')
    }
    
    // Handle other API errors
    if (error.message?.includes('400') || error.message?.includes('403')) {
      throw new Error('API access denied. Please check your API key and permissions.')
    }
    
    // Handle network errors
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.')
    }
    
    // For quota exceeded, don't throw error - let retry mechanism handle it
    if (error.message?.includes('quota') || error.message?.includes('billing')) {
      console.log('💰 API quota exceeded, will retry with delays...')
      throw new Error('QUOTA_EXCEEDED_RETRY')
    }
    
    // Generic error fallback
    throw new Error('Failed to generate response. Please try again.')
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