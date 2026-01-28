/**
 * Round Instruction Parser
 * Automatically calculates stitch counts from crochet instructions
 */

/**
 * Parse a round instruction and calculate resulting stitch count
 * @param {string} instruction - The round instruction (e.g., "6 sc in MR" or "(sc, inc) x 6")
 * @param {number} previousStitchCount - Stitch count from previous round
 * @returns {number} - Calculated stitch count for this round
 */
export function parseRoundInstruction(instruction, previousStitchCount) {
    if (!instruction) return previousStitchCount;
    
    instruction = instruction.toLowerCase().trim();
    
    // Pattern: "6 sc in MR" or "6 sc in magic ring"
    const magicRingMatch = instruction.match(/(\d+)\s*sc\s*in\s*(mr|magic\s*ring)/i);
    if (magicRingMatch) {
        return parseInt(magicRingMatch[1]);
    }

    // Pattern: "inc in each st" or "inc in each stitch" - doubles the count
    if (instruction.match(/inc\s+in\s+each/i)) {
        return previousStitchCount * 2;
    }

    // Pattern: "dec around" or "dec all around" - halves the count
    if (instruction.match(/dec.*(around|all)/i)) {
        return Math.floor(previousStitchCount / 2);
    }

    // Pattern: "(sc, inc) x 6" or "(2 sc, inc) x 6"
    // This is the most common pattern in amigurumi
    const repeatMatch = instruction.match(/\((.*?)\)\s*x?\s*(\d+)/i);
    if (repeatMatch) {
        const sequence = repeatMatch[1];
        const repeats = parseInt(repeatMatch[2]);
        
        // Count increases and decreases in the sequence
        const incCount = (sequence.match(/inc/g) || []).length;
        const decCount = (sequence.match(/dec/g) || []).length;
        
        const changePerRepeat = incCount - decCount;
        return previousStitchCount + (changePerRepeat * repeats);
    }

    // Pattern: "12 sc" or "24 dc" - explicit stitch count
    const explicitMatch = instruction.match(/^(\d+)\s*(sc|hdc|dc|tr)/i);
    if (explicitMatch) {
        return parseInt(explicitMatch[1]);
    }

    // Pattern: "sc around" or "dc around" - no change
    if (instruction.match(/(sc|hdc|dc|tr).*around/i)) {
        return previousStitchCount;
    }

    // Pattern: "sc 12" (alternate format)
    const altFormatMatch = instruction.match(/(sc|hdc|dc|tr)\s+(\d+)/i);
    if (altFormatMatch) {
        return parseInt(altFormatMatch[2]);
    }

    // Pattern: "[sc, inc] x 6" - brackets instead of parentheses
    const bracketMatch = instruction.match(/\[(.*?)\]\s*x?\s*(\d+)/i);
    if (bracketMatch) {
        const sequence = bracketMatch[1];
        const repeats = parseInt(bracketMatch[2]);
        
        const incCount = (sequence.match(/inc/g) || []).length;
        const decCount = (sequence.match(/dec/g) || []).length;
        
        const changePerRepeat = incCount - decCount;
        return previousStitchCount + (changePerRepeat * repeats);
    }

    // If we can't parse it, return previous count (no change assumed)
    return previousStitchCount;
}

/**
 * Validate if an instruction can be parsed
 * @param {string} instruction
 * @returns {boolean}
 */
export function canParseInstruction(instruction) {
    if (!instruction || instruction.trim() === '') return false;
    
    // Check if it matches any known pattern
    const patterns = [
        /\d+\s*sc\s*in\s*(mr|magic\s*ring)/i,
        /inc\s+in\s+each/i,
        /dec.*(around|all)/i,
        /\(.*?\)\s*x?\s*\d+/i,
        /\[.*?\]\s*x?\s*\d+/i,
        /^\d+\s*(sc|hdc|dc|tr)/i,
        /(sc|hdc|dc|tr).*around/i
    ];
    
    return patterns.some(pattern => pattern.test(instruction.toLowerCase()));
}

/**
 * Get human-readable explanation of what the parser detected
 * Useful for debugging or showing users
 */
export function explainParsing(instruction, previousStitchCount) {
    if (!instruction) return 'No instruction provided';
    
    instruction = instruction.toLowerCase().trim();
    
    if (instruction.match(/\d+\s*sc\s*in\s*(mr|magic\s*ring)/i)) {
        return 'Starting with magic ring';
    }
    
    if (instruction.match(/inc\s+in\s+each/i)) {
        return 'Doubling stitch count (increase in each stitch)';
    }
    
    if (instruction.match(/\(.*?\)\s*x?\s*\d+/i)) {
        return 'Pattern repeat detected';
    }
    
    if (instruction.match(/^\d+\s*(sc|hdc|dc|tr)/i)) {
        return 'Explicit stitch count';
    }
    
    if (instruction.match(/(sc|hdc|dc|tr).*around/i)) {
        return 'Working around (no change)';
    }
    
    return 'Unable to auto-calculate (using previous count)';
}

export default parseRoundInstruction;
