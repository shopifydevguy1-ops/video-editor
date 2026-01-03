# How to Generate JWT Secrets

## What Are JWT Secrets?

JWT secrets are **random strings** that you generate yourself. They're used to:
- **Sign** JWT tokens when users log in
- **Verify** JWT tokens when users make authenticated requests

**Important**: These are NOT provided by any service - you must generate them yourself!

---

## 🔐 Quick Generation Methods

### Method 1: Using Node.js (Recommended)

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this **twice** to get two different secrets:
- First run → Use for `JWT_SECRET`
- Second run → Use for `JWT_REFRESH_SECRET`

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
```

### Method 2: Using OpenSSL

```bash
openssl rand -hex 64
```

Run this **twice** to get two different secrets.

### Method 3: Using Online Generator (Less Secure)

You can use: https://randomkeygen.com/
- Use the "CodeIgniter Encryption Keys" section
- Generate two different keys
- Use 64+ character keys

### Method 4: Using Python

```bash
python3 -c "import secrets; print(secrets.token_hex(64))"
```

Run this **twice** to get two different secrets.

---

## 📝 How to Use

### For Local Development

Add to `backend/.env`:
```env
JWT_SECRET=your-generated-secret-here-64-characters-or-more
JWT_REFRESH_SECRET=your-generated-refresh-secret-here-64-characters-or-more
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### For Production (Render/Fly.io/etc.)

Add as environment variables in your deployment platform:

**Render:**
1. Go to your service → "Environment" tab
2. Add:
   - `JWT_SECRET` = your generated secret
   - `JWT_REFRESH_SECRET` = your generated refresh secret

**Fly.io:**
```bash
fly secrets set JWT_SECRET="your-generated-secret"
fly secrets set JWT_REFRESH_SECRET="your-generated-refresh-secret"
```

**Railway:**
1. Go to your service → "Variables" tab
2. Add the secrets

---

## ✅ Best Practices

1. **Generate Different Secrets**: 
   - `JWT_SECRET` and `JWT_REFRESH_SECRET` should be **completely different**
   - Never reuse the same secret for both

2. **Use Long Secrets**:
   - Minimum 32 characters
   - Recommended: 64+ characters
   - The longer, the more secure

3. **Keep Them Secret**:
   - Never commit to Git
   - Never share publicly
   - Store only in environment variables

4. **Use Different Secrets for Different Environments**:
   - Development: One set of secrets
   - Production: Different set of secrets
   - Staging: Another set of secrets

5. **Rotate Periodically**:
   - Change secrets every 6-12 months
   - When rotating, users will need to log in again

---

## 🚀 Quick Start

### Step 1: Generate Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (run again to get different value)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 2: Copy the Output

You'll get something like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
```

### Step 3: Use in Environment Variables

```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
JWT_REFRESH_SECRET=b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3
```

---

## 🔍 What If I Don't Set These?

If you don't set JWT secrets:
- Users **cannot log in**
- Authentication will **fail**
- The backend will throw errors

**Always set these before deploying!**

---

## 💡 Example: Complete Setup

```bash
# 1. Generate secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# 2. Add to .env file
echo "JWT_SECRET=$JWT_SECRET" >> backend/.env
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" >> backend/.env

# 3. For production, add to deployment platform
# (Copy the values and paste in Render/Fly.io/etc. dashboard)
```

---

## ❓ FAQ

**Q: Can I use the same secret for both?**
A: No! Always use different secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

**Q: How long should the secret be?**
A: At least 32 characters, preferably 64+ characters.

**Q: Can I use a simple password?**
A: No! Use cryptographically secure random strings. Simple passwords are easy to guess.

**Q: What happens if I lose my secrets?**
A: Users will need to log in again. Generate new secrets and update your environment variables.

**Q: Do I need to remember these?**
A: No, just store them securely in environment variables. You don't need to memorize them.

---

## 🎯 Summary

1. **Generate** two random secrets (64+ characters each)
2. **Use different** secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`
3. **Store** in environment variables (never in code)
4. **Never commit** to Git
5. **Use different** secrets for dev/prod environments

That's it! You're ready to secure your authentication system.

