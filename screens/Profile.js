import { View, Text, ScrollView, Image, TouchableOpacity, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import * as ProfileData from "../data/Profile";
import Colors from "../utils/colors";
import Icon from "react-native-vector-icons/Entypo";
import Heading from "../components/Heading";
import CustomIcon from "../components/CustomIcon";
import ShowAllFooter from "../components/ShowAllFooter";
import SectionHeading from "../components/SectionHeading";
import ShowPeople from "../components/Profile/ShowPeople";
import ShowCourses from "../components/Profile/ShowCourses";
import ShowProjects from "../components/Profile/ShowProjects";
import ShowSkills from "../components/Profile/ShowSkills";
import ShowLicenses from "../components/Profile/ShowLicenses";
import ShowEducation from "../components/Profile/ShowEducation";
import ShowExperience from "../components/Profile/ShowExperience";
import Styles from "../utils/Styles";
const API_URL = "http://192.168.0.109:4001/api/v1";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Alert } from "react-native";

export default function Profile() {
  const DATA = ProfileData.default;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Name and Bio Section
  const [username, setUsername] = useState('');
  const getUserNameFromStorage = async () => {
  try {
    const userDataString = await AsyncStorage.getItem("userData");
    
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return userData.name || null; // Return the name or null if it doesn't exist
    }
    return null;
  } catch (error) {
    console.error("Error retrieving user name:", error);
    return null;
  }
};
  // End


  // Editable Bio
  // Add these state variables
const [isEditingBio, setIsEditingBio] = useState(false);
const [editedBio, setEditedBio] = useState("");
const [updatingBio, setUpdatingBio] = useState(false);

const handleSaveBio = async () => {
  try {
    setUpdatingBio(true);
    
    // Get the user ID
    const userId = await getUserIdFromStorage();
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please login again.");
      return;
    }
    
    // Update the bio in the profile data directly
    const updatedProfile = {
      ...profileData,
      info: {
        ...profileData.info,
        bio: editedBio
      }
    };

    // Make API request to update the profile
    const response = await fetch(`${API_URL}/profile/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ info: updatedProfile.info }), // Only updating info section
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    // Get updated profile data
    const result = await response.json();
    
    // Update local state with new data
    setProfileData(result.data.profile);
    
    // Exit edit mode
    setIsEditingBio(false);
    Alert.alert("Success", "Your bio has been updated successfully.");
  } catch (error) {
    console.error('Error updating bio:', error);
    Alert.alert("Update Failed", "There was a problem updating your bio. Please try again.");
  } finally {
    setUpdatingBio(false);
  }
};

// End


  // Is editing Section
  // Add these near your other state declarations
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [editedAbout, setEditedAbout] = useState("");
  const [updatingAbout, setUpdatingAbout] = useState(false);
  // end

  // Start
  const updateProfileFieldArray = async (field, value) => {
  try {
    setLoading(true); // Show loading indicator
    
    // Get the user ID
    const userId = await getUserIdFromStorage();
    
    console.log(`Updating ${field} for user ${userId}`);
    console.log("New value:", JSON.stringify(value));
    
    // Make API request to update just this field
    const response = await fetch(`${API_URL}/profile/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: value }), // Only send the field being updated
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    // Get updated profile data
    const result = await response.json();
    
    // Log the successful update
    console.log(`${field} updated successfully:`, result);
    
    // Update local state with new data
    setProfileData(result.data.profile);
    
    Alert.alert("Success", `Your ${field} has been updated successfully.`);
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    Alert.alert("Update Failed", `There was a problem updating your ${field}. Please try again.`);
    throw error;
  } finally {
    setLoading(false); // Hide loading indicator
  }
};
  // End



// Add this function to your Profile component
const updateProfileField = async (field, value) => {
  try {
    // Get the user ID
    const userId = await getUserIdFromStorage();
    
    // Make API request to update just this field
    const response = await fetch(`${API_URL}/profile/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: value }), // Only send the field being updated
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    // Get updated profile data
    const result = await response.json();
    
    // Update local state with new data
    setProfileData(result.data.profile);
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
// Editing one
// Add this function to your Profile component
const handleSaveAbout = async () => {
  try {
    setUpdatingAbout(true);
    
    // Call the update function
    await updateProfileField('about', editedAbout);
    
    // Exit edit mode
    setIsEditingAbout(false);
  } catch (error) {
    Alert.alert('Error', 'Failed to update about section');
  } finally {
    setUpdatingAbout(false);
  }
};
// end

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
  const createProfile = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create profile: ${response.status}`);
      }

      const createdProfile = await response.json();
      return createdProfile;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error; // Re-throw to handle in the calling function
    }
  };
  // Fetch profile data
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const userId = await getUserIdFromStorage();
        const userName = await getUserNameFromStorage();
        setUsername(userName)
        if (!userId) {
          console.error("No user ID available");
          if (isMounted) setLoading(false);
          return;
        }

        let response = await fetch(`${API_URL}/profile/${userId}`);

        // If profile doesn't exist, create one
        if (response.status === 404) {
          const newProfile = await createProfile(userId);
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        if (isMounted) setProfileData(data);
      } catch (error) {
        console.log("Error fetching profile:", error);
      } finally {
        // location.reload()
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  const Analytics = ({ title, subTitle, icon }) => (
    <View style={[Styles.flexCenter, { paddingVertical: 10 }]}>
      <CustomIcon
        name={icon}
        size={28}
        color={Colors.GRAY}
        style={{ marginRight: 10 }}
      />
      <View>
        <Text style={{ fontSize: 17, fontWeight: "bold", color: Colors.BLACK }}>
          {title}
        </Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={{ color: Colors.LIGHT_BLACK }}>{subTitle}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.BLUE} />
        <Text>Loading profile...</Text>
      </View>
    );
  }
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: Colors.WHITE, marginBottom: 10 }}>
        <Image
          source={DATA.INFO.banner}
          style={{ width: "100%", height: 100 }}
        />
        <Image
          source={DATA.INFO.profile_picture}
          style={{
            height: 100,
            width: 100,
            borderRadius: 100,
            borderColor: Colors.WHITE,
            bottom: 50,
            left: 15,
          }}
        />
        <View style={{ marginTop: -45, paddingHorizontal: 10 }}>
          <Text
            style={{ fontSize: 28, color: Colors.BLACK, fontWeight: "bold" }}
          >
            {username}
          </Text>
        </View>

        <View
          style={[
            Styles.flexCenter,
            {
              marginVertical: 16,
              justifyContent: "space-evenly",
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {}}
            style={{
              backgroundColor: Colors.BLUE,
              borderRadius: 50,
              width: 140,
              paddingVertical: 5,
              alignItems: "center",
            }}
          >
            <Text style={{ color: Colors.WHITE, fontSize: 19 }}>Open to</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {}}
            style={{
              borderWidth: 1,
              borderColor: Colors.GRAY,
              borderRadius: 50,
              width: 140,
              paddingVertical: 5,
              alignItems: "center",
            }}
          >
            <Text style={{ color: Colors.GRAY, fontSize: 19 }}>
              Add Section
            </Text>
           </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {}}
            style={{
              borderRadius: 50,
              borderWidth: 1,
              borderColor: Colors.GRAY,
              width: 35,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="dots-three-horizontal" size={19} color={Colors.GRAY} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{ backgroundColor: Colors.WHITE, marginBottom: 10, padding: 10 }}
      >
        <Heading title="Analytics" />
        <View style={Styles.flexCenter}>
          {/* <CustomIcon name="eye" size={19} color={Colors.GRAY} /> */}
          {/* <Text> Private to you</Text> */}
        </View>
        <Analytics
          icon="people"
          title={`${DATA.ANALYTICS.profile_views} total quizes`}
          subTitle="Keep Going"
        />
        <Analytics
          icon="bar-chart"
          title={`${DATA.ANALYTICS.post_impressions} highest score`}
          subTitle="Breaking more leaderboards"
        />
        <Analytics
          icon="search"
          title={`${DATA.ANALYTICS.search_appearence} average score`}
          subTitle="Always flying"
        />
      </View>
<View
  style={{ backgroundColor: Colors.WHITE, marginBottom: 10, padding: 10 }}
>
  <View
    style={[
      Styles.flexCenter,
      {
        justifyContent: "space-between",
        marginBottom: 14,
      },
    ]}
  >
    <Heading title="About" />
    <TouchableOpacity
      onPress={() => {
        if (isEditingAbout) {
          // Save the changes
          handleSaveAbout();
        } else {
          // Enter edit mode and initialize with current value
          setEditedAbout(profileData?.about || DATA.ABOUT);
          setIsEditingAbout(true);
        }
      }}
      disabled={updatingAbout}
    >
      {updatingAbout ? (
        <ActivityIndicator size="small" color={Colors.BLUE} />
      ) : (
        <CustomIcon
          size={22}
          name={isEditingAbout ? "check" : "pencil"}
          color={Colors.GRAY}
        />
      )}
    </TouchableOpacity>
  </View>

  {isEditingAbout ? (
    <View>
      <TextInput
        value={editedAbout}
        onChangeText={setEditedAbout}
        style={{
          color: Colors.BLACK,
          fontSize: 15,
          textAlign: "justify",
          borderWidth: 1,
          borderColor: Colors.GRAY,
          borderRadius: 5,
          padding: 10,
          minHeight: 100,
        }}
        multiline
        autoFocus
      />
      <View style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
      }}>
        <TouchableOpacity
          onPress={() => {
            // Cancel editing
            setIsEditingAbout(false);
          }}
          style={{
            paddingVertical: 5,
            paddingHorizontal: 10,
            marginRight: 10,
          }}
        >
          <Text style={{ color: Colors.GRAY }}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSaveAbout}
          style={{
            backgroundColor: Colors.BLUE,
            paddingVertical: 5,
            paddingHorizontal: 15,
            borderRadius: 5,
          }}
          disabled={updatingAbout}
        >
          {updatingAbout ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : (
            <Text style={{ color: Colors.WHITE }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <Text
      style={{ color: Colors.BLACK, fontSize: 15, textAlign: "justify" }}
    >
      {profileData?.about || DATA.ABOUT}
    </Text>
  )}
</View>

<View style={Styles.container}>
  <SectionHeading title="Experience" />
  <ShowExperience 
    DATA={profileData.data} 
    profileData={profileData} 
    updateProfileField={updateProfileFieldArray}
  />
  {/* <ShowAllFooter /> */}
</View>

      <View style={Styles.container}>
        <SectionHeading title="Education" />
        <ShowEducation 
            DATA={profileData.education} 
        profileData={profileData} 
    updateProfileField={updateProfileFieldArray} />
      </View>

      <View style={Styles.container}>
        <SectionHeading title="Licenses & Certifications" />
        <ShowLicenses DATA={profileData.licenses} 
        profileData={profileData} 
    updateProfileField={updateProfileFieldArray} />
      </View>

      <View style={Styles.container}>
        <SectionHeading title="Skills" />
        <ShowSkills DATA={profileData.skills} 
        profileData={profileData} 
    updateProfileField={updateProfileFieldArray} />
      </View>

      {/* <View style={Styles.container}>
        <SectionHeading title="Courses" />
        <ShowCourses DATA={DATA} />
      </View> */}

      <View style={Styles.container}>
        <SectionHeading title="Projects" />
        <ShowProjects DATA={profileData.projects} 
        profileData={profileData} 
    updateProfileField={updateProfileFieldArray} />
      </View>

      <View
        style={[
          Styles.container,
          { backgroundColor: Colors.LIGHT_BLUE, marginBottom: 0 },
        ]}
      >
        <SectionHeading title="Contact Details" />
        <ShowPeople DATA={profileData.contact}         profileData={profileData} 
 updateProfileField={updateProfileFieldArray} />
      </View>
    </ScrollView>
  );
}
