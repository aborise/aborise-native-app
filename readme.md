To get started with the "aborise" project, follow these steps:

1. Clone the repository to your local machine.
2. Install the latest version of Node.js and npm.
3. Install Expo CLI by running `npm install -g eas-cli`.
4. Install the project dependencies by running `npm install`.

Once you have completed these steps, you can use the following scripts to run the project:

- `npm start` or `npm run start`: Starts dev server

- `npm run android`: Should open android emulator
- `npm run ios`: Should open ios emulator
- `npm run run`: Pulls the latest server build and runs it.
- `npm run emulator`: Starts ulimas android emulator :D.

- `npm run build`: Builds the app using EAS (iOS & Android).
- `npm run build:server`: Builds the Android app on the server.
- `npm run build:simulator`: Builds the ios app on the server.
- `eas build:run -p ios`: Installs build on ios simulator.

- `eas submit -p ios`: Submit to the Apple App Store
- `eas submit -p android`: Submit to the Google Play Store

# Release

- Increase build number (ios) and versionCode (android)
- Make ios build (`eas build -p ios`) and preview build for android (`npm run build:preview`)
- Internal testing
- Build android for production (`eas build -p android`)
- `eas submit -p ios` (only works for ios for now => manual upload for android)
- Release builds
- Send mail
