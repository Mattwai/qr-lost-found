// Centralized configuration for QR Lost & Found

export const CONFIG = {
  // Domain configuration
  DOMAIN: "https://qr-lost-found.vercel.app",
  APP_NAME: "QR Lost & Found",

  // Pickup timeout in days
  PICKUP_TIMEOUT_DAYS: 7,
};

// Drop-off location interface
export interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Partner drop-off locations (manually configured for prototype)
export const DROP_OFF_LOCATIONS: Location[] = [
  {
    id: 1,
    name: "Fudan University, Teaching Building 6, Room 101",
    address: "复旦大学邯郸校区第六教学楼",
    phone: "555-0101",
    coordinates: {
      lat: 40.7128,
      lng: -74.006,
    },
  },
  {
    id: 2,
    name: "Fudan University, South Canteen",
    address: "复旦大学邯郸校区教工食堂",
    phone: "555-0102",
    coordinates: {
      lat: 40.758,
      lng: -73.9855,
    },
  },
  {
    id: 3,
    name: "Fudan University, International Students Main Building, Reception",
    address: "复旦大学邯郸校区北苑学生生活园区留学生公寓主楼",
    phone: "555-0103",
    coordinates: {
      lat: 40.7489,
      lng: -73.968,
    },
  },
  {
    id: 4,
    name: "Fudan University, North Canteen, Level 1 Help Desk",
    address: "复旦大学邯郸校区北食堂",
    phone: "555-0104",
    coordinates: {
      lat: 40.7295,
      lng: -73.9965,
    },
  },
];

// Helper function to generate QR code URL
// Generates URL in format: https://qr-lost-found.vercel.app/QR-{UUID}
// This allows scanning with normal phone camera (no app needed)
// Next.js redirects /QR-:id to /found?qr=QR-:id
export const generateQRUrl = (qrCode: string): string => {
  return `${CONFIG.DOMAIN}/${qrCode}`;
};

// Helper function to validate QR URL format
// Only accepts URLs from the correct domain with UUID format QR codes
export const isValidQRUrl = (url: string): boolean => {
  const expectedPrefix = `${CONFIG.DOMAIN}/QR-`;
  if (!url.startsWith(expectedPrefix)) {
    return false;
  }

  // Extract QR code from URL
  const qrCode = url.substring(CONFIG.DOMAIN.length + 1);

  // Validate UUID format: QR-{UUID}
  const uuidRegex =
    /^QR-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  return uuidRegex.test(qrCode);
};

// Helper function to extract QR code from valid URL
export const extractQRCodeFromUrl = (url: string): string | null => {
  if (!isValidQRUrl(url)) {
    return null;
  }
  return url.substring(CONFIG.DOMAIN.length + 1);
};

// Helper function to calculate expiry date
export const calculateExpiryDate = (fromDate: Date = new Date()): string => {
  const expiryDate = new Date(fromDate);
  expiryDate.setDate(expiryDate.getDate() + CONFIG.PICKUP_TIMEOUT_DAYS);
  return expiryDate.toISOString();
};

// Helper function to get location by ID
export const getLocationById = (id: number): Location | undefined => {
  return DROP_OFF_LOCATIONS.find((location) => location.id === id);
};

// Item status types
export type ItemStatus =
  | "active"
  | "reportedFound"
  | "droppedOff"
  | "pickedUp"
  | "expired";

// Item data interface
export interface ItemData {
  id: string;
  qr_code: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  status: ItemStatus;
  location?: Location;
  reportedFoundAt?: string;
  droppedOffAt?: string;
  pickedUpAt?: string;
  expiresAt?: string;
  registeredAt: string;
}

// LocalStorage keys
export const STORAGE_KEYS = {
  QR_ITEMS: "qrItems",
  USER_EMAIL: "userEmail",
};
