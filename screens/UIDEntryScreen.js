import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import RSAKey from 'react-native-rsa-expo';
import { appState } from '../lib/AppState';
import CryptoES from 'crypto-es';
import { serverInfo } from '../lib/ServerInfo';
import KeyboardDismissContainer from '../lib/KeyboardDismissContainer';

const UIDEntryScreen = ({ navigation }) => {
  // The state for the UID entry box
  const [UID, setUID] = useState('');
  // Whether the app is currently working
  const [working, setWorking] = useState(false);

  // Handles when the user attempts to verify a UID
  const verifyUIDHandler = () => {
    async function _verifyUIDHandler() {
      // Validate the input to UID
      if (UID.length !== 9) {
        Alert.alert(
          'Invalid UID',
          'The UID you provided is not of the correct length. Be sure you are entering the right identification credential.',
          [
            { text: 'Ok', onPress: () => {} }
          ],
          { cancelable: false },
        );
        return;
      }

      // Disable the button
      setWorking(true);

      // Make the request to the server
      fetch(serverInfo.serverAddress + `/api/v1/check_UID/${UID}`, {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((responseJson) => {
          // If the UID does not exist
          if (responseJson.failed) {
            Alert.alert(
              'UID does not exist',
              'The UID you entered is not registered with the server, or the account has already been activated. If this is a mistake, contact DF support.',
              [
                { text: 'Ok', onPress: () => {
                  setWorking(false);
                } }
              ],
              { cancelable: false },
            );
            return;
          }

          // If the UID does exist, navigate to the Initial Setup Screen
          appState.setupUID = UID;
          navigation.replace('Initial Setup');
        })
        .catch((error) => {
          console.log('Error', error);
          setWorking(false);
        });
    }

    _verifyUIDHandler();
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
          <Text style={style.titleText}>UID Validation</Text>
          <Text style={style.descriptionText}>Please enter the UID which was given to you. This is a unique code assigned to you which is responsible for your security in Rothkopf Chat.</Text>
          <TextInput
            value={UID}
            onChangeText={(UID) => setUID(UID.toUpperCase())}
            placeholder={'UID'}
            style={style.inputBox}
            keyboardType={'default'}
          />
          <Button
            title={'Verify UID'}
            onPress={verifyUIDHandler}
            disabled={working}
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

export default UIDEntryScreen;