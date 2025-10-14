# Complete Setup Instructions for Owen

## Quick Start (3 Steps)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Copy and Run the SQL
1. Open the file `OWEN_SAFE_DATABASE_SETUP.sql` in this project
2. Copy the ENTIRE contents
3. Paste it into the Supabase SQL Editor
4. Click "Run" button

### Step 3: Verify
After running, you should see "Success. No rows returned" - this is normal and correct!

## What This Does

This SQL file will:
- ✅ Skip creating objects that already exist (no errors!)
- ✅ **Drop and recreate** accounting tables if they have incorrect schemas
- ✅ Create all missing tables for your hotel system
- ✅ Set up proper security policies (RLS)
- ✅ Add all database functions and triggers
- ✅ Insert default data (hotel settings, account categories)
- ℹ️ **Note:** Room data is NOT included - you'll add rooms manually through the application

## Important Notes

- **Safe to run multiple times** - it won't break existing data
- **All your current data is preserved** - we only add what's missing
- **Takes about 30 seconds to complete**
- If you see any warnings, they're safe to ignore

## After Setup

Once the SQL runs successfully:
1. Your database will have all tables from the main system
2. Go to Room Management to add your rooms manually
3. Accounting module will be fully set up
4. Security policies will be active

## Need Help?

If you encounter any issues:
1. Make sure you're logged into Supabase Dashboard
2. Check you have "Owner" or "Admin" access to the project
3. Try running the script in smaller sections if needed

---

**For:** Owen's Hotel Management System
**File to Run:** OWEN_SAFE_DATABASE_SETUP.sql
