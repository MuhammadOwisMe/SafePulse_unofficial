import { usePathname, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
    CheckCircle,
    ChevronRight,
    Home as HomeIcon,
    Lock,
    LogOut,
    MapPin,
    ShieldAlert,
    User,
    Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig"; // Firebase config import zaroor karein

export default function ProfileScreen() {
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic states for user info
  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("");
  const [avatarInitial, setAvatarInitial] = useState("?");

  useEffect(() => {
    // Firebase Auth Listener: Ye check karta hai kaunsa user login hai
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Agar user ka displayName set hai (Signup wali file se), toh wo dikhao
        // Warna email ka pehla part nikal lo
        const name = user.displayName || user.email?.split("@")[0] || "User";
        const email = user.email || "No email provided";

        setUserName(name);
        setUserEmail(email);
        setAvatarInitial(name.charAt(0).toUpperCase());
      } else {
        // Agar login nahi hai toh login screen pe bhej do
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, []);

  // Logout Function
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await auth.signOut();
            router.replace("/");
          } catch (error) {
            Alert.alert("Error", "Could not log out.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* HEADER SECTION - Now Dynamic */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>

          {/* ACCOUNT SECTION */}
          <Text style={styles.sectionTitle}>ACCOUNT</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/personal-info")}
          >
            <View style={[styles.iconBg, { backgroundColor: "#eff6ff" }]}>
              <User size={22} color="#2563eb" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.mainText}>Personal Information</Text>
              <Text style={styles.subText}>
                View and update profile details
              </Text>
            </View>
            <ChevronRight size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.card,
              { borderColor: "#fcd34d", backgroundColor: "#fffbeb" },
            ]}
            onPress={() => router.push("/TrustedContacts")}
          >
            <View style={[styles.iconBg, { backgroundColor: "#fef3c7" }]}>
              <ShieldAlert size={22} color="#d97706" />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.mainText, { color: "#b45309" }]}>
                Trusted Contacts
              </Text>
              <Text style={styles.subText}>Manage your emergency circle</Text>
            </View>
          </TouchableOpacity>

          {/* SAFETY & PRIVACY */}
          <Text style={styles.sectionTitle}>SAFETY & PRIVACY</Text>
          <TouchableOpacity style={styles.card}>
            <View style={[styles.iconBg, { backgroundColor: "#f0fdf4" }]}>
              <Lock size={22} color="#16a34a" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.mainText}>Privacy Settings</Text>
              <Text style={styles.subText}>Location & data sharing</Text>
            </View>
            <ChevronRight size={20} color="#d1d5db" />
          </TouchableOpacity>

          {/* FIREBASE SYNC CARD */}
          <View style={styles.syncCard}>
            <View style={styles.syncHeader}>
              <Text style={styles.syncTitle}>System Status</Text>
              <View style={styles.statusBadge}>
                <CheckCircle size={14} color="#16a34a" />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            </View>
            <View style={styles.syncRow}>
              <Text style={styles.syncLabel}>Authentication</Text>
              <Text style={styles.syncVal}>Active</Text>
            </View>
            <View style={styles.syncRow}>
              <Text style={styles.syncLabel}>Firestore</Text>
              <Text style={styles.syncVal}>Synced</Text>
            </View>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* --- BOTTOM NAVIGATION BAR --- */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/home")}
          >
            <HomeIcon
              size={24}
              color={pathname === "/home" ? "#2563eb" : "#94a3b8"}
            />
            <Text
              style={[
                styles.navText,
                pathname === "/home" && { color: "#2563eb" },
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/map")}
          >
            <MapPin
              size={24}
              color={pathname === "/map" ? "#2563eb" : "#94a3b8"}
            />
            <Text
              style={[
                styles.navText,
                pathname === "/map" && { color: "#2563eb" },
              ]}
            >
              Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/TrustedContacts")}
          >
            <Users
              size={24}
              color={pathname === "/TrustedContacts" ? "#2563eb" : "#94a3b8"}
            />
            <Text
              style={[
                styles.navText,
                pathname === "/TrustedContacts" && { color: "#2563eb" },
              ]}
            >
              Contacts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/Profile")}
          >
            <User
              size={24}
              color={pathname === "/Profile" ? "#2563eb" : "#94a3b8"}
            />
            <Text
              style={[
                styles.navText,
                pathname === "/Profile" && { color: "#2563eb" },
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#1e293b",
    padding: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { color: "white", fontSize: 32, fontWeight: "bold" },
  userName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  userEmail: { color: "#94a3b8", fontSize: 14 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconBg: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: { flex: 1, marginLeft: 15 },
  mainText: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  subText: { fontSize: 12, color: "#64748b" },
  syncCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  syncHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  syncTitle: { fontWeight: "bold", fontSize: 16 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  syncRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  syncLabel: { color: "#64748b", fontSize: 13 },
  syncVal: { color: "#16a34a", fontWeight: "bold", fontSize: 13 },
  logoutBtn: {
    backgroundColor: "#ef4444",
    marginHorizontal: 20,
    marginTop: 30,
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: { color: "white", fontWeight: "bold", marginLeft: 10 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 25 : 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 10, color: "#94a3b8", marginTop: 4, fontWeight: "600" },
});
