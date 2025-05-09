// src/config/FirebaseConfig.js
import { firebase } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

// Your web app's Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgqKMYdONoQygfExPmTYdJH7FEb6qXmf8",
  authDomain: "com.company.mad_001",
  projectId: "mad-001-b54d5",
  storageBucket: "mad-001-b54d5.firebasestorage.app",
  messagingSenderId: "706309380537",
  appId: "1:706309380537:android:4247a3d02e61923dc8fe68"
};

// Initialize Firebase only if no apps are initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'project-706309380537', // Get this from Firebase console -> Authentication -> Sign-in method -> Google -> Web SDK configuration
});

// Email/Password Sign In
export const signInWithEmail = async (email, password) => {
  try {
    const result = await auth().signInWithEmailAndPassword(email, password);
    return { success: true, user: result.user };
  } catch (error) {
    let errorMessage = 'An error occurred during sign in';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email address';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'The email address is invalid';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Email/Password Sign Up
export const signUpWithEmail = async (email, password) => {
  try {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    return { success: true, user: result.user };
  } catch (error) {
    let errorMessage = 'An error occurred during sign up';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'That email address is already in use';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'That email address is invalid';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices();
    
    // Get the user ID token
    const { idToken } = await GoogleSignin.signIn();
    
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    
    // Sign-in with credential
    const result = await auth().signInWithCredential(googleCredential);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Facebook Sign In
export const signInWithFacebook = async () => {
  try {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    
    if (result.isCancelled) {
      return { success: false, error: 'User cancelled the login process' };
    }
    
    // Get the access token
    const data = await AccessToken.getCurrentAccessToken();
    
    if (!data) {
      return { success: false, error: 'Something went wrong obtaining access token' };
    }
    
    // Create a Facebook credential with the token
    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
    
    // Sign-in with credential
    const userCredential = await auth().signInWithCredential(facebookCredential);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign Out
export const signOut = async () => {
  try {
    await auth().signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Password Reset
export const resetPassword = async (email) => {
  try {
    await auth().sendPasswordResetEmail(email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth().currentUser;
};

// Listen for authentication state changes
export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
};

export default {
  firebase,
  auth,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  signOut,
  resetPassword,
  getCurrentUser,
  onAuthStateChanged
};