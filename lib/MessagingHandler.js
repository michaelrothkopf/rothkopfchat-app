// Live socket connection
import { connData, createSocket } from './Connection';

// Cryptographic functions
import CryptoES from 'crypto-es';
import RSAKey from 'react-native-rsa-expo';
import uuid from 'react-native-uuid';

// Data and state management
import * as SecureStore from 'expo-secure-store';
import { appState } from './AppState';

// User interface and application controls
import { Alert, BackHandler } from 'react-native';
import RNExitApp from 'react-native-exit-app';

/**
 * Handles all communications between the server and the client application.
 * 
 * A prerequisite for the creation of a MessagingHandler is the authentication credentials of the client end user.
 * Because of the application's unconventional authentication pattern, these credentials are authenticated directly with the
 * server upon establishing a connection.
 * 
 * All messages sent to the server are signed, as the application relies on signature authentication through a password-
 * encrypted private key stored locally on the device. This is how the server verifies the identity of the sender.
 */
export default class MessagingHandler {
  /**
   * Creates a new MessageHandler to handle the application's server communications
   * @param {string} pubKey The RSA public key of the authenticated user
   * @param {string} priKey The RSA private key of the authenticated user
   */
  constructor(pubKey, priKey) {
    // The RSA key of the authenticated user
    this.pubKey = pubKey;
    this.priKey = priKey;

    // The session token given by the server
    this.sessionToken = null;

    // The user ID for use in chats
    this.userId = null;

    // The nickname of the user for use in chats
    this.nickname = null;

    // The rank of the user for determining which features to display access to
    this.rank = null;

    // The chats the user has access to
    this.chats = [];

    // The application's locally stored last message seen dictionary
    this.lastMessagesSeen = {};

    // Attempt to connect the socket
    connData.socket = createSocket();

    // Send the initial online message to the server when the socket connects
    connData.socket.on('connect', () => {
      this.sendOnlineStatus();
    });

    connData.socket.on('loginstatusupdate', async (payload) => {
      // Populate the messaging handler state
      console.log('Login status update!', payload);
      this.chats = payload.chatData;
      this.sessionToken = payload.sessionToken;
      this.userId = payload.userId;
      this.nickname = payload.nickname;
      this.rank = payload.rank;

      // Load the data from the last messages seen key
      const lmsData = await SecureStore.getItemAsync('chatLastMessagesSeen');

      try {
        // Try to set the LMS data
        this.lastMessagesSeen = JSON.parse(lmsData);
      } catch (e) {}

      if (this.lastMessagesSeen === null || this.lastMessagesSeen === undefined) {
        // If LMS data has not been created, create it
        this.lastMessagesSeen = {};

        // For each chat
        for (const chatId in this.chats) {
          // Assume all messages are unseen
          this.lastMessagesSeen[chatId] = '';
        }
      }

      // Add the blank user time data to the chats
      for (const chatId in this.chats) {
        this.chats[chatId].userTimes = [];
      }

      // Fire the callback to populate the chat list
      appState.populateChatList();

      // Fire all the callbacks to refresh AdminLocks if the user is HC
      if (payload.isAdminGroup) {
        for (const callback of appState.adminLockUpdateCallbacks) {
          callback(true);
        }
      }
    });

    connData.socket.on('message:data', (payload) => {
      console.log('msgdatarcv:', payload)
      this.receiveMessage(payload);
    });

    // Callback for when the server sends back a list of online users for a chat
    connData.socket.on('chat_online_status:data', (payload) => {
      // Add the data to the chat
      this.chats[payload.chat].userTimes = payload.userTimes;

      // If the chat is active
      if (payload.chat === appState.activeChat) {
        // Populate the list
        appState.populateChatUsersStatusList(payload.userTimes);
      }
    });

    connData.socket.on('authfailure:statusonline', (message) => {
      Alert.alert(
        'Authentication error',
        `The server could not authenticate the request (reason: '${message}'). Try again later and contact support if the issue persists. The app will now close.`
        [
          { text: 'Ok', onPress: () => {
            // Close the app
            // RNExitApp.exitApp();
          } }
        ],
        { cancelable: false },
      )
      // Try again after 5 seconds
      // setTimeout(() => {
      //   this.emit('status:online', { timestamp: Date.now() });
      // }, 5000);
    });
  }

  /**
   * Updates the last seen message
   */
  async updateLastMessageSeen() {
    // If there is not currently an active chat, ignore it
    if (!appState.activeChat) {
      return;
    }

    try {
      // Set the message in memory to the last message in the active chat
      // this.lastMessagesSeen[appState.activeChat] = this.chats[appState.activeChat].messages[this.chats[appState.activeChat].messages.length - 1]._id;
      this.lastMessagesSeen[appState.activeChat] = this.chats[appState.activeChat].messages[0]._id;

      // Save the data to disk
      await SecureStore.setItemAsync('chatLastMessagesSeen', JSON.stringify(this.lastMessagesSeen));

      // Rerender the chat list to get rid of message unseen notices
      appState.populateChatList();
    } catch (e) {}
  }

  /**
   * Sends the signed online status message to the server to verify identity
   */
  sendOnlineStatus() {
    // Set the contents to hash
    const contents = { requestIdentifier: uuid.v4() };
    // The hash of the data
    const payloadHash = CryptoES.SHA256(JSON.stringify(contents)).toString();

    // RSA encrypt the hash to sign the data
    const rsa = new RSAKey();
    rsa.setPrivateString(this.priKey);
    const signature = rsa.encryptPrivate(payloadHash);

    // Send the data to the client
    connData.socket.emit('status:online', {
      authToken: this.pubKey,
      signature: signature,
      contents: contents,
    });
  }

  /**
   * Sends data to the server with signed authentication
   * @param {string} event The name of the event to emit
   * @param {object} contents The data to send to the server
   */
  async emit(event, contents) {
    // Send the data to the client
    connData.socket.emit(event, {
      sessionToken: this.sessionToken,
      contents: contents,
    });
  }

  /**
   * Handles the sending of a message to the server
   * @param {string} chat The ID of the chat to which the message was sent
   * @param {string} text The text contents of the message
   */
  async sendMessage(chat, text) {
    // Send the message to the server
    appState.messagingHandler.emit('message:create', {
      chat: chat,
      text: text.trim(),
    });
  }

  /**
   * Receives and displays a message
   * @param {object} msgData The message data to process
   */
  async receiveMessage(msgData) {
    // Add the message to the memory chat data
    this.chats[msgData.chat].messages.unshift(msgData);

    if (msgData.chat === appState.activeChat) {
      // Call the update callback
      appState.appendMessages([msgData]);

      // Update the last seen message
      this.updateLastMessageSeen();
    }
  }
}