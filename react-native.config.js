module.exports = {
  project: {
    ios: {},
    android: {
      packageName: 'com.anonymous.AppCables',
    },
  },
  dependencies: {
    '@react-native-async-storage/async-storage': {
      platforms: {
        android: {
          sourceDir: '../node_modules/@react-native-async-storage/async-storage/android',
          packageImportPath: 'io.github.reactnativecommunity.asyncstorage.AsyncStoragePackage',
        },
      },
    },
    'react-native-gesture-handler': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-gesture-handler/android',
          packageImportPath: 'com.swmansion.gesturehandler.RNGestureHandlerPackage',
        },
      },
    },
    'react-native-reanimated': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-reanimated/android',
          packageImportPath: 'com.swmansion.reanimated.ReanimatedPackage',
        },
      },
    },
    'react-native-safe-area-context': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-safe-area-context/android',
          packageImportPath: 'com.th3rdwave.safeareacontext.SafeAreaContextPackage',
        },
      },
    },
    'react-native-screens': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-screens/android',
          packageImportPath: 'com.swmansion.rnscreens.RNScreensPackage',
        },
      },
    },
    'react-native-vector-icons': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-vector-icons/android',
          packageImportPath: 'com.oblador.vectoricons.VectorIconsPackage',
        },
      },
    },
    'react-native-webview': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-webview/android',
          packageImportPath: 'com.reactnativecommunity.webview.RNCWebViewPackage',
        },
      },
    },
    'react-native-date-picker': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-date-picker/android',
          packageImportPath: 'com.henninghall.date_picker.DatePickerPackage',
        },
      },
    },
    'react-native-edge-to-edge': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-edge-to-edge/android',
          packageImportPath: 'com.zoontek.rnedgetoedge.EdgeToEdgePackage',
        },
      },
    },
  },
};
