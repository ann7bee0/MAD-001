import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

const QuizHistory = ({ userId }) => {
  const [highestBadge, setHighestBadge] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await fetch(`https://mad-001-backend.onrender.com/api/v1/attempt/user/${userId}`);
        const data = await res.json();

        let highestBadge = null;
        let totalPoints = 0;

        // Loop through all attempts to find highest badge and calculate total points
        data.data.attempts.forEach(attempt => {
          totalPoints += attempt.score;

          // Find the highest badge based on condition
          if (attempt.earned_badges.length > 0) {
            const badge = attempt.earned_badges[0]; // Assuming first badge is highest (adjust logic as needed)
            if (!highestBadge || parseFloat(badge.condition) > parseFloat(highestBadge.condition)) {
              highestBadge = badge;
            }
          }
        });

        setHighestBadge(highestBadge);
        setTotalPoints(totalPoints);
      } catch (err) {
        console.error('Failed to fetch attempts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>OHS Dashboard</Text>
      <Text style={styles.totalPoints}>Total Points: {totalPoints}</Text>

      {highestBadge ? (
        <View style={styles.badgeContainer}>
          <Image source={{ uri: `https://mad-001-backend.onrender.com/${highestBadge.media}` }} style={styles.badgeImage} />
          <Text style={styles.badgeText}>Earned Badge: {highestBadge.condition}%</Text>
        </View>
      ) : (
        <Text>No badges earned</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  totalPoints: {
    fontSize: 18,
    marginBottom: 15,
  },
  badgeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  badgeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuizHistory;
