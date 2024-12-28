// React Native imports
import { Alert, BackHandler, Button, Pressable, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useEffect, useState } from 'react';

// Application bottom bar screens
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';

// Other application screens
import LoginScreen from './screens/LoginScreen';
import MessagingWindow from './screens/MessagingWindow';
import InitialSetupScreen from './screens/InitialSetupScreen';
import ChatInfoScreen from './screens/ChatInfoScreen';
import PoliciesScreen from './screens/PoliciesScreen';
import AgeScreen from './screens/AgeScreen';

// Navigation library imports
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import 'react-native-gesture-handler';

// App state and global handlers
import { appState } from './lib/AppState';
import MessagingHandler from './lib/MessagingHandler';
import { serverInfo } from './lib/ServerInfo';

// Notification imports
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import UIDEntryScreen from './screens/UIDEntryScreen';

// Prevent screenshotting
import { usePreventScreenCapture, addScreenshotListener } from 'expo-screen-capture';
import RNExitApp from 'react-native-exit-app';

// Cryptography
import CryptoES from 'crypto-es';
import RSAKey from 'react-native-rsa-expo';
import uuid from 'react-native-uuid';

// Set the global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// The Expo EAS project id
const EXPO_PROJECT_ID = '0a28d370-c13d-4c08-a572-a8d30e00e05f';

/**
 * Sends a push notification to a specified user
 * @param {String} expoPushToken The push token to send a notification to
 * 
 * Copied from the Expo docs, https://docs.expo.dev/push-notifications/push-notifications-setup/.
 */
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

/**
 * Sets the client up to receive push notifications and generates a token
 * @returns The push notification token
 * 
 * Copied from the expo docs, https://docs.expo.dev/push-notifications/push-notifications-setup/.
 */
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log(finalStatus);
    }
    if (finalStatus !== 'granted') {
      alert('Push notification permission denied. Please go to settings and allow push notifications for the app.');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    })).data;
    appState.notifications.expoPushToken = token;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// Create the global navigation handlers
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Cache the options for the application screens
const appScreenOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: '#880808',
  },
  headerTintColor: '#fff',
};

// Cache the options for the login screens
const loginScreenOptions = {
  headerStyle: {
    backgroundColor: '#880808',
  },
  headerTintColor: '#fff'
};

// Create a stack for the chat screen
function ChatStack({ }) {
  return (
    <Stack.Navigator
      initialRouteName='ChatScreen'
      screenOptions={appScreenOptions}
    >
      <Stack.Screen
        name='ChatScreen'
        options={{ title: 'Chat' }}
      >
        {(props) => <ChatScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name='MessagingWindow'
        /* Change the Screen title based on the parameter passed to route in the navigation function */
        options={ ({ navigation, route }) => ({
          title: route.params.chatTitle, headerBackTitle: 'Chats',
          headerRight: () => {
            if (Platform.OS === 'ios') {
              return (
                <Button
                  onPress={() => { navigation.navigate('ChatInfoScreen', { chatTitle: route.params.chatTitle, chatId: route.params.chatId }) }}
                  title='Info'
                  color='#fff'
                />
              );
            }

            return (
              <TouchableOpacity
              onPress={() => { navigation.navigate('ChatInfoScreen', { chatTitle: route.params.chatTitle, chatId: route.params.chatId }) }}
              >
                <Text style={{
                  color: 'white',
                  padding: '4%',
                }}>INFO</Text>
              </TouchableOpacity>
            );
          }
        }) }
      >
        {(props) => {
          return <MessagingWindow {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen
        name='ChatInfoScreen'
        /* Change the Screen title based on the parameter passed to route in the navigation function */
        options={ ({ route }) => ({ title: `${route.params.chatTitle} Users`, headerBackTitle: `Chat` }) }
      >
        {(props) => {
          return <ChatInfoScreen {...props} />;
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Create a stack for the home screen
function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName='HomeScreen'
      screenOptions={appScreenOptions}
    >
      <Stack.Screen
        name='HomeScreen'
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
    </Stack.Navigator>
  );
}

// Create a stack for the settings screen
function SettingsStack() {
  return (
    <Stack.Navigator
      initialRouteName='SettingsScreen'
      screenOptions={appScreenOptions}
    >
      <Stack.Screen
        name='SettingsScreen'
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

// Create a function for the global app
export default function App() {
  // Store the login state information in the App state because it is irrelevant to global application and because the app needs to rerender when the login state is changed
  const [loginState, setLoginState] = useState({
    loginState: 0,
    privateKey: '',
    publicKey: '',
  });

  // When the app starts
  useEffect(() => {
    // If the push notifications have not been initialized
    if (appState.notifications.expoPushToken === null || appState.notifications.notificationListener === null || appState.notifications.responseListener === null) {
      // // Wait one second before prompting notifications
      // setTimeout(() => {
      //   // Register for push notifications and set the token in the global app state
      //   registerForPushNotificationsAsync().then(token => {
      //     console.log(`Registered for push notifications with token ${token}`)
      //     appState.notifications.expoPushToken = token;
      //   });

      //   // Set the notification listener
      //   appState.notifications.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      //     appState.notifications.currentNotification = notification;
      //   });

      //   // Set the response listener
      //   appState.notifications.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      //     // Handle this later
      //   });
      // }, 1000);

      // Register for push notifications and set the token in the global app state
      registerForPushNotificationsAsync().then(token => {
        console.log(`Registered for push notifications with token ${token}`)
        appState.notifications.expoPushToken = token;
      });

      // Set the notification listener
      appState.notifications.notificationListener = Notifications.addNotificationReceivedListener(notification => {
        appState.notifications.currentNotification = notification;
      });

      // Set the response listener
      appState.notifications.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        // Handle this later
      });

      /**
       * FUTURE DEVELOPMENT NOTICE:
       * The documentation at https://docs.expo.dev/push-notifications/push-notifications-setup/ had the following extra lines in its example:
        return () => {
          Notifications.removeNotificationSubscription(notificationListener.current);
          Notifications.removeNotificationSubscription(responseListener.current);
        };
       * All of which I deemed unnecessary for this application as the app uses global state management rather than App.js component level state.
       */
    }
  });;

  // When the login state is changed
  useEffect(() => {
    // If the login state is fully unlocked and the messaging handler is unset
    if (loginState.loginState === 1 && appState.messagingHandler === null) {
      // Create the messaging handler using the login state data
      appState.messagingHandler = new MessagingHandler(loginState.publicKey, loginState.privateKey);
    }
  }, [loginState]);

  // Handles setting the login state in child components
  const handleSetLoginState = (newLoginState) => {
    // Set the login state in the global state
    appState.loginState = newLoginState.loginState;
    // Set the application state
    setLoginState(newLoginState);
  }

  // Prevents screenshotting any portion of the application
  usePreventScreenCapture();

  // Screenshot lockout handler
  const handleScreenshotLock = () => {
    // Create the request data contents
    const contents = {
      requestIdentifier: uuid.v4(),
      lockoutRequest: 'Attempted screenshot',
    };

    // Hash the contents
    const payloadHash = CryptoES.SHA256(JSON.stringify(contents)).toString();

    // RSA encrypt the hash to sign the data
    const rsa = new RSAKey();
    rsa.setPrivateString(appState.messagingHandler.priKey);
    const signature = rsa.encryptPrivate(payloadHash);

    // Send the lockout request to the server
    fetch(serverInfo.serverAddress + '/api/v1/lockout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authToken: appState.messagingHandler.pubKey,
        signature: signature,
        contents: contents,
      }),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      Alert.alert(
        'Unknown Server Error',
        `An unknown error has occurred. Please contact support for further assistance. Code E110.`,
        [
          { text: 'Ok', onPress: () => {
            // Exit the app once OK is pressed
            // RNExitApp.exitApp();
          } }
        ],
        { cancelable: false },
      );
    });
  };

  // If a user attempts to screenshot the application, lock the user out
  //addScreenshotListener(handleScreenshotLock);

  // If the login state is not logged in
  if (loginState.loginState === 0) {
    // Return the login screen state
    return (
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name='Login' options={loginScreenOptions}>
              {(props) => <LoginScreen {...props} setAppLoginState={handleSetLoginState} />}
            </Stack.Screen>
            <Stack.Screen name='Policies Screen' options={loginScreenOptions}>
              {(props) => <PoliciesScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name='Age Verification' options={loginScreenOptions}>
              {(props) => <AgeScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name='UID Entry' options={loginScreenOptions}>
              {(props) => <UIDEntryScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name='Initial Setup' options={loginScreenOptions}>
              {(props) => <InitialSetupScreen {...props} />}
            </Stack.Screen>
          </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // If the app is fully unlocked
  if (loginState.loginState === 1) {
    // Return the full application
    return (
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName='Home'
          screenOptions={{
            headerShown: false,
            tabBarLabelStyle: {
              color: 'white',
              fontWeight: 'bold',
            },
            tabBarStyle: {
              backgroundColor: '#880808'
            },
            tabBarActiveTintColor: '#d4af37',
            tabBarInactiveTintColor: 'white',
          }}
        >
          <Tab.Screen
            name='Chat'
            options={{
              tabBarLabel: 'Chat',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name='message' color={color} size={size} />
              ),
            }}
          >
            {(props) => <ChatStack {...props} />}
          </Tab.Screen>
          <Tab.Screen
            name='Home'
            component={HomeStack}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name='home' color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name='Settings'
            component={SettingsStack}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name='cog' color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  // If the app is in lockdown mode (partial/pseudo unlock)
  if (loginState.loginState === 2) {
    // Return the navigator without the chat option
    return (
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName='Home'
          screenOptions={{
            headerShown: false
          }}
        >
          <Tab.Screen
            name='Home'
            component={HomeStack}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name='home' color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name='Settings'
            component={SettingsStack}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name='cog' color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  // The navigation had an error, display that
  return (
    <View>
      <Text>There was an error with the navigation system, code APP10.</Text>
    </View>
  );
}