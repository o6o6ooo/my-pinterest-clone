/**
 * clean up inputs
 * - trim spaces
 * - convert to lowercase
 * @param {string} input
 * @param {Object} options
 * @param {boolean} [options.toLowerCase=false]
 * @returns {string} formatted value
 */
export default function cleanInput(input, { toLowerCase = false, removeAllSpaces = false } = {}) {
    let result = input.trim();
    if (removeAllSpaces) {
        result = result.replace(/\s+/g, '');
    }
    if (toLowerCase) {
        result = result.toLowerCase();
    }
    return result;
}