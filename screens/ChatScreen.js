import { SafeAreaView, Text, View, ActivityIndicator, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import ChatListItem from '../components/ChatListItem';
import { appState } from '../lib/AppState';
import { useIsFocused } from '@react-navigation/native';

const ChatScreen = ({ route, navigation }) => {
  const [chatList, setChatList] = useState([]);

  // Force a reload when screen is focused
  const isFocused = useIsFocused();

  // Create a login state update callback to populate the chat list
  appState.populateChatList = () => {
    // Create an array to store the processed chats
    const _chats = [];

    // For each chat in the messaging handler state
    for (const chatId in appState.messagingHandler.chats) {
      // Check if the chat has new messages
      let newMessages = false;
      try {
        newMessages = appState.messagingHandler.chats[chatId].messages[0]._id !== appState.messagingHandler.lastMessagesSeen[chatId];
      } catch (e) {}

      // Reformat the chat data and place it into the temporary array
      _chats.push({
        id: chatId,
        title: appState.messagingHandler.chats[chatId].title,
        newMessages,
      });
    }

    // Set the chat list to the list of chats
    setChatList(_chats);
  };

  useEffect(() => {
    // Create a useEffect as a backup for populateChatList in case the chat list is opened after the login state has been updated
    appState.populateChatList();
  }, []);

  // If the chat list has not yet been populated
  if (chatList.length === 0) {
    // Return a loading screen
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator></ActivityIndicator>
      </SafeAreaView>
    );
  }

  // The chat list has been populated, render the buttons
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ width: '100%', padding: 16 }}>
        <FlatList
          data={chatList}
          renderItem={({ item }) => {
            return (
              <ChatListItem key={item.id} name={item.title} newMessages={item.newMessages} callback={() => {
                navigation.navigate('MessagingWindow', { chatTitle: item.title, chatId: item.id });
              }} />
            );
          }}
        />
        {/* <ChatList messagingHandler={messagingHandler}
          openChat={(id, title) => {
          // Handle opening a chat window
          navigation.navigate('MessagingWindow', { chatTitle: title, chatId: id, messagingHandler: messagingHandler });
        }} /> */}
      </View>
    </SafeAreaView>
  );
}

export default ChatScreen;