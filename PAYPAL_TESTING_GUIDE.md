# 🧪 PayPal Testing Guide

## 🎯 How to Test PayPal Payment

### Step 1: Start the Payment Flow
1. Go to https://itsworth.app
2. Analyze any token (e.g., "Bitcoin" or "Ethereum")
3. Click **"Unlock full report"**
4. You should see a modal with two options:
   - 💳 **Credit / Debit Card** (Stripe)
   - 🔵 **PayPal**
5. Click on **PayPal**

### Step 2: PayPal Sandbox Login
You'll be redirected to PayPal Sandbox. You need to use **test accounts**:

#### Option A: Use PayPal's Default Test Accounts
PayPal provides default test buyer accounts. Look for these in PayPal Developer Dashboard:
- **Email**: Any test buyer email from your PayPal app
- **Password**: The test password for that account

#### Option B: Create Your Own Test Account
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. **Sandbox** → **Accounts**
3. Create a new **Personal** account (buyer)
4. Use the email/password from that account

### Step 3: Complete the Payment
1. Login to PayPal with test credentials
2. Review the payment details:
   - **Amount**: $2.99
   - **Description**: Premium Crypto Analysis Report
3. Click **"Pay Now"** or **"Continue"**
4. You'll be redirected back to https://itsworth.app?payment=success

### Step 4: Verify Success
After successful payment:
1. You should be redirected to the **result screen**
2. The button should change from **"Unlock full report"** to **"Download full report"**
3. You should see a timer showing "Premium access expires in X minutes"
4. You can now download the full PDF report

## 🔧 Troubleshooting

### If PayPal login doesn't work:
- Make sure you're using **Sandbox credentials**, not real PayPal account
- Check that the test account is **activated** in PayPal Developer Dashboard

### If payment doesn't complete:
- Check browser console for errors
- Check Netlify Function logs for any issues
- Make sure you're not using real money (should be Sandbox)

### If redirect doesn't work:
- Check that `return_url` is set to `https://itsworth.app?payment=success`
- Make sure the site URL is correct

## 📊 Expected Flow

```
1. itsworth.app → Choose PayPal → PayPal Sandbox
2. PayPal Sandbox → Login with test account → Review payment
3. PayPal Sandbox → Confirm payment → Redirect to itsworth.app
4. itsworth.app → Show success → Enable full report download
```

## 🎭 Test Account Creation

If you need to create a new test account:

1. **PayPal Developer Dashboard**: https://developer.paypal.com/
2. **Sandbox** → **Accounts** → **Create Account**
3. **Account Type**: Personal (for buyer testing)
4. **Country**: Your choice
5. **Currency**: USD
6. **Email**: Will be auto-generated
7. **Password**: Set your own test password

## 💡 Tips

- **No real money** will be charged in Sandbox mode
- You can test the **same payment multiple times**
- **Premium access lasts 1 hour** per payment
- Each **token requires separate payment** (by design)

## 🚨 Important Notes

- **Sandbox Mode**: All payments are fake/test payments
- **Real Money**: Will only be charged when you switch to Production mode
- **Credentials**: Make sure PayPal credentials are set in Netlify environment variables

---

**Ready to test?** Start with Step 1 above! 🚀
