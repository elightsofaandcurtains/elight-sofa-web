// Pricing Utility Functions for Sofa Per-Foot Calculation

/**
 * Default foot price for Sofa category (₹ per sq ft)
 * This can be overridden by database configuration
 */
export const DEFAULT_SOFA_FOOT_PRICE = 2500;

/**
 * Parse size string to extract feet values
 * Handles formats like: "8ft", "8 ft", "8x6ft", "8 x 6 ft", "8ft x 6ft"
 * @param sizeString - The size input string
 * @returns Object with length, width (optional), totalFeet, and isValid flag
 */
export function parseFeet(sizeString: string): {
    length: number;
    width: number | null;
    totalFeet: number;
    isValid: boolean;
    error?: string;
} {
    if (!sizeString || typeof sizeString !== 'string') {
        return { length: 0, width: null, totalFeet: 0, isValid: false, error: 'Size is required' };
    }

    // Clean the string: remove extra spaces, convert to lowercase
    const cleaned = sizeString.toLowerCase().trim();

    if (!cleaned) {
        return { length: 0, width: null, totalFeet: 0, isValid: false, error: 'Size is required' };
    }

    // Pattern to match numbers (with optional decimals) followed by optional "ft" or "feet"
    // Handles: "8ft", "8 ft", "8.5ft", "8x6", "8 x 6", "8ft x 6ft", "8 x 6 ft"

    // First, try to match two dimensions (length x width)
    const twoValuePattern = /(\d+(?:\.\d+)?)\s*(?:ft|feet)?\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet)?/i;
    const twoValueMatch = cleaned.match(twoValuePattern);

    if (twoValueMatch) {
        const length = parseFloat(twoValueMatch[1]);
        const width = parseFloat(twoValueMatch[2]);

        if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
            return { length: 0, width: null, totalFeet: 0, isValid: false, error: 'Invalid dimensions' };
        }

        const totalFeet = length * width; // Area in sq ft
        return { length, width, totalFeet, isValid: true };
    }

    // Try to match single dimension (length only)
    const singleValuePattern = /(\d+(?:\.\d+)?)\s*(?:ft|feet)?/i;
    const singleValueMatch = cleaned.match(singleValuePattern);

    if (singleValueMatch) {
        const length = parseFloat(singleValueMatch[1]);

        if (isNaN(length) || length <= 0) {
            return { length: 0, width: null, totalFeet: 0, isValid: false, error: 'Invalid size value' };
        }

        return { length, width: null, totalFeet: length, isValid: true };
    }

    return { length: 0, width: null, totalFeet: 0, isValid: false, error: 'Could not parse size format' };
}

/**
 * Calculate sofa rate based on size and foot price
 * @param sizeString - The size input string (e.g., "8ft", "8 x 6 ft")
 * @param footPrice - Price per sq ft (or per ft for single dimension)
 * @returns Object with calculated rate and parsing details
 */
export function calculateSofaRate(
    sizeString: string,
    footPrice: number = DEFAULT_SOFA_FOOT_PRICE
): {
    rate: number;
    totalFeet: number;
    isValid: boolean;
    error?: string;
    displayText?: string;
} {
    const parsed = parseFeet(sizeString);

    if (!parsed.isValid) {
        return {
            rate: 0,
            totalFeet: 0,
            isValid: false,
            error: parsed.error
        };
    }

    const rate = parsed.totalFeet * footPrice;

    // Create display text for user feedback
    let displayText: string;
    if (parsed.width !== null) {
        displayText = `${parsed.length} × ${parsed.width} = ${parsed.totalFeet} sq ft × ₹${footPrice.toLocaleString()} = ₹${rate.toLocaleString()}`;
    } else {
        displayText = `${parsed.length} ft × ₹${footPrice.toLocaleString()} = ₹${rate.toLocaleString()}`;
    }

    return {
        rate,
        totalFeet: parsed.totalFeet,
        isValid: true,
        displayText
    };
}

/**
 * Check if a category should use per-foot pricing
 * @param category - The product category
 * @returns boolean indicating if per-foot pricing applies
 */
export function isSofaCategory(category: string): boolean {
    return category.toLowerCase() === 'sofa';
}

/**
 * Format feet display for UI
 * @param totalFeet - Total feet value
 * @param hasWidth - Whether it's an area calculation
 * @returns Formatted string
 */
export function formatFeetDisplay(totalFeet: number, hasWidth: boolean): string {
    if (hasWidth) {
        return `${totalFeet} sq ft`;
    }
    return `${totalFeet} ft`;
}
