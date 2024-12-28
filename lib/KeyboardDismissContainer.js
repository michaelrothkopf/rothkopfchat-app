import { useEffect, useState, useCallback } from 'react';
import { Button, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { Keyboard } from 'react-native';

const KeyboardDismissContainer = ({ children }) => {
  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
    }}>
      {children}
    </TouchableWithoutFeedback>
  );
}

export default KeyboardDismissContainer;