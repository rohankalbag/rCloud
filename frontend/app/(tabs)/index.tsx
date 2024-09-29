import { Image, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      // headerImage={
      //   <Image
      //     source={require('@/assets/images/partial-react-logo.png')}
      //     style={styles.reactLogo}
      //   />
      // }
      headerImage={<Ionicons size={310} name="cloud-outline" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to rCloud!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedText>
      rCloud is a secure file storage and sharing platform designed to provide users with a seamless and reliable way to store, share, and access their files from anywhere. It is currently a work under progress. It will be used to setup my homelab server as a cloud storage
      </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
