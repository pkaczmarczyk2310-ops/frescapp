import { Platform } from "react-native";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import * as Sharing from "expo-sharing";

import * as FileSystem from "expo-file-system";

import logo from "../assets/logo.png";

import { supabase } from "../supabase";

export default function ProfileScreen({
  user,
}) {

  const [sessions, setSessions] =
    useState([]);

  const [userData, setUserData] =
    useState(null);

  const hourlyRate =
  userData?.hourly_rate || 0;

  useEffect(() => {

    fetchSessions();

    fetchUserData();

  }, []);

  async function fetchUserData() {

    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {

      console.log(error);

      return;
    }

    setUserData(data);
  }

  async function fetchSessions() {

    const {
      data,
      error,
    } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("employee_id", user.id)
      .order("started_at", {
        ascending: false,
      });

    if (error) {

      console.log(error);

      return;
    }

    setSessions(data);
  }

  async function logout() {

    await supabase.auth.signOut();
  }

  function formatDate(date) {

    return new Date(date)
      .toLocaleString(
        "pl-PL",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",

          hour: "2-digit",
          minute: "2-digit",
        }
      );
  }

  function calculateHours(
    start,
    end
  ) {

    if (!end) {

      return "W trakcie 🚀";
    }

    const startDate =
      new Date(start);

    const endDate =
      new Date(end);

    const diffMs =
      endDate - startDate;

    const hours =
      Math.floor(
        diffMs /
        (1000 * 60 * 60)
      );

    const minutes =
      Math.floor(
        (
          diffMs %
          (1000 * 60 * 60)
        ) / (1000 * 60)
      );

    return `${hours}h ${minutes}min`;
  }

  function getTotalMinutes() {

    let totalMinutes = 0;

    sessions.forEach((session) => {

      if (!session.ended_at) {
        return;
      }

      const start =
        new Date(
          session.started_at
        );

      const end =
        new Date(
          session.ended_at
        );

      const diffMs =
        end - start;

      totalMinutes +=
        diffMs /
        1000 /
        60;
    });

    return totalMinutes;
  }

  function calculateTotalHours() {

    const totalMinutes =
      getTotalMinutes();

    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      Math.floor(
        totalMinutes % 60
      );

    return `${hours}h ${minutes}min`;
  }

  function calculateSalary() {


    const totalMinutes =
      getTotalMinutes();

    const totalHours =
      totalMinutes / 60;

    console.log("RATE:", hourlyRate);
console.log("MINUTES:", totalMinutes);
console.log("HOURS:", totalHours);


    return (
      totalHours *
      hourlyRate
    ).toFixed(2);
  }

  async function generatePDF() {

    try {
      console.log(
  "WYPŁATA:",
  calculateSalary()
);

console.log(
  "GODZINY:",
  calculateTotalHours()
);

console.log(
  sessions
);

      const response =
        await fetch(
          "https://frescapp.onrender.com/generate-pdf",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              employeeName:
                userData?.full_name ||
                "Brak danych",

              employeeEmail:
                user.email,

              totalHours:
                calculateTotalHours(),

              amount:
  Number(calculateSalary()),

              sessions,
            }),
          }
        );

      const blob =
        await response.blob();

      // WEB
      if (Platform.OS === "web") {

        const url =
          window.URL.createObjectURL(blob);

        const a =
          document.createElement("a");

        a.href = url;

        a.download =
          "ewidencja.pdf";

        a.click();

        return;
      }

      // MOBILE
      const reader =
        new FileReader();

      reader.onload = async () => {

        const base64data =
          reader.result.split(",")[1];

        const fileUri =
          FileSystem.documentDirectory +
          "ewidencja.pdf";

        await FileSystem.writeAsStringAsync(
          fileUri,
          base64data,
          {
            encoding: "base64",
          }
        );

        await Sharing.shareAsync(
          fileUri
        );
      };

      reader.readAsDataURL(blob);

    } catch (error) {

      console.log(error);

      alert(
        "Błąd generowania PDF 😢"
      );
    }
  }

  return (

    <View style={styles.container}>

      <FlatList

        data={sessions}

        keyExtractor={(item) =>
          item.id.toString()
        }

        showsVerticalScrollIndicator={
          false
        }

        ListHeaderComponent={

          <>

            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.name}>
              {userData?.full_name}
            </Text>

            <Text style={styles.email}>
              {user.email}
            </Text>

            <View style={styles.topButtons}>

              <TouchableOpacity
                style={styles.smallButton}
                onPress={generatePDF}
                activeOpacity={0.85}
              >

                <Text style={styles.smallButtonText}>
                  PDF 📄
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallLogout}
                onPress={logout}
                activeOpacity={0.85}
              >

                <Text style={styles.smallButtonText}>
                  Wyloguj
                </Text>

              </TouchableOpacity>

            </View>

            <View style={styles.summaryCard}>

              <Text style={styles.summaryLabel}>
                Łączny czas pracy
              </Text>

              <Text style={styles.summaryValue}>
                {calculateTotalHours()}
              </Text>

            </View>

            <View style={styles.summaryCard}>

              <Text style={styles.summaryLabel}>
                Do wypłaty 💰
              </Text>

              <Text style={styles.summaryValue}>
                {calculateSalary()} zł
              </Text>

            </View>

            <Text style={styles.sectionTitle}>
              Historia pracy 📅
            </Text>

          </>

        }

        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text style={styles.label}>
              START
            </Text>

            <Text style={styles.value}>
              {
                formatDate(
                  item.started_at
                )
              }
            </Text>

            <Text style={styles.label}>
              STOP
            </Text>

            <Text style={styles.location}>
              📍 {item.location_name}
            </Text>

            <Text style={styles.value}>
              {
                item.ended_at
                  ? formatDate(
                      item.ended_at
                    )
                  : "W trakcie 🚀"
              }
            </Text>

            <Text style={styles.hours}>
              ⏱️ {
                calculateHours(
                  item.started_at,
                  item.ended_at
                )
              }
            </Text>

          </View>

        )}

      />

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 22,
  },

  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
  },

  name: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
  },

  email: {
    fontSize: 15,
    color: "#777",
    marginTop: 8,
    marginBottom: 25,
    textAlign: "center",
  },

  topButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },

  smallButton: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
  },

  smallLogout: {
    flex: 1,
    backgroundColor: "#f12626",
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
  },

  smallButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  summaryCard: {
    backgroundColor: "#f12626",
    borderRadius: 32,
    padding: 28,
    marginBottom: 24,
  },

  summaryLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
    opacity: 0.9,
  },

  summaryValue: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
  },

  sectionTitle: {
    color: "#000",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#f7f7f7",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },

  label: {
    color: "#888",
    fontSize: 13,
    marginBottom: 6,
  },

  value: {
    color: "#000",
    fontSize: 16,
    marginBottom: 14,
    fontWeight: "600",
  },

  hours: {
    color: "#f12626",
    fontSize: 18,
    fontWeight: "800",
  },

  location: {
    color: "#666",
    fontSize: 14,
    marginBottom: 12,
  },

});