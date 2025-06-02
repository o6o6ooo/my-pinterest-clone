/**
 * clean up inputs
 * - trim spaces
 * - convert to lowercase
 * @param {string} input
 * @param {Object} options
 * @param {boolean} [options.toLowerCase=false]
 * @returns {string} formatted value
 */
export function cleanInput(input, { toLowerCase = false } = {}) {
    if (typeof input !== 'string') return input;

    // remove spaces
    let cleaned = input.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');

    // convert to lowercase if needed
    if (toLowerCase) {
        cleaned = cleaned.toLowerCase();
    }

    return cleaned;
  }