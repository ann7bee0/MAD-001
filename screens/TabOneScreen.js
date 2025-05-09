import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';

// Create a documents directory if it doesn't exist
const documentsDirectory = FileSystem.documentDirectory + 'documents/';
const ensureDirectoryExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(documentsDirectory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(documentsDirectory, { intermediates: true });
    console.log("Created documents directory");
  }
};

// Create a JSON file for storing document metadata
const metadataFile = documentsDirectory + 'documents.json';

// Document model
const createDocument = (uri, name, tags = []) => {
  return {
    id: Date.now().toString(),
    name,
    uri,
    tags,
    createdAt: new Date().toISOString(),
  };
};

// Storage functions
const saveDocumentsToStorage = async (documents) => {
  try {
    await ensureDirectoryExists();
    await FileSystem.writeAsStringAsync(
      metadataFile,
      JSON.stringify(documents)
    );
    console.log("Documents saved successfully");
  } catch (error) {
    console.error('Error saving documents:', error);
    throw error;
  }
};

const loadDocumentsFromStorage = async () => {
  try {
    await ensureDirectoryExists();
    const fileInfo = await FileSystem.getInfoAsync(metadataFile);
    if (fileInfo.exists) {
      const data = await FileSystem.readAsStringAsync(metadataFile);
      console.log("Documents loaded successfully");
      return JSON.parse(data);
    }
    console.log("No existing documents found, returning empty array");
    return [];
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
};

export default function DocumentScanner() {
  // App states
  const [screen, setScreen] = useState('main'); // main, tagging, viewer
  const [documents, setDocuments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  
  // Document states
  const [currentDocumentUri, setCurrentDocumentUri] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [captureMode, setCaptureMode] = useState(''); // scan or upload
  
  // Load documents on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedDocuments = await loadDocumentsFromStorage();
        setDocuments(loadedDocuments);
        
        // Extract and set all unique tags
        const tags = new Set();
        loadedDocuments.forEach(doc => {
          if (doc.tags && Array.isArray(doc.tags)) {
            doc.tags.forEach(tag => tags.add(tag));
          }
        });
        setAvailableTags(Array.from(tags));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in loadData:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save documents whenever they change
  useEffect(() => {
    const saveData = async () => {
      if (!isLoading && documents.length > 0) {
        try {
          await saveDocumentsToStorage(documents);
        } catch (error) {
          console.error('Error in saveData:', error);
        }
      }
    };
    
    saveData();
  }, [documents, isLoading]);

  // Request permissions
  const requestPermissions = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      
      return {
        cameraGranted: cameraPermission.status === 'granted',
        mediaGranted: mediaPermission.status === 'granted'
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return { cameraGranted: false, mediaGranted: false };
    }
  };

  // Handle document scanning with ImagePicker (simplified approach)
  const handleScan = async () => {
    try {
      const { cameraGranted, mediaGranted } = await requestPermissions();
      
      if (!cameraGranted || !mediaGranted) {
        Alert.alert(
          'Permissions Required',
          'Camera and media library permissions are required to scan documents.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Launch camera directly using ImagePicker instead of custom camera UI
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Process the captured image
        const processedImage = await manipulateAsync(
          result.assets[0].uri,
          [], // No transformations needed as ImagePicker already allows editing
          { compress: 0.8, format: SaveFormat.JPEG }
        );
        
        setCaptureMode('scan');
        setCurrentDocumentUri(processedImage.uri);
        setDocumentName(`Scan ${new Date().toLocaleDateString()}`);
        setSelectedTags([]);  // Reset selected tags
        setScreen('tagging');
      }
    } catch (error) {
      console.error('Error in handleScan:', error);
      Alert.alert('Error', 'Failed to capture image.');
    }
  };

  // Handle document upload
  const handleUpload = async () => {
    try {
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      
      if (!mediaPermission.granted) {
        Alert.alert(
          'Permission Required',
          'Media library permission is required to upload documents.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCaptureMode('upload');
        setCurrentDocumentUri(result.assets[0].uri);
        setDocumentName(`Upload ${new Date().toLocaleDateString()}`);
        setSelectedTags([]);  // Reset selected tags
        setScreen('tagging');
      }
    } catch (error) {
      console.error('Error in handleUpload:', error);
      Alert.alert('Error', 'Failed to upload image.');
    }
  };

  // Tag handlers
  const toggleTag = (tag) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };

  const addNewTag = () => {
    const trimmedTag = newTagText.trim();
    
    if (trimmedTag !== '' && !availableTags.includes(trimmedTag)) {
      setAvailableTags(prevTags => [...prevTags, trimmedTag]);
      setSelectedTags(prevTags => [...prevTags, trimmedTag]);
      setNewTagText('');
    }
    setShowTagModal(false);
  };

  // Save document
  const saveDocument = async () => {
    if (!documentName.trim()) {
      Alert.alert('Warning', 'Please enter a document name');
      return;
    }
    
    try {
      if (!currentDocumentUri) {
        throw new Error('No document URI to save');
      }
      
      await ensureDirectoryExists();
      
      // Create new document
      const newDocument = createDocument(currentDocumentUri, documentName.trim(), selectedTags);
      
      // Copy file to app's documents directory for persistence
      const newDocumentPath = documentsDirectory + newDocument.id + '.jpg';
      console.log('Copying from', currentDocumentUri);
      console.log('Copying to', newDocumentPath);
      
      await FileSystem.copyAsync({
        from: currentDocumentUri,
        to: newDocumentPath
      });
      
      // Update the document with the new permanent URI
      newDocument.uri = newDocumentPath;
      
      // Add document to collection
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      
      // Update available tags
      const updatedTags = new Set(availableTags);
      selectedTags.forEach(tag => updatedTags.add(tag));
      setAvailableTags(Array.from(updatedTags));
      
      // Reset states
      setSelectedTags([]);
      setCurrentDocumentUri(null);
      
      Alert.alert('Success', 'Document saved successfully!');
      setScreen('main');
    } catch (error) {
      console.error('Error saving document:', error);
      Alert.alert('Error', 'Failed to save document: ' + error.message);
    }
  };

  // Delete document
  const deleteDocument = (docId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this document?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const docToDelete = documents.find(doc => doc.id === docId);
              
              if (docToDelete) {
                // Delete the file
                const fileInfo = await FileSystem.getInfoAsync(docToDelete.uri);
                if (fileInfo.exists) {
                  await FileSystem.deleteAsync(docToDelete.uri);
                }
                
                // Remove from documents array
                const updatedDocuments = documents.filter(doc => doc.id !== docId);
                setDocuments(updatedDocuments);
                
                // Go back to main screen if in viewer
                if (screen === 'viewer') {
                  setCurrentDocument(null);
                  setScreen('main');
                }
              }
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          }
        }
      ]
    );
  };

  // View document
  const viewDocument = (document) => {
    setCurrentDocument(document);
    setScreen('viewer');
  };

  // Filter documents based on search text and selected tags
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => doc.tags && doc.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  // Render document item
  const renderDocumentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.documentItem}
      onPress={() => viewDocument(item)}
    >
      <Ionicons name="document-text" size={20} color="#1E90FF" style={styles.icon} />
      <View style={styles.documentInfo}>
        <Text style={styles.documentText}>{item.name}</Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagContainer}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.documentTag}>#{tag}</Text>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteDocument(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6347" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Main screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </SafeAreaView>
    );
  }

  // Tagging screen
  if (screen === 'tagging') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>
          {captureMode === 'scan' ? 'Save Scanned Document' : 'Save Uploaded Document'}
        </Text>
        
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: currentDocumentUri }}
            style={styles.tagPreviewImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.inputLabel}>Document Name:</Text>
        <TextInput
          style={styles.nameInput}
          value={documentName}
          onChangeText={setDocumentName}
          placeholder="Enter document name"
        />
        
        <Text style={styles.inputLabel}>Tags:</Text>
        <View style={styles.tagSelectionContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={() => setShowTagModal(true)}
            >
              <Ionicons name="add" size={16} color="#1E90FF" />
              <Text style={styles.addTagText}>New Tag</Text>
            </TouchableOpacity>
            
            {availableTags.map((tag, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.tagItem, 
                  selectedTags.includes(tag) && styles.tagItemSelected
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextSelected
                ]}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setScreen('main')}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveDocument}
          >
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Document</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Document viewer screen
  if (screen === 'viewer' && currentDocument) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.documentHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setCurrentDocument(null);
              setScreen('main');
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#1E90FF" />
          </TouchableOpacity>
          <Text style={styles.documentTitle}>{currentDocument.name}</Text>
          <TouchableOpacity
            style={styles.deleteViewButton}
            onPress={() => deleteDocument(currentDocument.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6347" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.documentTagsContainer}>
          {currentDocument.tags && currentDocument.tags.map((tag, index) => (
            <Text key={index} style={styles.documentViewTag}>#{tag}</Text>
          ))}
        </View>
        
        <ScrollView style={styles.documentImageContainer}>
          <Image
            source={{ uri: currentDocument.uri }}
            style={styles.documentImage}
            resizeMode="contain"
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main screen (default)
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Document Scanner</Text>
      
      {/* Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search documents..."
        value={searchText}
        onChangeText={setSearchText}
      />
      
      {/* Tag filters */}
      <View style={styles.tagFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableTags.length > 0 && availableTags.map((tag, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.tagItem, 
                selectedTags.includes(tag) && styles.tagItemSelected
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextSelected
              ]}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Document list */}
      {filteredDocuments.length > 0 ? (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item) => item.id}
          renderItem={renderDocumentItem}
          style={styles.documentList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open" size={60} color="#CCCCCC" />
          <Text style={styles.emptyText}>No documents found</Text>
        </View>
      )}
      
      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Ionicons name="cloud-upload" size={20} color="#fff" />
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.buttonText}>Scan</Text>
        </TouchableOpacity>
      </View>
      
      {/* Add Tag Modal */}
      <Modal
        visible={showTagModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTagModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Tag</Text>
            <TextInput
              style={styles.tagInput}
              placeholder="Enter tag name"
              value={newTagText}
              onChangeText={setNewTagText}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowTagModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={addNewTag}
              >
                <Text style={styles.modalPrimaryButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  tagFiltersContainer: {
    marginBottom: 15,
    height: 40,
  },
  documentList: {
    flex: 1,
    marginVertical: 10,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1E90FF',
  },
  documentInfo: {
    flex: 1,
  },
  icon: {
    marginRight: 15,
  },
  documentText: {
    fontSize: 16,
    fontWeight: '500',
  },
  documentTag: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 5,
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagItemSelected: {
    backgroundColor: '#1E90FF',
  },
  tagText: {
    color: '#666',
    fontSize: 14,
  },
  tagTextSelected: {
    color: '#fff',
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  addTagText: {
    color: '#1E90FF',
    marginLeft: 5,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#AAAAAA',
    marginTop: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#FF6347',
    fontSize: 16,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tagInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  modalPrimaryButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#666',
  },
  modalPrimaryButtonText: {
    color: '#fff',
  },
  
  // Camera screen styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentFrame: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Processing screen styles
  processingContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
  },
  previewImage: {
    width: '90%',
    height: '90%',
  },
  processingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E90FF',
    flex: 1,
    marginHorizontal: 5,
  },
  controlButtonText: {
    color: '#1E90FF',
    marginLeft: 8,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#1E90FF',
    borderColor: '#1E90FF',
  },
  primaryButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },

  // Tag document screen styles
  tagPreviewImage: {
    width: '100%',
    height: 200,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  tagSelectionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    minHeight: 40,
  },
  saveButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 2,
  },
  saveButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },

  // Document view screen styles
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  documentTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  documentViewTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    color: '#666',
  },
  documentImageContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  documentImage: {
    width: '100%',
    height: 500,
  },
});