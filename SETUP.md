# Wanderlust — Setup Guide

Your private travel photo gallery, powered by Firebase.

---

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Name it something like `wanderlust-gallery`
4. Disable Google Analytics (not needed) → **Create Project**

## 2. Enable Authentication

1. In the Firebase console sidebar, go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable **Email/Password**
4. Go to the **Users** tab → click **"Add user"**
5. Enter your email and a password — this is your login for the gallery
6. **Important:** Don't share these credentials. Only you should have an account.

## 3. Create a Firestore Database

1. In the sidebar, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a region close to you (e.g. `asia-southeast1` for Singapore, `europe-west2` for London)
5. After creation, go to the **Rules** tab
6. Replace the default rules with the contents of `firestore.rules` from this project:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

7. Click **Publish**

## 4. Enable Storage

1. In the sidebar, go to **Build → Storage**
2. Click **"Get started"** → **Start in production mode** → pick the same region
3. Go to the **Rules** tab and replace with the contents of `storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click **Publish**

## 5. Register a Web App & Get Config Keys

1. In the Firebase console, go to **Project Settings** (gear icon → Project settings)
2. Scroll down to **"Your apps"** → click the **web icon** (`</>`)
3. Nickname: `wanderlust` → **Register app**
4. You'll see a config object like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "wanderlust-gallery.firebaseapp.com",
  projectId: "wanderlust-gallery",
  storageBucket: "wanderlust-gallery.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. Open `src/firebase.js` in this project and **replace the placeholder values** with your real config.

## 6. Install & Run Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` — log in with the email/password you created in Step 2.

## 7. Deploy to Firebase Hosting (Free)

```bash
# Install Firebase CLI (one time)
npm install -g firebase-tools

# Log in to Firebase
firebase login

# Initialize hosting (when prompted, select your project)
firebase init hosting
# → Use "dist" as the public directory
# → Configure as single-page app: Yes
# → Don't overwrite index.html

# Build and deploy
npm run build
firebase deploy
```

Your gallery will be live at `https://your-project-id.web.app` 🎉

---

## Architecture

```
Firebase Auth          → Login (email/password)
Firestore              → Trip metadata (name, date, cover, photo count)
  /users/{uid}/trips/{tripId}
  /users/{uid}/trips/{tripId}/photos/{photoId}
Firebase Storage       → Actual photo files (compressed JPEG)
  /users/{uid}/trips/{tripId}/{filename}
Firebase Hosting       → The React app itself
```

## Security

- **Firestore rules** ensure each user can only access their own documents
- **Storage rules** ensure each user can only access their own folder
- **No public access** — everything requires authentication
- Photos are **compressed client-side** (max 2000px, 82% JPEG quality) before upload to save storage

## Free Tier Limits

| Resource        | Free Limit           | Roughly...                    |
|-----------------|----------------------|-------------------------------|
| Storage         | 5 GB                 | ~2,500 compressed photos      |
| Downloads       | 1 GB/day             | ~500 photo views/day          |
| Firestore reads | 50,000/day           | More than enough              |
| Hosting         | 10 GB/month transfer | Plenty for personal use       |

---

## Optional: Custom Domain

1. In Firebase Console → Hosting → **Add custom domain**
2. Follow the DNS verification steps
3. Free SSL certificate included

## Troubleshooting

- **"Permission denied"** → Check that Firestore/Storage rules are published correctly
- **Photos not loading** → Verify `storageBucket` in firebase.js matches your project
- **Can't log in** → Make sure you created a user in Authentication → Users
