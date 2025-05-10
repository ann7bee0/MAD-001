import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import Colors from '../../utils/colors';
import Styles from '../../utils/Styles';
import CustomIcon from '../CustomIcon';

const BLANK_LICENSE = {
  title: '',
  issuer: '',
  date: '',
  hasCertificate: false
};

const LicenseItem = ({ item, index, onUpdate, onDelete, isProfileData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatingLicense, setUpdatingLicense] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });

  const isNewItem = !item.title;

  useEffect(() => {
    if (isNewItem) setIsEditing(true);
  }, [isNewItem]);

  const handleSave = async () => {
    if (!editedItem.title) {
      Alert.alert('Error', 'License title is required');
      return;
    }

    setUpdatingLicense(true);
    await onUpdate(editedItem, index);
    setIsEditing(false);
    setUpdatingLicense(false);
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
      {/* License icon placeholder */}
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
          <Icon name="trophy" size={24} color={Colors.GRAY} />
        </View>
      )}
      
      <View style={{ flex: 1 }}>
        {isEditing ? (
          <View>
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>License Title<Text style={{ color: 'red' }}>*</Text>:</Text>
            <TextInput
              placeholder="e.g. AWS Certified Developer"
              value={editedItem.title}
              onChangeText={(text) => setEditedItem({ ...editedItem, title: text })}
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
            
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Issuing Organization:</Text>
            <TextInput
              placeholder="e.g. Amazon Web Services"
              value={editedItem.issuer}
              onChangeText={(text) => setEditedItem({ ...editedItem, issuer: text })}
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
            
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Date Issued:</Text>
            <TextInput
              placeholder="e.g. June 2023"
              value={editedItem.date}
              onChangeText={(text) => setEditedItem({ ...editedItem, date: text })}
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
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
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
                disabled={updatingLicense}
              >
                {updatingLicense ? (
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
                  <TouchableOpacity 
                    onPress={() => setIsEditing(true)} 
                    style={{ marginRight: 15 }}
                  >
                    <CustomIcon size={18} name="pencil" color={Colors.GRAY} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => {
                    Alert.alert(
                      "Delete License",
                      "Are you sure you want to delete this license?",
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
              {item.issuer}
            </Text>
            
            <Text style={{ fontSize: 15, marginTop: 3 }}>
              {item.date?.split('T')[0]}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const ShowLicenses = ({ DATA, profileData, updateProfileField }) => {
  const [licenses, setLicenses] = useState([]);

  useEffect(() => {
    if (profileData?.licenses?.length > 0) {
      setLicenses([...profileData.licenses]);
    } else if (DATA?.LICENSE_CERTIFICATION?.length > 0) {
      setLicenses([...DATA.LICENSE_CERTIFICATION]);
    }
  }, [profileData, DATA]);

  const handleAddLicense = () => setLicenses([...licenses, { ...BLANK_LICENSE }]);

  const handleUpdateLicense = async (updatedItem, index) => {
    const updatedList = [...licenses];
    updatedList[index] = { ...updatedItem };
    setLicenses(updatedList);
    if (profileData) await updateProfileField('licenses', updatedList);
  };

  const handleDeleteLicense = async (index) => {
    const updatedList = [...licenses];
    updatedList.splice(index, 1);
    setLicenses(updatedList);
    if (profileData) await updateProfileField('licenses', updatedList);
  };

  return (
    <>
      {licenses.map((item, index) => (
        <LicenseItem 
          key={`license-${index}`} 
          item={item} 
          index={index} 
          onUpdate={handleUpdateLicense} 
          onDelete={handleDeleteLicense}
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
          onPress={handleAddLicense}
        >
          <CustomIcon name="add" size={16} color={Colors.BLUE} style={{ marginRight: 5 }} />
          <Text style={{ color: Colors.BLUE, fontWeight: '500' }}>Add License</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default ShowLicenses;