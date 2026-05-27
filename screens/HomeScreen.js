import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";

import {
  useState,
  useEffect,
} from "react";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import * as Location
from "expo-location";

import { supabase }
from "../supabase";

import logo
from "../assets/logo.png";

export default function HomeScreen({
  user,
}) {

  const [working, setWorking] =
    useState(false);

  const [scannerVisible, setScannerVisible] =
    useState(false);

  const [workTime, setWorkTime] =
    useState(0);

  const [currentLocation, setCurrentLocation] =
    useState(null);

  const [userData, setUserData] =
    useState(null);

  const [currentLocationName, setCurrentLocationName] =
    useState("");

  const [
    permission,
    requestPermission,
  ] = useCameraPermissions();

  useEffect(() => {

    let interval;

    if (working) {

      interval = setInterval(() => {

        setWorkTime(
          (prev) => prev + 1
        );

      }, 1000);
    }

    return () =>
      clearInterval(interval);

  }, [working]);

  useEffect(() => {

    getLocation();

    fetchUserData();

    checkActiveSession();

  }, []);

  async function getLocation() {

    const permission =
      await Location
        .requestForegroundPermissionsAsync();

    if (
      permission.status !== "granted"
    ) {

      alert(
        "Brak lokalizacji 🚫"
      );

      return;
    }

    const location =
      await Location
        .getLastKnownPositionAsync();

    if (location) {

      setCurrentLocation(
        location.coords
      );
    }
  }

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

  async function checkActiveSession() {

    const {
      data,
      error,
    } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("employee_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {

      console.log(error);

      return;
    }

    if (data) {

      setWorking(true);

      setCurrentLocationName(
        data.location_name || ""
      );

      const start =
        new Date(data.started_at);

      const now =
        new Date();

      const diffSeconds =
        Math.floor(
          (now - start) / 1000
        );

      setWorkTime(diffSeconds);
    }
  }

  async function startWork(
    locationName
  ) {

    const {
      data,
      error,
    } = await supabase
      .from("work_sessions")
      .insert([
        {
          employee_id:
            user.id,

          is_active: true,

          location_name:
            locationName,
        },
      ])
      .select();

    if (error) {

      console.log(error);

      alert(
        "Błąd startu pracy"
      );

      return;
    }

    setWorking(true);

    setWorkTime(0);

    alert(
      "Praca rozpoczęta 🚀"
    );
  }

  async function stopWork() {

    const { error } =
      await supabase
        .from("work_sessions")
        .update({
          ended_at:
            new Date(),

          is_active: false,
        })
        .eq(
          "employee_id",
          user.id
        )
        .eq(
          "is_active",
          true
        );

    if (error) {

      console.log(error);

      alert(
        "Błąd zakończenia pracy"
      );

      return;
    }

    setWorking(false);

    setCurrentLocationName("");

    alert(
      "Praca zakończona 🛑"
    );
  }

  async function openScanner() {

    await requestPermission();

    const locationPermission =
      await Location
        .requestForegroundPermissionsAsync();

    if (
      locationPermission.status !==
      "granted"
    ) {

      alert(
        "Brak uprawnień"
      );

      return;
    }

    setScannerVisible(true);
  }

  async function handleBarCodeScanned({
    data,
  }) {

    setScannerVisible(false);

    const {
      data: locationData,
      error,
    } = await supabase
      .from("locations")
      .select("*")
      .eq(
        "qr_code",
        data
      )
      .single();

    if (
      error ||
      !locationData
    ) {

      alert(
        "Nieprawidłowy QR 🚫"
      );

      return;
    }

    if (!currentLocation) {

      alert(
        "Brak lokalizacji telefonu 🚫"
      );

      return;
    }

    const distance =
      getDistanceFromLatLonInKm(
        currentLocation.latitude,

        currentLocation.longitude,

        locationData.latitude,

        locationData.longitude
      );

    if (distance > 50) {

      alert(
        "Nie jesteś w lokalizacji pracy 🚫"
      );

      return;
    }

    const {
      data: activeSession,
    } = await supabase
      .from("work_sessions")
      .select("*")
      .eq(
        "employee_id",
        user.id
      )
      .eq(
        "is_active",
        true
      )
      .maybeSingle();

    setCurrentLocationName(
      locationData.name
    );

if (activeSession) {

  if (
    activeSession.location_name !==
    locationData.name
  ) {

    alert(
      "Musisz zakończyć zmianę w tym samym lokalu 🚫"
    );

    return;
  }

  stopWork();

} else {

  startWork(
    locationData.name
  );
}
  }

  function getDistanceFromLatLonInKm(
    lat1,
    lon1,
    lat2,
    lon2
  ) {

    const R = 6371;

    const dLat =
      deg2rad(
        lat2 - lat1
      );

    const dLon =
      deg2rad(
        lon2 - lon1
      );

    const a =
      Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +

      Math.cos(
        deg2rad(lat1)
      ) *

      Math.cos(
        deg2rad(lat2)
      ) *

      Math.sin(dLon / 2) *

      Math.sin(dLon / 2);

    const c =
      2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return R * c;
  }

  function deg2rad(deg) {

    return deg * (
      Math.PI / 180
    );
  }

  function formatWorkTime() {

    const hours =
      Math.floor(
        workTime / 3600
      );

    const minutes =
      Math.floor(
        (workTime % 3600) / 60
      );

    const seconds =
      workTime % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  if (scannerVisible) {

    return (

      <CameraView
        onBarcodeScanned={
          handleBarCodeScanned
        }

        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}

        selectedLens="builtInWideAngleCamera"

        style={{
          flex: 1,
        }}
      />

    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Cześć {
            userData?.full_name?.split(" ")[0]
          } 👋
        </Text>

        <Text style={styles.subtitle}>
          Miłej pracy 🍕
        </Text>

      </View>

      {
        working && (

          <View style={styles.timerCard}>

            <Text style={styles.liveText}>
              ● AKTUALNIE PRACUJESZ
            </Text>

            <Text style={styles.timerText}>
              {formatWorkTime()}
            </Text>

            <Text style={styles.locationText}>
              📍 {currentLocationName}
            </Text>

          </View>

        )
      }

      <TouchableOpacity
        style={styles.qrButton}
        onPress={openScanner}
        activeOpacity={0.85}
      >

        <Text style={styles.qrTitle}>
          ZESKANUJ QR
        </Text>

        <Text style={styles.qrSubtitle}>
          Rozpocznij lub zakończ zmianę
        </Text>

      </TouchableOpacity>

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

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    width: 170,
    height: 170,
    marginBottom: 10,
  },

  title: {
    color: "#000",
    fontSize: 34,
    fontWeight: "800",
  },

  subtitle: {
    color: "#666",
    fontSize: 16,
    marginTop: 6,
  },

  timerCard: {
    backgroundColor: "#f12626",
    borderRadius: 32,
    padding: 30,
    marginBottom: 28,
  },

  liveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
    opacity: 0.9,
  },

  timerText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 2,
  },

  locationText: {
    color: "#fff",
    marginTop: 14,
    fontSize: 16,
    opacity: 0.95,
  },

  qrButton: {
    backgroundColor: "#f12626",
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 24,
  },

  qrTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },

  qrSubtitle: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },

});