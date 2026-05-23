import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function RankingScreen() {

  return (

    <View style={styles.container}>

      <Text style={styles.text}>
        WKRÓTCE 🚀
      </Text>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: "#22c55e",
    fontSize: 40,
    fontWeight: "bold",
  },

});