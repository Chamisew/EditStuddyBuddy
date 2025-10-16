import { View, Text, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScheduleListCardComponent from '@/components/scheduleListCardComponent/scheduleListCardComponent';
import { get } from '@/helpers/api';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

interface Schedule {
  _id: string;
  wmaId: string;
  collectorId: string;
  area: string | { name: string };
  date: string;  
  time: string;  
  status: string;
}

const ScheduleScreen = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [completedSchedules, setCompletedSchedules] = useState<Schedule[]>([]);
  const [inCompletedSchedules, setInCompletedSchedules] = useState<Schedule[]>([]);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const response = await get(`/schedule/collector-schedules`);
      const scheduleData = response.data as Schedule[];
      setSchedules(scheduleData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      Alert.alert('Error', 'Failed to fetch schedules data.');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [schedules]);

  // Helper function to sort by date and time
  const sortByDateAndTime = (a: Schedule, b: Schedule) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime();
    const dateB = new Date(`${b.date}T${b.time}`).getTime();
    return dateA - dateB;
  };

  // Filter and sort schedules based on status, date, and time
  useEffect(() => {
    const completed = schedules
      .filter(schedule => schedule.status === 'Completed')
      .sort(sortByDateAndTime); // Sort by date and time

    const inCompleted = schedules
      .filter(schedule => schedule.status !== 'Completed')
      .sort(sortByDateAndTime); // Sort by date and time
    
    setCompletedSchedules(completed);
    setInCompletedSchedules(inCompleted);
  }, [schedules]);

  const pendingCount = inCompletedSchedules.length;
  const completedCount = completedSchedules.length;

  return (
    <View className="p-5" style={{ flex: 1 }}>
      {/* Header banner */}
      <View style={{ backgroundColor: '#EAF7EA', borderRadius: 16, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#DFF3D9', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <FontAwesome6 name="calendar-days" size={22} color="#1E7F2A" />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#134E0E' }}>Your Schedules</Text>
            <Text style={{ color: '#475569', marginTop: 4 }}>Stay on top of your daily route</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', marginRight: 12 }}>
            <Text style={{ fontWeight: '700', color: '#134E0E' }}>{pendingCount}</Text>
            <Text style={{ color: '#6B7280', fontSize: 12 }}>Pending</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontWeight: '700', color: '#134E0E' }}>{completedCount}</Text>
            <Text style={{ color: '#6B7280', fontSize: 12 }}>Completed</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* To be completed section */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>To be completed</Text>
            <Text style={{ color: '#6B7280' }}>{pendingCount} items</Text>
          </View>

          {inCompletedSchedules.length > 0 ? (
            inCompletedSchedules.map((schedule, index) => {
              const areaName =
                typeof schedule.area === 'string'
                  ? schedule.area
                  : schedule.area?.name || 'Unknown Area';

              return (
                <View key={schedule._id} style={{ marginBottom: 12 }}>
                  <ScheduleListCardComponent
                    id={schedule._id}
                    area={areaName}
                    date={schedule.date}
                    time={schedule.time}
                        status={schedule.status}
                    garbageId={(schedule as any).garbageId}
                    btn={true}
                  />
                </View>
              );
            })
          ) : (
            <View style={{ padding: 16, backgroundColor: '#F8FAFC', borderRadius: 10 }}>
              <Text style={{ color: '#6B7280' }}>You're all caught up! No scheduled routes pending.</Text>
            </View>
          )}
        </View>

        {/* Completed section */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>Completed</Text>
            <Text style={{ color: '#6B7280' }}>{completedCount} items</Text>
          </View>

          {completedSchedules.length > 0 ? (
            completedSchedules.map((schedule) => {
              const areaName =
                typeof schedule.area === 'string'
                  ? schedule.area
                  : schedule.area?.name || 'Unknown Area';

              return (
                <View key={schedule._id} style={{ marginBottom: 12 }}>
                  <ScheduleListCardComponent
                    id={schedule._id}
                    area={areaName}
                    date={schedule.date}
                    time={schedule.time}
                        status={schedule.status}
                        garbageId={(schedule as any).garbageId}
                    btn={false}
                  />
                </View>
              );
            })
          ) : (
            <View style={{ padding: 16, backgroundColor: '#F8FAFC', borderRadius: 10 }}>
              <Text style={{ color: '#6B7280' }}>No completed schedules yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ScheduleScreen;
