# GitHub Profile Analyzer

A comprehensive cross-platform mobile app built with React Native that allows users to analyze GitHub profiles with detailed statistics, visualizations, and insights.

## Features

### 🔍 Profile Analysis
- **User Input & Validation**: Clean username input with GitHub username validation
- **Recent Searches**: Persistent search history with quick access
- **Comprehensive Profile Data**: User information, repository statistics, and metrics

### 📊 Data Visualization
- **Language Analysis**: Interactive pie charts showing programming language distribution
- **Repository Insights**: Bar charts for most starred and forked repositories
- **Contribution Heatmap**: Visual representation of contribution activity
- **Activity Metrics**: Commit patterns, PR statistics, and issue tracking

### 🎯 Advanced Analytics
- **Productivity Insights**: Development patterns and project management metrics
- **Social Metrics**: Follower growth, network insights, and engagement
- **Repository Quality**: Maintainability scores and collaboration patterns
- **Historical Trends**: Activity over time with trend analysis

### 🎨 User Experience
- **Clean Modern UI**: Following platform design guidelines
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Responsive Design**: Optimized for mobile devices
- **Offline Capability**: Caching for previously viewed profiles
- **Performance Optimized**: Background data processing and efficient API usage

## Technical Stack

- **Framework**: React Native 0.81.4
- **Language**: TypeScript
- **State Management**: React Hooks
- **API Integration**: 
  - GitHub REST API v3
  - GitHub GraphQL API v4
- **Charts**: react-native-chart-kit
- **Storage**: AsyncStorage for caching and persistence
- **HTTP Client**: Axios with interceptors for rate limiting

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Charts.tsx      # Data visualization components
├── screens/            # Main app screens
│   ├── UserInputScreen.tsx
│   ├── ProfileOverviewScreen.tsx
│   └── AnalyticsScreen.tsx
├── services/           # API services
│   ├── githubAPI.ts    # REST API client
│   └── githubGraphQL.ts # GraphQL client
├── types/              # TypeScript type definitions
│   └── github.ts       # GitHub API types
└── utils/              # Utility functions
    └── theme.ts        # Theme configuration
```

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
