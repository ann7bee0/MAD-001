import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const QuizCard = ({ quiz, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(quiz)} style={{
      padding: 15,
      marginVertical: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8
    }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{quiz.title}</Text>
      <Text>{quiz.description}</Text>
      <Text style={{ fontSize: 12, color: '#666' }}>
        Categories: {quiz.category?.join(', ')}
      </Text>
      <Text style={{ fontSize: 12, color: '#666' }}>
        Questions: {quiz.questions_count || 0}
      </Text>
    </TouchableOpacity>
  );
};

export default QuizCard;
