import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AddQuiz from '../components/Quiz/addQuiz';
import QuizList from '../components/Quiz/QuizList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import QuizHistory from '../components/Quiz/badgeandAwards';
import Leaderboard from '../components/Quiz/leaderBoard';

const colors = {
  PRIMARY: "#1E88E5",
  WHITE: "#FFFFFF",
  LIGHT_BACKGROUND: "#F9FAFB",
  DARK_TEXT: "#1F2937",
  BORDER: "#E5E7EB",
  GRAY: "#9CA3AF",
  LIGHT_GRAY: "#D1D5DB",
};

const QuizPage = () => {
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);  // To handle loading state
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setUserId(user._id);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  const handleQuizPress = async (quiz) => {
    if (!userId) {
      alert('User not found');
      return;
    }

    try {
      const res = await fetch('https://mad-001-backend.onrender.com/api/v1/attempt/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userId, quiz: quiz._id })
      });

      const result = await res.json();

      if (res.status === 201) {
        const attemptId = result.data.attempt._id;
        navigation.navigate('QuizPlayScreen', {
          quizId: quiz._id,
          attemptId,
        });
      } else {
        alert(result.message || 'Failed to start quiz');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while starting the quiz');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={{ flex: 1 }}>
          {userId && <QuizHistory userId={userId} />}
        </View>
        <View style={{ flex: 1 }}>
          {/* Render the Leaderboard Component */}
          <Leaderboard />
        </View>

        {/* Add Quiz Button and Quiz List */}
        {!showAddQuiz ? (
          <>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddQuiz(true)}>
              <Text style={styles.addButtonText}>+ Add New Quiz</Text>
            </TouchableOpacity>

            <View style={styles.quizListWrapper}>
              <QuizList onQuizPress={handleQuizPress} />
            </View>
          </>
        ) : (
          <AddQuiz />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.LIGHT_BACKGROUND,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.DARK_TEXT,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  quizListWrapper: {
    marginTop: 10,
  },
});

export default QuizPage;
