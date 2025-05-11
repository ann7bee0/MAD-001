import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const API_URL = "http://192.168.0.109:4001/api/v1";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    email: "",
    avatar: null,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          avatar: userData.avatar || null,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
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

      // Update local storage with new data
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
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
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
  
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderAvatar = () => {
    if (profileData.avatar) {
      return (
        <Image 
          source={{ uri: profileData.avatar }} 
          style={styles.avatar} 
        />
      );
    }
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>
          {profileData.name ? profileData.name.charAt(0).toUpperCase() : "?"}
        </Text>
      </View>
    );
  };

  const SettingItem = ({ icon, title, onPress, isLast = false, rightContent, danger = false }) => (
    <TouchableOpacity
      style={[
        styles.settingItem, 
        isLast && styles.lastSettingItem,
        danger && styles.dangerItem
      ]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
          <Icon name={icon} size={22} color={danger ? colors.DANGER : colors.PRIMARY} />
        </View>
        <Text style={[styles.settingText, danger && styles.dangerText]}>{title}</Text>
      </View>
      {rightContent ? (
        rightContent
      ) : (
        <Icon name="chevron-right" size={22} color={colors.GRAY} />
      )}
    </TouchableOpacity>
  );

  const ToggleSettingItem = ({ icon, title, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={22} color={colors.PRIMARY} />
        </View>
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <Switch
        trackColor={{ false: colors.LIGHT_GRAY, true: colors.PRIMARY_LIGHT }}
        thumbColor={value ? colors.PRIMARY : colors.WHITE}
        onValueChange={onValueChange}
        value={value}
        style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
      />
    </View>
  );

  if (loading && !isEditingProfile && !showPasswordSection) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.WHITE} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          {isEditingProfile ? (
            <View style={styles.editProfileContainer}>
              <View style={styles.avatarEditContainer}>
                {renderAvatar()}
                <TouchableOpacity style={styles.changeAvatarButton}>
                  <Icon name="camera-alt" size={18} color={colors.WHITE} />
                </TouchableOpacity>
              </View>
              
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
                  style={[styles.input, styles.bioInput]}
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
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.WHITE} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.profileInfo}>
                {renderAvatar()}
                <View style={styles.profileTextContainer}>
                  <Text style={styles.profileName}>{profileData.name || "Your Name"}</Text>
                  <Text style={styles.profileEmail}>{profileData.email || "email@example.com"}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditingProfile(true)}
                >
                  <Icon name="edit" size={18} color={colors.PRIMARY} />
                </TouchableOpacity>
              </View>
              
              {/* Bio display */}
              {profileData.bio && (
                <View style={styles.bioContainer}>
                  <Text style={styles.bioText}>{profileData.bio}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Account Settings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        
        <View style={styles.section}>
          <SettingItem 
            icon="email" 
            title="Email Address" 
            rightContent={<Text style={styles.settingValue}>{profileData.email}</Text>}
          />
          
          <SettingItem 
            icon="lock" 
            title="Change Password" 
            onPress={() => setShowPasswordSection(!showPasswordSection)} 
            isLast
          />
        </View>

        {/* Change Password Form */}
        {showPasswordSection && (
          <View style={styles.passwordSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry={!passwordVisibility.current}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility('current')}>
                  <Icon 
                    name={passwordVisibility.current ? "visibility" : "visibility-off"} 
                    size={20} 
                    color={colors.GRAY} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!passwordVisibility.new}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility('new')}>
                  <Icon 
                    name={passwordVisibility.new ? "visibility" : "visibility-off"} 
                    size={20} 
                    color={colors.GRAY} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!passwordVisibility.confirm}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility('confirm')}>
                  <Icon 
                    name={passwordVisibility.confirm ? "visibility" : "visibility-off"} 
                    size={20} 
                    color={colors.GRAY} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.passwordButtonContainer}>
              <TouchableOpacity
                style={styles.cancelPasswordButton}
                onPress={() => {
                  setShowPasswordSection(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text style={styles.cancelPasswordText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.WHITE} />
                ) : (
                  <Text style={styles.changePasswordButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Appearance */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>
        
        <View style={styles.section}>
          <ToggleSettingItem
            icon="dark-mode"
            title="Dark Mode"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          
          <ToggleSettingItem
            icon="notifications"
            title="Push Notifications"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          
          <SettingItem 
            icon="tune" 
            title="Notification Settings" 
            onPress={() => navigation.navigate("NotificationSettings")} 
            isLast
          />
        </View>

        {/* Support */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
        </View>
        
        <View style={styles.section}>
          <SettingItem 
            icon="help-outline" 
            title="Help Center" 
            onPress={() => navigation.navigate("HelpCenter")} 
          />
          
          <SettingItem 
            icon="feedback" 
            title="Send Feedback" 
            onPress={() => navigation.navigate("Feedback")} 
          />
          
          <SettingItem 
            icon="info-outline" 
            title="About" 
            onPress={() => navigation.navigate("About")} 
            isLast
          />
        </View>

        {/* Danger Zone */}
        <View style={[styles.sectionHeader, styles.dangerHeader]}>
          <Text style={styles.dangerSectionTitle}>Actions</Text>
        </View>
        
        <View style={styles.section}>
          <SettingItem 
            icon="delete-outline" 
            title="Delete Account" 
            onPress={handleDeleteAccount}
            isLast
            danger
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color={colors.DANGER} style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const colors = {
  PRIMARY: "#1E88E5", // Indigo
  PRIMARY_LIGHT: "#B8D7F7", // Light Indigo
  SECONDARY: "#8B5CF6", // Purple
  DANGER: "#EF4444", // Red
  DANGER_LIGHT: "#FEE2E2", // Light Red
  SUCCESS: "#10B981", // Green
  WARNING: "#F59E0B", // Amber
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  LIGHT_BACKGROUND: "#F9FAFB",
  DARK_TEXT: "#1F2937",
  MEDIUM_TEXT: "#4B5563",
  LIGHT_TEXT: "#6B7280",
  GRAY: "#9CA3AF",
  LIGHT_GRAY: "#D1D5DB",
  BORDER: "#E5E7EB",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.WHITE,
  },
  loadingText: {
    marginTop: 10,
    color: colors.MEDIUM_TEXT,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: colors.LIGHT_BACKGROUND,
  },
  header: {
    backgroundColor: colors.WHITE,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.DARK_TEXT,
  },
  profileContainer: {
    backgroundColor: colors.WHITE,
    paddingVertical: 24,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bioContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.WHITE,
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.DARK_TEXT,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.LIGHT_TEXT,
  },
  editButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.LIGHT_BACKGROUND,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.MEDIUM_TEXT,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  dangerHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.PRIMARY,
  },
  dangerSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.DANGER,
  },
  section: {
    backgroundColor: colors.WHITE,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  dangerItem: {
    backgroundColor: colors.DANGER_LIGHT,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dangerIconContainer: {
    backgroundColor: colors.DANGER_LIGHT,
  },
  settingText: {
    fontSize: 15,
    color: colors.DARK_TEXT,
    flex: 1,
    fontWeight: "500",
  },
  dangerText: {
    color: colors.DANGER,
  },
  settingValue: {
    fontSize: 14,
    color: colors.LIGHT_TEXT,
    marginRight: 5,
  },
  editProfileContainer: {
    paddingHorizontal: 20,
  },
  avatarEditContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  changeAvatarButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: colors.PRIMARY,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.WHITE,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.MEDIUM_TEXT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.DARK_TEXT,
  },
  bioInput: {
    height: 100, 
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.LIGHT_BACKGROUND,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  saveButton: {
    backgroundColor: colors.PRIMARY,
  },
  cancelButtonText: {
    color: colors.MEDIUM_TEXT,
    fontSize: 15,
    fontWeight: '500',
  },
  saveButtonText: {
    color: colors.WHITE,
    fontSize: 15,
    fontWeight: '500',
  },
  passwordSection: {
    backgroundColor: colors.WHITE,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: colors.DARK_TEXT,
  },
  passwordButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelPasswordButton: {
    backgroundColor: colors.LIGHT_BACKGROUND,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  cancelPasswordText: {
    color: colors.MEDIUM_TEXT,
    fontWeight: '500',
  },
  changePasswordButton: {
    backgroundColor: colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePasswordButtonText: {
    color: colors.WHITE,
    fontSize: 15,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: colors.WHITE,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: colors.DANGER,
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    color: colors.LIGHT_TEXT,
    fontSize: 13,
  },
});

export default SettingsScreen;