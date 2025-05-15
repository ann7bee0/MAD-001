import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();  // Initialize navigation

  // Fetch leaderboard data from the backend
  const fetchLeaderboardData = async () => {
    try {
      const res = await fetch('https://mad-001-backend.onrender.com/api/v1/attempt/leaderboard');  // Replace with actual backend URL
      const result = await res.json();
      console.log(result);  // Log the result to inspect the data
      if (result?.data?.leaderboard) {
        setLeaderboardData(result.data.leaderboard);
      } else {
        console.error("Leaderboard data is missing or malformed.");
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const handlePress = (userId) => {
    navigation.navigate('Profile', { userId });
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>
      
      <FlatList
        data={leaderboardData}
        keyExtractor={(item) => item.userId}  // Use userId as the keyExtractor
        renderItem={({ item, index }) => (
          <View style={styles.leaderboardItem}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <TouchableOpacity onPress={() => handlePress(item.userId)}>
              <Text style={styles.userName}>{item.name}</Text>
            </TouchableOpacity>
            <Text style={styles.score}>Score: {item.totalScore}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    color: '#555',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Leaderboard;
