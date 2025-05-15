// CameraScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image
} from 'react-native';
import { Camera } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TagManager from './TagManager';

// This would be imported from a library like react-native-mlkit-document-scanner
// For this example, we'll simulate document edge detection
const DocumentScanner = {
  scanDocument: async (uri) => {
    // In a real implementation, this would call ML Kit's document scanner
    // For now, we'll just return the original image
    return { uri };
  }
};

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get the callback function from route params
  const onDocumentScanned = route.params?.onDocumentScanned;
  
  // The directory to save captured documents
  const documentDir = FileSystem.documentDirectory + 'scanned_documents/';

  useEffect(() => {
    (async () => {
      // Request camera permissions
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      
      setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
      
      // Ensure document directory exists
      const dirInfo = await FileSystem.getInfoAsync(documentDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(documentDir, { intermediates: true });
      }
      
      // Load available tags
      loadAvailableTags();
    })();
  }, []);

  // Load available tags from storage
  const loadAvailableTags = async () => {
    try {
      const storedTagsJson = await AsyncStorage.getItem('documentTags');
      if (storedTagsJson) {
        setAvailableTags(JSON.parse(storedTagsJson));
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  // Handle when camera is ready
  const handleCameraReady = () => {
    setCameraReady(true);
  };

  // Take a picture with the camera
  const takePicture = async () => {
    if (cameraRef.current && cameraReady && !isCapturing) {
      setIsCapturing(true);
      
      try {
        // Capture photo
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          skipProcessing: false,
        });
        
        // Process the captured image with document scanner
        const processedDoc = await DocumentScanner.scanDocument(photo.uri);
        setCapturedImage(processedDoc.uri);
        
        // Show tag selection modal
        setShowTagModal(true);
      } catch (error) {
        console.error('Error capturing document:', error);
        Alert.alert('Error', 'Failed to capture document');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  // Save the document with selected tags
  const saveDocument = async () => {
    if (!capturedImage) return;
    
    try {
      // Generate a filename based on timestamp
      const timestamp = new Date().getTime();
      const fileName = `Scan_${timestamp}.jpg`;
      const newFilePath = documentDir + fileName;
      
      // Copy the captured image to permanent storage
      await FileSystem.copyAsync({
        from: capturedImage,
        to: newFilePath
      });
      
      // Create document info object
      const documentInfo = {
        name: fileName,
        uri: newFilePath,
        tags: selectedTags,
        dateAdded: new Date().toISOString(),
        type: 'image/jpeg'
      };
      
      // Call the callback function passed from the main screen
      if (onDocumentScanned) {
        onDocumentScanned(documentInfo);
      }
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error saving document:', error);
      Alert.alert('Error', 'Failed to save document');
    }
  };

  // Retake the photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setShowTagModal(false);
    setSelectedTags([]);
  };

  // Handle tag selection changes
  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
  };

  // Render permissions not granted screen
  if (hasPermission === null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.permissionText}>Requesting permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centeredContainer}>
        <FontAwesome name="exclamation-triangle" size={50} color="#FF6347" />
        <Text style={styles.permissionText}>Camera access is required to scan documents</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        // Camera view
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.back}
          onCameraReady={handleCameraReady}
          ratio="4:3"
          autoFocus={Camera.Constants.AutoFocus.on}
        >
          {/* Document frame overlay */}
          <View style={styles.frameOverlay}>
            <View style={styles.documentFrame} />
          </View>
          
          {/* Camera controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <FontAwesome name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isCapturing || !cameraReady}
            >
              {isCapturing ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <FontAwesome name="camera" size={30} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
          {/* Instructions overlay */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Position document within the frame and ensure good lighting
            </Text>
          </View>
        </Camera>
      ) : (
        // Preview captured image
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: capturedImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          
          {/* Preview controls */}
          {!showTagModal && (
            <View style={styles.previewControls}>
              <TouchableOpacity 
                style={[styles.previewButton, styles.retakeButton]}
                onPress={retakePhoto}
              >
                <FontAwesome name="refresh" size={20} color="white" />
                <Text style={styles.previewButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.previewButton, styles.useButton]}
                onPress={() => setShowTagModal(true)}
              >
                <FontAwesome name="check" size={20} color="white" />
                <Text style={styles.previewButtonText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {/* Tag selection modal */}
      <Modal
        visible={showTagModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTagModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Tags to Document</Text>
            <TagManager
              availableTags={availableTags}
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              allowCreate={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTagModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveDocument}
              >
                <Text style={styles.modalButtonText}>Save Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  permissionText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  frameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentFrame: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  instructionContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewImage: {
    flex: 1,
  },
  previewControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.7)',
  },
  useButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.7)',
  },
  previewButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#1E90FF',
    marginLeft: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CameraScreen;