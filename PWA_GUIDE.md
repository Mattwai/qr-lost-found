# PWA (Progressive Web App) Guide

## 🎉 Your Web App is Now a PWA!

The QR Lost & Found web app is now a **Progressive Web App** that can be installed on mobile devices and **access the camera** for QR code scanning - no native mobile app needed!

## ✨ Features

- 📱 **Installable**: Add to home screen on iOS and Android
- 📷 **Camera Access**: Scan QR codes directly in the browser
- 🔌 **Offline Support**: Works without internet (cached pages)
- 🚀 **Fast Loading**: Service worker caching
- 📲 **App-like Experience**: Full-screen, no browser UI
- 🔔 **Push Notifications**: Ready for future implementation

## 📱 How to Install on Mobile

### iOS (iPhone/iPad)

1. Open Safari browser
2. Navigate to your web app URL
3. Tap the **Share** button (box with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it "QR Lost & Found"
6. Tap **"Add"**
7. App icon appears on home screen!

### Android

1. Open Chrome browser
2. Navigate to your web app URL
3. Tap the **menu** (three dots)
4. Tap **"Add to Home screen"** or **"Install app"**
5. Confirm installation
6. App icon appears on home screen!

## 📷 Camera Access

### Browser Compatibility

Camera access works on:
- ✅ Chrome (Android & Desktop)
- ✅ Safari (iOS 11+)
- ✅ Edge
- ✅ Firefox
- ✅ Samsung Internet

### First-Time Setup

1. Open the app
2. Tap **"Scan QR Code"**
3. Allow camera permissions when prompted
4. Point at QR code and it will auto-scan

### iOS-Specific Notes

- Camera access works in Safari and installed PWA
- Must allow camera permissions in iOS Settings if denied initially
- Go to: Settings → Safari → Camera → Allow

### Android-Specific Notes

- Camera works in Chrome and installed PWA
- Grant permission when prompted
- If denied, go to: Settings → Apps → [Your App] → Permissions → Camera

## 🏗️ PWA Components

### 1. Manifest (`/public/manifest.json`)
```json
{
  "name": "QR Lost & Found",
  "short_name": "QR L&F",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2563eb"
}
```

Defines how the app appears when installed.

### 2. Service Worker (`/public/sw.js`)
```javascript
// Caches pages for offline use
// Handles background sync
// Manages push notifications
```

Enables offline functionality and caching.

### 3. Icons
Required icons in `/public/`:
- `icon-192.png` - 192x192px
- `icon-512.png` - 512x512px
- `favicon.ico` - Browser favicon

### 4. Meta Tags (in `layout.tsx`)
```html
<meta name="theme-color" content="#2563eb">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="manifest" href="/manifest.json">
```

## 🔧 Testing PWA Features

### Local Testing

```bash
cd web
npm run build
npm start
```

Open `http://localhost:3000` and:
1. Open DevTools → Application tab
2. Check "Manifest" section
3. Check "Service Workers" section
4. Test "Add to Home Screen"

### Mobile Testing

1. Deploy to Vercel (HTTPS required)
2. Open on mobile browser
3. Test installation
4. Test camera access
5. Test offline mode (airplane mode)

## 📊 PWA Checklist

- [x] HTTPS enabled (Vercel automatic)
- [x] manifest.json configured
- [x] Service worker registered
- [x] Icons provided (192px, 512px)
- [x] Installable on iOS/Android
- [x] Camera API access
- [x] Offline support
- [x] Meta tags for mobile
- [x] Responsive design

## 🎯 Key Pages

### 1. Home Page (`/`)
Landing page with app information

### 2. Scan Page (`/scan`)
**Camera access page** - scan QR codes directly
- Uses WebRTC API for camera
- ZXing library for QR decoding
- Works on iOS and Android
- Manual entry fallback

### 3. Found Page (`/found?qr=CODE`)
Landing page when QR code is scanned

### 4. Register Page (`/register?qr=CODE`)
Register new items with QR codes

## 🔐 Permissions

### Required Permissions

1. **Camera** - For QR code scanning
   - Requested when user taps "Scan QR Code"
   - Can be revoked/granted in browser settings

### Optional Permissions (Future)

- **Notifications** - For found item alerts
- **Location** - For nearby drop-off locations
- **Storage** - For offline data

## 🚀 Deployment

### Vercel (Recommended)

```bash
cd web
vercel deploy --prod
```

**Important**: PWAs require HTTPS. Vercel provides this automatically.

### Custom Domain

If using custom domain:
1. Add domain in Vercel
2. Wait for SSL certificate
3. Test PWA installation

## 📱 User Flow

1. **First Visit**
   - User visits web app URL
   - Prompted to "Add to Home Screen"
   - Service worker installed in background

2. **Installation**
   - User adds to home screen
   - App icon appears
   - Opens in full-screen mode

3. **Using Camera**
   - User taps "Scan QR Code"
   - Browser requests camera permission
   - User allows → camera opens
   - QR code auto-detected → redirects to found page

4. **Offline Use**
   - User opens app without internet
   - Cached pages load instantly
   - Some features available offline

## 🎨 Customization

### Change Theme Color

Edit `manifest.json`:
```json
"theme_color": "#your-color",
"background_color": "#your-color"
```

### Change App Name

Edit `manifest.json`:
```json
"name": "Your App Name",
"short_name": "Short Name"
```

### Update Icons

Replace in `/public/`:
- `icon-192.png`
- `icon-512.png`
- `favicon.ico`

## 🐛 Troubleshooting

### Camera Not Working

**iOS:**
- Open Settings → Safari → Camera → Allow
- Or Settings → [App Name] → Camera → Allow
- Restart browser/app

**Android:**
- Open Settings → Apps → [App Name] → Permissions → Camera
- Or long-press app icon → App Info → Permissions
- Restart browser/app

### App Won't Install

- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Clear browser cache
- Try different browser

### Service Worker Issues

```bash
# Clear cache
DevTools → Application → Service Workers → Unregister
DevTools → Application → Cache Storage → Delete
```

### Offline Mode Not Working

- Check service worker is registered
- Verify sw.js is in `/public/`
- Check browser console for errors

## 📚 Additional Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Camera API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## 🎯 Benefits vs Native App

| Feature | PWA | Native App |
|---------|-----|------------|
| Installation | ✅ Instant | ❌ App Store |
| Updates | ✅ Automatic | ❌ Manual |
| Camera Access | ✅ Yes | ✅ Yes |
| Storage | ✅ Limited | ✅ Full |
| App Store | ❌ No | ✅ Yes |
| Development | ✅ Single codebase | ❌ iOS + Android |
| Cost | ✅ Low | ❌ High |

## 🎊 Summary

Your web app is now a **fully functional PWA** that:
- ✅ Can be installed like a native app
- ✅ Accesses the camera for QR scanning
- ✅ Works offline
- ✅ Runs on iOS and Android
- ✅ No app store submission needed

**You no longer need a separate mobile app!** The web app does everything the mobile app would do, accessible via any modern browser.

---

**Ready to use!** 📱📷✨

Visit your deployed URL, add to home screen, and start scanning QR codes!