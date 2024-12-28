import { useEffect, useState, useCallback } from 'react';
import { Button, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { Keyboard } from 'react-native';
import { appState } from './AppState';

const AdminLock = ({ children }) => {
  const [shouldShow, setShouldShow] = useState(false);

  // Add setShouldShow to the list of appState callbacks for AdminLocks
  appState.adminLockUpdateCallbacks.push((value) => setShouldShow(value));

  // If the user is not in the Admin Group
  if (!shouldShow) {
    return (
      <></>
    );
  }

  // Otherwise return the content
  return (
    <>{children}</>
  );
}

export default AdminLock;