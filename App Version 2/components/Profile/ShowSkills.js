import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import CustomIcon from '../CustomIcon';
import Colors from '../../utils/colors';
import Styles from '../../utils/Styles';

const ShowSkills = ({ profileData, updateProfileField }) => {
  const [skills, setSkills] = useState(profileData?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      Alert.alert('Error', 'Skill cannot be empty');
      return;
    }

    setIsAdding(true);
    const updatedSkills = [...skills, newSkill.trim()];
    setSkills(updatedSkills);
    setNewSkill('');

    if (profileData) {
      try {
        await updateProfileField('skills', updatedSkills);
      } catch (error) {
        Alert.alert('Error', 'Failed to add skill');
        // Revert if update fails
        setSkills(skills);
      }
    }
    setIsAdding(false);
  };

  const handleEditSkill = async (index, value) => {
    if (!value.trim()) {
      Alert.alert('Error', 'Skill cannot be empty');
      return;
    }

    const updatedSkills = [...skills];
    updatedSkills[index] = value.trim();
    setSkills(updatedSkills);
    setEditingIndex(null);

    if (profileData) {
      try {
        await updateProfileField('skills', updatedSkills);
      } catch (error) {
        Alert.alert('Error', 'Failed to update skill');
        // Revert if update fails
        setSkills(skills);
        setEditingIndex(index);
      }
    }
  };

  const handleDeleteSkill = (index) => {
    Alert.alert(
      "Delete Skill",
      "Are you sure you want to delete this skill?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            const updatedSkills = skills.filter((_, i) => i !== index);
            setSkills(updatedSkills);

            if (profileData) {
              try {
                await updateProfileField('skills', updatedSkills);
              } catch (error) {
                Alert.alert('Error', 'Failed to delete skill');
                // Revert if delete fails
                setSkills(skills);
              }
            }
          }, 
          style: "destructive" 
        }
      ]
    );
  };

  return (
    <View style={{ padding: 10 }}>
      {skills.map((skill, index) => (
        <View 
          key={index} 
          style={[
            Styles.flexCenter,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: Colors.LIGHT_GRAY,
            }
          ]}
        >
          {editingIndex === index ? (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                height: 40, 
                width: 40, 
                marginRight: 10, 
                backgroundColor: Colors.LIGHT_GRAY, 
                borderRadius: 20, 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <Icon name="edit" size={18} color={Colors.GRAY} />
              </View>
              
              <TextInput
                value={skill}
                onChangeText={(text) => {
                  const updatedSkills = [...skills];
                  updatedSkills[index] = text;
                  setSkills(updatedSkills);
                }}
                autoFocus
                style={{ 
                  flex: 1, 
                  fontSize: 16, 
                  color: Colors.BLACK,
                  borderWidth: 1,
                  borderColor: Colors.GRAY,
                  borderRadius: 5,
                  padding: 8,
                }}
                onSubmitEditing={() => handleEditSkill(index, skill)}
                onBlur={() => handleEditSkill(index, skill)}
              />
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  height: 40, 
                  width: 40, 
                  marginRight: 10, 
                  backgroundColor: Colors.LIGHT_GRAY, 
                  borderRadius: 20, 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Icon name="check" size={18} color={Colors.GRAY} />
                </View>
                
                <Text style={{ fontSize: 16, color: Colors.BLACK }}>{skill}</Text>
              </View>
              
              {profileData && (
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity 
                    onPress={() => setEditingIndex(index)}
                    style={{ marginRight: 15 }}
                  >
                    <CustomIcon name="pencil" size={18} color={Colors.GRAY} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => handleDeleteSkill(index)}>
                    <CustomIcon name="trash" size={18} color={Colors.GRAY} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      ))}

      {profileData && (
        <View style={{ marginTop: 15 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Add New Skill:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ 
              height: 40, 
              width: 40, 
              marginRight: 10, 
              backgroundColor: Colors.LIGHT_GRAY, 
              borderRadius: 20, 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <Icon name="plus" size={18} color={Colors.GRAY} />
            </View>
            
            <TextInput
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Enter skill name"
              style={{ 
                flex: 1, 
                fontSize: 16, 
                color: Colors.BLACK,
                borderWidth: 1,
                borderColor: Colors.GRAY,
                borderRadius: 5,
                padding: 8,
                marginRight: 10,
              }}
              onSubmitEditing={handleAddSkill}
            />
            
            <TouchableOpacity 
              onPress={handleAddSkill}
              style={{
                backgroundColor: Colors.BLUE,
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderRadius: 5,
                minWidth: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={Colors.WHITE} />
              ) : (
                <Text style={{ color: Colors.WHITE }}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default ShowSkills;