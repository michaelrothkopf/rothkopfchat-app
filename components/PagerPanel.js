import { useEffect, useState, useCallback } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import RSAKey from 'react-native-rsa-expo';
import { appState } from '../lib/AppState';
import CryptoES from 'crypto-es';
import { serverInfo } from '../lib/ServerInfo';
import uuid from 'react-native-uuid';

const PagerPanel = () => {
  // Create the state for the group input box
  const [groupName, setGroupName] = useState('');
  // Create the state for the message text input box
  const [messageText, setMessageText] = useState('');

  // Handles when the user presses the send button
  const onSendPage = () => {
    // If the group name or message text are invalid
    if (groupName.length < 5 || messageText.length < 1) {
      // Alert the user and return the function
      Alert.alert('Error Sending Page', 'The group name and message text must be provided before sending a page.');
      return;
    }

    // Create the page data contents
    const contents = {
      requestIdentifier: uuid.v4(),
      group: groupName, message: messageText
    };

    // Hash the contents
    const payloadHash = CryptoES.SHA256(JSON.stringify(contents)).toString();

    // RSA encrypt the hash to sign the data
    const rsa = new RSAKey();
    rsa.setPrivateString(appState.messagingHandler.priKey);
    const signature = rsa.encryptPrivate(payloadHash);

    // Send the page to the server
    fetch(serverInfo.serverAddress + '/api/v1/page', {
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
      // If the response failed
      if (responseJson.failed) {
        Alert.alert(
          'Page Send Failed',
          `Page send failed with reason '${responseJson.message}'.`,
          [
            { text: 'Ok', onPress: () => {} }
          ],
          { cancelable: false },
        );
      }
      else {
        // Alert that the page was successful
        Alert.alert(
          'Page Send Successful',
          `Page send successful with message '${responseJson.message}'.`,
          [
            { text: 'Ok', onPress: () => {} }
          ],
          { cancelable: false },
        );
      }
    });
  }

  return (
    <View style={style.container}>
      <Text style={style.titleText}>Send Page</Text>
      <Text style={style.descriptionText}>A page will send a push notification to all users in a group with a special sound and custom message.</Text>
      <TextInput
        value={groupName}
        onChangeText={(groupName) => setGroupName(groupName)}
        placeholder={'Page Group'}
        style={style.inputBox}
      />
      <TextInput
        value={messageText}
        onChangeText={(messageText) => setMessageText(messageText)}
        placeholder={'Page Message'}
        style={style.inputBox}
      />
      <Button
        onPress={() => { onSendPage(); setGroupName(''); setMessageText(''); }}
        title={'Send'}
        accessibilityLabel={'Send a message'}
      />
    </View>
  );
}

const style = StyleSheet.create({
  // Style for the outer pager box
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

    marginBottom: 15,
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

    marginBottom: 3,
  }
});

export default PagerPanel;