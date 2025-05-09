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
  Image,
} from 'react-native';
import { Camera } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import TagManager from './TagManager';

const DocumentScanner = {
  scanDocument: async (uri) => {
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

  const onDocumentScanned = route.params?.onDocumentScanned;
  const documentDir = FileSystem.documentDirectory + 'scanned_documents/';

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');

      const dirInfo = await FileSystem.getInfoAsync(documentDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(documentDir, { intermediates: true });
      }

      loadAvailableTags();
    })();
  }, []);

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

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const takePicture = async () => {
    if (cameraRef.current && cameraReady && !isCapturing) {
      setIsCapturing(true);

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          skipProcessing: false,
        });

        const processedDoc = await DocumentScanner.scanDocument(photo.uri);
        setCapturedImage(processedDoc.uri);
        setShowTagModal(true);
      } catch (error) {
        console.error('Error capturing document:', error);
        Alert.alert('Error', 'Failed to capture document');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const saveDocument = async () => {
    if (!capturedImage) return;

    try {
      const timestamp = new Date().getTime();
      const fileName = `Scan_${timestamp}.jpg`;
      const newFilePath = documentDir + fileName;

      await FileSystem.copyAsync({
        from: capturedImage,
        to: newFilePath
      });

      const documentInfo = {
        name: fileName,
        uri: newFilePath,
        tags: selectedTags,
        dateAdded: new Date().toISOString(),
        type: 'image/jpeg'
      };

      if (onDocumentScanned) {
        onDocumentScanned(documentInfo);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving document:', error);
      Alert.alert('Error', 'Failed to save document');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowTagModal(false);
    setSelectedTags([]);
  };

  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
  };

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
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.back}
          onCameraReady={handleCameraReady}
          ratio="4:3"
          autoFocus={Camera.Constants.AutoFocus.on}
        >
          <View style={styles.frameOverlay}>
            <View style={styles.documentFrame} />
          </View>

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

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Position document within the frame and ensure good lighting
            </Text>
          </View>
        </Camera>
      ) : (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: capturedImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />

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

      <Modal
        visible={showTagModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTagModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tag this document</Text>

            <TagManager
              availableTags={availableTags}
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={retakePhoto}
              >
                <Text style={styles.modalButtonText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveDocument}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  frameOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  documentFrame: { borderColor: 'white', borderWidth: 2, width: '80%', height: '60%' },
  controlsContainer: { position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 20, top: 40 },
  captureButton: { alignSelf: 'center', backgroundColor: '#1E90FF', padding: 15, borderRadius: 50 },
  instructionContainer: { position: 'absolute', top: 20, width: '100%', alignItems: 'center' },
  instructionText: { color: 'white', fontSize: 14 },
  previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  previewImage: { width: '100%', height: '80%' },
  previewControls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', padding: 20 },
  previewButton: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 5 },
  retakeButton: { backgroundColor: '#FF6347' },
  useButton: { backgroundColor: '#32CD32' },
  previewButtonText: { color: 'white', marginLeft: 8 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { marginTop: 20, fontSize: 16, textAlign: 'center', color: 'white' },
  button: { backgroundColor: '#1E90FF', padding: 10, marginTop: 20, borderRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalButton: { flex: 1, padding: 12, marginHorizontal: 5, borderRadius: 5, alignItems: 'center' },
  cancelButton: { backgroundColor: '#FF6347' },
  saveButton: { backgroundColor: '#1E90FF' },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default CameraScreen;
