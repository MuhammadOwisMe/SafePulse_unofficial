import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { onAuthStateChanged } from "firebase/auth";
import {
  AlertCircle,
  Bell,
  Flame,
  Home as HomeIcon,
  Map as MapIcon,
  Smartphone,
  User,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [isTriggered, setIsTriggered] = useState(false); // Fix: Multiple alerts lock

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

  const triggerSnatchingMode = async () => {
    if (isTriggered) return; // Dubara trigger hone se rokay ga

    setIsTriggered(true);
    console.log("🚨 SOS Triggered!");

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        setIsTriggered(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const response = await fetch(
        "http://192.168.100.111:3000/api/sos/trigger",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userName,
            location: {
              lat: location.coords.latitude,
              long: location.coords.longitude,
            },
            type: "Snatching (Shake Detected)",
          }),
        },
      );

      if (response.ok) {
        console.log("✅ Alert Logged to Firestore!");
        router.push("/TheftAlert" as any);
      }
    } catch (error) {
      console.log("SOS Trigger Error:", error);
    } finally {
      // 5 second baad lock khulega
      setTimeout(() => setIsTriggered(false), 5000);
    }
  };

  useEffect(() => {
    const SHAKE_THRESHOLD = 2.0;
    const subscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const acceleration = Math.sqrt(x * x + y * y + z * z);

      if (acceleration > SHAKE_THRESHOLD && !isTriggered) {
        triggerSnatchingMode();
      }
    });

    Accelerometer.setUpdateInterval(100);
    return () => subscription.remove(); // Cleanup when leaving screen
  }, [userName, isTriggered]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#161E2E" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetText}>Stay Safe,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.headerIcons}>
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
          <Text style={styles.statusText}>Safe Mode Active</Text>
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
              <Text style={styles.sosSubText}>TAP FOR HELP</Text>
              <Text style={styles.sosCategory}>General / Fire / Disaster</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Smartphone size={18} color="#2563eb" />
          <Text style={styles.sectionTitle}>Gesture Detection</Text>
        </View>

        <TouchableOpacity
          style={styles.theftCard}
          onPress={triggerSnatchingMode}
        >
          <View style={styles.theftIconCircle}>
            <AlertCircle size={24} color="#ef4444" />
          </View>
          <View style={styles.theftInfo}>
            <Text style={styles.theftTitle}>🚨 Theft / Snatching</Text>
            <Text style={styles.theftSub}>
              Shake phone or tap for immediate alert
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <AlertCircle size={18} color="#ef4444" />
          <Text style={styles.sectionTitle}>Report Manually</Text>
        </View>

        <View style={styles.manualGrid}>
          <TouchableOpacity
            style={[styles.manualCard, { backgroundColor: "#ef4444" }]}
          >
            <AlertCircle size={28} color="#fff" />
            <Text style={styles.manualLabel}>Police</Text>
            <Text style={styles.manualCode}>15</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.manualCard, { backgroundColor: "#9333ea" }]}
          >
            <Flame size={28} color="#fff" />
            <Text style={styles.manualLabel}>Fire</Text>
            <Text style={styles.manualCode}>16</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.manualCard, { backgroundColor: "#166534" }]}
          >
            <Users size={28} color="#fff" />
            <Text style={styles.manualLabel}>Ambulance</Text>
            <Text style={styles.manualCode}>1020</Text>
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
  container: { flex: 1, backgroundColor: "#fff" },
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
  greetText: { color: "#94a3b8", fontSize: 14 },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  headerIcons: { flexDirection: "row" },
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
  sosContainer: { alignItems: "center", marginVertical: 40 },
  sosOuter: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    elevation: 15,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  sosInner: { alignItems: "center" },
  sosText: { color: "#fff", fontSize: 40, fontWeight: "900", marginTop: 5 },
  sosSubText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    opacity: 0.9,
    letterSpacing: 1,
  },
  sosCategory: { color: "#fff", fontSize: 10, marginTop: 10, opacity: 0.7 },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
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
    marginTop: 5,
  },
  manualCard: {
    flex: 0.31,
    height: 135,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  manualLabel: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 12,
    fontSize: 15,
  },
  manualCode: { color: "#fff", fontSize: 12, opacity: 0.85, marginTop: 2 },
  bottomTab: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    justifyContent: "space-around",
    width: "100%",
  },
  tabItem: { alignItems: "center" },
  tabText: { fontSize: 11, color: "#94a3b8", marginTop: 6, fontWeight: "500" },
});
