import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppContext } from '@/components/StateContext';
import { useState, useEffect } from 'react';

export default function Users() {
    const { user, setUser, csrfToken, setcsrfToken } = useAppContext();
    const [users, setUsers] = useState<[string, string][]>([]);

    useEffect(() => {
        if (user) {
            getUsers();
        }
    }, [user]);

    const getUsers = () => {
        let url = `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/users`;
        fetch(
            url,
            {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': csrfToken ? csrfToken : '',
                },
                credentials: 'include'
            }
        )
            .then(response => response.json())
            .then(data => {
                if (data instanceof Array) {
                    setUsers(data);
                }
            })
            .catch(error => alert(error));
    }

    if (user === null) {
        return (
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={<Ionicons size={310} name="people-outline" style={styles.headerImage} />}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">rCloud users</ThemedText>
                </ThemedView>
                <ThemedText>
                    You are not logged in. Please login to view the list of users.
                </ThemedText>
            </ParallaxScrollView>
        );
    }
    else {
        return (
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={<Ionicons size={310} name="people-outline" style={styles.headerImage} />}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">rCloud users</ThemedText>
                </ThemedView>
                <ThemedText>
                    Welcome, {user}! Here is the list of users:
                </ThemedText>
                <FlatList
                    data={users}
                    keyExtractor={(item) => item[0]} // Assuming username is unique
                    renderItem={({ item }) => (
                        <ThemedView style={styles.userContainer}>
                            <ThemedText style={{ color: 'black' }}>Username : {item[0]}</ThemedText>
                            <ThemedText style={{ color: 'black' }}>Wish them on : {item[1]}</ThemedText>
                        </ThemedView>
                    )}
                />
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
    userContainer: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    }
});