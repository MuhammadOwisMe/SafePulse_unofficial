import { useRouter } from "expo-router";
import {
    AlertTriangle,
    CheckCircle,
    Mail,
    MapPin,
    Mic,
    Phone,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TheftAlert() {
  const router = useRouter();

  useEffect(() => {
    // Screen khulte hi email bhejane ka function
    sendAlertEmails();
  }, []);

  const sendAlertEmails = async () => {
    try {
      // Ye endpoint aapke trusted contacts ko email trigger karega
      await fetch("http://192.168.100.111:3000/api/sos/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "farazzz" }), // User ID backend ko bhejein
      });
      console.log("📧 Alert Emails Triggered");
    } catch (error) {
      console.log("Email trigger error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.alertHeader}>
          <AlertTriangle size={60} color="#ef4444" />
          <Text style={styles.alertTitle}>Theft Alert ACTIVE</Text>
          <Text style={styles.alertSub}>Help is on the way</Text>
        </View>

        <View style={styles.cardContainer}>
          {/* GPS Location */}
          <View style={styles.statusItem}>
            <View style={[styles.iconCircle, { backgroundColor: "#166534" }]}>
              <MapPin size={24} color="#fff" />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>GPS Location Shared</Text>
              <Text style={styles.statusSubText}>Live tracking active</Text>
            </View>
            <CheckCircle size={20} color="#22c55e" />
          </View>

          {/* Email Alert - NEW */}
          <View style={styles.statusItem}>
            <View style={[styles.iconCircle, { backgroundColor: "#ea580c" }]}>
              <Mail size={24} color="#fff" />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Trusted Contacts Notified</Text>
              <Text style={styles.statusSubText}>
                Emails sent with live location
              </Text>
            </View>
            <CheckCircle size={20} color="#22c55e" />
          </View>

          {/* Recording */}
          <View style={styles.statusItem}>
            <View style={[styles.iconCircle, { backgroundColor: "#991b1b" }]}>
              <Mic size={24} color="#fff" />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Audio Evidence</Text>
              <Text style={styles.statusSubText}>
                Background recording active...
              </Text>
            </View>
            <View style={styles.recordingPulse} />
          </View>
        </View>

        <TouchableOpacity style={styles.callButton}>
          <Phone size={20} color="#fff" />
          <Text style={styles.buttonText}>Call Police (15)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endButton}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.endButtonText}>✕ End Emergency Alert</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... Styles (Puraane wale hi use honge) ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: { padding: 20, alignItems: "center" },
  alertHeader: { alignItems: "center", marginVertical: 30 },
  alertTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },
  alertSub: { color: "#94a3b8", fontSize: 16 },
  cardContainer: { width: "100%", marginBottom: 30 },
  statusItem: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  statusTextContainer: { flex: 1, marginLeft: 15 },
  statusTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  statusSubText: { color: "#94a3b8", fontSize: 12 },
  recordingPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },
  callButton: {
    backgroundColor: "#166534",
    flexDirection: "row",
    width: "100%",
    padding: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  endButton: {
    width: "100%",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  endButtonText: { color: "#94a3b8", fontWeight: "bold" },
});
