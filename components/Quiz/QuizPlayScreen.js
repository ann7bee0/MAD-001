import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Video } from 'expo-video';

const QuizPlayScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { quizId, attemptId } = route.params;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://192.168.0.109:4001/api/v1/questions/quiz/${quizId}`);
        const data = await res.json();
        setQuestions(data.data.questions);

        const durationInSeconds = data.data.questions.length * 60; // Example timer logic
        setTimeLeft(durationInSeconds);

        const interval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              handleQuizSubmit();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return Alert.alert('Warning', 'Please select an answer.');

    try {
      const res = await fetch(`http://192.168.0.109:4001/api/v1/attempt/${attemptId}/question`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion._id,
          selected_answer: selectedAnswer
        })
      });

      const result = await res.json();

      if (res.status === 200) {
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex(currentIndex + 1);
          setSelectedAnswer('');
        } else {
          setSubmitted(true);
          handleQuizSubmit();
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to submit answer');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleQuizSubmit = async () => {
    try {
      const res = await fetch(`http://192.168.0.109:4001/api/v1/attempt/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, questions: [] })
      });

      const data = await res.json();
      if (res.status === 200) {
        setResult(data.data.attempt);
        setSubmitted(true);
        Alert.alert('Quiz Submitted', `Score: ${data.data.attempt.score}`);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit quiz');
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  if (submitted && result) {
    return (
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>🏁 Quiz Finished!</Text>
        <Text style={{ fontSize: 16, marginVertical: 10 }}>Score: {result.score} / {questions.length}</Text>

        {result.questions.map((q, i) => (
          <View key={i} style={{ marginVertical: 10 }}>
            <Text>Q{i + 1}: {q.question_id.question_text}</Text>
            <Text style={{ color: q.is_correct ? 'green' : 'red' }}>Your Answer: {q.selected_answer}</Text>
            {!q.is_correct && (
              <Text style={{ color: 'blue' }}>Correct Answer: {q.question_id.correct_answer}</Text>
            )}
          </View>
        ))}

        <Button title="Back to Home" onPress={() => navigation.navigate('QuizPage')} />
      </ScrollView>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </Text>

      <Text>Question {currentIndex + 1} of {questions.length}</Text>
      <Text style={{ fontSize: 18, marginVertical: 10 }}>{currentQuestion.question_text}</Text>

      {currentQuestion.media_url && (
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontWeight: '600' }}>Media:</Text>
          {currentQuestion.media_url.endsWith('.mp4') ? (
            <Video
              source={{ uri: `http://192.168.0.109:4001/${currentQuestion.media_url}` }}
              style={{ width: '100%', height: 200 }}
              useNativeControls
              resizeMode="contain"
            />
          ) : (
            <Image
              source={{ uri: `http://192.168.0.109:4001/${currentQuestion.media_url}` }}
              style={{ width: '100%', height: 200 }}
              resizeMode="contain"
            />
          )}
        </View>
      )}

      <TextInput
        placeholder="Enter your answer"
        value={selectedAnswer}
        onChangeText={setSelectedAnswer}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20 }}
      />

      <Button title="Next" onPress={handleAnswerSubmit} />
    </View>
  );
};

export default QuizPlayScreen;
