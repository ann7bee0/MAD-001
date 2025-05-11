import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import AddQuiz from '../components/Quiz/addQuiz';
import QuizList from '../components/Quiz/QuizList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import QuizPlayScreen from '../components/Quiz/QuizPlayScreen';

const QuizPage = () => {
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const navigation = useNavigation();

  const handleQuizPress = async (quiz) => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      const user = JSON.parse(userDataString);
      const res = await fetch('http://192.168.0.109:4001/api/v1/attempt/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user._id, quiz: quiz._id })
      });

      const result = await res.json();

      if (res.status === 201) {
        const attemptId = result.data.attempt._id;
        navigation.navigate('QuizPlayScreen', {
          quizId: quiz._id,
          attemptId,
        });
      } else {
        Alert.alert('Failed to start quiz', result.message || 'Unknown error');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while starting the quiz');
    }
  };

  return (
    <View style={{ marginTop: 50, padding: 10, flex: 1 }}>
      {!showAddQuiz && (
        <>
          <Button title="Add Quiz" onPress={() => setShowAddQuiz(true)} />
          <View style={{ marginTop: 20 }}>
            <QuizList onQuizPress={handleQuizPress} />
          </View>
        </>
      )}
      {showAddQuiz && <AddQuiz />}
    </View>
  );
};

export default QuizPage;