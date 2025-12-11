# Deployment Guide - QR Lost & Found PWA

## 🚀 Deploying to Vercel

This guide will help you deploy the QR Lost & Found PWA to Vercel.

### Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Git installed on your computer

### Step 1: Push Code to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   cd web
   git init
   git add .
   git commit -m "Initial commit: QR Lost & Found PWA"
   ```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name: `qr-lost-found`
   - Make it private or public
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/qr-lost-found.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Click "Add New..." → "Project"

2. **Import Repository**:
   - Connect your GitHub account if not already connected
   - Find and select your `qr-lost-found` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Leave as `.` or set to `web` if needed
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Environment Variables** (optional for prototype):
   - None needed for this prototype
   - For production, you might add:
     - `NEXT_PUBLIC_API_URL`
     - `NEXT_PUBLIC_ANALYTICS_ID`

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - You'll get a URL like: `https://qr-lost-found.vercel.app`

#### Option B: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd web
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (first time)
   - What's your project's name? `qr-lost-found`
   - In which directory is your code? `./`
   - Want to override settings? `N`

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Step 3: Configure Custom Domain (Optional)

If you have `qr-lost-found.vercel.app` or want a custom domain:

1. **Go to Project Settings**:
   - Vercel Dashboard → Your Project → Settings

2. **Add Domain**:
   - Click "Domains"
   - Add `qr-lost-found.vercel.app` or your custom domain
   - Follow DNS instructions if using custom domain

3. **Update Configuration**:
   - Edit `web/lib/config.ts`:
     ```typescript
     export const CONFIG = {
       DOMAIN: "https://your-custom-domain.com",
       // or "https://qr-lost-found.vercel.app"
       // ...
     };
     ```
   - Commit and push changes
   - Vercel will auto-deploy

### Step 4: Test Deployment

1. **Visit your site**: https://qr-lost-found.vercel.app
2. **Test key flows**:
   - ✅ Homepage loads
   - ✅ Register a QR code
   - ✅ Login to dashboard
   - ✅ View found page
   - ✅ Camera scanner works (HTTPS required)
   - ✅ PWA install works on mobile

3. **Check Console**: 
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Verify no 404s in Network tab

### Step 5: Enable PWA Features

The app is already configured as a PWA, but verify:

1. **Test on Mobile**:
   - Open site on iPhone or Android
   - Safari/Chrome menu → "Add to Home Screen"
   - Icon should appear on home screen
   - Open from icon → should feel like native app

2. **PWA Checklist**:
   - ✅ HTTPS enabled (Vercel provides this)
   - ✅ Service worker registered
   - ✅ Manifest file present
   - ✅ Icons configured
   - ✅ Responsive design
   - ✅ Offline support (basic)

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

1. **Make changes locally**:
   ```bash
   # Edit files
   git add .
   git commit -m "Feat(ui): improve dashboard layout"
   git push
   ```

2. **Automatic deployment**:
   - Vercel detects the push
   - Builds the project
   - Deploys to production
   - Takes ~2-3 minutes

3. **View deployment**:
   - Check Vercel dashboard for build status
   - Visit your site to see changes

## 🌍 Environment-Specific Deployments

### Development/Staging

Create a separate branch for staging:

```bash
# Create staging branch
git checkout -b staging
git push -u origin staging

# Vercel will create a preview deployment
# URL: https://qr-lost-found-staging-hash.vercel.app
```

### Production

Keep `main` branch for production:

```bash
git checkout main
git merge staging
git push

# Deploys to: https://qr-lost-found.vercel.app
```

## 🔧 Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Common issues**:
   - Missing dependencies → Run `npm install`
   - TypeScript errors → Run `npm run build` locally
   - Lint errors → Run `npm run lint` and fix

### Camera Not Working

1. **Verify HTTPS**: Camera requires secure context
2. **Check permissions**: Browser must allow camera access
3. **Test locally**: Should work on `localhost` for development

### LocalStorage Data Lost

1. **Expected behavior**: localStorage is client-side only
2. **Solution for production**: Implement backend API
3. **Workaround**: Users can export/import data via DevTools

### PWA Not Installing

1. **Check manifest**: Visit `/manifest.json` in browser
2. **Verify HTTPS**: Required for PWA
3. **Test lighthouse**: Chrome DevTools → Lighthouse → PWA audit
4. **Clear cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## 📊 Monitoring

### Analytics (Optional)

Add analytics to track usage:

1. **Google Analytics**:
   ```typescript
   // lib/analytics.ts
   export const trackEvent = (event: string, data: any) => {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', event, data);
     }
   };
   ```

2. **Vercel Analytics**:
   - Enable in Vercel dashboard
   - Settings → Analytics → Enable
   - Free tier available

### Error Tracking (Optional)

Add error monitoring:

1. **Sentry**:
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure**:
   ```javascript
   // sentry.client.config.js
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     environment: process.env.NODE_ENV,
   });
   ```

## 🔐 Security Checklist

Before going live:

- [ ] HTTPS enabled (Vercel provides this)
- [ ] No sensitive data in localStorage
- [ ] No API keys in client-side code
- [ ] CORS configured if using backend
- [ ] Content Security Policy headers
- [ ] Rate limiting (if using backend)
- [ ] Input validation and sanitization
- [ ] XSS protection
- [ ] CSRF protection (if using backend)

## 📱 Mobile Testing

Test on real devices:

1. **iOS Safari**:
   - iPhone 12+ (iOS 15+)
   - iPad (iPadOS 15+)
   - Test PWA install
   - Test camera scanner

2. **Android Chrome**:
   - Samsung, Pixel, OnePlus
   - Android 10+
   - Test PWA install
   - Test camera scanner

3. **Responsive Testing**:
   - Portrait and landscape
   - Different screen sizes
   - Tablet view
   - Desktop view

## 🚀 Performance Optimization

Already optimized, but you can further improve:

1. **Image Optimization**:
   - Use Next.js `<Image>` component
   - Compress images
   - Use WebP format

2. **Code Splitting**:
   - Already enabled with Next.js
   - Lazy load heavy components

3. **Caching**:
   - Configure headers in `next.config.ts`:
     ```typescript
     async headers() {
       return [
         {
           source: '/:all*(svg|jpg|png)',
           headers: [
             {
               key: 'Cache-Control',
               value: 'public, max-age=31536000, immutable',
             },
           ],
         },
       ];
     }
     ```

4. **Bundle Analysis**:
   ```bash
   npm install @next/bundle-analyzer
   npm run build
   npm run analyze
   ```

## 🎯 Go-Live Checklist

Before announcing to users:

- [ ] All features tested on production
- [ ] Mobile PWA install works
- [ ] Camera scanner works on HTTPS
- [ ] Dashboard authentication works
- [ ] QR codes generate correct URLs
- [ ] Drop-off locations configured
- [ ] Privacy policy page (if needed)
- [ ] Terms of service page (if needed)
- [ ] Contact/support page
- [ ] SEO metadata configured
- [ ] Social media cards (og:image, etc.)
- [ ] Favicon and app icons
- [ ] Error pages (404, 500)
- [ ] Loading states
- [ ] Accessibility tested (WCAG 2.1)

## 📞 Support

For deployment issues:

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: Create an issue in your repository

## 🎉 Success!

Your QR Lost & Found PWA should now be live at:
**https://qr-lost-found.vercel.app**

Share this URL with users to start testing!

---

**Need help?** Check the README.md and QUICKSTART.md for usage instructions.