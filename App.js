import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import Constants from 'expo-constants';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  
  let[title,setTitle]=useState("");
  let[body,setBody]=useState("");
  let[expoPushToken, setExpoPushToken] = useState('');
  useEffect(()=>{
    console.log("Registering for push notification");
    registerForPushNotificationsAsync().then((token) => {
      if(token)
      {
        console.log("Token =>"+token);
        setExpoPushToken(token);
      }
    }).catch((err)=>console.log(err))
  },[])


  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      try {
        const projectId =Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        
        if (!projectId) 
        {
          throw new Error('Project ID not found');
        }
        token = (await Notifications.getExpoPushTokenAsync({projectId:"6d72a469-8535-44ba-b242-85486aabc5ec"})).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

  async function sendNotification()
  {
    console.log("sending notification...");
    const message={
      to: expoPushToken,
      title:title,
      body:body
    }
    fetch("https://exp.host/--/api/v2/push/send",{
      method:"POST",
      headers:{
        host: "exp.host",
        accept: "application/json",
        "accept-encoding":" gzip, deflate",
        "content-type": "application/json"
      },
      body:JSON.stringify(message)
    });
    setBody("");
    setTitle("");
  }

  return (
    <View style={styles.container}>
      <TextInput placeholder='Enter your title' style={styles.inputBox} value={title} onChangeText={setTitle} />
      <TextInput placeholder='Enter your message' style={styles.inputBox} value={body} onChangeText={setBody} />
      <TouchableOpacity onPress={sendNotification} style={styles.btn}>
        <Text style={{color:"white"}}>Send Notification</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox:{
    width:"70%",
    minHeight:30,
    borderRadius:9,
    borderWidth:1,
    borderColor:"gray",  
    marginTop:9  ,
    padding:9
  },
  btn:{
    width:"50%",
    minHeight:30,
    justifyContent:"center",
    alignItems:"center",
    padding:9,
    borderRadius:9,
    backgroundColor:"royalblue",
    marginTop:15
  }
});
