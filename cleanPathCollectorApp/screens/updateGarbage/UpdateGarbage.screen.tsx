import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { get, put, post } from '@/helpers/api'; // Assuming you have a 'post' method for creating transactions
import { Ionicons } from '@expo/vector-icons';

interface BinProps {
  _id: string;
  userId: UserProps | null;
  type: string;
  area: AreaProps;
  status: string;
  garbageStatus: string;
}

interface UserProps {
  _id: string;
  username: string;
  contact: string;
  address: string;
}

interface AreaProps {
  _id: string;
  name: string;
  type: string;
  rate: number;
}

const UpdateGarbageScreen = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [gStatus, setGStatus] = useState('');
  const [bin, setBin] = useState<BinProps | null>(null);
  const [weight, setWeight] = useState<number | null>(null); // State for garbage weight

  const fetchBin = async () => {
    try {
      const response = await get(`smartDevices/${id}`); // Fetch the bin by ID
      setBin(response.data as BinProps);
    } catch (error) {
      console.error('Error fetching bin:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBin();
    }
  }, [id]);

  const createTransaction = async (transactionData: any) => {
    try {
      await post(`transactions`, transactionData); // Assuming you have a route to create transactions
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleStatusUpdate = async (newStatus: React.SetStateAction<string>) => {
    if (bin?.area?.type === 'weightBased' && !weight) {
      Alert.alert('Invalid Input', 'Please enter the weight for the garbage.');
      return;
    }

    setGStatus(newStatus);
    try {
      // Prepare transaction data if status is being updated to "Collected"
      if (newStatus === "Collected" && bin) {
        const areaType = bin.area.type;
        const garbageWeight = weight;
        const rate = bin.area.rate;

        let amount = areaType === "weightBased" ? garbageWeight! * rate : rate; // Calculate amount

        // Apply discount if the garbage type is "Recyclable"
        if (bin.type === "Recyclable") {
          amount *= 0.9; // Apply 10% discount
        }

        const newTransaction = {
          userID: bin.userId?._id,
          description: `Garbage Collection Bin: ${bin.type === "non-recyclable" ? "Non-Recyclable" : "Recyclable"}`,
          isRefund: false,
          isPaid: false,
          amount: amount,
        };

        await createTransaction(newTransaction); // Create the transaction
      }

      // Update garbage status
      await put(`smartDevices/device/${id}`, { garbageStatus: newStatus, weight: weight ?? undefined });
      Alert.alert(
        'Status Updated',
        'The status has been successfully updated. The user will be notified. Thank you!',
        [{ text: 'OK', onPress: () => router.push({ pathname: '/dashboard' }) }]
      );
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(
        'Update Failed',
        'There was an error updating the status. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-6">
        <View className="bg-white rounded-lg shadow-md p-6 mb-6">
          <View className="flex gap-2">
            <View className="bg-[#e3fbcd] rounded-full w-10 h-10 p-2">
              <Ionicons name="trash" size={22} color="#64903c" />
            </View>
            <Text className="text-xl font-bold text-primary mb-4 uppercase">
              Smart Bin Details
            </Text>
          </View>
          {bin && (
            <View className="space-y-2">

              <Text className="text-gray-600 text-md">
                <Text className="font-medium">Name:</Text> {bin?.userId?.username || 'N/A'}
              </Text>
              <Text className="text-gray-600 text-md">
                <Text className="font-medium">Contact:</Text> {bin?.userId?.contact || 'N/A'}
              </Text>
              <Text className="text-gray-600 text-md">
                <Text className="font-medium">Address:</Text> {bin?.userId?.address || 'N/A'}
              </Text>
              <Text className={bin?.type === "non-recyclable" ? `text-orange-600 text-md font-bold uppercase` : `text-green-600 text-md font-bold uppercase`}>
                <Text className="font-medium text-gray-600 capitalize">Bin Type:</Text> {bin?.type === "non-recyclable" ? "Non-Recyclable" : "Recyclable"}
              </Text>
              <View className="bg-gray-100 p-3 rounded-lg space-y-2">
                <Text className="text-gray-600 text-md">
                  <Text className="font-medium">Area:</Text> {bin?.area?.name}
                </Text>
                <Text className="text-gray-600 text-md ">
                  <Text className="font-medium">Rate:</Text> LKR {bin?.area?.rate}.00
                </Text>
                <Text className={bin?.area?.type === "flat" ? `text-indigo-600 font-bold uppercase` : `text-teal-500 font-bold uppercase`}>
                  <Text className="font-medium text-gray-600 capitalize">Area Type:</Text> {bin?.area?.type === "flat" ? "Flat Rate" : "Weight Based"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Show input for weight if area type is 'weightBased' */}
        {bin?.area?.type === 'weightBased' && (
          <View className="bg-white rounded-lg shadow-md p-6 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Enter Garbage Weight (kg)
            </Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2"
              placeholder="Enter weight in kg"
              keyboardType="numeric"
              value={weight ? weight.toString() : ''}
              onChangeText={(text) => setWeight(Number(text))}
            />
          </View>
        )}

        <View className="bg-white rounded-lg shadow-md p-6">
          {bin && (
            <Text className="text-md font-medium text-gray-800 mb-4">
              Current Status: <Text className={bin.garbageStatus === "Collected" ? `text-green-500 font-bold text-lg` : `text-yellow-500 font-bold text-lg`}>{bin.garbageStatus}</Text>
            </Text>)}
          <View className="w-full">
            <TouchableOpacity
              className="bg-green-100 py-2 px-6 border border-green-600 rounded-md"
              onPress={() => handleStatusUpdate("Collected")}
            >
              <Text className="text-primary font-bold text-center text-md uppercase">Mark as collected</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default UpdateGarbageScreen;
