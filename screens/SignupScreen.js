import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import logo from '../assets/logos/TVET.jpg';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as yup from 'yup';
import FaIcon from 'react-native-vector-icons/FontAwesome';

const signupValidationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().min(6, ({ min }) => `Password must be at least ${min} characters`).required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function SignUp() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Create your TVET Connect Account</Text>
      <Text style={styles.subheading}>Join the TVET ecosystem in Bhutan</Text>

      <Formik 
        validationSchema={signupValidationSchema} 
        initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
        onSubmit={values => Alert.alert('Account created!', JSON.stringify(values))}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
          <>
            <View style={styles.inputContainer}>
              <Icon name="person-outline" size={25} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Full Name" 
                onChangeText={handleChange('name')} 
                onBlur={handleBlur('name')} 
                value={values.name} 
              />
            </View>
            {errors.name && touched.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <View style={styles.inputContainer}>
              <Icon name="mail-outline" size={25} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Email" 
                keyboardType="email-address" 
                onChangeText={handleChange('email')} 
                onBlur={handleBlur('email')} 
                value={values.email} 
              />
            </View>
            {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={25} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Password" 
                secureTextEntry 
                onChangeText={handleChange('password')} 
                onBlur={handleBlur('password')} 
                value={values.password} 
              />
            </View>
            {errors.password && touched.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={25} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Confirm Password" 
                secureTextEntry 
                onChangeText={handleChange('confirmPassword')} 
                onBlur={handleBlur('confirmPassword')} 
                value={values.confirmPassword} 
              />
            </View>
            {errors.confirmPassword && touched.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={!isValid}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Or sign up with</Text>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}><FaIcon name="google" size={20} color="#DB4437" /></TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}><FaIcon name="facebook" size={20} color="#4267B2" /></TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}><Image source={require('../assets/logos/BhutanNDI.png')} style={styles.ndiLogo} /></TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('TVET Connect Sign In')}>
              <Text style={styles.signUp}>Already have an account? <Text style={styles.signUpLink}>Sign In</Text></Text>
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
  subheading: { 
    fontSize: 12, 
    marginBottom: 40, 
    textAlign: 'center', 
    color: 'black' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%', 
    height: 50, 
    backgroundColor: '#f1f1f1', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 20 
  },
  icon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    height: '100%' 
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
  signUp: { marginTop:5, color: '#000' },
  signUpLink: { color: '#1E90FF' },
  errorText: { color: 'red', alignSelf: 'flex-start', marginBottom: 10 }
});