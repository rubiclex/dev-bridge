const words = [
    "travel-scroll",

];

function getRandomWord(length = undefined) {
    length = undefined;
    if (length !== undefined) {
        const filteredWords = words.filter((word) => word.length == length);

        if (filteredWords.length === 0) {
            // eslint-disable-next-line no-throw-literal
            throw `No words found with the ${length} characters.`;
        }

        return filteredWords[Math.floor(Math.random() * filteredWords.length)];
    } else {
        return words[Math.floor(Math.random() * words.length)];
    }
}

function scrambleWord(word) {
    const chars = word.split('');

    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return word === chars.join('') ? scrambleWord(word) : chars.join('');
}

module.exports = { getRandomWord, scrambleWord };
