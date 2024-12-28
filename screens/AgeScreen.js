import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import RSAKey from 'react-native-rsa-expo';
import { appState } from '../lib/AppState';
import CryptoES from 'crypto-es';
import { serverInfo } from '../lib/ServerInfo';
import * as Linking from 'expo-linking';
import DateTimePicker from '@react-native-community/datetimepicker';

const AgeScreen = ({ navigation }) => {
  const [birthday, setBirthday] = useState(new Date());
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={style.container}>
        <Text style={style.titleText}>Age Verification</Text>
        <Text style={style.descriptionText}>Please enter your birthday:</Text>
        <DateTimePicker mode='date' value={birthday} onChange={(event, date) => {
          setBirthday(date);
        }} />
        <Button
          onPress={() => {
            if (birthday <= new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())) {
              // User is older than 13, redirect to UID entry
              navigation.replace('UID Entry');
            }
            else {
              // Otherwise, alert the user
              alert('You must be at least 13 years old to use the Rothkopf Chat.');
            }
          }}
          title='Submit'></Button>
      </View>
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
});

export default AgeScreen;