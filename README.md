# BoardingHub

A comprehensive boarding house management system built with React Native and Expo, featuring Firebase authentication and real-time data management.

## 🏠 About BoardingHub

BoardingHub is a mobile application designed to streamline boarding house management for both landlords and tenants. It provides separate dashboards for different user types with authentication and user management capabilities.

### Features

- 🔐 **Firebase Authentication** - Secure login/signup system
- 👥 **Dual User Types** - Separate interfaces for landlords and tenants
- 📱 **Cross-Platform** - Works on iOS, Android, and Web
- 🎨 **Modern UI** - Clean, intuitive interface with dark/light theme support
- 🔄 **Real-time Data** - Firebase Firestore integration
- 🔒 **Password Reset** - Email-based password recovery

## 🚀 Getting Started

### Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)
- **Expo CLI** (optional but recommended)

For mobile development:

- **Android Studio** (for Android development)
- **Xcode** (for iOS development - Mac only)

### 1. Clone the Repository

```bash
git clone https://github.com/Rensu2k/BoardingHub.git
cd BoardingHub
```

### 2. Install Dependencies

```bash
npm install
```

_Or if you prefer yarn:_

```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with your Firebase configuration:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**⚠️ Important:** Get these values from your Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings → General → Your apps
4. Copy the configuration values

### 4. Firebase Setup

1. **Enable Authentication:**

   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password" authentication

2. **Setup Firestore Database:**

   - Go to Firebase Console → Firestore Database
   - Create database (start in test mode for development)

3. **Configure Firestore Rules** (optional, for production):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### 5. Start the Development Server

```bash
npx expo start
```

This will start the Metro bundler and show a QR code in your terminal.

### 6. Run on Your Device/Emulator

#### Option A: Physical Device

1. Install **Expo Go** app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code with your camera (iOS) or Expo Go app (Android)

#### Option B: Android Emulator

```bash
npm run android
# or
npx expo run:android
```

#### Option C: iOS Simulator (Mac only)

```bash
npm run ios
# or
npx expo run:ios
```

#### Option D: Web Browser

```bash
npm run web
# or
npx expo start --web
```

## 📁 Project Structure

```
BoardingHub/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   │   ├── login.jsx      # Login screen
│   │   └── signup.jsx     # Signup screen
│   ├── landlord/          # Landlord-specific screens
│   ├── tenant/            # Tenant-specific screens
│   └── _layout.jsx        # Root layout
├── components/            # Reusable UI components
├── constants/             # App constants and configuration
│   ├── Colors.js          # Color scheme definitions
│   └── firebase.js       # Firebase configuration
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
│   ├── auth-helpers.js    # Authentication helper functions
│   └── userManagement.js  # User management utilities
├── assets/               # Images, fonts, and static assets
├── .env                  # Environment variables (create this)
├── app.json              # Expo configuration
└── package.json          # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality

## 👥 User Types

### Landlord Features

- Property management dashboard
- Tenant management
- Property information tracking

### Tenant Features

- Tenant dashboard
- Profile management
- Boarding house information

## 🔐 Authentication Flow

1. **Signup Process:**

   - Choose user type (Tenant/Landlord)
   - Fill personal information
   - Additional fields based on user type
   - Account creation with Firebase Auth
   - Profile storage in Firestore

2. **Login Process:**

   - Email/password authentication
   - User type detection from Firestore
   - Automatic routing to appropriate dashboard

3. **Password Reset:**
   - Email-based password recovery
   - Firebase Auth password reset functionality

## 🛠️ Development

### Code Style

This project uses ESLint for code quality. Run the linter with:

```bash
npm run lint
```

### Environment Variables

Never commit `.env` files to version control. The `.env` file contains sensitive Firebase configuration.

## 📱 Building for Production

### Android APK

```bash
npx expo build:android
```

### iOS IPA

```bash
npx expo build:ios
```

### Web Build

```bash
npx expo export:web
```

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler won't start:**

   ```bash
   npx expo start --clear
   ```

2. **Dependencies issues:**

   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Firebase connection issues:**

   - Verify your `.env` file configuration
   - Check Firebase project settings
   - Ensure authentication is enabled

4. **Build failures:**
   - Check Expo CLI version: `npx expo --version`
   - Update Expo CLI: `npm install -g @expo/cli`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Rensu2k/BoardingHub/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🚀 Deployment

This app can be deployed using:

- **Expo Application Services (EAS)** for app store distribution
- **Expo Web** for web deployment
- **Firebase Hosting** for web hosting

---

**Happy Coding! 🎉**
