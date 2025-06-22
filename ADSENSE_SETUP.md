# Google AdSense Setup Guide

## Overview

This guide will help you set up Google AdSense on your StudyMentor website with non-intrusive ads placed at the bottom of the page.

## Prerequisites

1. **Google AdSense Account**: You need an approved Google AdSense account
2. **Website Requirements**: Your site must comply with AdSense policies
3. **Domain**: A live domain (not localhost)

## Step 1: Get Your AdSense Publisher ID

1. Log in to your [Google AdSense account](https://www.google.com/adsense)
2. Go to **Settings** → **Account information**
3. Copy your **Publisher ID** (starts with `ca-pub-`)

## Step 2: Create Ad Units

1. In AdSense, go to **Ads** → **By ad unit**
2. Click **Create new ad unit**
3. Choose **Display ads**
4. Configure your ad unit:
   - **Name**: "Footer Banner"
   - **Ad size**: Responsive
   - **Ad style**: Default
5. Click **Create**
6. Copy the **Ad unit code** (you'll need the ad slot ID)

## Step 3: Update Configuration

### 1. Update Publisher ID

Edit `client/src/config/adsense.ts`:

```typescript
export const ADSENSE_CONFIG = {
  // Replace with your actual AdSense publisher ID
  PUBLISHER_ID: 'ca-pub-YOUR_ACTUAL_PUBLISHER_ID',
  
  // Replace with your actual ad slot IDs
  AD_SLOTS: {
    FOOTER_BANNER: 'YOUR_ACTUAL_AD_SLOT_ID', // Replace with your footer banner ad slot ID
    SIDEBAR: '0987654321',       // Optional: sidebar ad slot ID
    IN_ARTICLE: '1122334455',    // Optional: in-article ad slot ID
  },
  // ... rest of config
};
```

### 2. Update HTML Head

Edit `client/index.html`:

```html
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ACTUAL_PUBLISHER_ID"
 crossorigin="anonymous"></script>
```

## Step 4: Test Your Setup

### Development Mode
In development, you'll see placeholder ads:
- Shows "📢 Ad Space" with slot information
- Clearly marked as "Development Mode"
- No actual ads are loaded

### Production Mode
1. Deploy your site to production
2. Wait for AdSense to crawl your site (24-48 hours)
3. Check your AdSense dashboard for impressions

## Step 5: AdSense Policy Compliance

Ensure your site complies with AdSense policies:

### ✅ Do's
- Place ads in non-intrusive locations
- Maintain good user experience
- Follow AdSense content policies
- Use responsive ad units
- Test ads on different devices

### ❌ Don'ts
- Don't place ads too close to navigation
- Don't use clickbait or misleading content
- Don't place too many ads on one page
- Don't encourage accidental clicks
- Don't place ads on error pages

## Configuration Options

### Enable/Disable Ads
```typescript
SETTINGS: {
  ENABLED: true, // Set to false to disable all ads
  SHOW_TO_AUTHENTICATED_USERS: true, // Show ads to logged-in users
}
```

### Ad Placement
```typescript
PLACEMENT: {
  FOOTER: true,      // Footer banner ads
  SIDEBAR: false,    // Sidebar ads (disabled by default)
  IN_CONTENT: false, // In-content ads (disabled by default)
}
```

### Responsive Settings
```typescript
RESPONSIVE: {
  ENABLED: true,
  MAX_WIDTH: '728px', // Maximum ad width
}
```

## Troubleshooting

### Ads Not Showing
1. Check if your AdSense account is approved
2. Verify publisher ID is correct
3. Ensure site is live (not localhost)
4. Wait 24-48 hours for AdSense to crawl your site
5. Check browser console for errors

### Development vs Production
- **Development**: Shows placeholder ads
- **Production**: Shows real AdSense ads
- Use `NODE_ENV=production` to test real ads

### Common Issues
1. **"Ad temporarily unavailable"**: Network issues or AdSense loading problems
2. **No ads showing**: Check AdSense account status
3. **Wrong ad sizes**: Verify responsive settings

## Monitoring Performance

### AdSense Dashboard
- Monitor impressions and clicks
- Check revenue reports
- Review policy compliance
- Analyze ad performance

### Analytics Integration
Consider integrating with Google Analytics to track:
- Page views with ads
- User engagement
- Revenue correlation

## Best Practices

### User Experience
- Keep ads non-intrusive
- Maintain site performance
- Test on mobile devices
- Monitor page load times

### Content Quality
- High-quality, original content
- Regular updates
- Good site navigation
- Fast loading times

### Technical
- Use responsive ad units
- Implement proper error handling
- Test across browsers
- Monitor for policy violations

## Support

### AdSense Support
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
- [Policy Center](https://support.google.com/adsense/answer/48182)

### Technical Issues
- Check browser console for errors
- Verify network connectivity
- Test with different browsers
- Review AdSense documentation

## Revenue Optimization

### Ad Placement
- Test different ad positions
- Monitor click-through rates
- A/B test ad formats
- Optimize for mobile

### Content Strategy
- Create high-quality content
- Regular content updates
- SEO optimization
- User engagement focus

---

**Note**: This setup provides a non-intrusive ad experience that won't interfere with your users' study sessions while generating revenue for your platform. 