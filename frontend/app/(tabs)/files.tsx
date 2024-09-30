import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/components/StateContext';

export default function FileExplorerScreen() {
    const { user, setUser, csrfToken, setcsrfToken } = useAppContext();
    const [relpath, setRelpath] = useState('');
    const [files, setFiles] = useState<[string, string][]>([]);
    const [directories, setDirectories] = useState<[string, string][]>([]);

    const fetchFilesAndFolders = (path = '') => {
        const pathDetails = {
            path: path
        }

        let url = "http://localhost:3000/list";
        fetch(
            url,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': csrfToken ? csrfToken : '',
                },
                body: JSON.stringify(pathDetails),
                credentials: 'include'
            }
        )
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setDirectories(data.directories);
                setFiles(data.files);
            })
            .catch(error => alert(error));
    };

    useEffect(() => {
        if (user) {
            fetchFilesAndFolders(relpath);
        }
    }, [user, relpath]);

    if (user === null) {
        return (
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={<Ionicons size={310} name="folder-outline" style={styles.headerImage} />}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Files</ThemedText>
                </ThemedView>
                <ThemedText>
                    To be able to see your files, you need to be logged in.
                </ThemedText>

                <ExternalLink href="/login">
                    <ThemedText style={{ color: 'lightblue' }}>Click here to login</ThemedText>
                </ExternalLink>
            </ParallaxScrollView>
        );
    }
    else {
        return (
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={<Ionicons size={310} name="folder-outline" style={styles.headerImage} />}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Files</ThemedText>
                </ThemedView>
                <ThemedView style={{ width: 300, flexDirection: 'row' }}>
                    <ThemedText style={{ fontFamily: "SpaceMono", marginRight: 30 }}>
                        {'🏠: ' + relpath}
                    </ThemedText>
                    {
                        relpath !== "" &&
                        <Pressable onPress={() => { const lastSlashIndex = relpath.lastIndexOf('/'); setRelpath(relpath.slice(0, lastSlashIndex)); }}>
                            <Ionicons name="arrow-back-outline" size={25} color="green" />
                        </Pressable>
                    }
                </ThemedView>


                {directories.map((dir, ind) => (
                    <Pressable key={`dir-${ind}`} onPress={() => { setRelpath(relpath + '/' + dir); fetchFilesAndFolders(relpath); }} style={styles.item}>
                        <Ionicons name="folder-outline" size={20} color="orange" />
                        <ThemedText style={styles.itemText}>{dir}</ThemedText>
                    </Pressable>
                ))}

                {files.map((file, ind) => (
                    <ThemedView key={`file-${ind}`} style={styles.item}>
                        <Ionicons name="document-outline" size={20} color="blue" />
                        <ThemedText style={styles.itemText}>{file}</ThemedText>
                    </ThemedView>
                ))}

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
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    itemText: {
        marginLeft: 8,
        fontSize: 16,
    },
});