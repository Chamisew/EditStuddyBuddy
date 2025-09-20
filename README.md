# StudyPro - Peer Learning App 📚

A social learning platform where students can share resources, find tutors, and collaborate on their educational journey. Built with React Native, Expo, and Firebase.

## 🚀 Features

### **Core Functionality**
- **User Authentication** - Secure signup/signin with Firebase Auth
- **User Profiles** - Complete profiles with subjects, expertise levels, and tutor status
- **Resource Sharing** - Upload and share study materials (PDFs, documents, images)
- **Social Feed** - Facebook-like feed showing recent posts and resources
- **Tutor Discovery** - Find experienced students offering tutoring
- **Search & Filter** - Search for tutors and resources by subject

### **User Experience**
- **Modern UI** - Clean, intuitive interface with smooth navigation
- **Real-time Updates** - Live data synchronization with Firebase
- **File Management** - Easy document upload and sharing
- **Profile Management** - Edit personal information and preferences

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Navigation**: Expo Router
- **UI Components**: React Native + Expo Vector Icons
- **File Handling**: Expo Document Picker

## 📱 Screens

1. **Authentication**
   - Sign In (`/signin`)
   - Sign Up (`/signup`) - Enhanced with profile setup

2. **Main App**
   - Home Feed (`/home`) - Social feed with tabs for Feed, Tutors, Resources
   - Profile (`/profile`) - User profile management
   - Upload Resource (`/upload-resource`) - File upload interface

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd my-firebase-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go (Android/iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## 🔥 Firebase Setup

The app is configured with Firebase. Make sure your Firebase project has:

1. **Authentication** enabled (Email/Password)
2. **Firestore Database** created
3. **Storage** enabled
4. **Security Rules** configured for your use case

### Firestore Collections
- `users` - User profiles and preferences
- `resources` - Shared study materials

## 📋 Usage Guide

### For Students
1. **Sign Up** - Create an account with your subjects and expertise level
2. **Browse Feed** - See recent posts and shared resources
3. **Find Tutors** - Search for experienced students in your subjects
4. **Share Resources** - Upload your study materials to help others
5. **Connect** - Message tutors and collaborate with peers

### For Tutors
1. **Enable Tutoring** - Check "I want to offer tutoring" during signup
2. **Build Profile** - Add your subjects and expertise level
3. **Share Knowledge** - Upload resources and help other students
4. **Get Discovered** - Students can find and contact you

## 🎯 Key Features Explained

### **Social Learning Feed**
- Like Facebook's news feed but for educational content
- Shows recent resource uploads, tutor announcements, and study requests
- Interactive with likes, comments, and sharing

### **Resource Management**
- Upload various file types (PDF, DOC, PPT, images)
- Add descriptions and categorize by subject
- Track downloads and popularity

### **Tutor Matching**
- Students can find tutors based on subjects
- View tutor ratings and student counts
- Direct messaging for coordination

## 🔧 Development

### Project Structure
```
app/
├── _layout.tsx          # Main navigation layout
├── home.js             # Main feed screen
├── signin.js           # Sign in screen
├── signup.js           # Sign up screen
├── profile.js          # User profile screen
└── upload-resource.js  # Resource upload screen

firebase/
└── firebaseConfig.js   # Firebase configuration

hooks/
└── useAuth.js          # Authentication hook
```

### Adding New Features
1. Create new screens in the `app/` directory
2. Update navigation in `_layout.tsx`
3. Add Firebase collections as needed
4. Test on both iOS and Android

## 🚀 Deployment

### Expo Build
```bash
# Build for production
expo build:android
expo build:ios
```

### Firebase Hosting (Web)
```bash
npm run web
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the Firebase documentation
- Review Expo documentation
- Open an issue in this repository

---

**Happy Learning! 📚✨**

add app
