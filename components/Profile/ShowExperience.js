import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import CustomIcon from '../CustomIcon';
import Colors from '../../utils/colors';
import Styles from '../../utils/Styles';

const BLANK_EXPERIENCE = {
  title: '',
  company: '',
  startDate: '',
  endDate: '',
  description: ''
};

const ExperienceItem = ({ item, index, onUpdate, onDelete, isProfileData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatingExperience, setUpdatingExperience] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });

  // Check if this is a new item being added
  const isNewItem = !item.title;

  const handleSave = async () => {
    try {
      // Basic validation
      if (!editedItem.title) {
        Alert.alert('Error', 'Job title is required');
        return;
      }

      setUpdatingExperience(true);
      
      // Call the update function passed from parent
      await onUpdate(editedItem, index);
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update experience');
    } finally {
      setUpdatingExperience(false);
    }
  };

  const handleCancel = () => {
    if (isNewItem) {
      // If it's a new item being added, tell parent to remove it
      onDelete(index);
    } else {
      // Otherwise just reset to original values
      setEditedItem({ ...item });
      setIsEditing(false);
    }
  };

  // Start in edit mode if this is a new blank item
  React.useEffect(() => {
    if (isNewItem) {
      setIsEditing(true);
    }
  }, [isNewItem]);

  return (
    <View
      style={[
        Styles.flexCenter,
        {
          borderBottomColor: Colors.LIGHT_GRAY,
          borderBottomWidth: 1,
          paddingVertical: 10,
        },
      ]}
    >
      {/* When we have an item image (from DATA) */}
      {item.logo && (
        <Image source={item.logo} style={{ height: 50, width: 50, marginRight: 10 }} />
      )}
      
      {/* Fallback icon for API data */}
      {!item.logo && !isEditing && (
        <View style={{ height: 50, width: 50, marginRight: 10, backgroundColor: Colors.LIGHT_GRAY, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="briefcase" size={24} color={Colors.GRAY} />
        </View>
      )}
      
      <View style={{ flex: 1 }}>
        {isEditing ? (
          <View>
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Job Title<Text style={{ color: 'red' }}>*</Text>:</Text>
            <TextInput
              value={editedItem.title}
              onChangeText={(text) => setEditedItem({ ...editedItem, title: text })}
              style={{
                color: Colors.BLACK,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.GRAY,
                borderRadius: 5,
                padding: 5,
                marginBottom: 10,
              }}
              placeholder="Enter job title"
            />
            
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Company:</Text>
            <TextInput
              value={editedItem.company || editedItem.companyName || ''}
              onChangeText={(text) => setEditedItem({ ...editedItem, company: text })}
              style={{
                color: Colors.BLACK,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.GRAY,
                borderRadius: 5,
                padding: 5,
                marginBottom: 10,
              }}
              placeholder="Enter company name"
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 5 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Start Date:</Text>
                <TextInput
                  value={editedItem.startDate || ''}
                  onChangeText={(text) => setEditedItem({ ...editedItem, startDate: text })}
                  style={{
                    color: Colors.BLACK,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: Colors.GRAY,
                    borderRadius: 5,
                    padding: 5,
                  }}
                  placeholder="e.g. Jan 2023"
                />
              </View>
              
              <View style={{ flex: 1, marginLeft: 5 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>End Date:</Text>
                <TextInput
                  value={editedItem.endDate || ''}
                  onChangeText={(text) => setEditedItem({ ...editedItem, endDate: text })}
                  style={{
                    color: Colors.BLACK,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: Colors.GRAY,
                    borderRadius: 5,
                    padding: 5,
                  }}
                  placeholder="e.g. Present"
                />
              </View>
            </View>
            
            <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: Colors.GRAY }}>Description:</Text>
            <TextInput
              value={editedItem.description || ''}
              onChangeText={(text) => setEditedItem({ ...editedItem, description: text })}
              style={{
                color: Colors.BLACK,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.GRAY,
                borderRadius: 5,
                padding: 5,
                minHeight: 80,
                textAlignVertical: 'top'
              }}
              placeholder="Describe your role and responsibilities"
              multiline
              numberOfLines={4}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: Colors.GRAY }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: Colors.BLUE,
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  borderRadius: 5,
                }}
                disabled={updatingExperience}
              >
                {updatingExperience ? (
                  <ActivityIndicator size="small" color={Colors.WHITE} />
                ) : (
                  <Text style={{ color: Colors.WHITE }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 19, fontWeight: 'bold', color: Colors.BLACK }}>
                {item.title}
              </Text>
              
              {isProfileData && (
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => setIsEditing(true)} style={{ marginRight: 15 }}>
                    <CustomIcon size={18} name="pencil" color={Colors.GRAY} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => {
                    Alert.alert(
                      "Delete Experience",
                      "Are you sure you want to delete this experience?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", onPress: () => onDelete(index), style: "destructive" }
                      ]
                    );
                  }}>
                    <CustomIcon size={18} name="trash" color={Colors.GRAY} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <Text style={{ color: Colors.BLACK, fontSize: 16 }}>
              {item.company || item.companyName || ''}
            </Text>
            
            <Text style={{ fontSize: 15 }}>
              {item.startDate || ''} - {item.endDate || ''}
            </Text>
            
            {item.description && (
              <Text style={{ fontSize: 14, marginTop: 5, color: Colors.LIGHT_BLACK }}>
                {item.description}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const ShowExperience = ({ DATA, profileData, updateProfileField }) => {
  // Use profile data if available, otherwise fallback to static data
  const [experiences, setExperiences] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Initialize experiences array
  React.useEffect(() => {
    if (profileData?.experience?.length > 0) {
      setExperiences([...profileData.experience]);
    } else if (DATA?.EXPERIENCE?.length > 0) {
      // Map static data to match the schema
      const mappedExperiences = DATA.EXPERIENCE.map(item => ({
        title: item.title,
        company: item.companyName,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description || '',
        // Keep the logo for UI display only
        logo: item.logo
      }));
      setExperiences(mappedExperiences);
    } else {
      setExperiences([]);
    }
  }, [profileData, DATA]);

  const handleAddExperience = () => {
    setExperiences([...experiences, { ...BLANK_EXPERIENCE }]);
  };

  const handleUpdateExperience = async (updatedItem, index) => {
    try {
      // Create a clean copy of the updated item without UI-specific fields
      const cleanItem = {
        title: updatedItem.title,
        company: updatedItem.company || updatedItem.companyName,
        startDate: updatedItem.startDate,
        endDate: updatedItem.endDate,
        description: updatedItem.description || ''
      };
      
      // Create a copy of the current experiences array
      const updatedExperiences = [...experiences];
      
      // Update the specific item
      updatedExperiences[index] = {
        ...updatedExperiences[index],
        ...cleanItem
      };
      
      // Update the local state first for immediate UI feedback
      setExperiences(updatedExperiences);
      
      // Call the parent update function
      if (profileData) {
        // Strip any UI-specific properties before sending to API
        const apiExperiences = updatedExperiences.map(exp => ({
          title: exp.title,
          company: exp.company || exp.companyName,
          startDate: exp.startDate,
          endDate: exp.endDate, 
          description: exp.description || ''
        }));
        
        await updateProfileField('experience', apiExperiences);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  };
  
  const handleDeleteExperience = async (index) => {
    try {
      // Create a copy of the current experiences array
      const updatedExperiences = [...experiences];
      
      // Remove the item at the specified index
      updatedExperiences.splice(index, 1);
      
      // Update the local state first for immediate UI feedback
      setExperiences(updatedExperiences);
      
      // Call the parent update function
      if (profileData) {
        await updateProfileField('experience', updatedExperiences);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  };
  
  return (
    <>
      {experiences.map((item, index) => (
        <ExperienceItem 
          key={`experience-${index}`}
          item={item} 
          index={index}
          onUpdate={handleUpdateExperience}
          onDelete={handleDeleteExperience}
          isProfileData={!!profileData}
        />
      ))}
      
      {/* Add Experience button */}
      {profileData && (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            marginTop: 5,
          }}
          onPress={handleAddExperience}
        >
          <CustomIcon name="add" size={16} color={Colors.BLUE} style={{ marginRight: 5 }} />
          <Text style={{ color: Colors.BLUE, fontWeight: '500' }}>Add Experience</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default ShowExperience;