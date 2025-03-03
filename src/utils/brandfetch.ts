
/**
 * Utility function to fetch company logos from Brandfetch
 */

/**
 * Fetch a company logo from Brandfetch
 * @param companyName The name of the company to fetch the logo for
 * @returns A promise that resolves to the URL of the company logo or null if not found
 */
export const fetchCompanyLogo = async (companyName: string): Promise<string | null> => {
  try {
    // Clean up the company name (remove Inc., LLC, etc.)
    const cleanedName = companyName
      .replace(/\s+(Inc\.|LLC|Corp\.|Corporation|Ltd\.?|Limited)\.?$/i, '')
      .trim();
    
    // Construct the domain (this is a simple approximation)
    // In reality, the actual domain might differ from this pattern
    const domain = cleanedName.toLowerCase().replace(/\s+/g, '');
    
    // First try with .com
    const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(cleanedName)}`);
    
    if (!response.ok) {
      console.error('Error fetching company logo:', response.statusText);
      return null;
    }
    
    const suggestions = await response.json();
    
    if (suggestions && suggestions.length > 0) {
      // Return the logo URL from the first suggestion
      return suggestions[0].logo;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching company logo:', error);
    return null;
  }
};
