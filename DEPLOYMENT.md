# Deployment Guide - QR Lost & Found Web App

This guide will help you deploy the web application to Vercel.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   cd qr_lost_found
   git add .
   git commit -m "Feat(web): ready for deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings:
     - **Root Directory**: `web`
     - **Framework Preset**: Next.js
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from web directory**
   ```bash
   cd web
   vercel
   ```

4. **Follow the prompts**
   - Set up and deploy: Yes
   - Which scope: (select your account)
   - Link to existing project: No
   - Project name: qr-lost-found-web
   - In which directory is your code located: ./
   - Want to modify settings: No

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## ⚙️ Environment Variables

Currently, the app uses localStorage for MVP. For production with a backend:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add the following:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   ```

3. Redeploy after adding variables

## 🔧 Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## 📁 Project Structure for Deployment

Ensure your repository structure is:
```
qr_lost_found/
├── mobile/           # Mobile app (not deployed to Vercel)
├── web/             # Web app (THIS is deployed)
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
└── README.md
```

**Important**: Set the root directory to `web` in Vercel settings!

## ✅ Pre-Deployment Checklist

Before deploying, make sure:

- [ ] All dependencies are installed (`npm install`)
- [ ] Build passes locally (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] All pages load correctly in development
- [ ] Environment variables are configured (if needed)
- [ ] Custom domain DNS is configured (if using)

## 🧪 Testing the Deployment

After deployment:

1. **Test Home Page**
   - Visit `https://your-app.vercel.app`
   - Verify landing page loads

2. **Test Registration Flow**
   - Visit `https://your-app.vercel.app/register?qr=TEST-123`
   - Fill out the form
   - Verify success message

3. **Test Found Item Flow**
   - Visit `https://your-app.vercel.app/found?qr=TEST-123`
   - Verify item details display
   - Test drop-off location selection

## 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

To disable auto-deploy:
1. Go to Project Settings → Git
2. Configure deployment branches

## 📊 Monitoring

### View Deployment Logs
```bash
vercel logs
```

### Check Build Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Click on a deployment to view logs

### Analytics
- Vercel provides built-in analytics
- Access via Dashboard → Your Project → Analytics

## 🐛 Troubleshooting

### Build Fails

**Error: Cannot find module**
```bash
cd web
npm install
git add package-lock.json
git commit -m "Fix: update dependencies"
git push
```

**Error: ESLint errors**
```bash
cd web
npm run lint
# Fix errors shown
git add .
git commit -m "Fix: resolve linting errors"
git push
```

### Pages Not Loading

1. Check build output in Vercel logs
2. Verify root directory is set to `web`
3. Check that all files are committed to git

### Environment Variables Not Working

1. Make sure variables are prefixed with `NEXT_PUBLIC_`
2. Redeploy after adding variables
3. Clear cache: `vercel --prod --force`

## 🔐 Security Considerations

For production deployment:

1. **API Keys**: Use environment variables, never commit
2. **CORS**: Configure allowed origins in backend
3. **Rate Limiting**: Implement in API routes
4. **Authentication**: Add user authentication for production
5. **HTTPS**: Enabled by default on Vercel

## 📱 Mobile Integration

After deployment, update the mobile app:

1. Update QR code URLs to point to production:
   ```
   https://your-app.vercel.app/found?qr=CODE
   ```

2. Test QR code scanning with production URL

## 🚀 Performance Optimization

Vercel automatically provides:
- ✅ CDN distribution
- ✅ Image optimization
- ✅ Edge caching
- ✅ Gzip compression
- ✅ Automatic SSL

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Custom Domains on Vercel](https://vercel.com/docs/custom-domains)

## 🆘 Support

If you encounter issues:
1. Check Vercel logs
2. Review build output
3. Verify environment variables
4. Check DNS configuration (for custom domains)

---

**Your app is now live! 🎉**

Visit: `https://your-project.vercel.app`
