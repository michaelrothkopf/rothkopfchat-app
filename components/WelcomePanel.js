import { useEffect, useState, useCallback } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import RSAKey from 'react-native-rsa-expo';
import { appState } from '../lib/AppState';
import CryptoES from 'crypto-es';
import { serverInfo } from '../lib/ServerInfo';

const WelcomePanel = () => {
  return (
    <View style={style.container}>
      <Text style={style.titleText}>Welcome</Text>
      <Text style={style.descriptionText}>Welcome to Rothkopf Chat! Thank you for installing our communications app. If you have any questions, please contact us.</Text>
    </View>
  );
}

const style = StyleSheet.create({
  // Style for the outer box
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
});

export default WelcomePanel;