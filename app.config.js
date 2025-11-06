import 'dotenv/config';

export default {
  expo: {
    name: "P.M.A",
    slug: "Project Management App",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    // ✅ SCHEME CORRECTO para que Google pueda redirigir a tu app
    scheme: "com.tomas.project", // O "projectapp" si prefieres
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
      package: "com.tomas.project",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      // ✅ INTENT FILTER para Android
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "com.tomas.project", // DEBE coincidir con el scheme de arriba
              host: "auth"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-font",
      "expo-web-browser"
    ],
    extra: {
      eas: {
        projectId: "29a2cfe5-4915-4908-a18c-585f53e5c56f"
      },
      google: {
        androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
        expoClientId: process.env.GOOGLE_WEB_CLIENT_ID
      }
    }
  }
};