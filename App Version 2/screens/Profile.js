import { View, Text, ScrollView, Image, TouchableOpacity, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import * as ProfileData from "../data/Profile";
import Colors from "../utils/colors";
import Icon from "react-native-vector-icons/Entypo";
import Heading from "../components/Heading";
import CustomIcon from "../components/CustomIcon";
import SectionHeading from "../components/SectionHeading";
import ShowPeople from "../components/Profile/ShowPeople";
import ShowExperience from "../components/Profile/ShowExperience";
import ShowEducation from "../components/Profile/ShowEducation";
import ShowLicenses from "../components/Profile/ShowLicenses";
import ShowSkills from "../components/Profile/ShowSkills";
import ShowProjects from "../components/Profile/ShowProjects";
import Styles from "../utils/Styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Alert } from "react-native";

// API URL
const API_URL = "https://mad-001-backend.onrender.com/api/v1";

export default function Profile() {
const DATA = ProfileData.default;
const [profileData, setProfileData] = useState(null);
const [loading, setLoading] = useState(true);
const [totalPoints, setTotalPoints] = useState(0);  // Total points from quiz history
const [highestBadge, setHighestBadge] = useState(null);  // Highest badge

// Name and Bio Section
const [username, setUsername] = useState('');
const getUserNameFromStorage = async () => {
  try {
    const userDataString = await AsyncStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return userData.name || null;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving user name:", error);
    return null;
  }
};

// Fetch quiz history data (total points and highest badge)
const fetchQuizHistory = async (userId) => {
  try {
    const res = await fetch(`${API_URL}/attempt/user/${userId}`);
    const data = await res.json();

    let highestBadge = null;
    let totalPoints = 0;

    data.data.attempts.forEach(attempt => {
      totalPoints += attempt.score;
      if (attempt.earned_badges.length > 0) {
        const badge = attempt.earned_badges[0]; // Assuming first badge is highest
        if (!highestBadge || parseFloat(badge.condition) > parseFloat(highestBadge.condition)) {
          highestBadge = badge;
        }
      }
    });

    setHighestBadge(highestBadge);
    setTotalPoints(totalPoints);
  } catch (err) {
    console.error('Failed to fetch attempts', err);
  } finally {
    setLoading(false);
  }
};

// Create user profile if one doesn't exist
const createUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: userId }),
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('Profile created successfully');
      return result.data.profile;
    } else {
      console.error('Failed to create profile:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Error creating profile:', error);
    return null;
  }
};

// Fetch profile data
const getUserIdFromStorage = async () => {
  try {
    const userDataString = await AsyncStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return userData._id;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

useEffect(() => {
  let isMounted = true;

  const fetchProfile = async () => {
    try {
      const userId = await getUserIdFromStorage();
      const userName = await getUserNameFromStorage();
      setUsername(userName);

      if (!userId) {
        console.error("No user ID available");
        setLoading(false);
        return;
      }

      // Try to fetch user profile data
      try {
        const profileRes = await fetch(`${API_URL}/profile/${userId}`);
        
        if (!profileRes.ok) {
          // If profile doesn't exist (404) or other error, create one
          if (profileRes.status === 404) {
            console.log("Profile not found, creating new profile");
            const newProfile = await createUserProfile(userId);
            if (newProfile) {
              setProfileData(newProfile);
            } else {
              // If profile creation fails, use default data
              console.log("Using default profile data");
              setProfileData(DATA);
            }
          } else {
            throw new Error(`Failed to fetch profile: ${profileRes.status}`);
          }
        } else {
          // Profile exists
          const profileData = await profileRes.json();
          setProfileData(profileData.data.profile);
        }
      } catch (profileError) {
        console.error("Error in profile fetch:", profileError);
        // Attempt to create a profile as fallback
        const newProfile = await createUserProfile(userId);
        if (newProfile) {
          setProfileData(newProfile);
        } else {
          // If all else fails, use default data
          console.log("Using default profile data as fallback");
          setProfileData(DATA);
        }
      }

      // Fetch quiz history data
      fetchQuizHistory(userId);
    } catch (error) {
      console.error("Error in profile flow:", error);
      // Use default data as last resort
      setProfileData(DATA);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchProfile();

  return () => {
    isMounted = false;
  };
}, []);

  // Analytics component
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
          style={[Styles.flexCenter, { marginVertical: 16, justifyContent: "space-evenly" }]}
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
            <Text style={{ color: Colors.GRAY, fontSize: 19 }}>Add Section</Text>
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

      {/* Analytics Section */}
      <View style={{ backgroundColor: Colors.WHITE, marginBottom: 10, padding: 10 }}>
        <Heading title="Analytics" />
        <View style={Styles.flexCenter}>
          {/* Analytics Icons */}
        </View>

        {/* Display total points and highest badge */}
        <Analytics
          icon="people"
          title={`Total Points: ${totalPoints}`}
          subTitle="Keep Going"
        />
        {highestBadge ? (
          <Analytics
            icon="bar-chart"
            title={`Earned Badge: ${highestBadge.condition}%`}
            subTitle="Breaking more leaderboards"
          />
        ) : (
          <Analytics
            icon="search"
            title="No badges earned"
            subTitle="Keep trying!"
          />
        )}

        {/* Display badge media if available */}
        {highestBadge && (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Image
              source={{ uri: `https://mad-001-backend.onrender.com/${highestBadge.media}` }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <Text style={{ fontSize: 16, marginTop: 5, color: Colors.GRAY }}>
              Badge: {highestBadge.condition}%
            </Text>
          </View>
        )}
      </View>

      {/* About Section */}
      <View style={{ backgroundColor: Colors.WHITE, marginBottom: 10, padding: 10 }}>
        <Heading title="About" />
        <Text
          style={{ color: Colors.BLACK, fontSize: 15, textAlign: "justify" }}
        >
          {profileData?.about || DATA.ABOUT}
        </Text>
      </View>

      {/* Experience Section */}
      <View style={Styles.container}>
        <SectionHeading title="Experience" />
        <ShowExperience
          DATA={profileData?.experience}
          profileData={profileData}
        />
      </View>

      {/* Education Section */}
      <View style={Styles.container}>
        <SectionHeading title="Education" />
        <ShowEducation
          DATA={profileData?.education}
          profileData={profileData}
        />
      </View>

      {/* Licenses Section */}
      <View style={Styles.container}>
        <SectionHeading title="Licenses & Certifications" />
        <ShowLicenses
          DATA={profileData?.licenses}
          profileData={profileData}
        />
      </View>

      {/* Skills Section */}
      <View style={Styles.container}>
        <SectionHeading title="Skills" />
        <ShowSkills
          DATA={profileData?.skills}
          profileData={profileData}
        />
      </View>

      {/* Projects Section */}
      <View style={Styles.container}>
        <SectionHeading title="Projects" />
        <ShowProjects
          DATA={profileData?.projects}
          profileData={profileData}
        />
      </View>

      {/* Contact Section */}
      <View style={[Styles.container, { backgroundColor: Colors.LIGHT_BLUE, marginBottom: 0 }]}>
        <SectionHeading title="Contact Details" />
        <ShowPeople
          DATA={profileData?.contact}
          profileData={profileData}
        />
      </View>
    </ScrollView>
  );
}
