import ScheduleListCardComponent from '@/components/scheduleListCardComponent/scheduleListCardComponent';
import { get, post } from '@/helpers/api';
import { Entypo } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCameraPermissions } from 'expo-camera';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';

interface Schedule {
  _id: string;
  wmaId: string;
  collectorId: string;
  area: string | { name: string };
  date: string;
  time: string;  
  status: string;
}

interface Collector {
  _id: string;
  collectorName: string;
  collectorNIC: string;
  truckNumber: string;
}

const CollectorDashboard: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  const [greeting, setGreeting] = useState("Good Morning");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [progressSchedules, setProgressSchedules] = useState<Schedule[]>([]);
  const [currentCollector, setCurrentCollector] = useState<Collector>();

  useEffect(() => {
    const fetchBus = async () => {
        try {
            const response = await get(`collector/profile`);
            setCurrentCollector(response.data as Collector);
        } catch (error) {
            console.error("Error fetching bus profile:", error);
        }
      };
      fetchBus();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await get(`/schedule/collector-schedules`);
      const scheduleData = response.data as Schedule[];
      setSchedules(scheduleData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    // Consider Scheduled, In Progress or Urgent schedules as part of the current journey
    const inprogress = schedules.filter(schedule => ['In Progress', 'Scheduled', 'Urgent'].includes(schedule.status));
    setProgressSchedules(inprogress);
  }, [schedules]);


  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  const logoutHandler = async () => {
    try {
        const response = await post(`collector/logout`, {}); 
        if (response.status === 200) {
          Alert.alert("Success", "Logout successfully.");
            router.push("/");
        } else {
            console.error("Logout failed: unexpected response", response);
        }
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header card */}
      <View style={[styles.headerCard, styles.shadow]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: 'https://th.bing.com/th/id/OIP.JEwpvu9u48twP24qusBd7AHaLH?w=853&h=1280&rs=1&pid=ImgDetMain' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.mutedText}>{greeting}</Text>
            <Text style={styles.titleText}>{currentCollector?.collectorName}</Text>
            <Text style={styles.mutedTextSmall}>Truck: {currentCollector?.truckNumber ?? '—'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
          <View style={styles.cardSmall}>
            <Text style={styles.mutedTextSmall}>Monthly Earnings</Text>
            <Text style={styles.metricText}>Rs. 15,000</Text>
          </View>
          <View style={styles.cardSmall}>
            <Text style={styles.mutedTextSmall}>Today's Collections</Text>
            <Text style={styles.metricText}>120</Text>
          </View>
        </View>
      </View>

      {/* Actions row */}
      <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.smallAction} onPress={() => router.push('/(routes)/map')}>
          <Ionicons name="location-outline" size={20} color="#111111" />
          <Text style={[styles.smallActionLabel, { color: '#111111' }]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallAction} onPress={() => router.push('/(routes)/schedule')}>
          <Ionicons name="calendar-outline" size={20} color="#111111" />
          <Text style={[styles.smallActionLabel, { color: '#111111' }]}>Schedules</Text>
        </TouchableOpacity>
        <Link href="/scanner" asChild>
            <TouchableOpacity style={styles.smallActionPrimary}>
            <Ionicons name="scan" size={20} color="#111111" />
            <Text style={[styles.smallActionLabel, { color: '#111111' }]}>Scan</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      {/* Earnings and logout */}
      <View style={{ marginTop: 18 }}>
        <View style={[styles.earningsCard, styles.shadow]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.mutedTextSmall}>Monthly Earnings so far</Text>
              <Text style={styles.metricText}>Rs. 15,000.00</Text>
            </View>
            <TouchableOpacity style={styles.viewButton} onPress={() => router.push('/(routes)/earnings')}>
              <Text style={{ color: '#111111', fontWeight: '600' }}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

            <TouchableOpacity onPress={logoutHandler} style={[styles.logoutBtn, styles.shadow, { marginTop: 14 }] }>
          <Entypo name="log-out" size={18} color="#111111" />
          <Text style={{ marginLeft: 8, color: '#111111', fontWeight: '600' }}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CollectorDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  headerCard: {
    backgroundColor: 'rgba(136, 177, 103, 0.59)',
    borderRadius: 12,
    padding: 16,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  mutedText: { color: '#111111', fontSize: 13 },
  mutedTextSmall: { color: '#111111', fontSize: 12 },
  titleText: { color: '#111111', fontSize: 18, fontWeight: '700', marginTop: 4 },
  metricText: { color: '#111111', fontSize: 18, fontWeight: '700', marginTop: 6 },
  cardSmall: { flex: 1, backgroundColor: 'rgba(136, 177, 103, 0.59)', borderRadius: 10, padding: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  smallAction: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: 'rgba(136, 177, 103, 0.59)', marginRight: 8 },
  smallActionPrimary: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: 'rgba(136, 177, 103, 0.59)' },
  smallActionLabel: { marginTop: 6, color: '#111111', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111' },
  emptyBox: { backgroundColor: 'rgba(136, 177, 103, 0.59)', padding: 12, borderRadius: 10, marginTop: 8, alignItems: 'center' },
  earningsCard: { backgroundColor: 'rgba(136, 177, 103, 0.59)', borderRadius: 10, padding: 12 },
  viewButton: { backgroundColor: 'rgba(136, 177, 103, 0.59)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, backgroundColor: 'rgba(136, 177, 103, 0.59)' },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
});