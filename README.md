# QR Lost & Found - Web Application

A Next.js web application for the QR Lost & Found system. This app allows users to scan QR codes on lost items and helps reunite them with their owners through secure drop-off locations.

## 🚀 Features

- **QR Code Registration**: Register items with QR codes to protect your valuables
- **Found Item Reporting**: Scan QR codes to report found items
- **Secure Drop-off System**: Partner locations to safely hold found items
- **Privacy Protected**: Owner contact details hidden until item is reported found
- **Real-time Countdown**: 7-day pickup window tracking
- **Responsive Design**: Works seamlessly on mobile and desktop

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🛠️ Installation

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
web/
├── app/
│   ├── found/          # Found item page (QR scan landing)
│   ├── register/       # QR code registration page
│   ├── api/            # API routes (future backend integration)
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home/landing page
│   └── globals.css     # Global styles
├── public/             # Static assets
├── next.config.ts      # Next.js configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

## 🌐 Pages

### Home (`/`)
Landing page with product information and call-to-action buttons.

### Register (`/register?qr=QR-CODE`)
Register a new item with a QR code. Collects:
- Item name
- Owner name
- Owner email

### Found (`/found?qr=QR-CODE`)
Landing page when someone scans a QR code. Shows:
- Owner information (privacy protected)
- Item details
- Drop-off location selection
- Status tracking with countdown

## 🔧 Environment Variables

Currently uses localStorage for MVP. For production, add:

```env
NEXT_PUBLIC_API_URL=your-backend-api-url
```

## 🚀 Deployment to Vercel

This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `web`
4. Deploy!

Or use the Vercel CLI:

```bash
npm install -g vercel
cd web
vercel
```

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Storage**: localStorage (MVP) → Backend API (Production)

## 📱 Integration with Mobile App

The web app works seamlessly with the mobile app:
- Mobile app users register items
- Web app handles QR scan landing pages
- Both apps share the same data structure

## 🔐 Data Structure

```typescript
interface ItemData {
  qrCode: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  status: 'active' | 'droppedOff';
  location?: Location;
  droppedOffAt?: string;
  expiresAt?: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
}
```

## 🧪 Testing

Try the demo:
1. Visit `http://localhost:3000`
2. Click "Try Demo"
3. Experience the found item flow with a demo QR code

## 📝 Future Enhancements

- [ ] Backend API integration
- [ ] Database for persistent storage
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Multi-language support
- [ ] Payment integration for premium features

## 🤝 Contributing

This is part of the QR Lost & Found project. For mobile app, see `/mobile` directory.

## 📄 License

MIT

## 🆘 Support

For questions or issues, please create an issue in the repository.# qr-lost-found
