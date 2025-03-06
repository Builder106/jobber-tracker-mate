/**
 * Utility functions for location search using the Google Places API
 */

// Types for location suggestions
export interface LocationSuggestion {
  description: string;
  placeId: string;
}

/**
 * Fetch location suggestions from Google Places Autocomplete API
 * @param query The search query
 * @returns Array of location suggestions
 */
export async function fetchLocationSuggestions(query: string): Promise<LocationSuggestion[]> {


  if (!query || query.length < 2) {
    return [];
  }



  try {
    // First try to use the Google Places API if the key is available
    const googleApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    

    
    if (googleApiKey && googleApiKey !== 'your-google-places-api-key' && !googleApiKey.includes('%')) {
      try {
        // Use our local Vite proxy to avoid CORS issues
        // The proxy has been configured to add proper referer headers for API keys with referer restrictions
        // Adding a cache-busting parameter to avoid potential caching issues
        const timestamp = new Date().getTime();
        const apiUrl = `/api/places/autocomplete/json?input=${encodeURIComponent(
          query
        )}&types=(cities)&key=${googleApiKey}&timestamp=${timestamp}`;
        

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {

          throw new Error(`Google Places API request failed: ${response.status}`);
        }
        
        const data = await response.json();

        
        if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
          const results = data.predictions.map((prediction: any) => ({
            description: prediction.description,
            placeId: prediction.place_id,
          }));
          

          
          return results;
        } else {

          // No results found from Google API
          throw new Error(`Google API error: ${data.status} - ${data.error_message || 'No results found'}`);
        }
      } catch (googleError) {

        // Continue to mock data fallback
      }
    } else {

    }
  } catch (error) {
    // If we get here, Google Places API failed
    // Let's provide some mock data that includes the search query
    
    // Return mock data that includes the query to help with debugging
    if (query && query.length >= 2) {
      // Generate mock results that match the query
      const mockCities = [
        { city: 'Baltimore', state: 'MD', country: 'USA' },
        { city: 'Baton Rouge', state: 'LA', country: 'USA' },
        { city: 'Bangkok', state: '', country: 'Thailand' },
        { city: 'Barcelona', state: '', country: 'Spain' },
        { city: 'Bangalore', state: '', country: 'India' }
      ];
      
      // Filter cities that start with the query (case insensitive)
      const matchingCities = mockCities.filter(city => 
        city.city.toLowerCase().startsWith(query.toLowerCase())
      );
      
      if (matchingCities.length > 0) {

        return matchingCities.map((city, index) => ({
          description: `${city.city}${city.state ? ', ' + city.state : ''}, ${city.country}`,
          placeId: `mock-${index}`
        }));
      }
      
      // If no matches, return a generic mock result with the query
      return [
        { description: `${query} (mock result)`, placeId: 'mock-query' },
        { description: 'San Francisco, CA, USA', placeId: 'mock1' },
        { description: 'New York, NY, USA', placeId: 'mock2' },
      ];
    }
    return [
      { description: 'San Francisco, CA, USA', placeId: 'mock1' },
      { description: 'New York, NY, USA', placeId: 'mock2' },
      { description: 'Seattle, WA, USA', placeId: 'mock3' },
      { description: 'Austin, TX, USA', placeId: 'mock4' },
      { description: 'Boston, MA, USA', placeId: 'mock5' }
    ];
  }
}

/**
 * Get details for a specific place using its place ID
 * @param placeId The Google Place ID
 * @returns Place details or null if not found
 */
export async function getPlaceDetails(placeId: string): Promise<any | null> {
  if (!placeId) {
    return null;
  }

  // Handle mock data
  if (placeId.startsWith('mock')) {
    // Return a mock result for testing
    return {
      formatted_address: 'Mock Address',
      geometry: {
        location: {
          lat: 37.7749, // Default to San Francisco coordinates
          lng: -122.4194
        }
      }
    };
  }



  try {
    const googleApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    
    if (!googleApiKey || googleApiKey === 'your-google-places-api-key') {
      console.warn('No valid Google Places API key found for place details');
      return null;
    }
    
    // Use our local Vite proxy to avoid CORS issues
    const response = await fetch(
      `/api/places/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=${googleApiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Google Places Details API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    } else {
      console.warn('Google API returned non-OK status for place details:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}
