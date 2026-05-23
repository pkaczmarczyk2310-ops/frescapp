import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useState }
from "react";

import logo
from "../assets/logo.png";

import { supabase }
from "../supabase";

export default function LoginScreen({
  onLogin,
}) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function login() {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {

      console.log(error);

      Alert.alert(
        "Błąd",
        "Nieprawidłowe dane"
      );

      return;
    }

    onLogin(data.user);
  }

  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        Witaj 👋
      </Text>

      <Text style={styles.subtitle}>
        Zaloguj się do FrescApp
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Hasło"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={login}
        activeOpacity={0.85}
      >

        <Text style={styles.buttonText}>
          Zaloguj się
        </Text>

      </TouchableOpacity>

    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  logo: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginBottom: 10,
  },

  title: {
    color: "#000",
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#777",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },

  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 22,
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#f12626",
    borderRadius: 28,
    paddingVertical: 22,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

});