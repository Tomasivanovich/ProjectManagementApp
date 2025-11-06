import 'dotenv/config';

export default {
  expo: {
    name: "Project",
    slug: "Project",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "projectapp",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tomas.project"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.tomas.project",
      config: {
        googleSignIn: {
          certificateHash: "2E:25:54:1B:65:C9:AB:21:1A:EF:53:17:A0:60:21:CE:4E:0F:09:66"
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-font",
      "expo-web-browser"
    ],
    // AGREGAR ESTA SECCIÓN ↓
    extra: {
      eas: {
        projectId: "29a2cfe5-4915-4908-a18c-585f53e5c56f"
      },
      google: {
        androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.GOOGLE_WEB_CLIENT_ID,
        webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
        expoClientId: process.env.GOOGLE_WEB_CLIENT_ID
      }
    }
  }
};