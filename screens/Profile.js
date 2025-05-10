import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native';
import React, { useEffect, useState } from 'react';
import * as ProfileData from '../data/Profile';
import Colors from '../utils/colors';
import Icon from 'react-native-vector-icons/Entypo';
import Heading from '../components/Heading';
import CustomIcon from '../components/CustomIcon';
import ShowAllFooter from '../components/ShowAllFooter';
import SectionHeading from '../components/SectionHeading';
import ShowPeople from '../components/Profile/ShowPeople';
import ShowCourses from '../components/Profile/ShowCourses';
import ShowProjects from '../components/Profile/ShowProjects';
import ShowSkills from '../components/Profile/ShowSkills';
import ShowLicenses from '../components/Profile/ShowLicenses';
import ShowEducation from '../components/Profile/ShowEducation';
import ShowExperience from '../components/Profile/ShowExperience';
import Styles from '../utils/Styles';
const API_URL = 'http://192.168.0.109:4001/api/v1';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const DATA = ProfileData.default;
  const [profileData, setProfileData] = useState(null);
const [loading, setLoading] = useState(true);

const getUserIdFromStorage = async () => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');
    
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      // console.log(userData)
      const userId = userData._id;
      // console.log(userId)
      return userId;
    } else {
      console.error('No user data found');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};
const createProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userId })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create profile: ${response.status}`);
    }
    
    const createdProfile = await response.json();
    return createdProfile;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error; // Re-throw to handle in the calling function
  }
};
// Fetch profile data
useEffect(() => {
  let isMounted = true;
  
  const fetchProfile = async () => {
    try {
      const userId = await getUserIdFromStorage();
      if (!userId) {
        console.error('No user ID available');
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
      if (isMounted) setProfileData(data);
    } catch (error) {
      console.log('Error fetching profile:', error);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchProfile();
  
  // Cleanup function to prevent state updates on unmounted component
  return () => {
    isMounted = false;
  };
}, []);

  const Analytics = ({title, subTitle, icon}) => (
    <View style={[Styles.flexCenter, { paddingVertical: 10}]}>
      <CustomIcon
        name={icon}
        size={28}
        color={Colors.GRAY}
        style={{marginRight: 10}}
      />
      <View>
        <Text style={{fontSize: 17, fontWeight: 'bold', color: Colors.BLACK}}>
          {title}
        </Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={{color: Colors.LIGHT_BLACK}}>{subTitle}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{backgroundColor: Colors.WHITE, marginBottom: 10}}>
        <Image source={DATA.INFO.banner} style={{width: '100%', height: 100}} />
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
        <View style={{marginTop: -45, paddingHorizontal: 10}}>
          <Text style={{fontSize: 28, color: Colors.BLACK, fontWeight: 'bold'}}>
            {DATA.INFO.name}
          </Text>
          <Text style={{color: Colors.BLACK, fontSize: 16}}>
            {DATA.INFO.bio}
          </Text>
          <Text style={{marginTop: 4, marginBottom: 10}}>
            Talks about - {DATA.INFO.talksAbout.map(item => `${item} `)}
          </Text>
          <View style={Styles.flexCenter}>
            <Text
              style={{color: Colors.BLUE, fontSize: 15, fontWeight: 'bold'}}>
              {DATA.INFO.followers} followers
            </Text>
            <Icon name="dot-single" size={16} color={Colors.GRAY} />
            <Text
              style={{color: Colors.BLUE, fontSize: 15, fontWeight: 'bold'}}>
              {DATA.INFO.connections > 500 ? '500+' : DATA.INFO.connections}{' '}
              connections
            </Text>
          </View>
        </View>

        <View
          style={[Styles.flexCenter, {
            marginVertical: 16,
            justifyContent: 'space-evenly',
          }]}>
          <TouchableOpacity
            onPress={() => {}}
            style={{
              backgroundColor: Colors.BLUE,
              borderRadius: 50,
              width: 140,
              paddingVertical: 5,
              alignItems: 'center',
            }}>
            <Text style={{color: Colors.WHITE, fontSize: 19}}>Open to</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {}}
            style={{
              borderWidth: 1,
              borderColor: Colors.GRAY,
              borderRadius: 50,
              width: 140,
              paddingVertical: 5,
              alignItems: 'center',
            }}>
            <Text style={{color: Colors.GRAY, fontSize: 19}}>Add Section</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {}}
            style={{
              borderRadius: 50,
              borderWidth: 1,
              borderColor: Colors.GRAY,
              width: 35,
              height: 35,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="dots-three-horizontal" size={19} color={Colors.GRAY} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{backgroundColor: Colors.WHITE, marginBottom: 10, padding: 10}}>
        <Heading title="Analytics" />
        <View style={Styles.flexCenter}>
          <CustomIcon name="eye" size={19} color={Colors.GRAY} />
          <Text> Private to you</Text>
        </View>
        <Analytics
          icon="people"
          title={`${DATA.ANALYTICS.profile_views} profile views`}
          subTitle="Discover who's viewed your profile"
        />
        <Analytics
          icon="bar-chart"
          title={`${DATA.ANALYTICS.post_impressions} post impressions`}
          subTitle="Check out who's engaing with your posts"
        />
        <Analytics
          icon="search"
          title={`${DATA.ANALYTICS.search_appearence} search appearences`}
          subTitle="See how often you appear in search results"
        />
      </View>

      <View
        style={{backgroundColor: Colors.WHITE, marginBottom: 10, padding: 10}}>
        <View
          style={[Styles.flexCenter, {
            justifyContent: 'space-between',
            marginBottom: 14,
          }]}>
          <Heading title="About" />
          <TouchableOpacity onPress={() => {}}>
            <CustomIcon size={22} name="pencil" color={Colors.GRAY} />
          </TouchableOpacity>
        </View>

        <Text
          style={{color: Colors.BLACK, fontSize: 15, textAlign: 'justify'}}
          numberOfLines={4}
          ellipsizeMode="tail">
          {DATA.ABOUT}
        </Text>
      </View>

      <View style={Styles.container}>
        <SectionHeading title="Experience" />
        <ShowExperience DATA={DATA} />
        <ShowAllFooter />
      </View>

      <View style={Styles.container}>
        <SectionHeading title="Education" />
        <ShowEducation DATA={DATA} />
      </View>

      <View style={Styles.container}>
        <SectionHeading title="Licenses & Certifications" />
        <ShowLicenses DATA={DATA} />
      </View>

      <View style={Styles.container}>
        <SectionHeading title="Skills" />
        <ShowSkills DATA={DATA} />
      </View>

      <View style={Styles.container}>
        <SectionHeading title="Courses" />
        <ShowCourses DATA={DATA} />
      </View>

      <View style={Styles.container}>
        <SectionHeading title="Projects" />
        <ShowProjects DATA={DATA} />
      </View>

      <View style={[Styles.container, { backgroundColor: Colors.LIGHT_BLUE, marginBottom: 0 }]}>
        <SectionHeading title="Contact Details" />
        <ShowPeople DATA={DATA} />
      </View>
    </ScrollView>
  );
}