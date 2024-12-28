// UI imports
import { useEffect, useState, useCallback } from 'react';
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Actions, GiftedChat } from 'react-native-gifted-chat';

// App state reference
import { appState } from '../lib/AppState';

// Legacy chat imports
// import MessagePanel from '../components/MessagePanel';
// import MessageInput from '../components/MessageInput';
// import MessagingKeyboardPadding from '../components/MessagingKeyboardPadding';

// Image picking imports
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Server communication and authentication
// import { serverInfo } from '../lib/ServerInfo';
// import uuid from 'react-native-uuid';
// import CryptoES from 'crypto-es';
// import RSAKey from 'react-native-rsa-expo';

const MessagingWindow = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);

  // Set the currently active chat ID in the app state
  appState.activeChat = route.params.chatId;
  appState.appendMessages = (newMessages) => {
    // const msgs = [];

    // // For each message in the chat
    // for (const message of appState.messagingHandler.chats[route.params.chatId].messages) {
    //   // Add the message data to the cache
    //   msgs.push({
    //     _id: message.timestamp + Date.now(),
    //     text: message.text,
    //     createdAt: message.timestamp,
    //     nickname: message.nickname,
    //     // If the message has an active pending token, the message is pending
    //     pending: !(message.pendingToken === null || message.pendingToken === undefined),
    //   });
    // }

    // setMessages(msgs.reverse());

    // // Get the messages from the app state
    // const appStateMessages = appState.messagingHandler.chats[route.params.chatId].messages.slice();
    // // Reverse the message order
    // appStateMessages.reverse();

    // Set the messages to the app state messages
    // setMessages(appState.messagingHandler.chats[route.params.chatId].messages);

    // Append the new messages using GiftedChat
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  };

  // When the chat is opened
  useEffect(() => {
    // Add the messages for the chat
    appState.appendMessages(appState.messagingHandler.chats[route.params.chatId].messages);

    // Tell the messaging handler to update the last message seen
    appState.messagingHandler.updateLastMessageSeen();

    // When the component will unmount
    return () => {
      // Set the active chat to null
      appState.activeChat = null;
    };
  }, []);

  const onSend = useCallback((newMessages = []) => {
    // setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));

    // Send the message to the server using the messaging handler
    appState.messagingHandler.sendMessage(route.params.chatId, newMessages[0].text.trim());
  });

  const onUploadImage = useCallback(() => {
    const pickImage = async () => {
      // Get permission to select images
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      // If the camera roll permissions are not granted
      if (permission.granted === false) {
        // Notify the user and break out of the function
        alert('Camera roll permissions must be granted to send images!');
        return;
      }

      // Attempt to pick an image
      const selectedImage = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
      });
      // If no image is selected
      if (selectedImage.canceled === true) {
        // Break out of the function
        return;
      }

      console.log(selectedImage.assets[0].uri, selectedImage.assets[0].uri.split('.'), selectedImage.assets[0].uri.split('.').pop());

      appState.messagingHandler.emit('image_message:create', {
        chatId: route.params.chatId,
        image: selectedImage.assets[0].base64,
        extension: selectedImage.assets[0].uri.split('.').pop(),
      });

      // // Upload the image data to the server
      // const imageFormData = new FormData();
      // // imageFormData.append('image', selectedImage);
      // imageFormData.append('image', {
      //   name: selectedImage.assets[0].fileName,
      //   type: selectedImage.assets[0].type,
      //   uri: Platform.OS === 'ios' ? selectedImage.assets[0].uri.replace('file://', '') : selectedImage.assets[0].uri,
      // });

      // // Create authentication data
      // const authContents = {
      //   requestIdentifier: uuid.v4(),
      //   chatId: route.params.chatId,
      // };

      // // Hash the authentication data
      // const payloadHash = CryptoES.SHA256(JSON.stringify(authContents)).toString();

      // // RSA encrypt the hash to sign the data
      // const rsa = new RSAKey();
      // rsa.setPrivateString(appState.messagingHandler.priKey);
      // const signature = rsa.encryptPrivate(payloadHash);

      // // Fetch the server
      // fetch(serverInfo.serverAddress + '/api/v1/media/image/upload', {
      //   method: 'POST',
      //   headers: {
      //     'Authentication': JSON.stringify({
      //       authToken: appState.messagingHandler.pubKey,
      //       signature: signature,
      //       contents: authContents
      //     }),
      //   },
      //   body: imageFormData,
      // }).then((resp) => {
      // }).catch((e) => {
      // });
    }

    pickImage();
  });

  return (
    <SafeAreaView style={style.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}

        bottomOffset={77}
        renderActions={(renderActionsProps) => {
          return (
            <>
              <Actions {...renderActionsProps}
                icon={() => (
                  <MaterialCommunityIcons name='image-multiple-outline' size={24} />
                )}
                onPressActionButton={onUploadImage}
              ></Actions>
            </>
          );
        }}

        renderAvatar={(props) => {
          return (
            <View style={style.avatarContainer}>
              <Text style={style.avatarText}>{props.currentMessage.user.name.match(/\b\w/g).join('')}</Text>
            </View>
          );
        }}
        renderUsernameOnMessage={true}
        renderUsername={(user) => {
          return (
            <View style={style.usernameContainer}>
              <Text style={style.usernameText}>{user.name}</Text>
            </View>
          );
        }}
        
        user={{
          _id: appState.messagingHandler.userId
        }}
      />
      {/* <MessagePanel messages={messages} />
      <MessageInput sendCallback={(text) => { onSend(text); }} />
      <MessagingKeyboardPadding /> */}
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
    display: 'flex',
    flexDirection: 'column'
  },
  usernameContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  usernameText: {
    top: -3,
    left: 0,
    fontSize: 12,
    backgroundColor: 'transparent',
    color: '#999'
  },
  avatarContainer: {
    // padding: '5%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    width: 36,
    height: 36,
    borderRadius: 20,

    backgroundColor: '#686868',
  },
  avatarText: {
    fontWeight: 'normal',
    color: 'white',
    fontSize: (Platform.OS === 'ios' ? 18 : 15),
  },
});

export default MessagingWindow;