// TagManager.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const TagManager = ({ availableTags = [], selectedTags = [], onTagsChange, allowCreate = true }) => {
  const [newTag, setNewTag] = useState('');

  // Handle adding a new tag
  const handleAddTag = () => {
    const tagToAdd = newTag.trim();
    
    // Validate tag
    if (!tagToAdd) {
      return;
    }
    
    // Check if tag already exists
    if (availableTags.includes(tagToAdd)) {
      // If tag exists but isn't selected, add it to selected tags
      if (!selectedTags.includes(tagToAdd)) {
        onTagsChange([...selectedTags, tagToAdd]);
      }
    } else if (allowCreate) {
      // Create new tag and add to selected
      onTagsChange([...selectedTags, tagToAdd]);
    }
    
    // Clear input
    setNewTag('');
  };

  // Toggle a tag selection
  const toggleTagSelection = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tag input */}
      {allowCreate && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add new tag..."
            value={newTag}
            onChangeText={setNewTag}
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
            <FontAwesome name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Tags</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tagRow}>
              {selectedTags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.tag, styles.selectedTag]}
                  onPress={() => toggleTagSelection(tag)}
                >
                  <Text style={styles.selectedTagText}>{tag}</Text>
                  <FontAwesome name="times" size={12} color="#fff" style={styles.tagIcon} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
      
      {/* Available tags */}
      {availableTags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Tags</Text>
          <View style={styles.tagContainer}>
            {availableTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) ? styles.selectedTag : styles.availableTag
                ]}
                onPress={() => toggleTagSelection(tag)}
              >
                <Text
                  style={selectedTags.includes(tag) ? styles.selectedTagText : styles.availableTagText}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {availableTags.length === 0 && !allowCreate && (
        <Text style={styles.noTagsText}>No tags available. Create some tags when scanning or uploading documents.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#1E90FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: '#1E90FF',
  },
  availableTag: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTagText: {
    color: '#fff',
    fontWeight: '500',
  },
  availableTagText: {
    color: '#333',
  },
  tagIcon: {
    marginLeft: 6,
  },
  noTagsText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default TagManager;