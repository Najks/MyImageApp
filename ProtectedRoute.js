import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from './hooks/authContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (user === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (user) {
    return children;
  } else {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please log in to access this page.</Text>
      </View>
    );
  }
};

export default ProtectedRoute;
