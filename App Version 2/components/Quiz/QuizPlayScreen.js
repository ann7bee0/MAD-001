import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  StyleSheet
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  const currentQuestion = questions[currentIndex];
  const API_BASE_URL = 'https://mad-001-backend.onrender.com';

  const isVideo = currentQuestion?.media_url?.endsWith('.mp4');
  const videoUrl = isVideo ? `${API_BASE_URL}/${currentQuestion.media_url}` : null;
  const player = useVideoPlayer(videoUrl, (p) => { p.loop = false; });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player?.playing ?? false });

  useEffect(() => {
    const loadAnsweredQuestions = async () => {
      try {
        const saved = await AsyncStorage.getItem(`quiz_${attemptId}_answers`);
        if (saved) setAnsweredQuestions(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved answers', error);
      }
    };
    loadAnsweredQuestions();
  }, [attemptId]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/questions/quiz/${quizId}`);
        const data = await res.json();
        if (data.status === 'success') {
          setQuestions(data.data.questions);
          if (timeLeft === null) {
            const durationInSeconds = data.data.questions.length * 60;
            setTimeLeft(durationInSeconds);
            const savedTimeData = await AsyncStorage.getItem(`quiz_${attemptId}_timer`);
            if (savedTimeData) {
              const { endTime } = JSON.parse(savedTimeData);
              const now = new Date().getTime();
              const remaining = Math.floor((endTime - now) / 1000);
              if (remaining > 0) setTimeLeft(remaining);
              else return handleQuizSubmit();
            } else {
              const endTime = new Date().getTime() + (durationInSeconds * 1000);
              await AsyncStorage.setItem(`quiz_${attemptId}_timer`, JSON.stringify({ endTime }));
            }
          }
        } else {
          throw new Error(data.message || 'Failed to load questions');
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

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
  }, [quizId]);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return Alert.alert('Warning', 'Please select an answer.');

    const updatedAnswers = [...answeredQuestions];
    const existingIndex = updatedAnswers.findIndex(q => q.question_id === currentQuestion._id);
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = { question_id: currentQuestion._id, selected_answer: selectedAnswer };
    } else {
      updatedAnswers.push({ question_id: currentQuestion._id, selected_answer: selectedAnswer });
    }

    setAnsweredQuestions(updatedAnswers);
    await AsyncStorage.setItem(`quiz_${attemptId}_answers`, JSON.stringify(updatedAnswers));

    const res = await fetch(`${API_BASE_URL}/api/v1/attempt/${attemptId}/question`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: currentQuestion._id, selected_answer: selectedAnswer })
    });

    const result = await res.json();
    if (res.status === 200) {
      const isLastQuestion = currentIndex + 1 === questions.length;
      if (isLastQuestion) {
        await new Promise(resolve => setTimeout(resolve, 100));
        await handleQuizSubmit();
      } else {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer('');
      }
    } else {
      Alert.alert('Error', result.message || 'Failed to submit answer');
    }
  };

  const handleQuizSubmit = async () => {
    try {
      let updatedAnswers = [...answeredQuestions];
      const alreadySaved = updatedAnswers.some(q => q.question_id === currentQuestion._id);
      if (!alreadySaved && selectedAnswer) {
        const patchRes = await fetch(`${API_BASE_URL}/api/v1/attempt/${attemptId}/question`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_id: currentQuestion._id, selected_answer: selectedAnswer })
        });

        if (patchRes.status === 200) {
          updatedAnswers.push({ question_id: currentQuestion._id, selected_answer: selectedAnswer });
          setAnsweredQuestions(updatedAnswers);
          await AsyncStorage.setItem(`quiz_${attemptId}_answers`, JSON.stringify(updatedAnswers));
        } else {
          return Alert.alert('Error', 'Failed to save final answer');
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/attempt/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, questions: updatedAnswers })
      });

      const data = await res.json();
      if (res.status === 200) {
        setResult(data.data.attempt);
        setSubmitted(true);
        Alert.alert('Quiz Submitted', `Score: ${data.data.attempt.score}`);
        await AsyncStorage.removeItem(`quiz_${attemptId}_answers`);
        await AsyncStorage.removeItem(`quiz_${attemptId}_timer`);
      } else {
        throw new Error(data.message || 'Failed to submit quiz');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading quiz questions...</Text>
      </View>
    );
  }

  if (submitted && result) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>🏁 Quiz Finished!</Text>
          <Text style={styles.resultScore}>Score: {result.score} / {questions.length}</Text>
        </View>
        {result.questions.map((q, i) => (
          <View key={i} style={styles.questionResult}>
            <Text style={styles.questionText}>Q{i + 1}: {q.question_id.question_text}</Text>
            <Text style={{ color: q.is_correct ? 'green' : 'red', marginVertical: 5 }}>
              Your Answer: {q.selected_answer}
            </Text>
            {!q.is_correct && (
              <Text style={styles.correctAnswer}>Correct Answer: {q.question_id.correct_answer}</Text>
            )}
            <View style={styles.divider} />
          </View>
        ))}
        <Button title="Back to Home" onPress={() => navigation.navigate('Root')} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timer}>Time Left: {formatTime(timeLeft)}</Text>
        <Text style={styles.progress}>Question {currentIndex + 1} of {questions.length}</Text>
      </View>

      <Text style={styles.questionText}>{currentQuestion?.question_text}</Text>

      {currentQuestion?.media_url && (
        isVideo ? (
          <View style={styles.mediaContainer}>
            <VideoView
              player={player}
              style={styles.media}
              allowsFullscreen
              allowsPictureInPicture
            />
            <View style={styles.controlsContainer}>
              <Button
                title={isPlaying ? 'Pause' : 'Play'}
                onPress={() => isPlaying ? player.pause() : player.play()}
              />
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: `${API_BASE_URL}/${currentQuestion.media_url}` }}
            style={styles.media}
            resizeMode="contain"
          />
        )
      )}

      {currentQuestion?.question_type === 'MCQ' ? (
        <View style={styles.optionsContainer}>
          {currentQuestion.options?.map((option, idx) => {
            const optionText = typeof option === 'object' ? (option.text || option.value || JSON.stringify(option)) : String(option);
            const optionValue = typeof option === 'object' ? (option.value || option.text || JSON.stringify(option)) : option;
            return (
              <Button
                key={idx}
                title={optionText}
                onPress={() => setSelectedAnswer(optionValue)}
                color={selectedAnswer === optionValue ? '#007BFF' : '#6c757d'}
              />
            );
          })}
        </View>
      ) : (
        <TextInput
          placeholder="Enter your answer"
          value={selectedAnswer}
          onChangeText={setSelectedAnswer}
          style={styles.textInput}
          multiline
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          title={currentIndex + 1 === questions.length ? 'Submit Quiz' : 'Next'}
          onPress={handleAnswerSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10 },
  header: { marginBottom: 15 },
  timer: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  progress: { fontSize: 14 },
  questionText: { fontSize: 18, marginVertical: 10 },
  mediaContainer: { marginBottom: 15 },
  mediaLabel: { fontWeight: '600', marginBottom: 5 },
  media: { width: '100%', height: 200 },
  controlsContainer: { marginTop: 10, flexDirection: 'row', justifyContent: 'center' },
  textInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20, minHeight: 100 },
  buttonContainer: { marginTop: 10 },
  resultHeader: { marginBottom: 20 },
  resultTitle: { fontSize: 22, fontWeight: 'bold' },
  resultScore: { fontSize: 18, marginVertical: 10 },
  questionResult: { marginVertical: 10 },
  correctAnswer: { color: 'blue', marginBottom: 5 },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 10 },
  optionsContainer: { marginVertical: 10, gap: 10 },
  debugContainer: { marginTop: 20, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 5, borderWidth: 1, borderColor: '#ddd' }
});

export default QuizPlayScreen;
