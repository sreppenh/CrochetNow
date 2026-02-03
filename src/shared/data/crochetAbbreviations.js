/**
 * Crochet Abbreviations Library
 * US terminology (most common for amigurumi)
 */

export const CROCHET_ABBREVIATIONS = [
    // ===== BASIC STITCHES =====
    { abbr: 'ch', full: 'chain', category: 'basic', stitchChange: 0 },
    { abbr: 'sl st', full: 'slip stitch', category: 'basic', stitchChange: 0 },
    { abbr: 'sc', full: 'single crochet', category: 'basic', stitchChange: 0 },
    { abbr: 'hdc', full: 'half double crochet', category: 'basic', stitchChange: 0 },
    { abbr: 'dc', full: 'double crochet', category: 'basic', stitchChange: 0 },
    { abbr: 'tr', full: 'treble crochet', category: 'basic', stitchChange: 0 },
    { abbr: 'dtr', full: 'double treble crochet', category: 'basic', stitchChange: 0 },

    // ===== INCREASES/DECREASES =====
    { abbr: 'inc', full: 'increase', category: 'modify', stitchChange: +1 },
    { abbr: 'dec', full: 'decrease', category: 'modify', stitchChange: -1 },
    { abbr: 'invdec', full: 'invisible decrease', category: 'modify', stitchChange: -1 },

    // ===== SPECIAL TECHNIQUES =====
    { abbr: 'MR', full: 'magic ring', category: 'start' },
    { abbr: 'FLO', full: 'front loop only', category: 'modifier' },
    { abbr: 'BLO', full: 'back loop only', category: 'modifier' },
    { abbr: 'BL', full: 'back loop', category: 'modifier' },
    { abbr: 'FL', full: 'front loop', category: 'modifier' },
    { abbr: 'inv fo', full: 'invisible fasten off', category: 'finish' },
    { abbr: 'change color', full: 'change color', category: 'colorwork' },

    // ===== COMMON PHRASES =====
    { abbr: 'st', full: 'stitch', category: 'phrase' },
    { abbr: 'sts', full: 'stitches', category: 'phrase' },
    { abbr: 'rep', full: 'repeat', category: 'phrase' },
    { abbr: 'rnd', full: 'round', category: 'phrase' },
    { abbr: 'tog', full: 'together', category: 'phrase' },
    { abbr: 'in', full: 'in', category: 'phrase' },
    { abbr: 'each', full: 'each', category: 'phrase' },
];

/**
 * Get abbreviations by category
 */
export const getAbbreviationsByCategory = (category) => {
    return CROCHET_ABBREVIATIONS.filter(abbr => abbr.category === category);
};

/**
 * Get stitch change for an abbreviation
 */
export const getStitchChange = (abbr) => {
    const found = CROCHET_ABBREVIATIONS.find(a => a.abbr.toLowerCase() === abbr.toLowerCase());
    return found ? found.stitchChange : 0;
};

/**
 * Find abbreviation by abbr or full text
 */
export const findAbbreviation = (text) => {
    const lowerText = text.toLowerCase();
    return CROCHET_ABBREVIATIONS.find(a =>
        a.abbr.toLowerCase() === lowerText || a.full.toLowerCase() === lowerText
    );
};

/**
 * Quick access arrays for UI
 */
export const COMMON_STITCHES = ['sc', 'hdc', 'dc', 'inc', 'dec', 'MR'];
export const PUNCTUATION = ['(', ')', ',', 'x'];

export default CROCHET_ABBREVIATIONS;
