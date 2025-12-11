# Quick Start Guide - QR Lost & Found

## 🚀 Get Started in 5 Minutes

This guide will help you test the complete user flow of the QR Lost & Found system.

## Prerequisites

- Modern web browser (Chrome, Safari, Edge, or Firefox)
- Access to https://qr-lost-found.vercel.app

## Step-by-Step Testing

### 1. Register a Test Item (As Owner)

1. **Open the app**: https://qr-lost-found.vercel.app
2. **Click** "Register a QR Code"
3. **Enter test details**:
   - QR Code ID: `QR-TEST-001` (auto-generated if you scan)
   - Item Name: `Black Backpack`
   - Your Name: `John Doe`
   - Your Email: `john@test.com`
4. **Click** "Register Item"
5. **Success!** You'll see a confirmation page
6. **Click** "Go to Dashboard"

### 2. Access Your Dashboard (As Owner)

1. **Go to** https://qr-lost-found.vercel.app/dashboard
2. **Login** with email: `john@test.com`
3. **View your items**:
   - You'll see "Black Backpack" with status ✅ Active
   - Stats show: 1 Active Item

### 3. Simulate Finding the Item (As Finder)

1. **Open a new incognito/private window** (to simulate a different person)
2. **Go to the found page**: https://qr-lost-found.vercel.app/found?qr=QR-TEST-001
3. **You'll see**:
   ```
   This Item Belongs To: John Doe
   Item: Black Backpack
   ```
4. **Click** "🔍 I Found This Item"
5. **Select a drop-off location** (e.g., Central Library)
6. **Click** on the location card
7. **Read the warning** about false reports
8. **Click** "✅ I Dropped It Off Here"
9. **Success!** Confirmation page shows item at Central Library

### 4. Check Owner Dashboard (As Owner)

1. **Go back** to your dashboard (original window)
2. **Refresh the page**
3. **You'll now see**:
   - Status changed to 📦 Dropped Off
   - Alert: "🚨 PICK UP YOUR ITEM!"
   - Location: Central Library, 123 Main Street, Downtown
   - Countdown timer: 7 days, X hours, X mins
4. **Test Actions**:
   - Click "📱 Show Verification QR" to see pickup code
   - Click "👁️ View Public Page" to see what finders see

### 5. Verify Status Check (As Anyone)

1. **Open another window** (can be regular or incognito)
2. **Scan the QR** or visit: https://qr-lost-found.vercel.app/found?qr=QR-TEST-001
3. **You'll see**:
   ```
   📦 Item Awaiting Pickup
   Location: Central Library
   Pickup Deadline: [7 days from drop-off]
   Time remaining: X days X hours X mins
   ```

### 6. Mark as Picked Up (As Owner)

1. **Go back to dashboard**: https://qr-lost-found.vercel.app/dashboard
2. **Find your item** "Black Backpack"
3. **Click** "✅ Mark as Picked Up"
4. **Status changes** to ✅ Picked Up

### 7. Verify Completion (As Anyone)

1. **Visit** https://qr-lost-found.vercel.app/found?qr=QR-TEST-001
2. **You'll see**:
   ```
   🎉 Item Retrieved!
   This item has been picked up by the owner.
   ```

## 🧪 Advanced Testing Scenarios

### Test False Alarm

1. Register an item as owner
2. Have someone report it found (even though you have it)
3. In dashboard, click "False Alarm - I Have It"
4. Item resets to ✅ Active status

### Test Reported Found State

1. Register an item
2. Report it found (but don't select location yet)
3. Check dashboard - shows ⚠️ Reported Found
4. Owner can mark as false alarm before drop-off

### Test Multiple Items

1. Register 3 different items with same email
2. Login to dashboard
3. See all 3 items listed
4. Report one as found
5. Dashboard shows stats: 2 Active, 1 Reported Found

### Test Expiry (Quick Version)

To test expiry without waiting 7 days:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Run this code**:
   ```javascript
   const items = JSON.parse(localStorage.getItem('qrItems') || '{}');
   const itemId = 'QR-TEST-001';
   if (items[itemId]) {
     items[itemId].status = 'droppedOff';
     items[itemId].expiresAt = new Date(Date.now() + 60000).toISOString(); // 1 minute
     localStorage.setItem('qrItems', JSON.stringify(items));
     location.reload();
   }
   ```
4. **Wait 1 minute**
5. **Refresh page** - item should show as ⏰ Expired

## 📱 Testing on Mobile

1. **Open** https://qr-lost-found.vercel.app on your phone
2. **Add to Home Screen** (iOS Safari: Share → Add to Home Screen)
3. **Icon appears** like a native app
4. **Test all flows** above on mobile device

## 🔍 Testing Camera Scanner

1. **Go to** https://qr-lost-found.vercel.app/scan
2. **Allow camera access**
3. **Generate a test QR code**:
   - Visit https://www.qr-code-generator.com/
   - Enter: `https://qr-lost-found.vercel.app/found?qr=QR-TEST-002`
   - Download QR code
4. **Scan the QR code** with the camera
5. **Redirects** to found page

## 🗂️ Data Management

### View All Data (DevTools)

```javascript
// View all registered items
console.log(JSON.parse(localStorage.getItem('qrItems')));

// View logged-in user
console.log(localStorage.getItem('userEmail'));
```

### Clear All Data (Reset)

```javascript
// Clear everything
localStorage.clear();
location.reload();
```

### Export Data (Backup)

```javascript
// Copy to clipboard
const data = {
  items: JSON.parse(localStorage.getItem('qrItems') || '{}'),
  user: localStorage.getItem('userEmail')
};
console.log(JSON.stringify(data, null, 2));
```

### Import Data (Restore)

```javascript
// Paste your backup data
const backup = {
  items: {...}, // your items data
  user: "john@test.com"
};
localStorage.setItem('qrItems', JSON.stringify(backup.items));
localStorage.setItem('userEmail', backup.user);
location.reload();
```

## 🎯 Key URLs for Testing

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | Landing page |
| Dashboard | `/dashboard` | Owner management |
| Register | `/register?qr=QR-TEST-001` | Register new item |
| Found | `/found?qr=QR-TEST-001` | Finder landing page |
| Scan | `/scan` | Camera QR scanner |

## 🐛 Troubleshooting

### "QR Code Not Registered"
- Make sure you registered the item first
- Check that the QR parameter matches exactly

### "No Items Yet" in Dashboard
- Verify you're logged in with the correct email
- Check that you registered items with that email

### Camera Not Working
- Ensure you're on HTTPS (Vercel domain)
- Check browser permissions (Settings → Privacy)
- Try a different browser

### Data Disappeared
- Browser cleared localStorage (use backup/export)
- Different browser/device (localStorage is local)
- Incognito mode closed (data doesn't persist)

## 💡 Tips for Demo/Presentation

1. **Pre-register items** before demo
2. **Use memorable QR codes**: QR-WALLET, QR-KEYS, QR-BAG
3. **Print QR codes** to simulate real stickers
4. **Use two devices**: one as owner, one as finder
5. **Screenshot key states** for presentation slides
6. **Clear data** before each demo run

## 📊 Test Checklist

- [ ] Register item successfully
- [ ] Login to dashboard
- [ ] View registered items
- [ ] Report item as found
- [ ] See reported found status in dashboard
- [ ] Select drop-off location
- [ ] Confirm drop-off
- [ ] See dropped off status with countdown
- [ ] View public page showing countdown
- [ ] Mark as picked up
- [ ] Test false alarm workflow
- [ ] Test multiple items
- [ ] Test on mobile device
- [ ] Add to home screen (PWA)
- [ ] Test camera scanner

## 🎓 Demo Script

**For Investors/Clients:**

> "Let me show you how QR Lost & Found works. I have this backpack with a QR sticker on it. If I lose it, someone finds it, they just scan with their phone camera..."

**[Show found page]**

> "They see my name and the item. They click 'I Found This Item' and select the nearest drop-off location like this library. Now they drop it off and confirm."

**[Show dashboard]**

> "On my side, I immediately see in my dashboard that my backpack is at Central Library. I have 7 days to pick it up. When I arrive, I show this verification QR to prove it's mine."

**[Show verification]**

> "After pickup, I mark it as retrieved. The system is fully tracked, secure, and requires no app installation for finders!"

## 🚀 Next Steps

After testing the prototype:

1. **Collect feedback** on user experience
2. **Identify bottlenecks** in the flow
3. **Plan backend integration** (database, emails)
4. **Design QR sticker** templates
5. **Partner with locations** for drop-off sites
6. **Launch pilot program** with limited QR codes

---

**Happy Testing! 🎉**

For issues or questions, check the main README.md or open an issue on GitHub.