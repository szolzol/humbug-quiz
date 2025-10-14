# 🌐 Domain Setup Guide: humbug.hu

Complete guide for configuring your custom domain with Vercel and Forpsi DNS.

---

## 📋 Overview

**Domain**: `humbug.hu`  
**Registrar**: Forpsi  
**Registered**: October 11, 2025  
**Expires**: October 11, 2026  
**DNSSEC**: Enabled ✅  
**Nameservers**:

- Primary: `ns.forpsi.net`
- Secondary: `ns.forpsi.it`

---

## 🚀 Setup Process

### Step 1: Configure DNS at Forpsi

1. **Login to Forpsi Dashboard**

   - Visit: [https://admin.forpsi.com](https://admin.forpsi.com)
   - Login with your credentials

2. **Navigate to DNS Management**

   - Go to "Domains" section
   - Select `humbug.hu`
   - Click "DNS Settings" or "Manage DNS"

3. **Add Required DNS Records**

   #### A Record (Apex Domain)

   ```
   Type: A
   Name: @  (or leave blank for root domain)
   Value: 76.76.21.21
   TTL: 3600 (1 hour)
   ```

   #### CNAME Record (www Subdomain)

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600 (1 hour)
   ```

4. **Save Changes**
   - Click "Add Record" or "Save"
   - Wait for confirmation message

---

### Step 2: Add Domain to Vercel

1. **Login to Vercel Dashboard**

   - Visit: [https://vercel.com](https://vercel.com)
   - Select your `humbug-quiz` project

2. **Navigate to Domains**

   - Click "Settings" in the top menu
   - Select "Domains" from the sidebar

3. **Add Custom Domain**

   - Click "Add" or "Add Domain" button
   - Enter: `humbug.hu`
   - Click "Add"

4. **Vercel Will Check DNS**

   - Vercel automatically detects your DNS records
   - If configured correctly, you'll see:
     - ✅ "DNS configured correctly"
   - If not yet propagated:
     - ⏳ "Waiting for DNS propagation"

5. **Add www Subdomain (Optional)**
   - Click "Add" again
   - Enter: `www.humbug.hu`
   - Vercel will automatically redirect www → apex (per vercel.json config)

---

### Step 3: Verify Configuration

#### Wait for DNS Propagation

**Timeline**: 15 minutes to 48 hours (typically 1-2 hours)

**Check Propagation Status**:

1. **Online DNS Checker**

   - Visit: [https://dnschecker.org](https://dnschecker.org)
   - Enter: `humbug.hu`
   - Select "A" record type
   - Should show: `76.76.21.21` from multiple global locations

2. **Command Line (Windows PowerShell)**

   ```powershell
   # Check A record
   nslookup humbug.hu
   # Should return: 76.76.21.21

   # Check CNAME for www
   nslookup www.humbug.hu
   # Should return: cname.vercel-dns.com
   ```

3. **Command Line (Alternative)**
   ```powershell
   # Detailed DNS query
   Resolve-DnsName humbug.hu -Type A
   Resolve-DnsName www.humbug.hu -Type CNAME
   ```

#### Test in Browser

1. **Test Apex Domain**

   ```
   https://humbug.hu
   ```

   - Should load your HUMBUG! Quiz app
   - Check SSL certificate (padlock icon)
   - Verify no security warnings

2. **Test www Redirect**

   ```
   https://www.humbug.hu
   ```

   - Should redirect to `https://humbug.hu`
   - URL bar should show `humbug.hu` (no www)

3. **Test PWA Installation**
   - Visit `https://humbug.hu` on mobile
   - Browser should offer "Add to Home Screen"
   - Install and verify app icon

---

## 🔍 Verification Checklist

After DNS propagates, verify all functionality:

- [ ] `https://humbug.hu` loads successfully
- [ ] `https://www.humbug.hu` redirects to apex domain
- [ ] SSL certificate shows valid (not self-signed)
- [ ] Certificate issued by Vercel/Let's Encrypt
- [ ] Open Graph meta tags display correct URL in social shares
- [ ] PWA installs correctly on mobile devices
- [ ] Service worker loads from `https://humbug.hu/sw.js`
- [ ] All assets (images, fonts, audio) load without errors
- [ ] No mixed content warnings (HTTP vs HTTPS)
- [ ] Language switcher works (EN/HU)
- [ ] Background music player functions

---

## 🛠️ Troubleshooting

### Issue: DNS Not Propagating

**Symptoms**: Domain doesn't resolve after 24 hours

**Solutions**:

1. **Check DNS Records at Forpsi**

   - Login to admin.forpsi.com
   - Verify A and CNAME records are saved
   - Check for typos in IP address or CNAME value

2. **Check TTL (Time To Live)**

   - Lower TTL = faster propagation
   - Set TTL to 300 (5 minutes) during initial setup
   - Increase to 3600 (1 hour) after confirmed working

3. **Clear Local DNS Cache**

   ```powershell
   # Windows PowerShell (Run as Administrator)
   ipconfig /flushdns
   ```

4. **Try Different DNS Servers**
   - Google DNS: 8.8.8.8
   - Cloudflare DNS: 1.1.1.1
   - Test with: `nslookup humbug.hu 8.8.8.8`

---

### Issue: SSL Certificate Error

**Symptoms**: "Not Secure" warning or certificate mismatch

**Solutions**:

1. **Wait for Vercel Certificate**

   - Vercel auto-generates SSL via Let's Encrypt
   - Can take 5-30 minutes after DNS propagation
   - Check Vercel Dashboard → Settings → Domains

2. **Force SSL Renewal**

   - Vercel Dashboard → Settings → Domains
   - Click "Refresh" or "Regenerate Certificate"

3. **Check HTTPS Redirect**
   - Vercel automatically redirects HTTP → HTTPS
   - Verify `vercel.json` has no conflicting rules

---

### Issue: www Not Redirecting

**Symptoms**: `www.humbug.hu` doesn't redirect to apex

**Solutions**:

1. **Verify vercel.json Configuration**

   ```json
   {
     "redirects": [
       {
         "source": "/:path*",
         "has": [
           {
             "type": "host",
             "value": "www.humbug.hu"
           }
         ],
         "destination": "https://humbug.hu/:path*",
         "permanent": true
       }
     ]
   }
   ```

2. **Check CNAME Record**

   - Ensure www CNAME points to `cname.vercel-dns.com`
   - No trailing dot in CNAME value

3. **Redeploy Project**
   ```bash
   git push
   # Or in Vercel Dashboard: Deployments → Redeploy
   ```

---

### Issue: PWA Not Installing on Mobile

**Symptoms**: No "Add to Home Screen" prompt

**Solutions**:

1. **Check HTTPS**

   - PWA requires HTTPS (not HTTP)
   - Verify SSL certificate is valid

2. **Verify manifest.json**

   ```powershell
   # Test manifest loads
   Invoke-WebRequest https://humbug.hu/manifest.json
   ```

3. **Check Service Worker**

   - Visit `https://humbug.hu/sw.js`
   - Should show service worker code (not 404)
   - Open DevTools → Application → Service Workers
   - Status should be "Activated and running"

4. **Test PWA Criteria**
   - Open DevTools → Lighthouse
   - Run "Progressive Web App" audit
   - Fix any failing criteria

---

### Issue: Old Vercel Domain Still Showing

**Symptoms**: Content loads from `humbug-quiz.vercel.app` instead of `humbug.hu`

**Solutions**:

1. **Check Browser Cache**

   - Clear browser cache and cookies
   - Try incognito/private browsing mode

2. **Check Service Worker Cache**

   - DevTools → Application → Storage
   - Click "Clear site data"
   - Reload page

3. **Verify Canonical Tag**

   - View page source: `https://humbug.hu`
   - Look for: `<link rel="canonical" href="https://humbug.hu" />`

4. **Update Open Graph Tags**
   - Verify `og:url` meta tag shows `https://humbug.hu`
   - Test social share preview: [https://metatags.io](https://metatags.io)

---

## 🎯 Post-Setup Tasks

After successful domain configuration:

### 1. Update External References

- [ ] Update Google Search Console with new domain
- [ ] Submit new sitemap to search engines
- [ ] Update social media links (LinkedIn, Twitter, Facebook)
- [ ] Update any marketing materials or business cards

### 2. Monitor Performance

- [ ] Set up Vercel Analytics (Settings → Analytics)
- [ ] Monitor Core Web Vitals in production
- [ ] Check error rates in first 24 hours
- [ ] Verify analytics tracking (if implemented)

### 3. Security & Maintenance

- [ ] Enable Vercel's DDoS protection (automatic)
- [ ] Monitor Forpsi for renewal reminders
- [ ] Set calendar reminder for domain renewal (Oct 2026)
- [ ] Keep DNSSEC enabled at Forpsi

### 4. SEO Optimization

- [ ] Submit sitemap to Google Search Console
- [ ] Verify domain ownership in Search Console
- [ ] Check for crawl errors
- [ ] Monitor search rankings for "HUMBUG quiz" etc.

---

## 📊 Expected Timeline

| Task                       | Time              | Status            |
| -------------------------- | ----------------- | ----------------- |
| Configure Forpsi DNS       | 5-10 min          | ⏳ Pending        |
| Add domain to Vercel       | 2-3 min           | ⏳ Pending        |
| DNS propagation            | 15 min - 48 hrs   | ⏳ Pending        |
| SSL certificate generation | 5-30 min          | ⏳ Auto after DNS |
| First successful visit     | After propagation | ⏳ Pending        |
| PWA installation test      | After SSL         | ⏳ Pending        |

**Typical total time**: 1-2 hours for complete setup

---

## 🔗 Useful Resources

### Forpsi Documentation

- [Forpsi Admin Portal](https://admin.forpsi.com)
- [Forpsi DNS Help](https://www.forpsi.com/help/) (check for DNS articles)

### Vercel Documentation

- [Custom Domains Guide](https://vercel.com/docs/concepts/projects/domains)
- [DNS Configuration](https://vercel.com/docs/concepts/projects/domains/add-a-domain)
- [SSL Certificates](https://vercel.com/docs/concepts/edge-network/ssl)

### Testing Tools

- [DNS Checker](https://dnschecker.org) - Global DNS propagation
- [What's My DNS](https://whatsmydns.net) - Alternative DNS checker
- [SSL Server Test](https://www.ssllabs.com/ssltest/) - SSL certificate validation
- [Meta Tags Preview](https://metatags.io) - Social share preview

### Debugging Tools

- [Vercel Status](https://www.vercel-status.com) - Platform status
- [Google PageSpeed Insights](https://pagespeed.web.dev) - Performance testing
- Chrome DevTools → Network tab - Request inspection
- Chrome DevTools → Application tab - PWA debugging

---

## 💬 Need Help?

If you encounter issues:

1. **Check Vercel Dashboard Logs**

   - Deployments → Latest Deployment → Runtime Logs
   - Look for errors or warnings

2. **Review DNS Configuration**

   - Compare your Forpsi settings with this guide
   - Use `nslookup` commands to verify

3. **Test in Different Browsers**

   - Chrome, Firefox, Safari, Edge
   - Desktop and mobile versions

4. **Contact Support**
   - Forpsi Support: [support.forpsi.com](https://support.forpsi.com)
   - Vercel Support: [vercel.com/support](https://vercel.com/support)
   - GitHub Issues: [your-repo/issues](https://github.com/szolzol/humbug-quiz/issues)

---

<div align="center">

**🎉 Congratulations!**

Once configured, your HUMBUG! Quiz Party Game will be live at:

# [humbug.hu](https://humbug.hu)

_Professional, memorable, and ready to share with the world!_

</div>

---

**Last Updated**: January 2025  
**Domain Registered**: October 11, 2025  
**Domain Expires**: October 11, 2026

_Keep this guide for future reference and domain renewals._
