import { SafeAreaView, Text, View, ActivityIndicator, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { appState } from '../lib/AppState';
import formatDate from '../lib/formatDate';
import UserLastSeen from '../components/UserLastSeen';

const ChatInfoScreen = ({ route, navigation }) => {
  const [chatUsersStatusList, setChatUsersStatusList] = useState([]);

  // Create a callback to populate the list of users in the chat and when they were online
  appState.populateChatUsersStatusList = (userTimes) => {
    // Create an array to hold the data for when the users were last online
    const statusList = [];

    // For each user time
    for (const user of userTimes) {
      // If the user doesn't have a last login time
      if (!user.lastLogin) {
        // Push a string contianing a message instead
        statusList.push({
          name: user.name,
          status: 'Inactive'
        });
        continue;
      }

      // If the user doesn't have a last logout time
      if (!user.lastLogout || new Date(user.lastLogout).getTime() < new Date(user.lastLogin).getTime()) {
        // Push a string contianing a message instead
        statusList.push({
          name: user.name,
          status: 'Online'
        });
        continue;
      }

      // Otherwise, push a last seen status
      statusList.push({
        name: user.name,
        status: `Active ${formatDate(new Date(user.lastLogout), false)}`,
      });
    }

    // Set the data
    setChatUsersStatusList(statusList);
  };

  // Create a useEffect to tell the server to send the data
  useEffect(() => {
    appState.messagingHandler.emit('chat_online_status:get', {
      chat: route.params.chatId,
    });
  }, []);

  // If the chat list has not yet been populated
  if (chatUsersStatusList.length === 0) {
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
      <View style={{ width: '100%' }}>
        <FlatList
          style={{ paddingTop: '5%' }}
          data={chatUsersStatusList}
          renderItem={({ item }) => {
            return (
              <UserLastSeen
                userName={item.name}
                status={item.status}
              />
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default ChatInfoScreen;