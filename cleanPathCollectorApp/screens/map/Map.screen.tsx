import React, { useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Text, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import { get } from '@/helpers/api';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface Schedule {
  _id: string;
  wmaId: string;
  collectorId: string;
  area: string | { name: string };
  date: string;  
  time: string;  
  status: string;
}

interface Garbage {
  _id: string;
  longitude: number;
  latitude: number;
  type: string;
  address: string;
  area: string | { name: string };
}


const MapScreen = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [userLocationIsOn, setUserLocationOn] = useState(false);
  const [leafletHTML, setLeafletHTML] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [destinationLocation, setDestinationLocation] = useState('Nugegoda');
  const [startLocation, setStartLocation] = useState('Kaduwela');
  const [searchResult, setSearchResult] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [garbages, setGarbages] = useState<Garbage[]>([]);
  const [inProgressSchedule, setInProgressSchedule] = useState<Schedule>();
  
  const fetchSchedules = async () => {
    try {
      const response = await get(`/schedule/collector-schedules`);
      const scheduleData = response.data as Schedule[];
      setSchedules(scheduleData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };
  
  const fetchGarbages = async (id : string) => {
    try {
      const response = await get(`/garbage/garbage-requests-area/${id}`);
      const garbageData = response.data as Garbage[];
      setGarbages(garbageData);
    } catch (error) {
      console.error('Error fetching garbages:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    const inProgressSch = schedules.find(schedule => schedule.status === "In Progress");
    if(inProgressSch){
      setInProgressSchedule(inProgressSch);
    }
    else{
      setUserLocationOn(false);
    }
  }, [])

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (error) {
        setErrorMsg(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      }
    };

    const intervalId = setInterval(getLocation, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchGarbages('6703ffa8c936b7432d667c8e');
  }, []);

  const searchHandler = async () => {
    let result = '';
    let icon = '';
    garbages.map((garbage) => {
      if(garbage.type == 'Recyclable'){
        icon = 'redIcon';
      }
      else{
        icon = 'greenIcon';
      }
      result = result + `
      const Location${garbage._id} = [${garbage.latitude}, ${garbage.longitude}];
      L.marker(Location${garbage._id}, { icon: ${icon} }).addTo(mymap).bindPopup('${garbage.address}');`
    })


    setSearchResult(result);
  };

  useEffect(() => {
    if (location) {
      searchHandler();
    }
  }, [location]);

  useEffect(() => {
    const mapHTML = `
      <!DOCTYPE html>
      <html>
        <head>
            <title>Leaflet Map with Geocoding</title>
            <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
            <style>
              body, html, #map { height: 100%; margin: 0; padding: 0; }
              .dot {
                position: relative;
                width: 12px;
                height: 12px;
                background-color: #2E8B3A;
                border-radius: 50%;
                border: 2px solid #FFFFFF;
              }
              .dotinner {
                position: absolute;
                top: -125%;
                left: -125%;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 15px solid #2e8b3a2b;
              }
            </style>
            <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
            <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
            <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
        </head>
        <body>
            <div id="map"></div>
            <script>
              const mymap = L.map('map', {
                center: [${location?.latitude || 6.934101}, ${location?.longitude || 79.859634}], 
                zoom: 12,
                zoomControl: false
              });
              
              const userLocationIcon = L.divIcon({
                  className: 'custom-icon',
                  iconSize: [41, 41],
                  html: \`<div class=" dot "><div class="dotinner"></div></div>\`
              });

              const redIcon = L.icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              
              const greenIcon = L.icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });

              L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 19,
                  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              }).addTo(mymap);

              if(${userLocationIsOn}){
                const userLocation = [${location?.latitude}, ${location?.longitude}];
                L.marker(userLocation, { icon: userLocationIcon }).addTo(mymap).bindPopup('Your Location');
                mymap.setView(userLocation, 12);
                const garbLocation1 = [6.908173, 79.892441];
                L.marker(garbLocation1, { icon: redIcon }).addTo(mymap).bindPopup('9th lane, Rajagiriya');
                const garbLocation2 = [6.905255, 79.900230];
                L.marker(garbLocation2, { icon: greenIcon }).addTo(mymap).bindPopup('sal uyana, Rajagiriya');
                const garbLocation3 = [6.910580, 79.891197];
                L.marker(garbLocation3, { icon: greenIcon }).addTo(mymap).bindPopup('2nd lane, Rajagiriya');
                const garbLocation4 = [6.907662, 79.899501];
                L.marker(garbLocation4, { icon: redIcon}).addTo(mymap).bindPopup('Rajagiriya');
                

                ${searchResult}

                
              }
            </script>
        </body>
      </html>
    `;

    setLeafletHTML((prevHTML) => (prevHTML !== mapHTML ? mapHTML : prevHTML));
  }, [location, searchResult, userLocationIsOn]);

  const windowHeight = Dimensions.get('window').height;

  const handleToggleLocation = async (enable: boolean) => {
    if (enable) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setUserLocationOn(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        setUserLocationOn(true);
      } catch (error) {
        setErrorMsg(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        setUserLocationOn(false);
      }
    } else {
      setUserLocationOn(false);
    }
  };

  return (
    <View style={{ flex: 1, height: Platform.OS === 'web' ? windowHeight : '100%', position: 'relative' }}>
      {Platform.OS === 'web' ? (
        // On web, react-native-webview is not supported — render an iframe with the generated HTML
        <iframe
          title="leaflet-map"
          srcDoc={leafletHTML}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: leafletHTML }}
          style={{ flex: 1 }}
        />
      )}

      <View style={{ position: 'absolute', top: 12, left: '5%', width: '90%', zIndex: 20, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
        {/* Clickable status chip: tap to toggle location (handles permissions when enabling) */}
        <TouchableOpacity onPress={() => handleToggleLocation(!userLocationIsOn)} style={{ backgroundColor: 'rgba(234,247,234,0.95)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, flexDirection: 'row', alignItems: 'center', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 6 }}>
          <Text style={{ color: userLocationIsOn ? '#1E7F2A' : '#2E8B3A', fontWeight: '700', marginRight: 8 }}>{userLocationIsOn ? 'Location Service is On' : 'Location Service is Off'}</Text>
          <Fontisto name={userLocationIsOn ? 'toggle-on' : 'toggle-off'} size={22} color={userLocationIsOn ? '#1E7F2A' : '#2E8B3A'} />
        </TouchableOpacity>
      </View>

      {/* {userLocationIsOn && (<View className='absolute bottom-3 rounded-xl w-[90%] bg-primary left-[5%] py-3 px-5 flex flex-row justify-between items-center'>
        <Text className='text-xl text-white font-semibold text-center'>{inProgressSchedule?.area?.name ?? 'Unknown Area'}</Text>
        <FontAwesome6 name="route" size={24} color="white" />
      </View>)} */}
    </View>
  );
};

export default MapScreen;
