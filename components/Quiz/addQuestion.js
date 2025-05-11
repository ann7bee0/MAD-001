import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const AddQuestion = ({ quizId, index, onQuestionSaved }) => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MCQ');
  const [difficulty, setDifficulty] = useState('easy');
  const [points, setPoints] = useState('1');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [media, setMedia] = useState(null); // { uri, name, type }

  const handleMediaUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8
    });

    if (!result.canceled && result.assets.length > 0) {
      const file = result.assets[0];
      const uri = file.uri;
      const name = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(name);
      const type = match ? `${file.type}/${match[1]}` : `application/octet-stream`;
      setMedia({ uri, name, type });
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append('quiz', quizId);
    formData.append('question_text', questionText);
    formData.append('question_type', questionType);
    formData.append('difficulty', difficulty);
    formData.append('points', points);
    formData.append('correct_answer', correctAnswer);

    if (media) {
      formData.append('media', {
        uri: Platform.OS === 'ios' ? media.uri.replace('file://', '') : media.uri,
        name: media.name,
        type: media.type
      });
    }

    if (questionType === 'MCQ') {
      options.forEach((opt, i) => {
        formData.append(`options[${i}][text]`, opt);
        formData.append(`options[${i}][isCorrect]`, opt === correctAnswer);
      });
    }

    try {
      const res = await fetch('http://192.168.0.109:4001/api/v1/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      const result = await res.json();
      if (res.status === 201) {
        alert(`Question ${index + 1} saved!`);
        onQuestionSaved(index);
      } else {
        alert(result.message || 'Error saving question');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save question');
    }
  };

  return (
    <View style={{ marginVertical: 10, padding: 10, borderWidth: 1, borderColor: '#ddd' }}>
      <Text style={{ fontWeight: 'bold' }}>Question {index + 1}</Text>

      <TextInput
        placeholder="Question Text"
        value={questionText}
        onChangeText={setQuestionText}
      />

      <Text>Type: (MCQ / true_false / fill_in_the_blank)</Text>
      <TextInput value={questionType} onChangeText={setQuestionType} />

      <TextInput
        placeholder="Difficulty (easy / medium / hard)"
        value={difficulty}
        onChangeText={setDifficulty}
      />

      <TextInput
        placeholder="Points"
        keyboardType="numeric"
        value={points}
        onChangeText={setPoints}
      />

      <TextInput
        placeholder="Correct Answer"
        value={correctAnswer}
        onChangeText={setCorrectAnswer}
      />

      {questionType === 'MCQ' && options.map((opt, i) => (
        <TextInput
          key={i}
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChangeText={(text) => {
            const updated = [...options];
            updated[i] = text;
            setOptions(updated);
          }}
        />
      ))}

      <Button title={media ? 'Change Media' : 'Upload Media (Optional)'} onPress={handleMediaUpload} />
      {media && (
        <Text style={{ fontSize: 12, color: 'green' }}>📎 {media.name}</Text>
      )}

      <View style={{ marginTop: 10 }}>
        <Button title="Submit Question" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default AddQuestion;
