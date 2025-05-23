import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import WelcomeScreen from './screen/startScreen/WelcomeScreen';
import SignUpScreen from './screen/startScreen/SignUpScreen';
import LogInScreen from './screen/startScreen/LogInScreen';
import HomeScreen from './screen/mainScreen/HomeScreen';
import MarketplaceScreen from './screen/mainScreen/MarketplaceScreen';
import ProfileScreen from './screen/mainScreen/ProfileScreen';
import ForgotPasswordScreen from './screen/startScreen/ForgotPasswordScreen';
import HelpSupportScreen from './screen/additionalScreen/HelpSupportScreen';
import SettingsScreen from './screen/additionalScreen/SettingsScreen';
import SavedScreen from './screen/additionalScreen/SavedScreen';
import { TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import ChatScreen from './screen/additionalScreen/ChatScreen';
import { useNavigation } from '@react-navigation/native';
import 'react-native-gesture-handler';
import CustomDrawerContent from './navigation/CustomDrawerContent';
import { UserProvider } from './context/UserContext';
import EditProfile from './screen/mainScreen/EditProfile';
 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function HeaderChatButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Chat')}
      style={{ marginRight: 15 }}
    >
      <Image
        source={require('./assets/chat_icon.png')} 
        style={{ width: 24, height: 24 }}
      />
    </TouchableOpacity>
  );
}

 function TabNavigation() {
  return (
     <Tab.Navigator
    
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconSource;
          if (route.name === 'Home') {
            iconSource = require('./assets/house_icon.png');
          } else if (route.name === 'Marketplace') {
            iconSource = require('./assets/marketplace_icon.png');
          } else if (route.name === 'Profile') {
            iconSource = require('./assets/profile_icon.png');
          }
          return (
            <Image
              source={iconSource}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          );
        },
        tabBarActiveTintColor: '#FF6347',
        tabBarInactiveTintColor: 'gray',
      })}>

      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

 
  function DrawerNavigation() {
    return (
     <Drawer.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        drawerIcon: ({ color, size }) => {
          let iconSource;

          if (route.name === 'Help&Support') {
            iconSource = require('./assets/help_icon.png');
          } else if (route.name === 'Settings') {
            iconSource = require('./assets/setting_icon.png');
          } else if (route.name === 'PawPal') {
            iconSource = require('./assets/pawpal_logo_icon.png'); 
          }
          return (
            <Image
              source={iconSource}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          );
        },
        drawerActiveTintColor: '#FF6347',
        drawerInactiveTintColor: 'black',
      })}
       drawerContent={(props) => <CustomDrawerContent {...props} />} 
      >

        <Drawer.Screen name="PawPal" component={TabNavigation} options={{ title: 'PawPal', headerRight: () => <HeaderChatButton />,}}/>
        <Drawer.Screen name="Help&Support" component={HelpSupportScreen} 
        options={{ headerShown: true, title: 'Help&Support' }}/>
        <Drawer.Screen name="Settings" component={SettingsScreen} 
         options={{ headerShown: true, title: 'Settings' }}/>
      </Drawer.Navigator>
    );
  }
  

export default function App() {
  //mongodb+srv://naydenovayn:naydenovayn@cluster0.xc4mv5w.mongodb.net/
  //mongodb+srv://naydenovayn:<naydenovayn>@cluster0.zqsvtnb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    return (
    <UserProvider> 
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="LogIn" component={LogInScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Main" component={DrawerNavigation}  />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Chat' }} />
          <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: true, title: 'Edit Profile' }} />
    
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
    );
}

 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
