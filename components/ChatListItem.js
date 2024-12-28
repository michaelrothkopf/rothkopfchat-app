import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const ChatListItem = (props) => {
  return (
    <Pressable onPress={() => { props.callback(); }}>
      {({ pressed }) => (
        <View style={[styles.container, pressed ? styles.pressed : styles.unpressed ]}>
          <Text style={styles.titleText}>{props.name}</Text>
          {props.newMessages ? <>
            <Text style={styles.newMessagesIndicatorText}>+ Unread</Text>
          </> : <></>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Style for the outer box
  container: {
    paddingHorizontal: '5.5%',
    paddingVertical: '5.5%',
    marginBottom: '2.5%',

    backgroundColor: 'white',

    // Round the edges of the box
    borderWidth: 0,
    borderRadius: 5,

    // Add a drop shadow
    shadowColor: '#171717',
    shadowOpacity: 0.05,
    shadowOffset: { width: 2, height: 4},
    shadowRadius: 2,

    // Set the display to flex
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Style for when the component is not pressed
  unpressed: {
    backgroundColor: 'white',
  },
  // Style for when the component is pressed
  pressed: {
    backgroundColor: '#D9D9D9',
  },
  // Style for the title text
  titleText: {
    fontSize: 25,
    fontWeight: '500',
    flex: 1,

    /* marginBottom: 15, */
  },
  // Style for the description text
  newMessagesIndicatorText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'red',
    padding: 5,

    // marginBottom: 15,
  },
});

export default ChatListItem;