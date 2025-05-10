import { Text } from 'react-native'
import Colors from '../utils/colors'
Colors

export default function Heading({ title }) {
  return (
    <Text style={{ fontSize: 19, color: Colors.BLACK, fontWeight: "bold" }}>{title}</Text>
  )
}