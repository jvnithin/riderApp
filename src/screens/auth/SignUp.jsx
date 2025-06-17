import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../../services/authService';
import { validateForm } from '../../utils/valdation';

import RiderContext from '../../context/RiderContext';
import axios from 'axios';

const SignUp = ({ navigation }) => {
  const { location, getCurrentLocation, apiUrl } = useContext(RiderContext);
  useEffect(() => {
    getCurrentLocation(); // Call when SignUp mounts
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSignUp = async () => {
    const validation = validateForm(formData);
    console.log(formData);
    // if (!validation.isValid) {
    //   setErrors(validation.errors);
    //   console.log('error in validation');
    //   return;
    // }

    setIsLoading(true);
    try {
      //   const response = await AuthService.signUp(formData);
      const response = await axios.post(
        `${apiUrl}/api/auth/driver/signup`,
        formData,
      );
      console.log(response);
      //   Alert.alert('Success', 'Account created successfully!');
      navigation.replace('SignIn');
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-2xl font-bold">RE</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </Text>
              <Text className="text-gray-600 text-center">
                Join RideEasy and start your journey
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              {/* Name Input */}
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Full Name
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={value => handleInputChange('name', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  className={`w-full px-4 py-3 border rounded-lg bg-white ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Email Input */}
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </Text>
                <TextInput
                  value={formData.email}
                  onChangeText={value => handleInputChange('email', value)}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`w-full px-4 py-3 border rounded-lg bg-white ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Phone Input */}
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Phone Number
                </Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={value => handleInputChange('phone', value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  className={`w-full px-4 py-3 border rounded-lg bg-white ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.phone}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              {/* <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={formData.password}
                    onChangeText={value => handleInputChange('password', value)}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    className={`w-full px-4 py-3 border rounded-lg bg-white pr-12 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Text className="text-gray-500">
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </Text>
                )}
              </View> */}

              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={formData.password}
                    onChangeText={value => handleInputChange('password', value)}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword} // ✅ this toggles masking
                    className={`w-full px-4 py-3 border rounded-lg text-black bg-white pr-12 ${
                      errors.password ? 'border-red-300' : 'border-gray-300 '
                    }`}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Text className="text-gray-500">
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isLoading}
                className={`w-full py-4 rounded-lg items-center mt-6 ${
                  isLoading ? 'bg-gray-400' : 'bg-blue-600'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-semibold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500">or</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Sign In Link */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <Text className="text-blue-600 font-medium">Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
