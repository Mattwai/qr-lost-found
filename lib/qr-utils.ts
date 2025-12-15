/**
 * Utility functions for QR code processing
 */

const QR_CODE_REGEX = /QR-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;

/**
 * Extract QR code ID from various formats:
 * - Direct QR code: "QR-12345678-1234-1234-1234-123456789012"
 * - Full URL: "https://example.com/QR-12345678-1234-1234-1234-123456789012"
 * - Found page URL: "https://example.com/found?qr=QR-12345678-1234-1234-1234-123456789012"
 */
export function extractQRCode(input: string): string | null {
  if (!input) return null;

  // If it's already a valid QR code, return it
  if (QR_CODE_REGEX.test(input) && input.startsWith('QR-')) {
    return input;
  }

  // Try to extract QR code from URL
  const qrMatch = input.match(QR_CODE_REGEX);
  if (qrMatch) {
    return qrMatch[0];
  }

  // If it's a URL with qr parameter, extract that
  try {
    const url = new URL(input);
    const qrParam = url.searchParams.get('qr');
    if (qrParam) {
      return extractQRCode(qrParam);
    }
  } catch {
    // Not a valid URL, continue
  }

  // Fallback: extract the last part after the last slash if it looks like a QR code
  const lastPart = input.substring(input.lastIndexOf("/") + 1);
  if (QR_CODE_REGEX.test(lastPart)) {
    return lastPart;
  }

  return null;
}

/**
 * Validate if a string is a proper QR code format
 */
export function isValidQRCode(qrCode: string | null): boolean {
  if (!qrCode) return false;
  return QR_CODE_REGEX.test(qrCode) && qrCode.startsWith('QR-');
}

/**
 * Clean and encode QR code for URL usage
 */
export function encodeQRForURL(qrCode: string): string {
  const cleanQR = extractQRCode(qrCode);
  return cleanQR ? encodeURIComponent(cleanQR) : '';
}