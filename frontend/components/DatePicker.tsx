import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface DatePickerProps {
    updateDob: React.Dispatch<React.SetStateAction<string>>;
}

const DatePickerComponent = ({ updateDob }: DatePickerProps) => {
    const [day, setDay] = useState('1');
    const [month, setMonth] = useState('1');
    const [year, setYear] = useState('2024');
    const [error, setError] = useState('');
    const [date, setDate] = useState('');

    const validateDate = () => {
        if (!day || !month || !year) {
            setError('Please fill all fields');
            return false;
        }

        if (!/^\d+$/.test(day) || !/^\d+$/.test(month) || !/^\d+$/.test(year)) {
            setError('Invalid input. Please enter numbers only');
            return false;
        }

        if (Number(day) < 1 || Number(day) > 31) {
            setError('Day must be between 1-31');
            return false;
        }

        if (Number(month) < 1 || Number(month) > 12) {
            setError('Month must be between 1-12');
            return false;
        }

        if (year.length !== 4) {
            setError('Year must be 4 digits');
            return false;
        }

        setError('');
        return true;
    };

    const handleDatePicker = () => {
        if (validateDate()) {
            setDate(`${year}-${month}-${day}`);
            updateDob(`${year}-${month}-${day}`);
        }
    };

    return (
        <View>
            <View style={styles.datePickerContainer}>
                <TextInput
                    style={styles.dateInput}
                    value={day.toString()}
                    onChangeText={(text) => setDay(text)}
                    placeholder="DD"
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.dateInput}
                    value={month.toString()}
                    onChangeText={(text) => setMonth(text)}
                    placeholder="MM"
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.dateInput}
                    value={year.toString()}
                    onChangeText={(text) => setYear(text)}
                    placeholder="YYYY"
                    keyboardType="numeric"
                />
                <TouchableOpacity style={styles.button} onPress={handleDatePicker}>
                    <Text style={styles.buttonText}>Select Date</Text>
                </TouchableOpacity>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {date && (!error) && <Text style={{ color: 'yellow' }}>{"Selected date: " + date}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({

    datePickerContainer: {
        width: 250,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'white',
        marginTop: 10,
        marginBottom: 10
    },
    dateInput: {
        width: 80,
        height: 40,
        color: 'yellow',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    button: {
        marginLeft: 30,
        width: 100,
        backgroundColor: 'lightblue',
        padding: 10,
    },
    buttonText: {
        color: 'black',
    },
});

export default DatePickerComponent;