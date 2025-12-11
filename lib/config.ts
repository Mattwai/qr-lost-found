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
    name: "Central Library",
    address: "123 Main Street, Downtown",
    phone: "555-0101",
    coordinates: {
      lat: 40.7128,
      lng: -74.0060,
    },
  },
  {
    id: 2,
    name: "City Police Station",
    address: "456 Oak Avenue, City Center",
    phone: "555-0102",
    coordinates: {
      lat: 40.7580,
      lng: -73.9855,
    },
  },
  {
    id: 3,
    name: "Community Center",
    address: "789 Elm Street, Northside",
    phone: "555-0103",
    coordinates: {
      lat: 40.7489,
      lng: -73.9680,
    },
  },
  {
    id: 4,
    name: "Campus Security Office",
    address: "321 University Drive, Campus",
    phone: "555-0104",
    coordinates: {
      lat: 40.7295,
      lng: -73.9965,
    },
  },
];

// Helper function to generate QR code URL
export const generateQRUrl = (qrCode: string): string => {
  return `${CONFIG.DOMAIN}/found?qr=${qrCode}`;
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
export type ItemStatus = "active" | "reportedFound" | "droppedOff" | "pickedUp" | "expired";

// Item data interface
export interface ItemData {
  id: string;
  qrCode: string;
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
