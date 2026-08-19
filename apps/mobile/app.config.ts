import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  const branchId = process.env.EXPO_PUBLIC_BRANCH_ID;
  const appName = process.env.EXPO_PUBLIC_APP_NAME;
  const appSlug = process.env.EXPO_PUBLIC_APP_SLUG;
  const androidPackage = process.env.EXPO_PUBLIC_ANDROID_PACKAGE;
  const iosBundle = process.env.EXPO_PUBLIC_IOS_BUNDLE;

  if (!isDev) {
    if (!branchId || !appName || !appSlug || !androidPackage || !iosBundle) {
      throw new Error(
        "Production builds require all branch identity variables to be set: " +
        "EXPO_PUBLIC_BRANCH_ID, EXPO_PUBLIC_APP_NAME, EXPO_PUBLIC_APP_SLUG, " +
        "EXPO_PUBLIC_ANDROID_PACKAGE, EXPO_PUBLIC_IOS_BUNDLE"
      );
    }
  }

  return {
    ...config,
    name: appName || "SchoolOS Default",
    slug: appSlug || "schoolos-default",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/expo.icon",
      bundleIdentifier: iosBundle || "com.schoolos.default",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      predictiveBackGestureEnabled: false,
      package: androidPackage || "com.schoolos.default",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          image: "./assets/images/splash-icon.png",
          imageWidth: 76
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  };
};
