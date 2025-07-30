export interface APIStatus {
  isAvailable: boolean
  isOverloaded: boolean
  isQuotaExceeded: boolean
  lastChecked: Date
  errorMessage?: string
}

class APIStatusChecker {
  private status: APIStatus = {
    isAvailable: true,
    isOverloaded: false,
    isQuotaExceeded: false,
    lastChecked: new Date()
  }

  private checkTimeout: NodeJS.Timeout | null = null

  async checkAPIStatus(): Promise<APIStatus> {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        return this.status
      }

      // Check API key - try environment variable first, then localStorage
      let API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!API_KEY) {
        const localKey = localStorage.getItem('gemini_api_key')
        API_KEY = localKey || undefined
      }

      if (!API_KEY) {
        this.status = {
          isAvailable: false,
          isOverloaded: false,
          isQuotaExceeded: false,
          lastChecked: new Date(),
          errorMessage: 'API key not configured'
        }
        return this.status
      }

      // Try a simple test request
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      // Use a simple test prompt
      const result = await model.generateContent('Hello')
      await result.response.text()

      this.status = {
        isAvailable: true,
        isOverloaded: false,
        isQuotaExceeded: false,
        lastChecked: new Date()
      }
    } catch (error: any) {
      console.log('API status check failed:', error.message)
      
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        this.status = {
          isAvailable: false,
          isOverloaded: true,
          isQuotaExceeded: false,
          lastChecked: new Date(),
          errorMessage: 'API is currently overloaded'
        }
      } else if (error.message?.includes('quota') || error.message?.includes('billing') || error.message?.includes('429')) {
        // Quota exceeded - API is available but in demo mode
        this.status = {
          isAvailable: true,
          isOverloaded: false,
          isQuotaExceeded: true,
          lastChecked: new Date(),
          errorMessage: 'API quota exceeded - using demo mode'
        }
      } else if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
        this.status = {
          isAvailable: false,
          isOverloaded: false,
          isQuotaExceeded: false,
          lastChecked: new Date(),
          errorMessage: 'Invalid API key'
        }
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        this.status = {
          isAvailable: false,
          isOverloaded: false,
          isQuotaExceeded: false,
          lastChecked: new Date(),
          errorMessage: 'Network error'
        }
      } else {
        this.status = {
          isAvailable: false,
          isOverloaded: false,
          isQuotaExceeded: false,
          lastChecked: new Date(),
          errorMessage: 'API unavailable'
        }
      }
    }

    return this.status
  }

  getStatus(): APIStatus {
    return this.status
  }

  // Schedule periodic status checks
  startPeriodicCheck(intervalMs: number = 60000): void {
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout)
    }

    this.checkTimeout = setInterval(async () => {
      await this.checkAPIStatus()
    }, intervalMs)
  }

  stopPeriodicCheck(): void {
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout)
      this.checkTimeout = null
    }
  }
}

export const apiStatusChecker = new APIStatusChecker() 