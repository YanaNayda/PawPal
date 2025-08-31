import * as React from 'react';
import { FAB, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';


const FabGroupMarket = () => {
  const [state, setState] = React.useState({ open: false });
  const onStateChange = ({ open }) => setState({ open });
  const { open } = state;
  
  const navigation = useNavigation();
  return (
  
      <Portal>
        <FAB.Group
          open={open}
          visible
          icon={open ? 'calendar-today' : 'paw'}
            fabStyle={{ bottom: 70, right: 10, position: 'absolute' , backgroundColor: '#ffffffff' ,borderRadius: 23, elevation: 5 ,shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 7 }} 
          actions={[
            
            {
              icon: 'plus',
              label: 'Add Product',
              onPress: () => navigation.navigate('CreateProduct'),
            },
            {
              icon: 'account',
              label: 'My Products',
             onPress: () => navigation.navigate('MyProduct'),
            }
             
          ]}
          onStateChange={onStateChange}
          onPress={() => {
           if (!open) {
            setState({ open: true });
          }
          }}
        />
      </Portal>
  
  );
};

export default FabGroupMarket;