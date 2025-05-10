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