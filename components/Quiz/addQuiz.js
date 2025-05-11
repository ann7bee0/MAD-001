import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddQuestion from "./addQuestion";
// import getUserNameFromStorage from "../../utils/auth_user_data/user_data"

// Get UserID
const getUserIdFromStorage = async () => {
  try {
    const userDataString = await AsyncStorage.getItem("userData");

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      // console.log(userData)
      const userId = userData._id;
      // console.log(userId)
      return userId;
    } else {
      console.error("No user data found");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};
// ENd

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

  // Add Quiz Question Section
  const [createdQuizId, setCreatedQuizId] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionsSaved, setQuestionsSaved] = useState([]);
  // End

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

    badges.forEach((badge, index) => {
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
        console.log(result);
        alert("Quiz created successfully!");

        setCreatedQuizId(result.data.quiz._id); // Store quiz ID
        setShowQuestions(true);
        // Clear all fields after successful submission
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
        // setQuestionsCount("");
      } else {
        const errorResponse = await res.json();
        console.error("Error:", errorResponse);
        alert(
          `Failed to create quiz: ${errorResponse.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create quiz");
    }
  };

  return (
    <ScrollView>
      <Text>Title</Text>
      <TextInput value={title} onChangeText={setTitle} />

      <Text>Description</Text>
      <TextInput value={description} onChangeText={setDescription} />

      <Text>Category</Text>
      <TextInput value={category} onChangeText={setCategory} />
      <Button title="Add Category" onPress={addCategory} />
      {categories.map((c, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>• {c}</Text>
          <TouchableOpacity
            onPress={() => {
              const updated = [...categories];
              updated.splice(i, 1);
              setCategories(updated);
            }}
          >
            <Text style={{ marginLeft: 8, color: "red" }}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text>Tag</Text>
      <TextInput value={tag} onChangeText={setTag} />
      <Button title="Add Tag" onPress={addTag} />
      {tags.map((t, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>• {t}</Text>
          <TouchableOpacity
            onPress={() => {
              const updated = [...categories];
              updated.splice(i, 1);
              setCategories(updated);
            }}
          >
            <Text style={{ marginLeft: 8, color: "red" }}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text>Rule</Text>
      <TextInput value={rule} onChangeText={setRule} />
      <Button title="Add Rule" onPress={addRule} />
      {rules.map((r, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>• {r}</Text>
          <TouchableOpacity
            onPress={() => {
              const updated = [...categories];
              updated.splice(i, 1);
              setCategories(updated);
            }}
          >
            <Text style={{ marginLeft: 8, color: "red" }}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text>Badge Condition</Text>
      <TextInput value={badgeCondition} onChangeText={setBadgeCondition} />
      <Button title="Add Badge" onPress={addBadge} />
      {badges.map((b, i) => (
        <View key={i} style={{ marginBottom: 10 }}>
          <Image
            source={{ uri: b.media.uri }}
            style={{ width: 60, height: 60 }}
          />
          <TextInput
            placeholder="Badge condition"
            value={b.condition}
            onChangeText={(text) => {
              const updated = [...badges];
              updated[i].condition = text;
              setBadges(updated);
            }}
          />
          <TouchableOpacity
            onPress={() => {
              const updated = [...badges];
              updated.splice(i, 1);
              setBadges(updated);
            }}
          >
            <Text style={{ color: "red" }}>❌ Remove Badge</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text>Duration (minutes)</Text>
      <TextInput
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />

      <Text>Max Attempts</Text>
      <TextInput
        value={maxAttempts}
        onChangeText={setMaxAttempts}
        keyboardType="numeric"
      />

      <Text>Questions Count</Text>
      <TextInput
        value={questionsCount}
        onChangeText={setQuestionsCount}
        keyboardType="numeric"
      />

      <Button title="Submit Quiz" onPress={handleSubmit} />
      {showQuestions && (
        <View style={{ padding: 20 }}>
          <Text style={{ fontWeight: "bold" }}>
            Now add {questionsCount} questions:
          </Text>
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
            <Text style={{ color: "green" }}>✅ All questions saved!</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default AddQuiz;
