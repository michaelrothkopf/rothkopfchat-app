import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const UserLastSeen = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.userNameLabel}>{props.userName}</Text>
      <Text style={styles.userLoginTimeLabel}>{props.status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles for the user box
  container: {
    width: '100%',
    paddingHorizontal: '7.5%',
    paddingVertical: '2.5%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Styles for the user's name
  userNameLabel: {
    flex: 1,
    textAlign: 'left',
    fontSize: 20,
  },
  // Styles for the user's last login time
  userLoginTimeLabel: {
    textAlign: 'right',
    fontSize: 15,
  },
});

export default UserLastSeen;