import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Button, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import RSAKey from 'react-native-rsa-expo';
import { appState } from '../lib/AppState';
import CryptoES from 'crypto-es';
import { serverInfo } from '../lib/ServerInfo';
import { TouchableWithoutFeedback } from 'react-native';
import KeyboardDismissContainer from '../lib/KeyboardDismissContainer';
import * as SecureStore from 'expo-secure-store';
import Authenticator from '../lib/Authenticator';

const InitialSetupScreen = ({ route, navigation }) => {
  // Input box state
  const [securePassword, setSecurePassword] = useState('');
  const [pseudoPassword, setPseudoPassword] = useState('');
  // Whether the app is currently generating keys
  const [working, setWorking] = useState(false);

  const setupHandler = async () => {
    // Set the working state to prevent duplicate actions
    setWorking(true);
            
    // Handles asynchronously generating the keys
    const generateAndRequest = async () => {
      // Generate the keys
      const keys = Authenticator.createKeypair(securePassword, pseudoPassword);
      // Set the key items in SecureStore
      SecureStore.setItemAsync('userPublicKey', keys.publicKey);
      SecureStore.setItemAsync('userPrivateKey', keys.privateKey);
      SecureStore.setItemAsync('userSecurePasscode', JSON.stringify(keys.securePasscode));
      SecureStore.setItemAsync('userPseudoPasscode', JSON.stringify(keys.pseudoPasscode));
      
      // Make the request to the server to create the account
      fetch(serverInfo.serverAddress + '/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UID: appState.setupUID,
          rsaKey: keys.publicKey,
          expoPushToken: appState.notifications.expoPushToken,
        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        // If the response failed
        if (responseJson.failed) {
          Alert.alert(
            'Account creation failed',
            `Account creation failed with reason '${responseJson.message}'. Force-close the app and try again.`,
            [
              { text: 'Ok', onPress: () => {
                SecureStore.deleteItemAsync('userPublicKey');
                SecureStore.deleteItemAsync('userPrivateKey');
                SecureStore.deleteItemAsync('userSecurePasscode');
                SecureStore.deleteItemAsync('userPseudoPasscode');
              } }
            ],
            { cancelable: false },
          );
        }
        // Otherwise, the response succeded
        else {
          navigation.replace('Login');
        }
      });
    }

    // Call the asynchronous generation method after 500ms
    setTimeout(() => {
      generateAndRequest();
    }, 100);
  }

  const setupInitiatedHandler = () => {
    async function _setupInitiatedHandler() {
      // Validate the input to securePassword and pseudoPassword
      if (securePassword.length !== 6 || pseudoPassword.length !== 6) {
        Alert.alert(
          'Invalid entries',
          'Both passcodes must be 6 digits.',
          [
            { text: 'Ok', onPress: () => {} }
          ],
          { cancelable: false },
        );
        return;
      }

      // Validate the notification token
      if (appState.notifications.expoPushToken === null || typeof appState.notifications.expoPushToken !== 'string') {
        // Alert the user
        Alert.alert(
          'Notification error',
          `The application's notification tokens are malformed. Please force-close the app or restart your device and try again.`,
          [
            { text: 'Ok', onPress: () => {} }
          ],
          { cancelable: false },
        );
        return;
      }

      setupHandler();
    }

    if (!working) {
      _setupInitiatedHandler();
    }
  }

  // If currently loading
  if (working) {
    // Return the loading state
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator></ActivityIndicator>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardDismissContainer>
        <View style={style.container}>
          <Text style={style.titleText}>Activate Your Account</Text>
          <Text style={style.descriptionText}>Please create a secure passcode. When entered at login, this passcode will unlock the full, unrestricted version of the app.</Text>
          <TextInput
            value={securePassword}
            onChangeText={(securePassword) => setSecurePassword(securePassword)}
            placeholder={'Secure Password'}
            style={style.inputBox}
            keyboardType={'number-pad'}
          />
          <Text style={style.descriptionText}>Please create a pseudo passcode. When entered at login, this passcode will unlock a limited version of the app without private chats.</Text>
          <TextInput
            value={pseudoPassword}
            onChangeText={(pseudoPassword) => setPseudoPassword(pseudoPassword)}
            placeholder={'Pesudo Pasword'}
            style={style.inputBox}
            keyboardType={'number-pad'}
          />
          <Button
            onPress={() => { setupInitiatedHandler(); }}
            title={'Activate'}
            accessibilityLabel={'Activate your account'}
          />
        </View>
      </KeyboardDismissContainer>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  // Style for the outer pager box
  container: {
    paddingHorizontal: '7.5%',
    paddingVertical: '4.5%',
    marginHorizontal: '4.5%',
    marginTop: '4.5%',

    backgroundColor: 'white',

    // Round the edges of the box
    borderWidth: 0,
    borderRadius: 10,

    // Add a drop shadow
    shadowColor: '#171717',
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 4},
    shadowRadius: 3,
  },
  // Style for the 'Send Page' title text
  titleText: {
    fontSize: 30,
    fontWeight: '600',

    marginBottom: 20,
  },
  // Style for the description text
  descriptionText: {
    fontSize: 15,
    fontWeight: '300',

    marginBottom: 15,
  },
  // Style for the group name and message input boxes
  inputBox: {
    width: '100%',
    padding: '4%',

    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#B7B7B7',

    marginBottom: 25,
  }
});

export default InitialSetupScreen;