import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Switch } from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import Colors from "../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";

const API_URL = "http://192.168.0.109:4001/api/v1";

export default function Settings() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    email: "",
  });
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user data on component mount
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setProfileData({
            name: userData.name || "",
            email: userData.email || "",
            bio: userData.bio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const userId = await getUserIdFromStorage();
      if (!userId) {
        Alert.alert("Error", "User not found. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/profile/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          bio: profileData.bio,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      // Update local storage with new name
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        userData.name = profileData.name;
        userData.bio = profileData.bio;
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
      }

      Alert.alert("Success", "Profile updated successfully");
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const userId = await getUserIdFromStorage();
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      Alert.alert("Success", "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("token");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const userId = await getUserIdFromStorage();
              const response = await fetch(`${API_URL}/user/${userId}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error(`Failed to delete account: ${response.status}`);
              }

              await AsyncStorage.removeItem("userData");
              await AsyncStorage.removeItem("token");
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getUserIdFromStorage = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData._id;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving user ID:", error);
      return null;
    }
  };

  const SettingItem = ({ icon, title, onPress, isLast = false }) => (
    <TouchableOpacity
      style={[styles.settingItem, isLast && styles.lastSettingItem]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={Colors.GRAY} />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={Colors.GRAY} />
    </TouchableOpacity>
  );

  const ToggleSettingItem = ({ icon, title, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={Colors.GRAY} />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <Switch
        trackColor={{ false: Colors.LIGHT_GRAY, true: Colors.BLUE }}
        thumbColor={Colors.WHITE}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        {isEditingProfile ? (
          <View style={styles.editProfileContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={profileData.name}
                onChangeText={(text) => setProfileData({...profileData, name: text})}
                placeholder="Enter your name"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={profileData.bio}
                onChangeText={(text) => setProfileData({...profileData, bio: text})}
                placeholder="Tell something about yourself"
                multiline
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditingProfile(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.WHITE} />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            {profileData.bio ? (
              <Text style={styles.profileBio}>{profileData.bio}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditingProfile(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="email" size={24} color={Colors.GRAY} />
            <Text style={styles.settingText}>Email</Text>
          </View>
          <Text style={styles.settingValue}>{profileData.email}</Text>
        </View>
        
        <SettingItem 
          icon="lock" 
          title="Change Password" 
          onPress={() => navigation.navigate("ChangePassword")} 
        />
      </View>

      {/* Change Password Form (could be moved to a separate screen) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.saveButton, { marginTop: 10 }]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <ToggleSettingItem
          icon="brightness-4"
          title="Dark Mode"
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <ToggleSettingItem
          icon="notifications"
          title="Enable Notifications"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        <SettingItem 
          icon="notifications-active" 
          title="Notification Settings" 
          onPress={() => navigation.navigate("NotificationSettings")} 
        />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem 
          icon="help" 
          title="Help Center" 
          onPress={() => navigation.navigate("HelpCenter")} 
        />
        <SettingItem 
          icon="feedback" 
          title="Send Feedback" 
          onPress={() => navigation.navigate("Feedback")} 
        />
        <SettingItem 
          icon="info" 
          title="About" 
          onPress={() => navigation.navigate("About")} 
        />
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <SettingItem 
          icon="delete" 
          title="Delete Account" 
          onPress={handleDeleteAccount}
          isLast
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.LIGHT_BACKGROUND,
  },
  section: {
    backgroundColor: Colors.WHITE,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.BLACK,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  profileInfo: {
    paddingVertical: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.BLACK,
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 16,
    color: Colors.GRAY,
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: Colors.LIGHT_BLUE,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: Colors.BLUE,
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: Colors.BLACK,
    marginLeft: 15,
  },
  settingValue: {
    fontSize: 16,
    color: Colors.GRAY,
  },
  editProfileContainer: {
    paddingVertical: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.BLACK,
    marginBottom: 5,
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: Colors.BLACK,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.LIGHT_GRAY,
  },
  saveButton: {
    backgroundColor: Colors.BLUE,
  },
  buttonText: {
    color: Colors.WHITE,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: Colors.WHITE,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButtonText: {
    color: Colors.RED,
    fontSize: 16,
    fontWeight: 'bold',
  },
});