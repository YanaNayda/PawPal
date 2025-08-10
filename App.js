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
import MarketplaceScreen from './screen/mainScreen/Marketplace/MarketplaceScreen';
import ProfileScreen from './screen/mainScreen/ProfileScreen';
import ForgotPasswordScreen from './screen/startScreen/ForgotPasswordScreen';
import HelpSupportScreen from './screen/additionalScreen/HelpSupportScreen';
import SettingsScreen from './screen/additionalScreen/SettingsScreen';
import SavedScreen from './screen/additionalScreen/SavedScreen';
import PostScreen from './screen/mainScreen/PostScreen';
import ProductScreen from './screen/mainScreen/Marketplace/ProductScreen';
import ChatScreen from './screen/additionalScreen/ChatScreen';
import MessagesChatScreen from './screen/additionalScreen/MessagesChatScreen';
import CreateChatScreen from './screen/additionalScreen/CreateChatScreen';
import AddParticipantsScreen from './screen/additionalScreen/AddParticipantsScreen';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import 'react-native-gesture-handler';
import CustomDrawerContent from './navigation/CustomDrawerContent';
import { UserProvider } from './context/UserContext';
import EditProfile from './screen/mainScreen/EditProfile';
 import CreateProduct from './screen/mainScreen/Marketplace/CreateProduct';
import MyProductScreen from './screen/mainScreen/Marketplace/MyProductScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CreatePost from './screen/mainScreen/CreatePost';
import SearchScreen from './screen/additionalScreen/SearchScreen';
import ViewUserScreen from './screen/mainScreen/ViewUserScreen';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function HeaderButtons() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row', marginRight: 15 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Chat')}
      >
        <Image
          source={require('./assets/chat_icon.png')} 
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>
    </View>
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
          } else if (route.name === 'Search') {
            iconSource = require('./assets/information_icon.png');
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

      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ tabBarLabel: 'Marketplace' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
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

        <Drawer.Screen name="PawPal" component={TabNavigation} options={{ title: 'PawPal', headerRight: () => <HeaderButtons />,}}/>
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
    <GestureHandlerRootView> 
      <PaperProvider> 
      <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="LogIn" component={LogInScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Main" component={DrawerNavigation}  />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Chat' }} />
          <Stack.Screen name="MessagesChat" component={MessagesChatScreen} options={{ headerShown: true, title: 'Messages' }} />
          <Stack.Screen name="CreateChat" component={CreateChatScreen} options={{ headerShown: true, title: 'Create Chat' }} />
          <Stack.Screen name="AddParticipants" component={AddParticipantsScreen} options={{ headerShown: true, title: 'Add Participants' }} />
          <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: true, title: 'Edit Profile' }} />
          <Stack.Screen name="CreatePost" component={CreatePost} options={{ headerShown: true, title: 'Create Post' }} />
          <Stack.Screen name="Saved" component={SavedScreen} options={{ headerShown: true, title: 'Saved' }} />
          <Stack.Screen name="ProductScreen" component={ProductScreen} options={{ headerShown: true, title: 'Product' }} />
          <Stack.Screen name="CreateProduct" component={CreateProduct} options={{ headerShown: true, title: 'Add Product' }} />
          <Stack.Screen name="MyProduct" component={MyProductScreen} options={{ headerShown: true, title: 'My Products' }} />
          <Stack.Screen name="PostScreen" component={PostScreen} options={{ headerShown: true, title: 'Post' }} />
          <Stack.Screen name="ViewUser" component={ViewUserScreen} options={{ headerShown: true, title: 'User Profile' }} />
         </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
      </PaperProvider>
    </GestureHandlerRootView>
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
