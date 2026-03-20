import fs from 'fs';
const scale = 3;

// Load user completed levels JSON
let completedLevels = {};
try {
    completedLevels = JSON.parse(fs.readFileSync('./_completedpacks.json', 'utf-8'));
} catch (e) {
    console.warn('Could not load _completedpacks.json, defaulting to empty');
}

// Load all packs
let packs = [];
try {
    packs = JSON.parse(fs.readFileSync('./packs.json', 'utf-8'));
} catch (e) {
    console.warn('Could not load packs.json, defaulting to empty');
}

/**
 * Record a level as completed for a user
 */
function markLevelCompleted(user, levelName) {
    if (!completedLevels[user]) completedLevels[user] = [];
    if (!completedLevels[user].includes(levelName)) {
        completedLevels[user].push(levelName);
        fs.writeFileSync('./_completedpacks.json', JSON.stringify(completedLevels, null, 2));
    }
}

/**
 * Calculate the score awarded for a level, plus automatic pack points if completed
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

    // Only consider 100% completions for pack points
    if (percent === 100) {
        markLevelCompleted(user, levelName); // mark this level as completed

        for (const pack of packs) {
            // Check if all levels in the pack are completed
            const userCompleted = completedLevels[user] || [];
            const allCompleted = pack.levels.every(lvl => userCompleted.includes(lvl));
            if (allCompleted) {
                // Add pack points once per pack
                scoreValue += pack.points;
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
