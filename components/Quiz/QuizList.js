import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import QuizCard from "./QuizCard";

const QuizList = ({ onQuizPress }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("http://192.168.0.109:4001/api/v1/quiz/all");
      const result = await res.json();
      setQuizzes(result.data.quizzes);
    } catch (error) {
      console.error("Failed to fetch quizzes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleQuizPress = (quiz) => {
    console.log("Selected quiz:", quiz._id);
    // navigation.navigate('QuizScreen', { quizId: quiz._id }); ← next step
  };

  return (
    <FlatList
      data={quizzes}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <QuizCard quiz={item} onPress={() => onQuizPress(item)} />
      )}
    />
  );
};

export default QuizList;
