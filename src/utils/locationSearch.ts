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
    
    if (googleApiKey) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&types=(cities)&key=${googleApiKey}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        throw new Error('Google Places API request failed');
      }
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.predictions.map((prediction: any) => ({
          description: prediction.description,
          placeId: prediction.place_id,
        }));
      }
    }
    
    // Fallback to Teleport API if Google Places API key is not available or request failed
    const teleportResponse = await fetch(
      `https://api.teleport.org/api/cities/?search=${encodeURIComponent(query)}&limit=5`
    );
    
    if (!teleportResponse.ok) {
      throw new Error('Teleport API request failed');
    }
    
    const teleportData = await teleportResponse.json();
    
    return teleportData._embedded["city:search-results"].map((item: any) => ({
      description: item.matching_full_name,
      placeId: '', // Teleport doesn't provide place IDs
    }));
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
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

  try {
    const googleApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    
    if (!googleApiKey) {
      return null;
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=${googleApiKey}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error('Google Places Details API request failed');
    }
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}
