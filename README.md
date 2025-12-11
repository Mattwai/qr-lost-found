# QR Lost & Found - PWA

A Progressive Web App for managing lost and found items using QR codes. This is a proof-of-concept prototype that uses local storage (no database required).

## 🎯 Project Overview

QR Lost & Found helps people reunite with their lost items by using QR code stickers. When someone finds a lost item, they can scan the QR code with their phone's camera to see drop-off locations and notify the owner.

## 🚀 Features

- **Progressive Web App** - Works on mobile and desktop browsers
- **No Database Required** - Uses browser localStorage for prototype
- **Owner Dashboard** - Track all registered items and their status
- **Finder Flow** - Easy web-based process (no app download needed)
- **Drop-off Locations** - Partner locations to safely hold items
- **7-Day Countdown** - Automatic expiry after pickup window
- **Real-time Status Updates** - Track items through their lifecycle

## 📱 User Flows

### Flow 1: Owner Registers QR Code

1. **Purchase QR Code Sticker** - User buys a unique QR code from the business
2. **Scan to Register** - User scans QR code with camera → Opens `/register?qr=QR-12345`
3. **Enter Details**:
   - Item name (e.g., "Black Backpack")
   - Owner name
   - Owner email
4. **Confirmation** - Item registered successfully
5. **Access Dashboard** - Click "Go to Dashboard" to manage items

### Flow 2: Owner Manages Items

1. **Login** - Go to `/dashboard` and enter email
2. **View Items** - See all registered items with status badges:
   - ✅ **Active** - Item is with owner (not lost)
   - ⚠️ **Reported Found** - Someone found the item
   - 📦 **Dropped Off** - Item at pickup location (7-day countdown)
   - ✅ **Picked Up** - Owner retrieved the item
   - ⏰ **Expired** - Pickup window expired
3. **Manage Status**:
   - Mark false alarms as "I still have it"
   - Mark items as picked up after retrieval
   - View verification QR for pickup proof

### Flow 3: Finder Finds Lost Item

**State 1: Active Item (Not Yet Lost)**

1. **Finder Scans QR** → Opens `/found?qr=QR-12345`
2. **Sees Owner Info**:
   ```
   This Item Belongs To: [Owner Name]
   Item: [Item Name]
   ```
3. **Report Found** - Clicks "🔍 I Found This Item"
4. **Status Changes** to "Reported Found"

**State 2: Select Drop-off Location**

1. **See Partner Locations**:
   - Central Library (123 Main St)
   - City Police Station (456 Oak Ave)
   - Community Center (789 Elm St)
   - Campus Security (321 University Dr)
2. **Select Location** - Click on preferred location

**State 3: Confirm Drop-off**

1. **See Instructions**:
   - Take item to selected location
   - Tell staff it's from QR Lost & Found
   - Return to page after drop-off
2. **Warning Message**: "Please only click after physically dropping off the item"
3. **Confirm** - Click "✅ I Dropped It Off Here"
4. **Status Changes** to "Dropped Off" → 7-day countdown starts

### Flow 4: Subsequent Scans (Checking Status)

Anyone scanning the QR code after drop-off sees:

```
📦 Item Awaiting Pickup

Location: Central Library
Address: 123 Main Street, Downtown
Phone: 555-0101

Pickup Deadline: January 15, 2024
Time remaining: 5 days 12 hours 34 mins

⏰ The owner has 7 days to pick up this item.
```

### Flow 5: Owner Picks Up Item

1. **Check Dashboard** - See "🚨 PICK UP YOUR ITEM!" alert
2. **View Location Details**:
   - Location name, address, phone
   - Countdown timer
3. **Go to Location** - Visit the drop-off location
4. **Verify Ownership**:
   - Show verification QR in dashboard
   - Or provide email for verification
5. **Mark as Picked Up** - Click "✅ Mark as Picked Up" in dashboard

## 🏗️ Project Structure

```
web/
├── app/
│   ├── page.tsx              # Homepage
│   ├── dashboard/
│   │   └── page.tsx          # Owner dashboard
│   ├── found/
│   │   └── page.tsx          # Finder flow (multi-state)
│   ├── register/
│   │   └── page.tsx          # QR code registration
│   ├── scan/
│   │   └── page.tsx          # Camera QR scanner
│   └── layout.tsx            # Root layout
├── lib/
│   └── config.ts             # Centralized configuration
└── public/                   # Static assets
```

## 🔧 Configuration

All configuration is centralized in `lib/config.ts`:

### Domain Configuration

```typescript
export const CONFIG = {
  DOMAIN: "https://qr-lost-found.vercel.app",
  APP_NAME: "QR Lost & Found",
  PICKUP_TIMEOUT_DAYS: 7,
};
```

### Drop-off Locations

Partner locations are manually configured in `DROP_OFF_LOCATIONS` array:

```typescript
export const DROP_OFF_LOCATIONS: Location[] = [
  {
    id: 1,
    name: "Central Library",
    address: "123 Main Street, Downtown",
    phone: "555-0101",
    coordinates: { lat: 40.7128, lng: -74.0060 },
  },
  // ... more locations
];
```

**To add/edit locations**: Update the `DROP_OFF_LOCATIONS` array in `lib/config.ts`.

## 📊 Item State Machine

```
┌─────────────┐
│   ACTIVE    │ ← Item registered, with owner
└──────┬──────┘
       │ Finder clicks "I Found This Item"
       ↓
┌─────────────────┐
│ REPORTED FOUND  │ ← Owner notified, awaiting drop-off
└──────┬──────────┘
       │ Finder selects location & confirms drop-off
       ↓
┌─────────────┐
│ DROPPED OFF │ ← At location, 7-day countdown active
└──────┬──────┘
       │ Owner picks up OR 7 days pass
       ↓
┌──────────┬──────┐
│ PICKED UP│ EXPIRED│
└──────────┴────────┘
```

## 💾 Data Storage

### LocalStorage Keys

- `qrItems` - All registered items (JSON object)
- `userEmail` - Currently logged-in user email

### Item Data Structure

```typescript
interface ItemData {
  id: string;
  qrCode: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  status: "active" | "reportedFound" | "droppedOff" | "pickedUp" | "expired";
  location?: Location;
  reportedFoundAt?: string;
  droppedOffAt?: string;
  pickedUpAt?: string;
  expiresAt?: string;
  registeredAt: string;
}
```

## 🚀 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment

The app is configured for deployment to Vercel at `qr-lost-found.vercel.app`.

To change the domain, update `CONFIG.DOMAIN` in `lib/config.ts`.

## 📱 Browser Compatibility

- ✅ Chrome (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Edge
- ✅ Firefox
- ✅ Samsung Internet

**Camera scanning** requires HTTPS (works on localhost for development).

## 🔐 Security Considerations

This is a **proof-of-concept prototype** with the following limitations:

### Current Approach
- Email-only authentication (no password)
- No server-side validation
- Data stored in browser (can be cleared)
- No rate limiting
- Trust-based system for drop-off confirmation

### For Production, Add:
- Proper authentication (OAuth, magic links, or password)
- Backend API with database (PostgreSQL, MongoDB)
- Email notifications (SendGrid, AWS SES)
- SMS notifications (Twilio)
- Rate limiting and abuse prevention
- Drop-off verification codes
- Staff interface for locations
- Data encryption
- Audit logging
- GDPR compliance

## 🎨 Customization

### Branding

Update colors and branding in `app/globals.css` and component styles.

### Partner Locations

Edit `lib/config.ts` → `DROP_OFF_LOCATIONS` array.

### Pickup Window

Edit `lib/config.ts` → `CONFIG.PICKUP_TIMEOUT_DAYS`.

## 📋 Future Enhancements

- [ ] QR code generation in-app
- [ ] Printable QR stickers
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Location-based nearest drop-off
- [ ] Staff verification system
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Photo upload for found items
- [ ] Reward system for finders
- [ ] Integration with lost item databases

## 🐛 Known Limitations

1. **No Backend** - Data is lost if browser cache is cleared
2. **No Authentication** - Email-only login (anyone can access with email)
3. **No Notifications** - Status changes don't send emails/SMS
4. **Manual QR Generation** - QR codes must be generated externally
5. **Trust-based** - No verification for drop-off confirmation
6. **Single Device** - Can't sync across multiple devices
7. **No Search** - Can't search for items by ID or name

## 📄 License

Proprietary - All rights reserved.

## 👥 Contact

For business inquiries about QR code purchases or partnership opportunities, contact [your-email@example.com].

---

**Made with ❤️ to help reunite people with their belongings.**