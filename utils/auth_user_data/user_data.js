import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserNameFromStorage = async () => {
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
    console.error("Error retrieving user name:", error);
    return null;
  }
};