import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import RSAKey from 'react-native-rsa-expo';
import { appState } from '../lib/AppState';
import CryptoES from 'crypto-es';
import { serverInfo } from '../lib/ServerInfo';
import * as Linking from 'expo-linking';

const PoliciesScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={style.container}>
        <Text style={style.titleText}>Policies</Text>
        <Button onPress={() => { Linking.openURL('https://example.com'); }} title='Privacy Policy' />
        <Button onPress={() => { Linking.openURL('https://example.com'); }} title='Terms of Service' />
        <Text style={style.descriptionText}>By pressing the "I Agree" button below, I acknowledge that I have read, and that I agree to, both the Privacy Policy and Terms of Service, both of which are accessible above.</Text>
        <Button onPress={() => { navigation.replace('Age Verification'); }} title='I Agree' />
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

export default PoliciesScreen;