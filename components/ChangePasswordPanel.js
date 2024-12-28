import { useEffect, useState, useCallback } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import RSAKey from 'react-native-rsa-expo';
import { appState } from '../lib/AppState';
import CryptoES from 'crypto-es';
import { serverInfo } from '../lib/ServerInfo';
import * as SecureStore from 'expo-secure-store';
import PasswordHandler from '../lib/PasswordHandler';

const ChangePasswordPanel = () => {
  const handleChangePasscode = () => {
    Alert.prompt(
      'Enter new passcode',
      'Please enter your new 6-digit passcode',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (password) => {
            // Validate the new password; if the password is not length 6 or contains non-digit characters
            if (password.length !== 6 || /^\d+$/.test(password)) {
              // Alert the user
              Alert.alert(
                'Invalid entry',
                'The passcode must be 6 digits.',
                [
                  { text: 'Ok', onPress: () => {} }
                ],
                { cancelable: false },
              );
              return;
            }
            // Set the new password in the SecureStore
            SecureStore.setItemAsync('userPseudoPasscode', JSON.stringify(PasswordHandler.hashPassword(password)));
            // Alert the user
            Alert.alert(
              'Success',
              'Password successfully changed.',
              [
                { text: 'Ok', onPress: () => {} }
              ],
              { cancelable: false },
            );
            return;
          }
        }
      ]
    );
  }

  const handleChangeSecurePasscode = () => {
    Alert.prompt(
      'Enter new passcode',
      'Please enter your new 6-digit passcode',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (password) => {
            // Validate the new password; if the password is not length 6 or contains non-digit characters
            if (password.length !== 6 || /^\d+$/.test(password)) {
              // Alert the user
              Alert.alert(
                'Invalid entry',
                'The passcode must be 6 digits.',
                [
                  { text: 'Ok', onPress: () => {} }
                ],
                { cancelable: false },
              );
              return;
            }
            // Set the new password in the SecureStore
            SecureStore.setItemAsync('userSecurePasscode', JSON.stringify(PasswordHandler.hashPassword(password)));
            // Alert the user
            Alert.alert(
              'Success',
              'Password successfully changed.',
              [
                { text: 'Ok', onPress: () => {} }
              ],
              { cancelable: false },
            );
            return;
          }
        }
      ]
    );
  }

  return (
    <View style={style.container}>
      <Text style={style.titleText}>Change Password</Text>
      <Text style={style.descriptionText}></Text>
      <Button
        onPress={() => { handleChangePasscode(); }}
        title={`Change${appState.loginState === 1 ? ' Pseudo' : ''} Passcode`}
        style={style.button}
        accessibilityLabel={'Change Passcode'}
      />
      {
        appState.loginState === 1 ?
        <Button
          onPress={() => { handleChangeSecurePasscode(); }}
          title={'Change Secure Passcode'}
          style={style.button}
          accessibilityLabel={'Change Secure Passcode'}
        />
        : <></>
      }
    </View>
  );
}

const style = StyleSheet.create({
  // Style for the outer box
  container: {
    paddingHorizontal: '7.5%',
    paddingVertical: '4.5%',
    marginBottom: '4.5%',

    backgroundColor: 'white',

    // Round the edges of the box
    borderWidth: 0,
    borderRadius: 5,

    // Add a drop shadow
    shadowColor: '#171717',
    shadowOpacity: 0.05,
    shadowOffset: { width: 2, height: 4},
    shadowRadius: 2,
  },
  // Style for the 'Send Page' title text
  titleText: {
    fontSize: 30,
    fontWeight: '600',

    marginBottom: 0,
  },
  // Style for the description text
  descriptionText: {
    fontSize: 15,
    fontWeight: '300',

    marginBottom: 15,
  },
  // Style for the buttons
  button: {
    marginBottom: 3,
  }
});

export default ChangePasswordPanel;