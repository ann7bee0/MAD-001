import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddQuestion from "./addQuestion";

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

const getUserIdFromStorage = async () => {
  try {
    const userDataString = await AsyncStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return userData._id;
    } else {
      console.error("No user data found");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

const AddQuiz = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState([]);
  const [rule, setRule] = useState("");
  const [rules, setRules] = useState([]);
  const [badgeCondition, setBadgeCondition] = useState("");
  const [badges, setBadges] = useState([]);
  const [duration, setDuration] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("");
  const [questionsCount, setQuestionsCount] = useState("");
  const [userId, setUserId] = useState("");

  const [createdQuizId, setCreatedQuizId] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionsSaved, setQuestionsSaved] = useState([]);

  const addCategory = () => {
    if (category.trim()) {
      setCategories([...categories, category.trim()]);
      setCategory("");
    }
  };

  const addTag = () => {
    if (tag.trim()) {
      setTags([...tags, tag.trim()]);
      setTag("");
    }
  };

  const addRule = () => {
    if (rule.trim()) {
      setRules([...rules, rule.trim()]);
      setRule("");
    }
  };

  const addBadge = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const image = result.assets[0];
        const localUri = image.uri;
        const fileName = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(fileName);
        const fileType = match ? `image/${match[1]}` : `image`;

        setBadges((prev) => [
          ...prev,
          {
            media: {
              uri: localUri,
              name: fileName,
              type: fileType,
            },
            condition: badgeCondition,
          },
        ]);
        setBadgeCondition("");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image");
    }
  };

  const handleSubmit = async () => {
    const userId = await getUserIdFromStorage();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("duration", duration);
    formData.append("max_attempts", maxAttempts);
    formData.append("questions_count", questionsCount);
    formData.append("user", userId);
    formData.append("is_active", "true");

    categories.forEach((cat) => formData.append("category", cat));
    tags.forEach((tag) => formData.append("tags", tag));
    rules.forEach((rule) => formData.append("rules", rule));
    badges.forEach((badge) => {
      formData.append("badges", {
        uri: badge.media.uri,
        name: badge.media.name,
        type: badge.media.type,
      });
      formData.append(`condition_${badge.media.name}`, badge.condition);
    });

    try {
      const res = await fetch("http://192.168.0.109:4001/api/v1/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (res.status === 201) {
        const result = await res.json();
        alert("Quiz created successfully!");
        setCreatedQuizId(result.data.quiz._id);
        setShowQuestions(true);
        // Reset form fields
        setTitle("");
        setDescription("");
        setCategory("");
        setCategories([]);
        setTag("");
        setTags([]);
        setRule("");
        setRules([]);
        setBadgeCondition("");
        setBadges([]);
        setDuration("");
        setMaxAttempts("");
      } else {
        const errorResponse = await res.json();
        alert(`Failed to create quiz: ${errorResponse.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create quiz");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />

      <Text style={styles.label}>Description</Text>
      <TextInput value={description} onChangeText={setDescription} style={styles.input} />

      <Text style={styles.label}>Category</Text>
      <TextInput value={category} onChangeText={setCategory} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={addCategory}>
        <Text style={styles.buttonText}>Add Category</Text>
      </TouchableOpacity>
      {categories.map((c, i) => (
        <View key={i} style={styles.tagContainer}>
          <Text style={styles.tagText}>• {c}</Text>
          <TouchableOpacity onPress={() => {
            const updated = [...categories];
            updated.splice(i, 1);
            setCategories(updated);
          }}>
            <Text style={styles.removeTag}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.label}>Tag</Text>
      <TextInput value={tag} onChangeText={setTag} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={addTag}>
        <Text style={styles.buttonText}>Add Tag</Text>
      </TouchableOpacity>
      {tags.map((t, i) => (
        <View key={i} style={styles.tagContainer}>
          <Text style={styles.tagText}>• {t}</Text>
          <TouchableOpacity onPress={() => {
            const updated = [...tags];
            updated.splice(i, 1);
            setTags(updated);
          }}>
            <Text style={styles.removeTag}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.label}>Rule</Text>
      <TextInput value={rule} onChangeText={setRule} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={addRule}>
        <Text style={styles.buttonText}>Add Rule</Text>
      </TouchableOpacity>
      {rules.map((r, i) => (
        <View key={i} style={styles.tagContainer}>
          <Text style={styles.tagText}>• {r}</Text>
          <TouchableOpacity onPress={() => {
            const updated = [...rules];
            updated.splice(i, 1);
            setRules(updated);
          }}>
            <Text style={styles.removeTag}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.label}>Badge Condition</Text>
      <TextInput value={badgeCondition} onChangeText={setBadgeCondition} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={addBadge}>
        <Text style={styles.buttonText}>Add Badge</Text>
      </TouchableOpacity>
      {badges.map((b, i) => (
        <View key={i} style={styles.badgeContainer}>
          <Image source={{ uri: b.media.uri }} style={styles.badgeImage} />
          <TextInput
            placeholder="Badge condition"
            value={b.condition}
            onChangeText={(text) => {
              const updated = [...badges];
              updated[i].condition = text;
              setBadges(updated);
            }}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => {
            const updated = [...badges];
            updated.splice(i, 1);
            setBadges(updated);
          }}>
            <Text style={styles.removeTag}>❌ Remove Badge</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput value={duration} onChangeText={setDuration} style={styles.input} keyboardType="numeric" />

      <Text style={styles.label}>Max Attempts</Text>
      <TextInput value={maxAttempts} onChangeText={setMaxAttempts} style={styles.input} keyboardType="numeric" />

      <Text style={styles.label}>Questions Count</Text>
      <TextInput value={questionsCount} onChangeText={setQuestionsCount} style={styles.input} keyboardType="numeric" />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Quiz</Text>
      </TouchableOpacity>

      {showQuestions && (
        <View style={styles.questionsWrapper}>
          <Text style={styles.boldText}>Now add {questionsCount} questions:</Text>
          {[...Array(Number(questionsCount))].map((_, index) => (
            <AddQuestion
              key={index}
              index={index}
              quizId={createdQuizId}
              onQuestionSaved={(i) =>
                setQuestionsSaved((prev) => [...new Set([...prev, i])])
              }
            />
          ))}
          {questionsSaved.length === Number(questionsCount) && (
            <Text style={styles.successText}>✅ All questions saved!</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.LIGHT_BACKGROUND,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.DARK_TEXT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.WHITE,
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
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: colors.DARK_TEXT,
  },
  removeTag: {
    color: "red",
    marginLeft: 8,
  },
  badgeContainer: {
    marginBottom: 10,
  },
  badgeImage: {
    width: 60,
    height: 60,
  },
  questionsWrapper: {
    marginTop: 20,
    padding: 20,
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    marginTop: 10,
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  successText: {
    color: colors.SUCCESS,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 12,
  },
});

export default AddQuiz;
