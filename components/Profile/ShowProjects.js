import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import CustomIcon from '../CustomIcon';
import Colors from '../../utils/colors';
import Styles from '../../utils/Styles';

const BLANK_PROJECT = {
  title: '',
  description: '',
  link: ''
};

const ProjectItem = ({ item, index, onUpdate, onDelete, isProfileData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatingProject, setUpdatingProject] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });

  const isNewItem = !item.title;

  const handleSave = async () => {
    try {
      if (!editedItem.title) {
        Alert.alert('Error', 'Project title is required');
        return;
      }

      setUpdatingProject(true);
      await onUpdate(editedItem, index);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update project');
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleCancel = () => {
    if (isNewItem) {
      onDelete(index);
    } else {
      setEditedItem({ ...item });
      setIsEditing(false);
    }
  };

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
      {!isEditing && (
        <View style={{ height: 50, width: 50, marginRight: 10, backgroundColor: Colors.LIGHT_GRAY, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="folder" size={24} color={Colors.GRAY} />
        </View>
      )}
      
      <View style={{ flex: 1 }}>
        {isEditing ? (
          <View>
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Project Title<Text style={{ color: 'red' }}>*</Text>:</Text>
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
              placeholder="Enter project title"
            />
            
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Description:</Text>
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
                marginBottom: 10,
                minHeight: 80,
                textAlignVertical: 'top'
              }}
              placeholder="Describe your project"
              multiline
              numberOfLines={4}
            />
            
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Link:</Text>
            <TextInput
              value={editedItem.link || ''}
              onChangeText={(text) => setEditedItem({ ...editedItem, link: text })}
              style={{
                color: Colors.BLACK,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.GRAY,
                borderRadius: 5,
                padding: 5,
                marginBottom: 10,
              }}
              placeholder="Enter project URL"
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
                disabled={updatingProject}
              >
                {updatingProject ? (
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
                      "Delete Project",
                      "Are you sure you want to delete this project?",
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
            
            {item.description && (
              <Text style={{ fontSize: 14, marginTop: 5, color: Colors.LIGHT_BLACK }}>
                {item.description}
              </Text>
            )}
            
            {item.link && (
              <Text 
                style={{ fontSize: 14, marginTop: 5, color: Colors.BLUE }}
                onPress={() => Linking.openURL(item.link.startsWith('http') ? item.link : `https://${item.link}`)}
              >
                {item.link}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const ShowProjects = ({ DATA, profileData, updateProfileField }) => {
  const [projects, setProjects] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  React.useEffect(() => {
    if (profileData?.projects?.length > 0) {
      setProjects([...profileData.projects]);
    } else if (DATA?.PROJECTS?.length > 0) {
      setProjects(DATA.PROJECTS);
    } else {
      setProjects([]);
    }
  }, [profileData, DATA]);

  const handleAddProject = () => {
    setProjects([...projects, { ...BLANK_PROJECT }]);
  };

  const handleUpdateProject = async (updatedItem, index) => {
    try {
      const cleanItem = {
        title: updatedItem.title,
        description: updatedItem.description || '',
        link: updatedItem.link || ''
      };
      
      const updatedProjects = [...projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        ...cleanItem
      };
      
      setProjects(updatedProjects);
      
      if (profileData) {
        await updateProfileField('projects', updatedProjects);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };
  
  const handleDeleteProject = async (index) => {
    try {
      const updatedProjects = [...projects];
      updatedProjects.splice(index, 1);
      setProjects(updatedProjects);
      
      if (profileData) {
        await updateProfileField('projects', updatedProjects);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };
  
  return (
    <>
      {projects.map((item, index) => (
        <ProjectItem 
          key={`project-${index}`}
          item={item} 
          index={index}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
          isProfileData={!!profileData}
        />
      ))}
      
      {profileData && (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            marginTop: 5,
          }}
          onPress={handleAddProject}
        >
          <CustomIcon name="add" size={16} color={Colors.BLUE} style={{ marginRight: 5 }} />
          <Text style={{ color: Colors.BLUE, fontWeight: '500' }}>Add Project</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default ShowProjects;