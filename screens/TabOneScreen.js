import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from 'react-native-vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export default function ScanDocuments() {
  const [searchText, setSearchText] = useState('');
  const [documents, setDocuments] = useState([]);
  const [cameraPermission, setCameraPermission] = useState(null);
  const navigation = useNavigation();

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
  };

  const handleScan = async () => {
    await requestCameraPermission();
    if (!cameraPermission) return Alert.alert('Error', 'Camera permission is required');

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const croppedImage = await manipulateAsync(result.assets[0].uri, [], { compress: 1, format: SaveFormat.JPEG });
      const tag = prompt('Enter tags for this document (comma-separated):');
      const tagList = tag ? tag.split(',').map(t => t.trim()) : [];

      setDocuments(prev => [...prev, { name: `Document ${prev.length + 1}`, uri: croppedImage.uri, tags: tagList }]);
      Alert.alert('Success', 'Document scanned and saved!');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.documentItem}>
      <FontAwesome name="file-text" size={20} color="#1E90FF" style={styles.icon} />
      <Text style={styles.documentText}>{item.name}</Text>
      <Text style={styles.tagText}>Tags: {item.tags.join(', ')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Documents</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search documents by name or tag..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={documents.filter(doc => doc.name.toLowerCase().includes(searchText.toLowerCase()) || doc.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())))}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        style={styles.documentList}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleScan}>
          <FontAwesome name="camera" size={20} color="#fff" />
          <Text style={styles.buttonText}>Scan with Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  searchBar: { borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 20, borderRadius: 8 },
  documentList: { marginVertical: 10 },
  documentItem: { flexDirection: 'column', padding: 10, backgroundColor: '#f9f9f9', marginBottom: 5, borderRadius: 5 },
  icon: { marginBottom: 5 },
  documentText: { fontSize: 16, fontWeight: 'bold' },
  tagText: { fontSize: 14, color: '#555' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E90FF', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', marginLeft: 5 }
});
