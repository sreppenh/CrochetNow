// Helper function for descriptions - Updated to include sc2tog
function getAbbreviationDescription(abbr) {
    const descriptions = {
        'sc': 'Insert hook into stitch, yarn over, pull through (2 loops on hook), yarn over, pull through both loops.',
        'hdc': 'Yarn over, insert hook into stitch, yarn over and pull through (3 loops on hook), yarn over and pull through all 3 loops.',
        'dc': 'Yarn over, insert hook into stitch, yarn over and pull through (3 loops on hook), yarn over and pull through 2 loops, yarn over and pull through remaining 2 loops.',
        'inc': 'Work 2 single crochet stitches in the same stitch.',
        'dec': 'Insert hook in stitch, yarn over and pull through, insert hook in next stitch, yarn over and pull through (3 loops on hook), yarn over and pull through all 3 loops.',
        'invdec': 'Insert hook in front loop of first stitch, then front loop of second stitch, yarn over and pull through both front loops, yarn over and pull through 2 loops.',
        'sc2tog': 'Insert hook in first stitch, yarn over and pull through (2 loops on hook), insert hook in next stitch, yarn over and pull through (3 loops on hook), yarn over and pull through all 3 loops. This creates one stitch from two stitches.',
        'MR': 'Wrap yarn around fingers to form a ring, insert hook through ring, yarn over and pull through, chain 1, then work stitches into the ring. Pull tail to close ring.',
        'inv fo': 'Insert hook into front loop of next stitch, pull yarn through (2 loops on hook), cut yarn leaving a tail, pull tail through both loops. Weave in end through several stitches to secure.',
        'change color': 'Work last stitch of current color until 2 loops remain on hook, yarn over with new color and pull through both loops to complete the stitch. Continue with new color. Carry unused yarn inside if working in rounds.',
        'ch': 'Yarn over and pull through loop on hook.',
        'sl st': 'Insert hook into stitch, yarn over and pull through both the stitch and the loop on hook.',
        'FLO': 'Work into only the front loop of each stitch, leaving the back loop unworked.',
        'BLO': 'Work into only the back loop of each stitch, leaving the front loop unworked.',
        'tr': 'Yarn over twice, insert hook into stitch, yarn over and pull through (4 loops on hook), yarn over and pull through 2 loops, yarn over and pull through 2 loops, yarn over and pull through remaining 2 loops.',
        'dtr': 'Yarn over 3 times, insert hook into stitch, yarn over and pull through (5 loops on hook), then yarn over and pull through 2 loops four times.',
    };

    return descriptions[abbr] || `${abbr}: Instructions not yet available.`;
}

// NOTE: This is just the updated getAbbreviationDescription function
// You need to replace this function in your existing CrochetMode.jsx file
