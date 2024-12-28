import { SafeAreaView, Text, View } from 'react-native';
import ChangePasswordPanel from '../components/ChangePasswordPanel';

const SettingsScreen = ({ route, navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <ChangePasswordPanel />
      </View>
    </SafeAreaView>
  );
}

export default SettingsScreen;