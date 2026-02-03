/**
 * Text Transformation Utilities
 * Converts between abbreviated and full text based on user settings
 */

import { CROCHET_ABBREVIATIONS } from '../data/crochetAbbreviations';

/**
 * Get the current display mode from localStorage
 * @returns {boolean} - true if should show full text, false for abbreviations
 */
export const shouldShowFullText = () => {
    const setting = localStorage.getItem('crochet_show_full_text');
    return setting === 'true';
};

/**
 * Transform text to full words (abbreviations → full text)
 * @param {string} text - Text with abbreviations
 * @returns {string} - Text with full words
 */
export const transformToFullText = (text) => {
    if (!text) return text;
    
    let result = text;
    
    // Sort by length (longest first) to match multi-word abbreviations first
    const sortedAbbrs = [...CROCHET_ABBREVIATIONS].sort((a, b) => 
        b.abbr.length - a.abbr.length
    );
    
    sortedAbbrs.forEach(abbr => {
        // Create regex that matches the abbreviation as a whole word
        // Case-insensitive, preserves word boundaries
        const regex = new RegExp(`\\b${escapeRegex(abbr.abbr)}\\b`, 'gi');
        result = result.replace(regex, abbr.full);
    });
    
    return result;
};

/**
 * Transform text to abbreviations (full text → abbreviations)
 * @param {string} text - Text with full words
 * @returns {string} - Text with abbreviations
 */
export const transformToAbbreviations = (text) => {
    if (!text) return text;
    
    let result = text;
    
    // Sort by length (longest first) to match longer phrases first
    const sortedAbbrs = [...CROCHET_ABBREVIATIONS].sort((a, b) => 
        b.full.length - a.full.length
    );
    
    sortedAbbrs.forEach(abbr => {
        // Create regex that matches the full text as a whole phrase
        // Case-insensitive, preserves word boundaries
        const regex = new RegExp(`\\b${escapeRegex(abbr.full)}\\b`, 'gi');
        result = result.replace(regex, abbr.abbr);
    });
    
    return result;
};

/**
 * Display text based on current setting
 * @param {string} text - Original text (stored in database)
 * @returns {string} - Text transformed for display
 */
export const displayText = (text) => {
    if (shouldShowFullText()) {
        return transformToFullText(text);
    }
    return text;
};

/**
 * Escape special regex characters
 * @param {string} string
 * @returns {string}
 */
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default {
    shouldShowFullText,
    transformToFullText,
    transformToAbbreviations,
    displayText
};
