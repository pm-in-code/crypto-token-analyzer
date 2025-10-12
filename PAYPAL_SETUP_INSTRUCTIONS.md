# 🚀 PayPal Integration Setup Guide

## 📋 Quick Setup Steps

### 1. Add Environment Variables to Netlify

#### Option A: Manual Entry (Recommended)
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site (crypto-token-analyzer / itsworth.app)
3. Navigate to: **Site configuration** → **Environment variables**
4. Click **"Add a variable"** and add each of these:

```
Key: PAYPAL_CLIENT_ID
Value: AcGq4K7pDqR6xZHMWDo5Q7wZJJN4jYzW2zLVxX7cGvGnOC8JYm4lXOy2gzgzJzQ5OzKnKzNzKzMzLzI

Key: PAYPAL_SECRET
Value: ELtwjJWFUXLMHbKu9eFNXhtgrmmvzokC2Jh_vqUh453jBnseTCxiSkPFAAZsoAm66j2z-Io8y3Rz-Vcx

Key: PAYPAL_API_URL
Value: https://api-m.sandbox.paypal.com
```

#### Option B: Import from File
1. Open the file `netlify-env-paypal.txt`
2. Copy the variable names and values
3. Use Netlify's "Import from .env" feature if available
4. Or paste manually as shown in Option A

### 2. Trigger a Redeploy

After adding variables:
1. Go to **Deploys** tab in Netlify
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete (~2-3 minutes)

### 3. Test PayPal Integration

1. Visit your site: https://itsworth.app
2. Analyze any token
3. Click **"Unlock full report"**
4. You should see a modal with TWO payment options:
   - 💳 **Credit / Debit Card** (Stripe)
   - 🔵 **PayPal**
5. Click on **PayPal** option
6. You'll be redirected to PayPal Sandbox
7. Use these test credentials to login:

**PayPal Sandbox Test Account:**
- Email: Any valid sandbox test account
- Password: Your sandbox password
- Or use PayPal's test buyer accounts

8. Complete the payment
9. You'll be redirected back to itsworth.app
10. You should now see the "Download full report" button

## 🔧 Troubleshooting

### If PayPal button doesn't work:
1. Check Netlify Functions logs:
   - Netlify Dashboard → Functions → Select `server` function → View logs
2. Look for errors related to PayPal
3. Verify all 3 PayPal environment variables are set correctly

### If getting "PayPal not configured" error:
- Double-check that `PAYPAL_SECRET` variable is set in Netlify
- Make sure you triggered a redeploy after adding variables

### If redirected but payment doesn't register:
- Check browser console for errors
- Verify localStorage is enabled in browser
- Try clearing browser cache and localStorage

## 📊 Current Configuration

✅ **Sandbox Mode** (Testing)
- No real money charged
- Can test unlimited times
- Use PayPal test accounts

## 🎯 Moving to Production

When ready to accept real PayPal payments:

1. Get Production PayPal credentials:
   - Login to [PayPal Developer Dashboard](https://developer.paypal.com/)
   - Switch from Sandbox to Live
   - Create a Live App
   - Get your Live Client ID and Secret

2. Update Netlify environment variables:
```
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_SECRET=your_live_secret_here
PAYPAL_API_URL=https://api-m.paypal.com
```

3. Redeploy the site

## 📁 Files Created

- `netlify-env-paypal.txt` - Just PayPal variables
- `netlify-env-complete.txt` - All environment variables template
- `PAYPAL_SETUP_INSTRUCTIONS.md` - This guide

## ✨ Features

- 💳 Stripe + PayPal dual payment system
- 🎨 Beautiful payment method selection modal
- 💰 $2.99 pricing for both methods
- ⏱️ 1 hour premium access per payment
- 🔒 Per-token payment tracking
- 🔄 Automatic state management

## 🆘 Need Help?

If you encounter any issues:
1. Check Netlify Function logs
2. Check browser console logs
3. Verify all environment variables are set
4. Ensure you redeployed after adding variables

---

**Note:** This is a sandbox configuration. No real money will be charged during testing.

