import fs from 'fs';
const scale = 3;

// Load completed packs JSON
let completedPacks = {};
try {
    completedPacks = JSON.parse(fs.readFileSync('./_completedpacks.json', 'utf-8'));
} catch (e) {
    console.warn('Could not load _completedpacks.json, defaulting to empty');
}

// Load all packs
let packs = [];
try {
    packs = JSON.parse(fs.readFileSync('./packs.json', 'utf-8')); // your JSON from above
} catch (e) {
    console.warn('Could not load packs.json, defaulting to empty');
}

/**
 * Calculate the score awarded for a level, plus automatic pack points if completed
 * @param {String} user User ID
 * @param {Number} rank Level rank
 * @param {Number} percent Completion percent
 * @param {Number} minPercent Minimum percent required
 * @param {String} levelName Level name
 * @returns {Number}
 */
export function score(user, rank, percent, minPercent, levelName) {
    if (rank > 150) return 0;
    if (rank > 75 && percent < 100) return 0;

    // Base score
    let scoreValue = (-26 * Math.pow(rank - 1, 0.45) + 250) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    scoreValue = Math.max(0, scoreValue);

    if (percent !== 100) {
        scoreValue -= scoreValue / 3;
    }

    // Check for pack completion
    if (percent === 100) {
        const userCompleted = completedPacks[user] || [];

        for (const pack of packs) {
            // If this level is in the pack
            if (pack.levels.includes(levelName)) {
                // Check if all pack levels are completed by the user
                const allCompleted = pack.levels.every(lvl => userCompleted.includes(lvl));
                if (allCompleted) {
                    // Add pack points
                    scoreValue += pack.points;
                }
            }
        }
    }

    return Math.max(round(scoreValue), 0);
}

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        const arr = ('' + num).split('e');
        let sig = '';
        if (+arr[1] + scale > 0) sig = '+';
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}
