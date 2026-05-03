import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { onAuthStateChanged } from "firebase/auth";
import {
  AlertCircle,
  Bell,
  Home as HomeIcon,
  Map as MapIcon,
  Smartphone,
  User,
  Users,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");

  // --- SOS & Countdown States ---
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [timer, setTimer] = useState(5);
  const isProcessing = useRef(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const nameToShow =
          user.displayName || user.email?.split("@")[0] || "User";
        setUserName(nameToShow);
      } else {
        setUserName("Guest");
      }
    });
    return () => unsubscribe();
  }, []);

  // 1. Final SOS Execution
  const executeFinalSOS = async () => {
    Vibration.cancel();
    setIsCountingDown(false);
    isProcessing.current = true;

    Vibration.vibrate([500, 200, 500]);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        resetSOS();
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const response = await fetch(
        "http://192.168.100.111:3000/api/sos/trigger",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: auth.currentUser?.uid || "anonymous",
            location: {
              lat: location.coords.latitude,
              long: location.coords.longitude,
            },
            type: "Snatching (Shake Detected)",
            status: "active",
          }),
        },
      );

      if (response.ok) {
        router.push("/TheftAlert");
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      console.error("SOS Trigger Error:", error);
      Alert.alert("Error", "Check connection and try again.");
      resetSOS();
    }
  };

  // 2. Trigger function
  const triggerSnatchingMode = () => {
    if (isCountingDown || isProcessing.current) return;
    setTimer(5);
    setIsCountingDown(true);
    Vibration.vibrate(500);
  };

  // 3. Countdown Logic (Strict TS Fix)
  useEffect(() => {
    let interval: any = null;

    if (isCountingDown && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && timer === 0) {
      executeFinalSOS();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountingDown, timer]);

  const cancelSOS = () => {
    resetSOS();
    Vibration.cancel();
    Alert.alert("SafePulse", "Emergency alert cancelled.");
  };

  const resetSOS = () => {
    setIsCountingDown(false);
    isProcessing.current = false;
    setTimer(5);
  };

  // 4. Shake Detection logic
  useEffect(() => {
    const SHAKE_THRESHOLD = 12.0;
    const subscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      if (
        acceleration > SHAKE_THRESHOLD &&
        !isCountingDown &&
        !isProcessing.current
      ) {
        triggerSnatchingMode();
      }
    });
    Accelerometer.setUpdateInterval(100);
    return () => subscription.remove();
  }, [isCountingDown]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#161E2E" />

      {isCountingDown && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <AlertCircle size={100} color="#fff" />
            <Text style={styles.overlayTitle}>EMERGENCY ALERT</Text>
            <Text style={styles.overlaySub}>Notifying contacts in...</Text>
            <Text style={styles.timerText}>{timer}</Text>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelSOS}>
              <XCircle size={24} color="#ef4444" />
              <Text style={styles.cancelBtnText}>I AM SAFE (CANCEL)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetText}>Stay Safe,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          {/* FIXED: DIV REPLACED WITH VIEW HERE */}
          <View style={styles.headerIconsContainer}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => router.push("/Profile")}
            >
              <User size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconCircle, { marginLeft: 12 }]}>
              <Bell size={20} color="#fff" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statusBanner}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>SafePulse Protection Active</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sosContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.sosOuter}
            onPress={triggerSnatchingMode}
          >
            <View style={styles.sosInner}>
              <AlertCircle size={50} color="#fff" />
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosSubText}>TAP OR SHAKE</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Smartphone size={18} color="#2563eb" />
          <Text style={styles.sectionTitle}>Smart Detection</Text>
        </View>

        <TouchableOpacity
          style={styles.theftCard}
          onPress={triggerSnatchingMode}
        >
          <View style={styles.theftIconCircle}>
            <AlertCircle size={24} color="#ef4444" />
          </View>
          {/* FIXED: DIV REPLACED WITH VIEW HERE */}
          <View style={styles.theftInfo}>
            <Text style={styles.theftTitle}>🚨 Theft / Snatching</Text>
            <Text style={styles.theftSub}>
              Shake phone to trigger 5s countdown
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <AlertCircle size={18} color="#ef4444" />
          <Text style={styles.sectionTitle}>Emergency Services</Text>
        </View>

        <View style={styles.manualGrid}>
          <TouchableOpacity
            style={[styles.manualCard, { backgroundColor: "#ef4444" }]}
          >
            <Text style={styles.manualLabel}>Police</Text>
            <Text style={styles.manualCode}>15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.manualCard, { backgroundColor: "#9333ea" }]}
          >
            <Text style={styles.manualLabel}>Fire</Text>
            <Text style={styles.manualCode}>16</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.manualCard, { backgroundColor: "#166534" }]}
          >
            <Text style={styles.manualLabel}>Edhi</Text>
            <Text style={styles.manualCode}>115</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/home")}
        >
          <HomeIcon size={24} color="#2563eb" />
          <Text style={[styles.tabText, { color: "#2563eb" }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/map")}
        >
          <MapIcon size={24} color="#94a3b8" />
          <Text style={styles.tabText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/TrustedContacts")}
        >
          <Users size={24} color="#94a3b8" />
          <Text style={styles.tabText}>Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/Profile")}
        >
          <User size={24} color="#94a3b8" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(220, 38, 38, 0.98)",
    zIndex: 10000,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContent: { alignItems: "center", width: "100%" },
  overlayTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 20,
  },
  overlaySub: { color: "#fff", fontSize: 16, opacity: 0.8 },
  timerText: {
    color: "#fff",
    fontSize: 120,
    fontWeight: "900",
    marginVertical: 20,
  },
  cancelBtn: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: "center",
    elevation: 10,
  },
  cancelBtnText: {
    color: "#ef4444",
    fontWeight: "900",
    fontSize: 16,
    marginLeft: 10,
  },
  header: {
    backgroundColor: "#161E2E",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: Platform.OS === "android" ? 45 : 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIconsContainer: { flexDirection: "row" },
  greetText: { color: "#94a3b8", fontSize: 14 },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#161E2E",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },
  statusText: { color: "#22c55e", fontSize: 13, fontWeight: "700" },
  scrollContent: { paddingBottom: 110 },
  sosContainer: { alignItems: "center", marginVertical: 30 },
  sosOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    elevation: 15,
  },
  sosInner: { alignItems: "center" },
  sosText: { color: "#fff", fontSize: 42, fontWeight: "900", marginTop: 5 },
  sosSubText: { color: "#fff", fontSize: 12, fontWeight: "bold", opacity: 0.9 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#1e293b",
  },
  theftCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    alignItems: "center",
  },
  theftIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  theftInfo: { marginLeft: 15, flex: 1 },
  theftTitle: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  theftSub: { fontSize: 13, color: "#64748b", marginTop: 4 },
  manualGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  manualCard: {
    flex: 0.31,
    height: 110,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  manualLabel: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  manualCode: { color: "#fff", fontSize: 12, opacity: 0.85 },
  bottomTab: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    justifyContent: "space-around",
    width: "100%",
  },
  tabItem: { alignItems: "center" },
  tabText: { fontSize: 11, color: "#94a3b8", marginTop: 4, fontWeight: "500" },
});
