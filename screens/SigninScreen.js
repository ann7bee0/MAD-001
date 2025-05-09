import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import logo from '../assets/logos/TVET.jpg';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as yup from 'yup';
import FaIcon from 'react-native-vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';

const loginValidationSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().min(6, ({ min }) => `Password must be at least ${min} characters`).required('Password is required'),
});

export default function SignIn() {
  const navigation = useNavigation();
const authenticateUser = async (values) => {
    const fileUri = FileSystem.documentDirectory + 'cred.json';

    try {
      const fileExists = await FileSystem.getInfoAsync(fileUri);
      if (!fileExists.exists) throw new Error('No accounts found. Please sign up first.');

      const credentials = JSON.parse(await FileSystem.readAsStringAsync(fileUri));
      const user = credentials.find(cred => cred.email === values.email && cred.password === values.password);

      if (user) {
        Alert.alert('Login Successful!', 'Welcome to TVET Connect!');
        navigation.navigate('TabTwo');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Welcome to TVET Connect</Text>
      <Text style={styles.subheading}>Your gateway to the TVET ecosystem in Bhutan</Text>

      <Formik validationSchema={loginValidationSchema} initialValues={{ email: '', password: '' }} onSubmit={values => authenticateUser(values)}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid  } ) => (
          
          <>
            <View style={styles.inputContainer}>
              <Icon name="mail-outline" size={25} style={styles.icon} />
              <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" onChangeText={handleChange('email')} onBlur={handleBlur('email')} value={values.email} />
            </View>
            {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={25} style={styles.icon} />
              <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={handleChange('password')} onBlur={handleBlur('password')} value={values.password} />
            </View>
            {errors.password && touched.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity onPress={() => navigation.navigate('Forget')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={!isValid}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Or connect with</Text>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}><FaIcon name="google" size={20} color="#DB4437" /></TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}><FaIcon name="facebook" size={20} color="#4267B2" /></TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}><Image source={require('../assets/logos/BhutanNDI.png')} style={styles.ndiLogo} /></TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('TVET Connect Sign Up')}>
              <Text style={styles.signUp}>Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text></Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingHorizontal: 20, 
    marginTop: 50 
  },
  logo: { 
    height: 100, 
    width: "100%", 
    resizeMode: 'contain', 
    marginBottom: 20 
  },
  title: { 
    fontSize: 25, 
    fontWeight: 'bold', 
    color: 'black' 
  },
  subheading: 
  { 
    fontSize: 12, 
    marginBottom: 40, 
    textAlign: 'center', 
    color: 'black' 
  },
  inputContainer: 
  { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%', 
    height: 50, 
    backgroundColor: '#f1f1f1', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 20 },
  icon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    height: '100%' 
  },
  forgotPassword: { 
    alignSelf: 'flex-end', 
    marginBottom: 20, 
    color: '#000' 
  },
  button: { 
    width: '100%', 
    height: 50, 
    backgroundColor: '#1E90FF', 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18 
  },
  orText: { 
    marginVertical: 10, 
    color: '#000' 
  },
  socialContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
     marginVertical: 10 
    },
  socialButton: { 
    backgroundColor: '#f1f1f1', 
    padding: 15, 
    borderRadius: 8,
    width:50,
    height:50,
    alignContent:"center",
    alignItems:"center"
  },
  ndiLogo: { 
    width: 20, 
    height: 20, 
    resizeMode: 'contain' 
  },
  signUp: { color: '#000' },
  signUpLink: { color: '#1E90FF' },
  errorText: { color: 'red', alignSelf: 'flex-start', marginBottom: 10 }
});
