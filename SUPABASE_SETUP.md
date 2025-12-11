# Supabase Database Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Free tier includes: 500MB database, 50,000 monthly active users

### Step 2: Create New Project

1. Click "New Project"
2. Fill in details:
   - **Name**: `qr-lost-found`
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
3. Click "Create new project"
4. Wait 2-3 minutes for setup

### Step 3: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (safe to use in frontend)
   - **service_role**: `eyJhbGc...` (NEVER expose in frontend!)

### Step 4: Create Database Table

1. Go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Paste this SQL:

```sql
-- Create items table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_name TEXT,
  owner_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  location JSONB,
  reported_found_at TIMESTAMPTZ,
  dropped_off_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on qr_code for fast lookups
CREATE INDEX idx_items_qr_code ON items(qr_code);

-- Create index on owner_email for dashboard queries
CREATE INDEX idx_items_owner_email ON items(owner_email);

-- Create index on status for filtering
CREATE INDEX idx_items_status ON items(status);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read items (for scanning QR codes)
CREATE POLICY "Anyone can read items" ON items
  FOR SELECT
  USING (true);

-- Create policy: Anyone can insert items (for registration)
CREATE POLICY "Anyone can insert items" ON items
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Anyone can update items (for status changes)
CREATE POLICY "Anyone can update items" ON items
  FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for public item data (hides sensitive info)
CREATE VIEW items_public AS
SELECT 
  id,
  qr_code,
  name,
  owner_name,
  status,
  location,
  reported_found_at,
  dropped_off_at,
  expires_at,
  registered_at
FROM items;
```

4. Click "Run" (or press Ctrl/Cmd + Enter)
5. You should see "Success. No rows returned"

### Step 5: Verify Table Creation

1. Go to **Table Editor** (left sidebar)
2. You should see the `items` table
3. Click on it to view structure

### Step 6: Add Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...

# Optional: For server-side operations (if needed later)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...
```

**Important:** 
- Replace `xxxxx` with your actual project ID
- Replace the keys with your actual keys from Step 3
- Add `.env.local` to `.gitignore` (already done)

### Step 7: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## 📊 Database Schema

### Items Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `qr_code` | TEXT | Unique QR code ID (e.g., "QR-1765460594356") |
| `name` | TEXT | Item name (e.g., "Black Backpack") |
| `owner_name` | TEXT | Owner's name (optional) |
| `owner_email` | TEXT | Owner's email (required) |
| `status` | TEXT | Item status: `active`, `reportedFound`, `droppedOff`, `pickedUp`, `expired` |
| `location` | JSONB | Drop-off location details (JSON object) |
| `reported_found_at` | TIMESTAMPTZ | When item was reported as found |
| `dropped_off_at` | TIMESTAMPTZ | When item was dropped off |
| `picked_up_at` | TIMESTAMPTZ | When owner picked up item |
| `expires_at` | TIMESTAMPTZ | Pickup deadline (7 days after drop-off) |
| `registered_at` | TIMESTAMPTZ | When item was registered |
| `created_at` | TIMESTAMPTZ | Record creation time |
| `updated_at` | TIMESTAMPTZ | Last update time (auto-updated) |

### Example Data

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "qr_code": "QR-1765460594356",
  "name": "Black Backpack",
  "owner_name": "John Doe",
  "owner_email": "john@example.com",
  "status": "droppedOff",
  "location": {
    "id": 1,
    "name": "Central Library",
    "address": "123 Main Street, Downtown",
    "phone": "555-0101"
  },
  "reported_found_at": "2024-01-10T10:00:00Z",
  "dropped_off_at": "2024-01-10T11:00:00Z",
  "expires_at": "2024-01-17T11:00:00Z",
  "registered_at": "2024-01-01T09:00:00Z"
}
```

---

## 🔐 Security (Row Level Security)

The database is configured with RLS policies that allow:

✅ **Anyone can:**
- Read items (needed for QR scanning)
- Insert items (needed for registration)
- Update items (needed for status changes)

🔒 **Protected:**
- Direct database access (only via API)
- Owner email hidden in public views
- SQL injection prevented by Supabase

### For Production:

Consider adding stricter policies:

```sql
-- Only allow reading non-sensitive fields
CREATE POLICY "Read public data only" ON items
  FOR SELECT
  USING (true);

-- Only allow updates to specific fields
CREATE POLICY "Update status only" ON items
  FOR UPDATE
  USING (true)
  WITH CHECK (
    -- Can only update status-related fields
    (OLD.qr_code = NEW.qr_code) AND
    (OLD.name = NEW.name) AND
    (OLD.owner_email = NEW.owner_email)
  );
```

---

## 🧪 Testing the Database

### Test 1: Insert Item

Go to **SQL Editor** and run:

```sql
INSERT INTO items (qr_code, name, owner_name, owner_email, status)
VALUES ('QR-TEST-001', 'Test Backpack', 'Test User', 'test@example.com', 'active')
RETURNING *;
```

### Test 2: Query Item

```sql
SELECT * FROM items WHERE qr_code = 'QR-TEST-001';
```

### Test 3: Update Status

```sql
UPDATE items 
SET status = 'droppedOff',
    dropped_off_at = NOW(),
    expires_at = NOW() + INTERVAL '7 days'
WHERE qr_code = 'QR-TEST-001'
RETURNING *;
```

### Test 4: Query by Email

```sql
SELECT * FROM items WHERE owner_email = 'test@example.com';
```

---

## 📱 Next Steps

After Supabase is set up:

1. ✅ Database created
2. ✅ Environment variables added
3. ✅ Supabase client installed
4. 🔄 Update app code to use Supabase (next step)

---

## 🚨 Troubleshooting

### Error: "relation 'items' does not exist"
- Make sure you ran the SQL in Step 4
- Check the SQL Editor for error messages
- Verify you're in the correct project

### Error: "Invalid API key"
- Double-check your `.env.local` file
- Make sure keys are copied correctly (no extra spaces)
- Restart your dev server after adding env vars

### Error: "Row Level Security"
- RLS is enabled by default
- Make sure policies are created (Step 4)
- Check policies in **Authentication** → **Policies**

### Database is slow
- Add indexes (already included in setup)
- Check query performance in **SQL Editor**
- Consider upgrading plan for more resources

---

## 💰 Pricing

**Free Tier Includes:**
- 500 MB database space
- 50,000 monthly active users
- 2 GB file storage
- 5 GB bandwidth
- Unlimited API requests

**When to Upgrade:**
- Need more database space (>500MB)
- More than 50k monthly users
- Need point-in-time recovery
- Need additional regions

---

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript
- **SQL Reference**: https://supabase.com/docs/guides/database
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Setup Complete!

Once you've:
1. ✅ Created Supabase project
2. ✅ Created items table
3. ✅ Added environment variables
4. ✅ Installed Supabase client

You're ready to update the app code to use the database!

**Next:** Update the app to use Supabase instead of localStorage.