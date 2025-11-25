/**
 * Character encoding detection utilities
 */

import jschardet from 'jschardet';

/**
 * Detect and decode filename with proper encoding
 * @param {string} filename - Raw filename string
 * @returns {string} Decoded filename
 */
export function decodeFilename(filename) {
  if (!filename) return '';

  const detected = jschardet.detect(filename);

  if (detected.encoding && detected.encoding.toLowerCase() !== 'ascii') {
    try {
      const decoder = new TextDecoder(detected.encoding);
      const charCodes = [];
      for (let i = 0; i < filename.length; i++) {
        charCodes.push(filename.charCodeAt(i));
      }
      return decoder.decode(new Uint8Array(charCodes));
    } catch (e) {
      console.error('Encoding decode error:', e);
      return filename;
    }
  }

  return filename;
}

/**
 * Detect encoding of a string
 * @param {string} str - String to detect
 * @returns {{encoding: string, confidence: number}}
 */
export function detectEncoding(str) {
  return jschardet.detect(str);
}

export { jschardet };
