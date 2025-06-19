import React, { useContext } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RiderContext from '../context/RiderContext';

const Profile = () => {
  const { rider } = useContext(RiderContext);
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Back button */}
      <View className="absolute top-14 left-4 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header with background */}
        <View className="h-56 bg-gray-300" />

        {/* Avatar Icon */}
        <View className="absolute top-40 left-0 right-0 items-center">
          <View className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 items-center justify-center">
            <MaterialIcons name="person" size={60} color="#4B5563" />
          </View>
        </View>

        {/* Info Card */}
        <View className="mt-16 mx-4 bg-white rounded-xl p-6 shadow-lg">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            {rider.username}
          </Text>
          <View className="border-t border-gray-200 pt-4">
            <View className="flex-row items-center mb-3">
              <Text className="w-24 text-gray-600 font-semibold">Email:</Text>
              <Text className="flex-1 text-gray-800">{rider.email}</Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Text className="w-24 text-gray-600 font-semibold">Phone:</Text>
              <Text className="flex-1 text-gray-800">{rider.phone}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
