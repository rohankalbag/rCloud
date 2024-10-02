import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Modal, TextInput } from 'react-native';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/components/StateContext';
import * as DocumentPicker from 'expo-document-picker';

export default function FileExplorerScreen() {
    const { user, setUser, csrfToken, setcsrfToken } = useAppContext();
    const [relpath, setRelpath] = useState('');
    const [files, setFiles] = useState<[string, string][]>([]);
    const [directories, setDirectories] = useState<[string, string][]>([]);
    const [newFolderName, setNewFolderName] = useState('Untitled');
    const [dialogVisible, setDialogVisible] = useState(false);

    const fetchFilesAndFolders = (path = '') => {
        const pathDetails = {
            path: path
        }

        let url = "http://localhost:3000/ls";
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
                setDirectories(data.directories);
                setFiles(data.files);
            })
            .catch(error => alert(error));
    };


    const createNewDirectory = (path: string) => {
        const pathDetails = {
            path: path
        }

        let url = "http://localhost:3000/mkdir";
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
                alert(data.message);
                fetchFilesAndFolders(relpath);
            })
            .catch(error => alert(error));
    };

    const sendFilesToServer = (files: Array<File | undefined>) => {
        files.filter(file => typeof file !== "undefined").forEach(
            (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('path', relpath);
                fetch(
                    "http://localhost:3000/upload",
                    {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRFToken': csrfToken ? csrfToken : '',
                        },
                        body: formData,
                        credentials: 'include'
                    }
                )
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        fetchFilesAndFolders(relpath);
                    })
                    .catch(error => alert(error));
            }
        );
    };

    const deleteFile = (filename: string[]) => {
        const pathDetails = {
            path: relpath,
            filename: filename
        }

        let url = "http://localhost:3000/rm";
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
                alert(data.message);
                fetchFilesAndFolders(relpath);
            })
            .catch(error => alert(error));
    }

    const deleteFolder = (dirname: string[]) => {
        const pathDetails = {
            path: relpath + '/' + dirname
        }

        let url = "http://localhost:3000/rmdir";
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
                alert(data.message);
                fetchFilesAndFolders(relpath);
            })
            .catch(error => alert(error));
    }


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
                <ThemedView style={{ width: 600, flexDirection: 'row' }}>
                    <ThemedText style={{ fontFamily: "SpaceMono", marginRight: 30 }}>
                        {'🏠: ' + relpath}
                    </ThemedText>
                    {
                        relpath !== "" &&
                        <Pressable onPress={() => { const lastSlashIndex = relpath.lastIndexOf('/'); setRelpath(relpath.slice(0, lastSlashIndex)) }}>
                            <ThemedView style={{ width: 75, flexDirection: 'row', backgroundColor: 'grey', borderRadius: 10 }}>
                                <Ionicons name="arrow-back-outline" size={25} color="white" />
                                <ThemedText style={{ marginLeft: 5, color: 'white' }}>Back</ThemedText>
                            </ThemedView>
                        </Pressable>
                    }
                    <Pressable onPress={() => { setNewFolderName("Untitled"); setDialogVisible(true) }}>
                        <ThemedView style={{ width: 125, flexDirection: 'row', backgroundColor: 'grey', borderRadius: 10, paddingLeft: 5, marginLeft: 10 }}>
                            <Ionicons name="add-circle-outline" size={25} color="white" />
                            <ThemedText style={{ marginLeft: 5, color: 'white' }}>New Folder</ThemedText>
                        </ThemedView>
                    </Pressable>

                    <Pressable onPress={async () => {
                        const result = await DocumentPicker.getDocumentAsync({ multiple: true });
                        if (!result.canceled) {
                            const files = result.assets;
                            // TODO: handled for web, need to handle for mobile
                            sendFilesToServer(files.map((f) => (f.file)));
                        }
                    }}>
                        <ThemedView style={{ width: 100, flexDirection: 'row', backgroundColor: 'grey', borderRadius: 10, paddingLeft: 5, marginLeft: 10 }}>
                            <Ionicons name="cloud-upload-outline" size={25} color="white" />
                            <ThemedText style={{ marginLeft: 5, color: 'white' }}>Upload</ThemedText>
                        </ThemedView>
                    </Pressable>
                </ThemedView>


                {directories.map((dir, ind) => (
                    <Pressable key={`dir-${ind}`} onPress={() => { setRelpath(relpath + '/' + dir) }} style={styles.item}>
                        <Ionicons name="folder-outline" size={20} color="orange" />
                        <ThemedText style={styles.itemText}>{dir}</ThemedText>
                        <Pressable onPress={() => { deleteFolder(dir) }} style={{ marginLeft: 30 }}>
                            <Ionicons name="trash-outline" size={20} color="red" />
                        </Pressable>
                    </Pressable>
                ))}

                {files.map((file, ind) => (
                    <ThemedView key={`file-${ind}`} style={styles.item}>
                        <Ionicons name="document-outline" size={20} color="yellow" />
                        <ThemedText style={styles.itemText}>{file}</ThemedText>
                        <Pressable onPress={() => { deleteFile(file) }} style={{ marginLeft: 30 }}>
                            <Ionicons name="trash-outline" size={20} color="red" />
                        </Pressable>
                    </ThemedView>
                ))}

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={dialogVisible}
                    onRequestClose={() => {
                        setDialogVisible(false);
                    }}>
                    <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ThemedText style={{ padding: 10 }}>Enter Folder Name</ThemedText>
                        <ThemedView style={{
                            borderColor: 'white', borderWidth: 1, width: 250, marginTop: 10,
                            marginBottom: 10
                        }}>
                            <TextInput placeholder="" value={newFolderName} onChangeText={(text) => setNewFolderName(text)} style={styles.dateInput} />
                        </ThemedView>
                        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                            <Pressable onPress={() => { createNewDirectory(relpath + '/' + newFolderName); setDialogVisible(false) }}>
                                <ThemedView style={{ width: 60, flexDirection: 'row', backgroundColor: 'grey', borderRadius: 10, padding: 5, margin: 10 }}>
                                    <ThemedText>Create</ThemedText>
                                </ThemedView>
                            </Pressable>
                            <Pressable onPress={() => { setDialogVisible(false) }}>
                                <ThemedView style={{ width: 60, flexDirection: 'row', backgroundColor: 'grey', borderRadius: 10, padding: 5, margin: 10 }}>
                                    <ThemedText>Cancel</ThemedText>
                                </ThemedView>
                            </Pressable>
                        </ThemedView>
                    </ThemedView>
                </Modal>

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