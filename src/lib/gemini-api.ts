export interface GeminiConfig {
  apiKey: string
  model?: string
}

export class GeminiAPI {
  private config: GeminiConfig
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta/models'

  constructor(config: GeminiConfig) {
    this.config = config
  }

  // Public method to check if API is configured
  isConfigured(): boolean {
    return this.config.apiKey !== ''
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const model = this.config.model || 'gemini-pro'
      const url = `${this.baseURL}/${model}:generateContent?key=${this.config.apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API')
      }

      const generatedText = data.candidates[0].content.parts[0].text
      return generatedText

    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }
}

// Create a singleton instance
let geminiAPI: GeminiAPI | null = null

export function getGeminiAPI(): GeminiAPI | null {
  return geminiAPI
}

export function initializeGeminiAPI(apiKey: string): GeminiAPI {
  geminiAPI = new GeminiAPI({ apiKey })
  return geminiAPI
}

export function isGeminiConfigured(): boolean {
  return geminiAPI !== null && geminiAPI.isConfigured()
} 