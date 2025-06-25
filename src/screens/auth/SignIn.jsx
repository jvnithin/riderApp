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
import AuthService from '../../services/authService.js';
import { validateForm } from '../../utils/valdation.js';
import RiderContext from '../../context/RiderContext.jsx';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SignIn = ({ navigation }) => {
  const { getCurrentLocation, apiUrl ,setRider} = useContext(RiderContext);

  useEffect(() => {
    getCurrentLocation(); // Call when Signin mounts
  }, []);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

  const handleSignIn = async () => {
    const validation = validateForm(formData, false);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      //   const response = await AuthService.signIn(formData);
      //   Alert.alert('Success', 'Signed in successfully!');
      //   // Navigate to home screen or handle successful login
      console.log(formData);
      console.log(`${apiUrl}/api/auth/login`)
      const response = await axios.post(
        `${apiUrl}/api/auth/login`,

        formData,
      );
      setRider(response.data.user);
      console.log(response.data.token);
      await AsyncStorage.setItem("token", response.data.token);
      console.log(response);
      console.log(await AsyncStorage.getItem('token'));
      navigation.replace('Home');
    } catch (error) {
      console.log(error)
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
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-2xl font-bold">RE</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </Text>
              <Text className="text-gray-600 text-center">
                Sign in to continue to RideEasy
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
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
                  className={`w-full px-4 py-3 border text-black rounded-lg bg-white ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View>
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={formData.password}
                    onChangeText={value => handleInputChange('password', value)}
                    placeholder="Enter your password"
                     placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    className={`w-full px-4 py-3 border rounded-lg text-black bg-white pr-12 ${
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
              </View>

              {/* Forgot Password */}
              {/* <TouchableOpacity className="self-end">
                <Text className="text-blue-600 text-sm font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity> */}

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleSignIn}
                disabled={isLoading}
                className={`w-full py-4 rounded-lg items-center mt-6 ${
                  isLoading ? 'bg-gray-400' : 'bg-blue-600'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-semibold">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500">or</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Social Sign In Buttons */}
              {/* <TouchableOpacity className="w-full py-3 border border-gray-300 rounded-lg items-center flex-row justify-center mb-4">
                <Text className="text-gray-700 font-medium ml-2">
                  Continue with Google
                </Text>
              </TouchableOpacity> */}

              {/* Sign Up Link */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text className="text-blue-600 font-medium">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
