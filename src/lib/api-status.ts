export interface APIStatus {
  isAvailable: boolean
  isOverloaded: boolean
  isQuotaExceeded: boolean
  lastChecked: Date
}

class APIStatusChecker {
  private status: APIStatus = {
    isAvailable: false,
    isOverloaded: false,
    isQuotaExceeded: false,
    lastChecked: new Date()
  }

  private checkInterval: NodeJS.Timeout | null = null

  async checkAPIStatus(): Promise<APIStatus> {
    try {
      // Mock API status check for now
      const mockStatus: APIStatus = {
        isAvailable: true,
        isOverloaded: false,
        isQuotaExceeded: false,
        lastChecked: new Date()
      }
      
      return mockStatus
    } catch (error: unknown) {
      console.error('API status check failed:', error)
      return {
        isAvailable: false,
        isOverloaded: false,
        isQuotaExceeded: false,
        lastChecked: new Date()
      }
    }
  }

  startPeriodicCheck(intervalMs: number = 30000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    
    this.checkInterval = setInterval(async () => {
      try {
        this.status = await this.checkAPIStatus()
      } catch (error: unknown) {
        console.error('Periodic API status check failed:', error)
      }
    }, intervalMs)
  }

  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  getCurrentStatus(): APIStatus {
    return this.status
  }
}

export const apiStatusChecker = new APIStatusChecker() 