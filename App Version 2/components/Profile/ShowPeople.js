import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import CustomIcon from '../CustomIcon';
import Colors from '../../utils/colors';
import Styles from '../../utils/Styles';

const ShowPeople = ({ profileData, updateProfileField }) => {
  const [contacts, setContacts] = useState(profileData?.contact || [{
    email: '',
    website: '',
    phone: '',
    address: ''
  }]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempContacts, setTempContacts] = useState(contacts);

  const handleAddContact = () => {
    setTempContacts([...tempContacts, {
      email: '',
      website: '',
      phone: '',
      address: ''
    }]);
  };

  const handleEditContact = (index, field, value) => {
    const updatedContacts = [...tempContacts];
    updatedContacts[index][field] = value;
    setTempContacts(updatedContacts);
  };

  const handleDeleteContact = (index) => {
    if (tempContacts.length <= 1) {
      Alert.alert('Error', 'At least one contact is required');
      return;
    }

    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            const updatedContacts = tempContacts.filter((_, i) => i !== index);
            setTempContacts(updatedContacts);
          }, 
          style: "destructive" 
        }
      ]
    );
  };

  const handleSave = async () => {
    setIsAdding(true);
    try {
      await updateProfileField('contact', tempContacts);
      setContacts(tempContacts);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save contacts');
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setTempContacts(contacts);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setTempContacts([...contacts]);
    setIsEditing(true);
  };

  return (
    <View style={{ padding: 10 }}>
      {!isEditing && profileData && (
        <TouchableOpacity 
          onPress={handleEdit}
          style={{
            alignSelf: 'flex-end',
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 5,
            paddingHorizontal: 10,
            marginBottom: 10,
            backgroundColor: Colors.LIGHT_GRAY,
            borderRadius: 5,
          }}
        >
          <CustomIcon name="pencil" size={16} color={Colors.GRAY} />
          <Text style={{ color: Colors.GRAY, marginLeft: 5 }}>Edit</Text>
        </TouchableOpacity>
      )}

      {isEditing && (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
          <TouchableOpacity 
            onPress={handleCancel}
            style={{
              paddingVertical: 5,
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
              paddingVertical: 5,
              paddingHorizontal: 20,
              borderRadius: 5,
            }}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={Colors.WHITE} />
            ) : (
              <Text style={{ color: Colors.WHITE }}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {(isEditing ? tempContacts : contacts).map((contact, index) => (
        <View 
          key={index} 
          style={{
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors.LIGHT_GRAY,
          }}
        >
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Email:</Text>
            {isEditing ? (
              <TextInput
                value={contact.email}
                onChangeText={(text) => handleEditContact(index, 'email', text)}
                style={{
                  color: Colors.BLACK,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: Colors.GRAY,
                  borderRadius: 5,
                  padding: 8,
                  marginBottom: 15,
                }}
                keyboardType="email-address"
                placeholder="Enter email"
              />
            ) : (
              <Text style={{ fontSize: 14, color: Colors.BLACK, marginBottom: 15 }}>
                {contact.email || 'Not specified'}
              </Text>
            )}

            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Website:</Text>
            {isEditing ? (
              <TextInput
                value={contact.website}
                onChangeText={(text) => handleEditContact(index, 'website', text)}
                style={{
                  color: Colors.BLACK,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: Colors.GRAY,
                  borderRadius: 5,
                  padding: 8,
                  marginBottom: 15,
                }}
                placeholder="Enter website URL"
                keyboardType="url"
              />
            ) : (
              <Text style={{ fontSize: 14, color: Colors.BLACK, marginBottom: 15 }}>
                {contact.website || 'Not specified'}
              </Text>
            )}

            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Phone:</Text>
            {isEditing ? (
              <TextInput
                value={contact.phone}
                onChangeText={(text) => handleEditContact(index, 'phone', text)}
                style={{
                  color: Colors.BLACK,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: Colors.GRAY,
                  borderRadius: 5,
                  padding: 8,
                  marginBottom: 15,
                }}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={{ fontSize: 14, color: Colors.BLACK, marginBottom: 15 }}>
                {contact.phone || 'Not specified'}
              </Text>
            )}

            <Text style={{ fontWeight: 'bold', marginBottom: 5, color: Colors.GRAY }}>Address:</Text>
            {isEditing ? (
              <TextInput
                value={contact.address}
                onChangeText={(text) => handleEditContact(index, 'address', text)}
                style={{
                  color: Colors.BLACK,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: Colors.GRAY,
                  borderRadius: 5,
                  padding: 8,
                  marginBottom: 15,
                }}
                placeholder="Enter address"
              />
            ) : (
              <Text style={{ fontSize: 14, color: Colors.BLACK, marginBottom: 15 }}>
                {contact.address || 'Not specified'}
              </Text>
            )}
          </View>

          {isEditing && tempContacts.length > 1 && (
            <TouchableOpacity 
              onPress={() => handleDeleteContact(index)}
              style={{
                alignSelf: 'flex-end',
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 5,
                paddingHorizontal: 10,
                backgroundColor: Colors.LIGHT_RED,
                borderRadius: 5,
              }}
            >
              <CustomIcon name="trash" size={16} color={Colors.RED} />
              <Text style={{ color: Colors.RED, marginLeft: 5 }}>Delete Contact</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {isEditing && (
        <TouchableOpacity 
          onPress={handleAddContact}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            marginTop: 15,
            borderWidth: 1,
            borderColor: Colors.GRAY,
            borderRadius: 5,
          }}
        >
          <Icon name="plus" size={18} color={Colors.GRAY} />
          <Text style={{ color: Colors.GRAY, marginLeft: 10 }}>Add Another Contact</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ShowPeople;