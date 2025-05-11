import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const colors = {
  PRIMARY: "#1E88E5", // Indigo
  WHITE: "#FFFFFF",
  LIGHT_BACKGROUND: "#F9FAFB",
  DARK_TEXT: "#1F2937",
  BORDER: "#E5E7EB",
  GRAY: "#9CA3AF",
  LIGHT_GRAY: "#D1D5DB",
  SUCCESS: "#10B981", // Green
};

const AddQuestion = ({ quizId, index, onQuestionSaved }) => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("MCQ");
  const [difficulty, setDifficulty] = useState("easy");
  const [points, setPoints] = useState("1");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [media, setMedia] = useState(null); // { uri, name, type }

  const handleMediaUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const file = result.assets[0];
      const uri = file.uri;
      const name = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(name);
      const type = match ? `${file.type}/${match[1]}` : `application/octet-stream`;
      setMedia({ uri, name, type });
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append("quiz", quizId);
    formData.append("question_text", questionText);
    formData.append("question_type", questionType);
    formData.append("difficulty", difficulty);
    formData.append("points", points);
    formData.append("correct_answer", correctAnswer);

    if (media) {
      formData.append("media", {
        uri: Platform.OS === "ios" ? media.uri.replace("file://", "") : media.uri,
        name: media.name,
        type: media.type,
      });
    }

    if (questionType === "MCQ") {
      options.forEach((opt, i) => {
        formData.append(`options[${i}][text]`, opt);
        formData.append(`options[${i}][isCorrect]`, opt === correctAnswer);
      });
    }

    try {
      const res = await fetch("http://192.168.0.109:4001/api/v1/questions", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await res.json();
      if (res.status === 201) {
        alert(`Question ${index + 1} saved!`);
        onQuestionSaved(index);
      } else {
        alert(result.message || "Error saving question");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save question");
    }
  };

  const handleOptionChange = (text, i) => {
    const updatedOptions = [...options];
    updatedOptions[i] = text;
    setOptions(updatedOptions);
  };

  const handleRemoveOption = (i) => {
    const updatedOptions = options.filter((_, index) => index !== i);
    setOptions(updatedOptions);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Question {index + 1}</Text>

      <TextInput
        style={styles.input}
        placeholder="Question Text"
        value={questionText}
        onChangeText={setQuestionText}
      />

      <Text style={styles.label}>Type: (MCQ / true_false / fill_in_the_blank)</Text>
      <TextInput
        style={styles.input}
        value={questionType}
        onChangeText={setQuestionType}
      />

      <TextInput
        style={styles.input}
        placeholder="Difficulty (easy / medium / hard)"
        value={difficulty}
        onChangeText={setDifficulty}
      />

      <TextInput
        style={styles.input}
        placeholder="Points"
        keyboardType="numeric"
        value={points}
        onChangeText={setPoints}
      />

      <TextInput
        style={styles.input}
        placeholder="Correct Answer"
        value={correctAnswer}
        onChangeText={setCorrectAnswer}
      />

      {questionType === "MCQ" &&
        options.map((opt, i) => (
          <View key={i} style={styles.optionContainer}>
            <TextInput
              style={styles.optionInput}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChangeText={(text) => handleOptionChange(text, i)}
            />
            <TouchableOpacity onPress={() => handleRemoveOption(i)} style={styles.removeOption}>
              <Text style={styles.removeOptionText}>❌</Text>
            </TouchableOpacity>
          </View>
        ))}

      <TouchableOpacity style={styles.button} onPress={handleMediaUpload}>
        <Text style={styles.buttonText}>{media ? "Change Media" : "Upload Media (Optional)"}</Text>
      </TouchableOpacity>
      {media && <Text style={styles.mediaText}>📎 {media.name}</Text>}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Question</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 16,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 10,
    marginBottom: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.DARK_TEXT,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.GRAY,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.LIGHT_BACKGROUND,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.DARK_TEXT,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  mediaText: {
    fontSize: 12,
    color: "green",
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optionInput: {
    backgroundColor: colors.LIGHT_BACKGROUND,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.DARK_TEXT,
    marginRight: 8,
    flex: 1,
  },
  removeOption: {
    justifyContent: "center",
    alignItems: "center",
  },
  removeOptionText: {
    color: "red",
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});

export default AddQuestion;
