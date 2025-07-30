export interface Country {
  name: string
  flag: string
  callingCodes: string[]
}

// Fallback countries in case the API is unavailable
export const fallbackCountries: Country[] = [
  { name: 'United States', flag: '🇺🇸', callingCodes: ['1'] },
  { name: 'India', flag: '🇮🇳', callingCodes: ['91'] },
  { name: 'United Kingdom', flag: '🇬🇧', callingCodes: ['44'] },
  { name: 'Canada', flag: '🇨🇦', callingCodes: ['1'] },
  { name: 'Australia', flag: '🇦🇺', callingCodes: ['61'] },
  { name: 'Germany', flag: '🇩🇪', callingCodes: ['49'] },
  { name: 'France', flag: '🇫🇷', callingCodes: ['33'] },
  { name: 'Japan', flag: '🇯🇵', callingCodes: ['81'] },
  { name: 'China', flag: '🇨🇳', callingCodes: ['86'] },
  { name: 'Brazil', flag: '🇧🇷', callingCodes: ['55'] },
  { name: 'Mexico', flag: '🇲🇽', callingCodes: ['52'] },
  { name: 'Spain', flag: '🇪🇸', callingCodes: ['34'] },
  { name: 'Italy', flag: '🇮🇹', callingCodes: ['39'] },
  { name: 'Netherlands', flag: '🇳🇱', callingCodes: ['31'] },
  { name: 'Sweden', flag: '🇸🇪', callingCodes: ['46'] },
  { name: 'Norway', flag: '🇳🇴', callingCodes: ['47'] },
  { name: 'Denmark', flag: '🇩🇰', callingCodes: ['45'] },
  { name: 'Finland', flag: '🇫🇮', callingCodes: ['358'] },
  { name: 'Poland', flag: '🇵🇱', callingCodes: ['48'] },
  { name: 'Czech Republic', flag: '🇨🇿', callingCodes: ['420'] }
]

export async function fetchCountries(): Promise<Country[]> {
  try {
    console.log('🌍 Fetching countries from restcountries.com...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flag,idd', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Gemini-Chat/1.0)'
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.log('❌ Countries API not available, using fallback')
      return fallbackCountries
    }
    
    const data = await response.json()
    console.log('📡 Countries API response received:', data.length, 'countries')
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.log('❌ Invalid countries data format, using fallback')
      return fallbackCountries
    }
    
    const formattedCountries: Country[] = data
      .filter((country: unknown) => {
        // Check if country has idd (International Direct Dialing) information
        const countryData = country as { idd?: { root?: string; suffixes?: string[] } }
        return countryData.idd && countryData.idd.root && countryData.idd.suffixes && countryData.idd.suffixes.length > 0
      })
      .map((country: unknown) => {
        // Extract calling codes from idd field
        // idd.root already contains the "+" (like "+3") and idd.suffixes are like ["73"]
        const countryData = country as { name: { common: string }; flag: string; idd: { root: string; suffixes: string[] } }
        const callingCodes = countryData.idd.suffixes.map((suffix: string) => 
          countryData.idd.root + suffix
        )
        
        return {
          name: countryData.name.common,
          flag: countryData.flag,
          callingCodes: callingCodes
        }
      })
      .filter((country: Country) => country.callingCodes.length > 0) // Only countries with valid calling codes
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name))
    
    console.log('✅ Successfully formatted countries:', formattedCountries.length)
    
    // Only return if we got valid data
    if (formattedCountries.length > 0) {
      console.log('🌍 Using countries from API')
      return formattedCountries
    }
    
    console.log('⚠️ No valid countries from API, using fallback')
    return fallbackCountries
  } catch (error) {
    console.log('❌ Countries API failed, using fallback:', error)
    return fallbackCountries
  }
} 