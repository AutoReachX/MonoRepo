# Frontend Deployment Configuration

## Service Configuration

**Service Type**: Web Service
**Runtime**: Node.js 18
**Plan**: Free (can upgrade to paid for better performance)

## Build Configuration

**Root Directory**: `frontend`

**Build Command**: 
```bash
npm ci && npm run build
```

**Start Command**:
```bash
npm start
```

## Environment Variables

### Required Variables
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### Optional Variables
```
NODE_ENV=production
```

## Next.js Configuration

The frontend is built with Next.js 15 and includes:
- React 19
- TypeScript
- Tailwind CSS
- Axios for API calls

## Build Process

1. **Install Dependencies**: `npm ci` installs exact versions from package-lock.json
2. **Build Application**: `npm run build` creates optimized production build
3. **Start Server**: `npm start` serves the built application

## API Integration

The frontend communicates with the backend API using the `NEXT_PUBLIC_API_URL` environment variable. This should point to your deployed backend service.

### API Endpoints Used
- `/api/health` - Health check
- `/api/auth/*` - Authentication endpoints
- `/api/content/*` - Content management
- `/api/tweets/*` - Twitter integration
- `/api/analytics/*` - Analytics data

## Authentication Flow

The frontend handles Twitter OAuth 2.0 authentication:
1. User clicks "Login with Twitter"
2. Redirected to Twitter OAuth
3. Twitter redirects back to `/auth/twitter/oauth2-callback`
4. Frontend exchanges code for tokens via backend API

## Performance Optimization

### Next.js Features Used
- **Static Site Generation (SSG)**: For static pages
- **Server-Side Rendering (SSR)**: For dynamic content
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic code splitting for better performance

### Caching Strategy
- Static assets are cached by CDN
- API responses can be cached client-side
- Service worker for offline functionality (if implemented)

## Troubleshooting

### Common Build Issues

**Node Version Mismatch**:
```bash
# Ensure package.json specifies Node version
"engines": {
  "node": ">=18.0.0"
}
```

**Dependency Issues**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**:
- Check all TypeScript files for errors
- Ensure types are properly installed
- Verify tsconfig.json configuration

### Runtime Issues

**API Connection Errors**:
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Ensure backend service is running

**Environment Variable Issues**:
- Next.js requires `NEXT_PUBLIC_` prefix for client-side variables
- Verify variables are set in Render dashboard
- Check that variables are available at build time

**Routing Issues**:
- Ensure all pages are properly exported
- Check Next.js routing configuration
- Verify dynamic routes are working

### Performance Issues

**Slow Loading**:
- Check bundle size with `npm run build`
- Optimize images and assets
- Use Next.js performance features

**Memory Issues**:
- Monitor memory usage in Render dashboard
- Optimize component rendering
- Consider upgrading to paid plan

## Security Considerations

1. **Environment Variables**: Only expose necessary variables to client
2. **API Security**: All API calls go through backend authentication
3. **HTTPS**: Render provides HTTPS by default
4. **Content Security Policy**: Configure CSP headers if needed

## SEO and Social Media

### Meta Tags
The application includes proper meta tags for:
- Search engine optimization
- Social media sharing (Open Graph, Twitter Cards)
- Mobile optimization

### Sitemap and Robots
Consider adding:
- `sitemap.xml` for search engines
- `robots.txt` for crawler instructions

## Monitoring and Analytics

### Built-in Monitoring
- Service health checks
- Performance metrics
- Error tracking

### Custom Analytics
Consider integrating:
- Google Analytics
- Performance monitoring tools
- User behavior tracking

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Backend API URL is correct
- [ ] Twitter OAuth redirect URI updated
- [ ] Build passes locally
- [ ] All tests pass

### Post-Deployment
- [ ] Frontend loads correctly
- [ ] API connection works
- [ ] Authentication flow works
- [ ] All pages are accessible
- [ ] Mobile responsiveness verified

### Testing
- [ ] Test all major user flows
- [ ] Verify Twitter OAuth integration
- [ ] Test content creation features
- [ ] Check analytics functionality
- [ ] Verify responsive design

## Custom Domain (Optional)

To use a custom domain:
1. Go to your service settings in Render
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Twitter OAuth redirect URI
5. Update any hardcoded URLs

## Backup and Recovery

### Code Backup
- Code is backed up in GitHub repository
- Render automatically deploys from Git

### Data Backup
- User data is stored in backend database
- Frontend only stores temporary state
- Consider implementing data export features
