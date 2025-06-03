/**
 * clean up inputs
 * - trim spaces
 * - convert to lowercase
 * @param {string} input
 * @param {Object} options
 * @returns {string} formatted value
 */
export default function cleanInput(input, { toLowerCase = false, ensureHash = false } = {}) {
    if (typeof input !== 'string') return input;

    let result = input.trim();

    if (toLowerCase) {
        result = result.toLowerCase();
    }

    if (ensureHash && !result.startsWith('#')) {
        result = '#' + result;
    }

    return result;
}