import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import Colors from '../../utils/colors';
import Styles from '../../utils/Styles';
import CustomIcon from '../CustomIcon';

const BLANK_EDUCATION = {
  institution: '',
  degree: '',
  time: '',
  CGPA: ''
};

const EducationItem = ({ item, index, onUpdate, onDelete, isProfileData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatingEducation, setUpdatingEducation] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });

  const isNewItem = !item.institution;

  useEffect(() => {
    if (isNewItem) setIsEditing(true);
  }, [isNewItem]);

  const handleSave = async () => {
    if (!editedItem.institution) {
      Alert.alert('Error', 'Institution name is required');
      return;
    }

    setUpdatingEducation(true);
    await onUpdate(editedItem, index);
    setIsEditing(false);
    setUpdatingEducation(false);
  };

  const handleCancel = () => {
    if (isNewItem) onDelete(index);
    else {
      setEditedItem({ ...item });
      setIsEditing(false);
    }
  };

  return (
    <View style={[
      Styles.flexCenter,
      {
        borderBottomColor: Colors.LIGHT_GRAY,
        borderBottomWidth: 1,
        paddingVertical: 15,
      }
    ]}>
      {/* Institution icon placeholder */}
      {!isEditing && (
        <View style={{
          height: 50,
          width: 50,
          marginRight: 10,
          backgroundColor: Colors.LIGHT_GRAY,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Icon name="graduation-cap" size={24} color={Colors.GRAY} />
        </View>
      )}
      
      <View style={{ flex: 1 }}>
        {isEditing ? (
          <View>
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Institution<Text style={{ color: 'red' }}>*</Text>:</Text>
            <TextInput
              placeholder="University/School name"
              value={editedItem.institution}
              onChangeText={(text) => setEditedItem({ ...editedItem, institution: text })}
              style={{
                color: Colors.BLACK,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.GRAY,
                borderRadius: 5,
                padding: 10,
                marginBottom: 15,
              }}
            />
            
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Degree:</Text>
            <TextInput
              placeholder="Degree/Certificate"
              value={editedItem.degree}
              onChangeText={(text) => setEditedItem({ ...editedItem, degree: text })}
              style={{
                color: Colors.BLACK,
                fontSize: 16,
                borderWidth: 1,
                borderColor: Colors.GRAY,
                borderRadius: 5,
                padding: 10,
                marginBottom: 15,
              }}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Time Period:</Text>
                <TextInput
                  placeholder="e.g. 2015-2019"
                  value={editedItem.time}
                  onChangeText={(text) => setEditedItem({ ...editedItem, time: text })}
                  style={{
                    color: Colors.BLACK,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: Colors.GRAY,
                    borderRadius: 5,
                    padding: 10,
                  }}
                />
              </View>
              
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>CGPA/Score:</Text>
                <TextInput
                  placeholder="e.g. 3.8"
                  value={editedItem.CGPA}
                  keyboardType="numeric"
                  onChangeText={(text) => setEditedItem({ ...editedItem, CGPA: text })}
                  style={{
                    color: Colors.BLACK,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: Colors.GRAY,
                    borderRadius: 5,
                    padding: 10,
                  }}
                />
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 }}>
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                  marginRight: 10,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: Colors.GRAY
                }}
              >
                <Text style={{ color: Colors.GRAY }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: Colors.BLUE,
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                }}
                disabled={updatingEducation}
              >
                {updatingEducation ? (
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
                {item.institution}
              </Text>
              
              {isProfileData && (
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity 
                    onPress={() => setIsEditing(true)} 
                    style={{ marginRight: 15 }}
                  >
                    <CustomIcon size={18} name="pencil" color={Colors.GRAY} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => {
                    Alert.alert(
                      "Delete Education",
                      "Are you sure you want to delete this education entry?",
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
            
            <Text style={{ color: Colors.BLACK, fontSize: 16, marginTop: 3 }}>
              {item.degree}
            </Text>
            
            <Text style={{ fontSize: 15, marginTop: 3 }}>
              {item.time} {item.CGPA && `| CGPA: ${item.CGPA}`}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const ShowEducation = ({ DATA, profileData, updateProfileField }) => {
  const [educationList, setEducationList] = useState([]);

  useEffect(() => {
    if (profileData?.education?.length > 0) {
      setEducationList([...profileData.education]);
    } else if (DATA?.EDUCATION?.length > 0) {
      setEducationList([...DATA.EDUCATION]);
    }
  }, [profileData, DATA]);

  const handleAddEducation = () => setEducationList([...educationList, { ...BLANK_EDUCATION }]);

  const handleUpdateEducation = async (updatedItem, index) => {
    const updatedList = [...educationList];
    updatedList[index] = { ...updatedItem };
    setEducationList(updatedList);
    if (profileData) await updateProfileField('education', updatedList);
  };

  const handleDeleteEducation = async (index) => {
    const updatedList = [...educationList];
    updatedList.splice(index, 1);
    setEducationList(updatedList);
    if (profileData) await updateProfileField('education', updatedList);
  };

  return (
    <>
      {educationList.map((item, index) => (
        <EducationItem 
          key={`education-${index}`} 
          item={item} 
          index={index} 
          onUpdate={handleUpdateEducation} 
          onDelete={handleDeleteEducation}
          isProfileData={!!profileData}
        />
      ))}

      {profileData && (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            marginTop: 5,
          }}
          onPress={handleAddEducation}
        >
          <CustomIcon name="add" size={16} color={Colors.BLUE} style={{ marginRight: 5 }} />
          <Text style={{ color: Colors.BLUE, fontWeight: '500' }}>Add Education</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default ShowEducation;