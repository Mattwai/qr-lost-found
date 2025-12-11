# Database Migration Guide: localStorage → Supabase

## 🎯 Overview

This guide will help you migrate the QR Lost & Found app from using localStorage (browser-only storage) to Supabase (real database that works across all devices).

## 🔴 Why You Need This

**Current Problem with localStorage:**
- ❌ Data only exists in one browser/device
- ❌ When someone scans a QR code on their phone, they can't see data you registered on your computer
- ❌ Data is lost if browser cache is cleared
- ❌ Can't share data between users/devices

**Solution with Supabase:**
- ✅ Data stored in cloud database
- ✅ Anyone scanning QR code sees the registered item
- ✅ Works across all devices and browsers
- ✅ Data persists permanently
- ✅ Real-time updates

---

## 📋 Migration Steps

### Step 1: Set Up Supabase (5 minutes)

Follow the complete guide in **SUPABASE_SETUP.md**:

1. Create Supabase account
2. Create new project
3. Run SQL to create `items` table
4. Get your API keys
5. Install Supabase client: `npm install @supabase/supabase-js` ✅ (Already done)

### Step 2: Add Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` and add your Supabase credentials:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key...
   ```

3. **Get these values from:**
   - Go to your Supabase project
   - Click **Settings** → **API**
   - Copy **Project URL** and **anon public** key

### Step 3: Update Register Page

The register page needs to save to Supabase instead of localStorage.

**File:** `app/register/page.tsx`

**Find this code:**
```typescript
// Store in localStorage
const items = JSON.parse(
  localStorage.getItem(STORAGE_KEYS.QR_ITEMS) || "{}",
);
items[qrCode] = itemData;
localStorage.setItem(STORAGE_KEYS.QR_ITEMS, JSON.stringify(items));
```

**Replace with:**
```typescript
import { db } from "@/lib/supabase";

// Save to Supabase
const savedItem = await db.registerItem(itemData);
if (!savedItem) {
  Alert.alert("Error", "Failed to register item. Please try again.");
  return;
}
```

### Step 4: Update Found Page

The found page needs to fetch from Supabase instead of localStorage.

**File:** `app/found/page.tsx`

**Find this code:**
```typescript
const items = JSON.parse(
  localStorage.getItem(STORAGE_KEYS.QR_ITEMS) || "{}",
);
const item = items[qrCode];
```

**Replace with:**
```typescript
import { db } from "@/lib/supabase";

const item = await db.getItemByQrCode(qrCode);
```

**Find status update code:**
```typescript
items[qrCode].status = newStatus;
localStorage.setItem(STORAGE_KEYS.QR_ITEMS, JSON.stringify(items));
```

**Replace with:**
```typescript
await db.updateItemStatus(qrCode, newStatus, {
  reportedFoundAt: newStatus === "reportedFound" ? new Date().toISOString() : undefined,
  droppedOffAt: newStatus === "droppedOff" ? new Date().toISOString() : undefined,
  expiresAt: newStatus === "droppedOff" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  location: selectedLocation,
});
```

### Step 5: Update Dashboard

The dashboard needs to fetch user items from Supabase.

**File:** `app/dashboard/page.tsx`

**Find this code:**
```typescript
const allItems = JSON.parse(
  localStorage.getItem(STORAGE_KEYS.QR_ITEMS) || "{}",
);
const userItems = Object.values(allItems).filter(
  (item: unknown) => (item as ItemData).ownerEmail === email,
) as ItemData[];
```

**Replace with:**
```typescript
import { db } from "@/lib/supabase";

const userItems = await db.getItemsByEmail(email);
```

**Find status update code:**
```typescript
allItems[itemId].status = newStatus;
localStorage.setItem(STORAGE_KEYS.QR_ITEMS, JSON.stringify(allItems));
```

**Replace with:**
```typescript
if (newStatus === "active") {
  await db.resetItemToActive(itemId);
} else {
  await db.updateItemStatus(itemId, newStatus, {
    pickedUpAt: newStatus === "pickedUp" ? new Date().toISOString() : undefined,
  });
}
```

---

## 🧪 Testing Migration

### Test 1: Register New Item

1. Make sure `.env.local` has correct Supabase credentials
2. Restart dev server: `npm run dev`
3. Go to `/register?qr=QR-TEST-DB-001`
4. Fill in form and register
5. Check Supabase dashboard → Table Editor → items
6. You should see the new item!

### Test 2: Cross-Device Access

1. Register item on your computer
2. Open `/found?qr=QR-TEST-DB-001` on your phone
3. You should see the item details! 🎉
4. This proves it's working across devices

### Test 3: Status Updates

1. On phone, click "I Found This Item"
2. Select drop-off location
3. Confirm drop-off
4. On computer, open dashboard and login
5. You should see the item with "Dropped Off" status
6. This proves real-time sync works!

### Test 4: Dashboard

1. Register 2-3 items with same email
2. Login to dashboard with that email
3. All items should appear
4. Try marking one as picked up
5. Refresh page - status should persist

---

## 🔄 Migration Checklist

- [ ] Supabase project created
- [ ] Database table created (run SQL from SUPABASE_SETUP.md)
- [ ] Environment variables added to `.env.local`
- [ ] Dev server restarted
- [ ] Register page updated to use Supabase
- [ ] Found page updated to use Supabase
- [ ] Dashboard page updated to use Supabase
- [ ] Test registration works
- [ ] Test cross-device access works
- [ ] Test status updates work
- [ ] Test dashboard works
- [ ] Deploy to Vercel with env vars

---

## 🚀 Deploying to Vercel with Supabase

### Add Environment Variables to Vercel

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
5. Apply to: Production, Preview, Development
6. Click "Save"
7. Redeploy your project

### Verify Deployment

1. Visit your deployed site
2. Register a test item
3. Check Supabase dashboard - item should appear
4. Scan QR code on different device - should see item
5. Success! 🎉

---

## 🔒 Security Notes

### What's Safe to Expose

✅ **Supabase URL**: Safe to use in frontend
✅ **Anon Key**: Safe to use in frontend (has limited permissions)

### What to Keep Secret

❌ **Service Role Key**: NEVER expose in frontend or commit to git
❌ **Database Password**: Only you should know this

### Row Level Security (RLS)

The SQL setup includes RLS policies that:
- Allow anyone to read items (needed for QR scanning)
- Allow anyone to insert items (needed for registration)
- Allow anyone to update items (needed for status changes)

**For production**, consider adding stricter policies:
- Require authentication for sensitive operations
- Only allow owners to update their items
- Hide email addresses from public queries

---

## 📊 Data Migration (Optional)

If you have existing data in localStorage that you want to migrate:

### Export from localStorage

Open browser console and run:
```javascript
const items = JSON.parse(localStorage.getItem('qrItems') || '{}');
console.log(JSON.stringify(items, null, 2));
// Copy the output
```

### Import to Supabase

1. Go to Supabase dashboard
2. Table Editor → items
3. Click "Insert" → "Insert row"
4. Fill in data manually, or...
5. Use SQL Editor:

```sql
INSERT INTO items (qr_code, name, owner_name, owner_email, status, registered_at)
VALUES 
  ('QR-001', 'Black Backpack', 'John Doe', 'john@example.com', 'active', NOW()),
  ('QR-002', 'Blue Wallet', 'Jane Smith', 'jane@example.com', 'active', NOW());
```

---

## 🐛 Troubleshooting

### Error: "Supabase environment variables not set"

**Solution:**
1. Make sure `.env.local` exists
2. Verify it has the correct values
3. Restart dev server: `npm run dev`

### Error: "Failed to register item"

**Solution:**
1. Check browser console for detailed error
2. Verify Supabase project is active
3. Check SQL table was created correctly
4. Verify API keys are correct

### Items don't appear in dashboard

**Solution:**
1. Check the email matches exactly
2. Look in Supabase Table Editor to verify data exists
3. Check browser console for errors
4. Verify RLS policies are set up

### Cross-device not working

**Solution:**
1. Verify you're testing on deployed URL (Vercel), not localhost
2. Check that env vars are added to Vercel
3. Clear browser cache on both devices
4. Verify item exists in Supabase dashboard

---

## 🎯 Quick Start Script

Here's a quick copy-paste guide:

```bash
# 1. Install Supabase client (already done)
npm install @supabase/supabase-js

# 2. Create environment file
cp .env.local.example .env.local

# 3. Edit .env.local with your Supabase credentials
nano .env.local  # or use your preferred editor

# 4. Restart dev server
npm run dev

# 5. Test registration
# Open http://localhost:3000/register?qr=QR-DB-TEST-001
# Register an item

# 6. Check Supabase
# Go to your Supabase project → Table Editor → items
# You should see the item!

# 7. Test cross-device
# Open the found page on a different device
# http://localhost:3000/found?qr=QR-DB-TEST-001
# (Use your deployed URL for real cross-device testing)
```

---

## 📚 Additional Resources

- **Supabase Setup**: See `SUPABASE_SETUP.md`
- **Database Service**: See `lib/supabase.ts`
- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript

---

## ✅ Success Criteria

You'll know the migration is complete when:

- ✅ Items registered on one device appear on other devices
- ✅ QR codes scanned on any phone show the correct item
- ✅ Dashboard shows all your items when you login
- ✅ Status updates persist across page refreshes
- ✅ No "QR Code Not Registered" errors for valid items

---

## 🎉 Next Steps

After migration is complete:

1. **Deploy to Vercel** with environment variables
2. **Test thoroughly** on production
3. **Generate real QR codes** for your business
4. **Start selling!** 

**Need help?** Check the troubleshooting section or create an issue on GitHub.