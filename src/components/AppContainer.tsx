import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppContainerProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
}

export const AppContainer: React.FC<AppContainerProps> = ({ children, style }) => {
    return (
        <SafeAreaView style={[styles.container, style]}>
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
