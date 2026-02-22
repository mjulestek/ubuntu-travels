# 🚨 GUIDES NOT SHOWING? QUICK FIX

## The Problem
You're not seeing the "Verified Local Guides" section on the homepage.

## The Solution (99% of cases)
**Browser cache issue.** Your browser is showing an old version of the page.

---

## ✅ FIX #1: Hard Refresh (Try This First!)

### On Mac:
Press: **`Cmd + Shift + R`**

### On Windows/Linux:
Press: **`Ctrl + Shift + R`**

This forces your browser to reload everything from the server, bypassing the cache.

---

## ✅ FIX #2: Clear Cache & Hard Reload

1. Open Developer Tools:
   - Mac: `Cmd + Option + I`
   - Windows: `F12`

2. **Right-click** the refresh button (next to address bar)

3. Select **"Empty Cache and Hard Reload"**

---

## ✅ FIX #3: Incognito/Private Window

1. Open a new incognito/private window:
   - Mac: `Cmd + Shift + N` (Chrome) or `Cmd + Shift + P` (Firefox)
   - Windows: `Ctrl + Shift + N` (Chrome) or `Ctrl + Shift + P` (Firefox)

2. Go to: http://localhost:8000

3. If guides show here, it's definitely a cache issue!

---

## ✅ FIX #4: Check System Status

Open this URL to verify everything is working:

**http://localhost:8000/system-check.html**

All checks should show ✅ green. If any are red, that's the problem.

---

## 🔍 Still Not Working? Debug Steps

### Step 1: Check Browser Console
1. Press `Cmd + Option + I` (Mac) or `F12` (Windows)
2. Click the **"Console"** tab
3. Look for any **red error messages**
4. Take a screenshot and share it

### Step 2: Check Network Tab
1. In Developer Tools, click **"Network"** tab
2. Refresh the page (`Cmd + R`)
3. Look for these files:
   - `guides.js` - should show **200** status
   - `guides-section.css` - should show **200** status
   - Request to `/api/guides` - should show **200** status
4. If any show **404** or **failed**, that's the issue

### Step 3: Verify Servers Are Running

**Backend (should be running):**
```bash
cd ubuntu-backend
npm run dev
```
You should see: "✅ Server running on http://localhost:5000"

**Frontend (should be running):**
```bash
cd ubuntu-frontend
python3 -m http.server 8000
```
You should see: "Serving HTTP on 0.0.0.0 port 8000"

### Step 4: Test API Directly

Open this URL in your browser:
**http://localhost:5000/api/guides**

You should see JSON with 4 guides. If you see an error, the backend isn't working.

---

## 📸 What You Should See

After the hard refresh, you should see:

1. **"Verified local guides"** heading
2. **4 guide cards** in a grid:
   - Jean Mugabo (Rwanda)
   - Sarah Nakato (Uganda)
   - David Kimani (Kenya)
   - Amina Hassan (Tanzania)
3. Each card has:
   - Photo
   - Name
   - Short intro
   - "Read my Bio" button

---

## 🎯 Quick Checklist

- [ ] Did you do a hard refresh? (`Cmd + Shift + R`)
- [ ] Is the backend running? (http://localhost:5000/api/health should work)
- [ ] Is the frontend running? (http://localhost:8000 should load)
- [ ] Did you check the browser console for errors?
- [ ] Did you try incognito mode?
- [ ] Did you run the system check? (http://localhost:8000/system-check.html)

---

## 💡 Pro Tip

If you're making changes to the code, **always do a hard refresh** after saving files. Browsers aggressively cache CSS and JavaScript files, so you won't see your changes without forcing a reload.

---

## 🆘 Still Stuck?

If none of these work:

1. Take a screenshot of the browser console (with any errors)
2. Take a screenshot of the Network tab
3. Share the output of: `curl http://localhost:5000/api/guides`
4. Share what you see at: http://localhost:8000/system-check.html

This will help identify the exact issue!
