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
    
    // Only log in development environment
    if (import.meta.env.DEV) console.log('Google API Key available:', !!googleApiKey);
    
    if (googleApiKey && googleApiKey !== 'your-google-places-api-key') {
      try {
        // Use our local Vite proxy to avoid CORS issues
        const apiUrl = `/api/places/autocomplete/json?input=${encodeURIComponent(
          query
        )}&types=(cities)&key=${googleApiKey}`;
        
        // Only log in development environment
        if (import.meta.env.DEV) console.log('Fetching from URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          console.error('Response not OK:', response.status, response.statusText);
          throw new Error(`Google Places API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        // Only log in development environment
        if (import.meta.env.DEV) console.log('Google API response:', data);
        
        if (data.status === 'OK') {
          const results = data.predictions.map((prediction: any) => ({
            description: prediction.description,
            placeId: prediction.place_id,
          }));
          // Only log in development environment
          if (import.meta.env.DEV) console.log('Parsed results:', results);
          return results;
        } else {
          console.warn('Google API returned non-OK status:', data.status, data.error_message);
          // Throw an error to fall back to Teleport API
          throw new Error(`Google API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
      } catch (googleError) {
        console.warn('Google Places API failed, falling back to Teleport:', googleError);
        // Continue to Teleport fallback
      }
    } else {
      console.warn('No valid Google Places API key found, using Teleport API');
    }
    
    // Fallback to Teleport API if Google Places API key is not available or request failed
    // Use our local Vite proxy to avoid CORS issues
    const teleportResponse = await fetch(
      `/api/teleport/api/cities/?search=${encodeURIComponent(query)}&limit=5`
    );
    
    if (!teleportResponse.ok) {
      throw new Error(`Teleport API request failed: ${teleportResponse.status}`);
    }
    
    const teleportData = await teleportResponse.json();
    
    return teleportData._embedded["city:search-results"].map((item: any) => ({
      description: item.matching_full_name,
      placeId: `teleport-${item.matching_full_name.replace(/\s+/g, '-').toLowerCase()}`, // Generate a unique ID
    }));
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    // If we get here, both Google and Teleport APIs failed
    // Let's provide some mock data for testing
    // Only log in development environment
    if (import.meta.env.DEV) console.log('Returning mock data for testing');
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

  // Handle Teleport IDs
  if (placeId.startsWith('teleport-')) {
    // Extract the city name from the ID
    const cityName = placeId.replace('teleport-', '').replace(/-/g, ' ');
    return {
      formatted_address: cityName,
      geometry: {
        location: {
          lat: 0, // We don't have coordinates from Teleport in this implementation
          lng: 0
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
