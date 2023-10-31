import { Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { View } from 'react-native';
import { Template } from './Template';
import Icon from 'react-native-vector-icons/FontAwesome';

type HeaderProps = {
  title: string;
  onBack?: () => void;
  onSettings: () => void;
};

export const Header: React.FC<HeaderProps> = ({ title, onBack, onSettings }) => {
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Template vif={!onBack}>
            <Image source={require('../assets/logo.svg')} style={{ width: 48, height: 48 }} />
          </Template>
          <Template vif={!!onBack}>
            <TouchableOpacity style={{ marginLeft: 16 }} onPress={onBack}>
              <Icon name="cog" size={24} color="#000" />
            </TouchableOpacity>
          </Template>
          <Text style={{ fontSize: 24, marginLeft: 8 }}>{title}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => {
              // Your settings logic
            }}
          >
            <Text>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => {
              // Your logout logic
            }}
          >
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};
