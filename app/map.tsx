import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebaseConfig";

const CATEGORIES: any = {
  All: { color: "#2563EB", bg: "rgba(37, 99, 235, 0.2)" },
  Theft: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.3)" },
  Accident: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.3)" },
  Fire: { color: "#a951fb", bg: "rgba(147, 51, 234, 0.3)" },
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function IncidentMap() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }

        let initialPos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const initialRegion = {
          latitude: initialPos.coords.latitude,
          longitude: initialPos.coords.longitude,
          ...DEFAULT_DELTA,
        };

        setLocation(initialRegion);
        setLoading(false);

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 10, 
          },
          (currentPos) => {
            const userRegion = {
              latitude: currentPos.coords.latitude,
              longitude: currentPos.coords.longitude,
              ...DEFAULT_DELTA,
            };
            
            setLocation(userRegion);
            if (mapRef.current && isMapReady) {
              mapRef.current.animateToRegion(userRegion, 1000);
            }
          }
        );
      } catch (err) {
        setLoading(false);
      }
    })();

    const q = query(collection(db, "incidents"));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          latitude: Number(docData.latitude) || 0,
          longitude: Number(docData.longitude) || 0,
        };
      });
      setIncidents(data);
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (locationSubscription) locationSubscription.remove();
    };
  }, [isMapReady]);

  const filteredData = incidents.filter(
    (i) => activeFilter === "All" || i.type?.toLowerCase() === activeFilter.toLowerCase()
  );

  const goToMyLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(location, 1000);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 15, fontWeight: "600", color: "#374151" }}>
          SafePulse: Locating you...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* Edges 'bottom' remove kiya gaya taake bottom nav device ke bottom tak touch ho */}
      <SafeAreaView style={styles.container} edges={["top"]}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Live Incident Map</Text>
            <Text style={styles.headerSub}>Real-time safety updates</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={{ height: 60 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {Object.keys(CATEGORIES).map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setActiveFilter(item)}
                style={[
                  styles.filterBtn,
                  activeFilter === item && { backgroundColor: CATEGORIES[item].color },
                ]}
              >
                <Text style={[styles.filterText, activeFilter === item && { color: "white" }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            showsMyLocationButton={false}
            initialRegion={location}
            onMapReady={() => setIsMapReady(true)}
          >
            {filteredData.map((incident) => {
              if (!incident.latitude || !incident.longitude) return null;
              const catConfig = CATEGORIES[Object.keys(CATEGORIES).find(k => k.toLowerCase() === (incident.type || "All").toLowerCase()) || "All"];

              return (
                <React.Fragment key={incident.id}>
                  <Circle
                    center={{ latitude: incident.latitude, longitude: incident.longitude }}
                    radius={200}
                    fillColor={catConfig.bg}
                    strokeColor={catConfig.color}
                    strokeWidth={1}
                  />
                  <Marker
                    coordinate={{ latitude: incident.latitude, longitude: incident.longitude }}
                    title={incident.type}
                  >
                    <View style={[styles.markerDot, { backgroundColor: catConfig.color }]} />
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapView>

          <TouchableOpacity style={styles.myLocationFab} onPress={goToMyLocation}>
            <Ionicons name="locate" size={26} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation Fix */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/home")}>
            <Ionicons name="home-outline" size={24} color="#6B7280" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="map" size={24} color="#2563EB" />
            <Text style={[styles.navText, { color: "#2563EB" }]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/TrustedContacts")}>
            <Ionicons name="people-outline" size={24} color="#6B7280" />
            <Text style={styles.navText}>Contacts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/Profile")}>
            <Ionicons name="person-outline" size={24} color="#6B7280" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    backgroundColor: 'white',
    zIndex: 10,
    elevation: 2 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: "#f3f4f6", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 15 
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 12, color: "#6B7280" },
  filterContainer: { paddingHorizontal: 20, alignItems: "center", paddingBottom: 10 },
  filterBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F3F4F6", marginRight: 10 },
  filterText: { fontWeight: "700", color: "#4B5563", fontSize: 13 },
  mapContainer: { flex: 1, overflow: 'hidden' },
  map: { width: "100%", height: "100%" },
  markerDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: "white", elevation: 4 },
  myLocationFab: { 
    position: "absolute", 
    bottom: 20, 
    right: 20, 
    backgroundColor: "white", 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3 
  },
  bottomNav: { 
    flexDirection: "row", 
    height: Platform.OS === 'ios' ? 90 : 70, 
    backgroundColor: "white", 
    borderTopWidth: 1, 
    borderTopColor: "#F3F4F6", 
    justifyContent: "space-around",
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 10, marginTop: 4, color: "#6B7280", fontWeight: "700" },
});