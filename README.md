# CardSell — Firebase OTP V4 - Build Fix

This version replaces PostgreSQL with Firebase Firestore.

## Flow
Create Account → Firestore user record → Gmail OTP → Verify → active account + session → Dashboard.

## Firebase setup
1. Create a Firebase project and enable **Firestore Database**.
2. Open Project settings → Service accounts → Generate new private key.
3. Add the three Firebase Admin values to Vercel Environment Variables:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
4. Add the Gmail SMTP values from `.env.example`.
5. Use a Google **App Password** for `SMTP_PASS`; never commit it to GitHub.
6. Deploy/redeploy on Vercel.

## Firestore collections created by the app
- `users`
- `uniqueEmails`
- `uniqueMobiles`
- `otpChallenges`
- `signupSessions`
- `sessions`

No PostgreSQL is required for this version.


V6 fix: active OTP document ID is stored in signupSessions, avoiding composite Firestore query/index requirements during OTP verification and resend.
\n\nV7: Pending/unverified accounts can restart verification from Create Account or Login. Active accounts remain protected from duplicate registration.\n
## Admin Panel
Set `ADMIN_GMAIL` in Vercel to the Gmail address that should have admin access. The `/admin` page and admin APIs only allow the logged-in account matching this value.

## Admin Firebase Authentication
1. In Firebase Console → Authentication → Users, create the Admin user with the same Gmail as `ADMIN_GMAIL`.
2. Email/Password provider must be enabled.
3. In Firebase Console → Project settings → General, find the Web app configuration and copy its `apiKey` into Vercel as `FIREBASE_WEB_API_KEY`.
4. Keep `FIREBASE_WEB_API_KEY` in Vercel Environment Variables. It is a Firebase web API key, not the Admin SDK private key.
5. The Admin login is at `/admin/login` and uses a separate `cardsell_admin_session` cookie. Normal user login/OTP remains unchanged.
