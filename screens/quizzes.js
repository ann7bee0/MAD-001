import React, { useState } from 'react';
import { View, Button } from 'react-native';
import AddQuiz from '../components/Quiz/addQuiz';

const QuizPage = () => {
  const [showAddQuiz, setShowAddQuiz] = useState(false);

  return (
    <View style={{marginTop: 50}}>
      {!showAddQuiz && (
        <Button title="Add Quiz" onPress={() => setShowAddQuiz(true)} />
      )}
      {showAddQuiz && <AddQuiz />}
    </View>
  );
};

export default QuizPage;
