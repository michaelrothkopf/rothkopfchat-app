/**
 * The cross-component state for the whole application which cannot be stored in useState due to its frequent updates.
 */
export const appState = {
  // The messaging handler which controls client-server communications
  messagingHandler: null,
  // The login state of the application (mirrors App.js login state)
  loginState: 0,
  // Update the chat list when data is received from the server
  populateChatList: () => {},
  // Update the users online list for a chat when data is received from the server
  populateChatUsersStatusList: (userTimes) => {},
  // List of AdminLock elements' setShouldShow functions
  adminLockUpdateCallbacks: [(value) => {}],
  // The chat which is currently active
  activeChat: null,
  // The callback to update the chats
  appendMessages: (newMessages) => {},
  // The UID of the active user
  setupUID: null,
  // Handles notification related global state
  notifications: {
    // The push notification token of the user
    expoPushToken: null,
    // The notification and response listeners for the application
    notificationListener: null,
    responseListener: null,
    // The notification received by the application
    currentNotification: null,
  },
};