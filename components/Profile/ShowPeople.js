import {View, Text, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import CustomIcon from '../CustomIcon';
import Colors from '../../utils/colors';
import Styles from '../../utils/Styles';

export default ShowPeople = () => (
  <View style={[Styles.flexCenter, { paddingVertical: 15, marginHorizontal: 10 }]}>
    <View style={{width: 230}}>
      <Text style={{fontSize: 18, fontWeight: 'bold', color: Colors.BLACK, marginBottom: 4}}>
        John Doe
      </Text>
      <Text style={{fontSize: 14, color: Colors.DARK_GRAY, marginBottom: 2}}>
        johndoe@email.com
      </Text>
      <Text style={{fontSize: 14, color: Colors.DARK_GRAY, marginBottom: 2}}>
        +1 (555) 123-4567
      </Text>
      <Text style={{fontSize: 14, color: Colors.DARK_GRAY}}>
        123 Main Street, City
      </Text>
    </View>
    {/* <TouchableOpacity
      onPress={() => {}}
      style={{
        borderWidth: 1,
        borderColor: Colors.GRAY,
        borderRadius: 50,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.LIGHT_GRAY,
      }}>
      <CustomIcon name="edit" size={22} color={Colors.PRIMARY} />
    </TouchableOpacity> */}
  </View>
);