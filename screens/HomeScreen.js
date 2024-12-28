import { SafeAreaView, Text, View } from 'react-native';
import PagerPanel from '../components/PagerPanel';
import { appState } from '../lib/AppState';
import { useState } from 'react';
import WelcomePanel from '../components/WelcomePanel';
import AdminLock from '../lib/AdminLock';

const HomeScreen = ({ route, navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <WelcomePanel />
        <AdminLock>
          <PagerPanel />
        </AdminLock>
      </View>
    </SafeAreaView>
  );
}

export default HomeScreen;