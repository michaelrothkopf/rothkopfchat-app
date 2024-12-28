import { Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Authenticator from '../lib/Authenticator';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { appState } from '../lib/AppState';
import KeyboardDismissContainer from '../lib/KeyboardDismissContainer';

const LoginScreen = ({ route, navigation, setAppLoginState }) => {
  // Whether the login screen is currently ready to accept a login
  const [loginIsReady, setLoginIsReady] = useState(false);
  // The loaded security data from the SecureStore
  const [securityData, setSecurityData] = useState({
    publicKey: '',
    privateKey: '',
    securePasscode: '',
    pseudoPasscode: '',
  });
  // The passcode the user has entered into the box
  const [passcode, setPasscode] = useState('');

  // Create and validate the security data for the component state
  useEffect(() => {
    async function _effect() {
      // Set the setup UID to null
      appState.setupUID = null;
      
      // Attempt to fetch the key data
      const publicKey = await SecureStore.getItemAsync('userPublicKey');
      const privateKey = await SecureStore.getItemAsync('userPrivateKey');
      const securePasscode = await SecureStore.getItemAsync('userSecurePasscode');
      const pseudoPasscode = await SecureStore.getItemAsync('userPseudoPasscode');

      // console.log('prist:', privateKey, 'pubst:', publicKey)

      // If the key data is invalid, go to the PoliciesScreen screen
      if (!(publicKey && privateKey && securePasscode && pseudoPasscode)) {
        navigation.replace('Policies Screen');
        // Return to avoid parsing attempt on a null string
        return;
      }

      // The key data is valid, parse it
      setSecurityData({
        publicKey,
        privateKey,
        securePasscode,
        pseudoPasscode,
      });

      setLoginIsReady(true);
    }

    _effect();
  }, []);

  // Hanldes when the login button is pressed
  const loginHandler = () => {
    // Attempt to unlock the app
    const result = Authenticator.unlock(securityData, passcode);

    // No change necessary, login failed
    if (result === 0) {
      return;
    }

    // Set the parent state
    setAppLoginState(result);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <KeyboardDismissContainer>
          <View style={style.container}>
            <Text style={style.titleText}>Log In</Text>
            <Text style={style.descriptionText}>Please enter your passcode.</Text>
            <TextInput
              value={passcode}
              onChangeText={(passcode) => setPasscode(passcode)}
              placeholder={'Passcode'}
              style={style.inputBox}
              keyboardType={'number-pad'}
              autoFocus={true}
            />
            <Button onPress={() => {
              loginHandler();
            }} title='Log In'></Button>
            {/* <Button onPress={() => {
              SecureStore.deleteItemAsync('userPublicKey');
              SecureStore.deleteItemAsync('userPrivateKey');
              SecureStore.deleteItemAsync('userSecurePasscode');
              SecureStore.deleteItemAsync('userPseudoPasscode');
            }} title='RESET DEBUG'></Button> */}
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

export default LoginScreen;