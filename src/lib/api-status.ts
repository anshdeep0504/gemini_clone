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
      // Mock API status check for now
      const mockStatus: APIStatus = {
        isAvailable: true,
        isOverloaded: false,
        isQuotaExceeded: false,
        lastChecked: new Date().toISOString()
      }
      
      return mockStatus
    } catch (error: unknown) {
      console.error('API status check failed:', error)
      return {
        isAvailable: false,
        isOverloaded: false,
        isQuotaExceeded: false,
        lastChecked: new Date().toISOString()
      }
    }
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