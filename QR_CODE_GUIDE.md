# QR Code Generation Guide

## 📱 QR Code URL Format

All QR codes for this system should follow this format:

```
https://qr-lost-found.vercel.app/QR-{UNIQUE_ID}
```

### Examples:
- `https://qr-lost-found.vercel.app/QR-1765460594356`
- `https://qr-lost-found.vercel.app/QR-001`
- `https://qr-lost-found.vercel.app/QR-BACKPACK-123`

## 🔄 How It Works

1. **You generate QR codes** with URLs like `https://qr-lost-found.vercel.app/QR-{ID}`
2. **User scans with phone camera** (no app needed!)
3. **Automatic redirect** to `/found?qr=QR-{ID}`
4. **User sees found page** with item details

## 🛠️ Generating QR Codes

### Option 1: Online QR Code Generators (Easiest)

**Recommended Sites:**
- https://www.qr-code-generator.com/
- https://www.qrcode-monkey.com/
- https://www.the-qrcode-generator.com/

**Steps:**
1. Go to any QR code generator site
2. Select "URL" type
3. Enter: `https://qr-lost-found.vercel.app/QR-{YOUR_ID}`
4. Customize design (optional):
   - Add your logo in the center
   - Change colors
   - Add frame with text "Scan to Report Found"
5. Download as PNG or SVG
6. Print on waterproof sticker paper

### Option 2: Bulk Generation with Script

Create a Node.js script to generate multiple QR codes:

```javascript
// generate-qr-codes.js
const QRCode = require('qrcode');
const fs = require('fs');

const baseUrl = 'https://qr-lost-found.vercel.app/QR-';
const numberOfCodes = 100; // Generate 100 QR codes

async function generateQRCodes() {
  for (let i = 1; i <= numberOfCodes; i++) {
    const id = String(i).padStart(6, '0'); // QR-000001, QR-000002, etc.
    const url = `${baseUrl}${id}`;
    const filename = `qr-codes/QR-${id}.png`;
    
    await QRCode.toFile(filename, url, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H'
    });
    
    console.log(`Generated: ${filename}`);
  }
}

generateQRCodes();
```

**Run:**
```bash
npm install qrcode
node generate-qr-codes.js
```

### Option 3: Python Script

```python
# generate_qr_codes.py
import qrcode
import os

base_url = "https://qr-lost-found.vercel.app/QR-"
num_codes = 100

os.makedirs('qr-codes', exist_ok=True)

for i in range(1, num_codes + 1):
    qr_id = f"{i:06d}"  # QR-000001, QR-000002, etc.
    url = f"{base_url}{qr_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(f"qr-codes/QR-{qr_id}.png")
    
    print(f"Generated: QR-{qr_id}.png")
```

**Run:**
```bash
pip install qrcode[pil]
python generate_qr_codes.py
```

## 🏷️ QR Code ID Formats

Choose an ID format that works for your business:

### Sequential Numbers
```
QR-000001
QR-000002
QR-000003
```
**Pros:** Easy to track inventory
**Cons:** Predictable

### Timestamp-based
```
QR-1765460594356
QR-1765460594357
```
**Pros:** Unique, chronological
**Cons:** Long numbers

### Category-based
```
QR-WALLET-001
QR-BACKPACK-001
QR-KEYS-001
```
**Pros:** Easy to identify item type
**Cons:** More complex tracking

### Random/UUID
```
QR-A7B2C9D4
QR-X3Y8Z1K5
```
**Pros:** Secure, unpredictable
**Cons:** Harder to track manually

## 🖨️ Printing QR Codes

### Recommended Materials

1. **Waterproof Vinyl Stickers**
   - Size: 1" x 1" (2.5cm x 2.5cm) minimum
   - Finish: Glossy or matte
   - Adhesive: Permanent, outdoor-rated

2. **Paper + Laminate**
   - Print on standard paper
   - Use clear laminating sheets
   - Cut to size

3. **Professional Sticker Services**
   - Sticker Mule: https://www.stickermule.com/
   - Avery: Printable waterproof labels
   - VistaPrint: Custom stickers

### Design Template

```
┌─────────────────────────────┐
│                             │
│     [Your Logo/Brand]       │
│                             │
│    ┌─────────────────┐      │
│    │                 │      │
│    │   [QR CODE]     │      │
│    │                 │      │
│    └─────────────────┘      │
│                             │
│  "Scan to Report Found"     │
│   QR-ID: 000001             │
│                             │
└─────────────────────────────┘
```

## 📊 QR Code Best Practices

### Size Guidelines
- **Minimum size**: 0.8" x 0.8" (2cm x 2cm)
- **Recommended**: 1" x 1" (2.5cm x 2.5cm)
- **For large items**: 1.5" x 1.5" (4cm x 4cm)

### Placement Tips
- Clean, flat surface
- Visible but not obtrusive
- Protected from wear (inside pockets, under flaps)
- Multiple stickers on valuable items (backup)

### Error Correction Level
Use **Level H (High)** - 30% error correction
- QR code still works if partially damaged
- Can add logo in center without affecting scan

## 🧪 Testing QR Codes

Before printing in bulk:

1. **Generate test codes**:
   - `https://qr-lost-found.vercel.app/QR-TEST-001`
   - `https://qr-lost-found.vercel.app/QR-TEST-002`

2. **Test with multiple devices**:
   - iPhone Camera app
   - Android Camera app
   - QR scanner apps

3. **Register the test item** in the system

4. **Scan and verify** the full flow works

## 💼 Business Operations

### Inventory Tracking

Create a spreadsheet to track QR codes:

| QR Code ID | Status | Sold Date | Customer Email | Notes |
|------------|--------|-----------|----------------|-------|
| QR-000001 | Sold | 2024-01-10 | john@email.com | - |
| QR-000002 | Available | - | - | - |
| QR-000003 | Sold | 2024-01-11 | sarah@email.com | - |

### Pricing Structure

Example pricing tiers:
- **Single QR Sticker**: $5
- **5-Pack**: $20 ($4 each)
- **10-Pack**: $35 ($3.50 each)
- **Business/Bulk (50+)**: Contact for pricing

### Sales Channels

1. **Online Store** (Shopify, WooCommerce)
2. **Local Retailers** (consignment)
3. **Direct Sales** (events, markets)
4. **B2B Sales** (schools, companies)

## 🔐 Security Considerations

### QR Code ID Security

**Don't:**
- ❌ Use sequential IDs if codes are pre-printed (QR-001, QR-002...)
- ❌ Store customer data in the QR code itself
- ❌ Make IDs easily guessable

**Do:**
- ✅ Use timestamp-based or random IDs
- ✅ Keep customer data server-side only
- ✅ Track which IDs have been sold/activated

### Anti-Counterfeiting

Optional measures:
1. Add hologram stickers
2. Use special UV-reactive ink
3. Serial number verification system
4. Unique QR code designs per batch

## 📞 Customer Instructions

Include this with each QR sticker purchase:

---

**How to Use Your QR Lost & Found Sticker:**

1. **Register Your Item**
   - Scan the QR code with your phone camera
   - Click "Register This QR Code"
   - Enter item name and your email
   - Save your item in the dashboard

2. **Attach the Sticker**
   - Place on a clean, dry surface
   - Press firmly for 30 seconds
   - Let adhesive cure for 1 hour

3. **If Your Item is Lost**
   - Anyone who finds it can scan the QR code
   - They'll see instructions to drop it off
   - You'll be notified in your dashboard

4. **Pick Up Your Item**
   - Visit the drop-off location within 7 days
   - Show your verification QR from the app
   - Get your item back!

---

## 🚀 Scaling Production

### Phase 1: Manual (0-100 codes)
- Generate QR codes online
- Print on sticker paper at home
- Cut manually

### Phase 2: Semi-Automated (100-1,000 codes)
- Use bulk generation script
- Order custom stickers from print shop
- Die-cut to size

### Phase 3: Automated (1,000+ codes)
- API integration with printing service
- Auto-generate on demand
- Direct shipping to customers

## 📚 Additional Resources

**QR Code Libraries:**
- JavaScript: `qrcode`, `qrcode.react`
- Python: `qrcode`, `segno`
- PHP: `phpqrcode`, `endroid/qr-code`

**Design Tools:**
- Canva (free templates)
- Adobe Illustrator (professional)
- Figma (collaborative design)

**Print Services:**
- Sticker Mule: https://www.stickermule.com/
- StickerApp: https://stickerapp.com/
- Avery: https://www.avery.com/

---

## 🎯 Quick Start Checklist

For your first batch of QR codes:

- [ ] Decide on ID format (e.g., QR-000001)
- [ ] Generate 10-20 test QR codes
- [ ] Print on regular paper to test
- [ ] Register and test 2-3 codes in the system
- [ ] Order waterproof sticker sheets
- [ ] Print final batch
- [ ] Cut to size (use corner rounder for professional look)
- [ ] Create packaging with instructions
- [ ] Test with real customers
- [ ] Collect feedback and iterate

---

**Questions?** Check the main README.md or deployment documentation.

**Ready to generate QR codes?** Start with 10 test codes and validate the entire flow before bulk production!