import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DatePickerComponent from '@/components/DatePicker';
import { TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { useAppContext } from '@/components/StateContext';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState('');
    const { user, setUser, csrfToken, setcsrfToken } = useAppContext();

    const clearForm = () => {
        setUsername('');
        setPassword('');
        setDob('');
    }

    const handleregister = () => {
        if (!username || !password || !dob) {
            alert('Please fill all fields');
            return;
        } else {
            const userDetails = {
                username: username,
                password: password,
                dob: dob
            }

            let url = `/api/register`;
            fetch(
                url,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userDetails),
                    credentials: 'include'
                }
            )
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    if (data.message === 'User registered successfully!') {
                        setUser(username);
                        setcsrfToken(data.csrf_token);
                        clearForm();
                    }
                }
                )
                .catch(error => alert(error));
        }
    }

    const handlelogout = () => {
        setUser(null);

        fetch(`/api/logout`, {
            method: "GET",
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => alert(data.message))
            .catch(error => alert(error));
    }

    if (user === null) {
        return (
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={<Ionicons size={310} name="create-outline" style={styles.headerImage} />}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Register to rCloud</ThemedText>
                </ThemedView>
                <ThemedText>If you are a new user, please register. Let's get started</ThemedText>
                <Collapsible title="Choose your username">
                    <ThemedText>
                        Lets start with your username. Please enter your username below.
                    </ThemedText>
                    <ThemedView style={{
                        borderColor: 'white', borderWidth: 1, width: 250, marginTop: 10,
                        marginBottom: 10
                    }}>
                        <TextInput placeholder="Enter your username" value={username} onChangeText={(text) => setUsername(text)} style={styles.dateInput} />
                    </ThemedView>
                </Collapsible>
                <Collapsible title="Choose your password">
                    <ThemedText>
                        Next, on to your password. Please enter your password below. Please make sure to remember it. Also make sure to use a strong password.
                    </ThemedText>

                    <ThemedView style={{
                        borderColor: 'white', borderWidth: 1, width: 250, marginTop: 10,
                        marginBottom: 10
                    }}>
                        <TextInput style={styles.dateInput} placeholder="Enter your password" secureTextEntry={true} value={password} onChangeText={(text) => setPassword(text)} />
                    </ThemedView>

                </Collapsible>
                <Collapsible title="Mention your Date of Birth">
                    <ThemedText>
                        We love birthdays. Please enter your date of birth below. We promise to keep it a secret.
                    </ThemedText>
                    <DatePickerComponent updateDob={setDob} />
                </Collapsible>

                <Pressable style={{ marginLeft: 30, width: 85, backgroundColor: 'lightblue', padding: 10 }} onPress={handleregister}>
                    <ThemedText style={{ color: 'black' }}> Submit </ThemedText>
                </Pressable>
            </ParallaxScrollView>
        );
    } else {
        return (
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={<Ionicons size={310} name="create-outline" style={styles.headerImage} />}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Register to rCloud</ThemedText>
                </ThemedView>
                <ThemedText>
                    You are already registered and logged in as {user}. If you wish to register as a different user, please logout first.
                </ThemedText>
                <Pressable onPress={handlelogout}>
                    <ThemedText style={{ color: 'lightblue' }}>Click here to logout</ThemedText>
                </Pressable>
            </ParallaxScrollView>
        );
    }
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
        gap: 8,
    },
    dateInput: {
        width: 250,
        height: 40,
        color: 'yellow',
        textAlign: 'center',
    },
});