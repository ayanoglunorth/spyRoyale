import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/constants/theme';
import { CategoriesProvider, useCategories } from './src/context/CategoriesContext';
import { ThemeProvider, useThemeContext } from './src/context/ThemeContext';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { InputNamesScreen } from './src/screens/InputNamesScreen';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { GameConfig, GameState, assignRolesAndWords } from './src/utils/gameLogic';

SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  Setup: { lastConfig?: GameConfig };
  InputNames: { totalPlayers: number; config: GameConfig };
  Loading: { config: GameConfig; playerNames: string[] };
  Reveal: { gameState: GameState };
  Dashboard: { lastConfig?: GameConfig; gameState?: GameState };
};

const Stack = createStackNavigator<RootStackParamList>();

type PartialConfig = { agentCount: number; spyCount: number; categoryIds: string[] };

function AppNavigator() {
  const [lastConfig, setLastConfig] = useState<PartialConfig | undefined>();
  const [lastGameState, setLastGameState] = useState<GameState | undefined>();
  const { categories } = useCategories();
  const { colors, isDark } = useThemeContext();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.error,
        },
        fonts: {
          regular: { fontFamily: theme.fontFamily, fontWeight: '400' },
          medium: { fontFamily: theme.fontFamily, fontWeight: '500' },
          bold: { fontFamily: theme.fontFamily, fontWeight: '700' },
          heavy: { fontFamily: theme.fontFamily, fontWeight: '900' },
        },
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
        initialRouteName="Setup"
      >
        <Stack.Screen name="Setup">
          {(props) => (
            <SetupScreen
              {...props}
              onNext={(config) => {
                setLastConfig(config);
                props.navigation.navigate('InputNames', {
                  totalPlayers: config.agentCount + config.spyCount,
                  config,
                });
              }}
              initialConfig={lastConfig}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="InputNames">
          {(props) => (
            <InputNamesScreen
              {...props}
              totalPlayers={props.route.params.totalPlayers}
              onStart={(names) => {
                props.navigation.navigate('Loading', {
                  config: props.route.params.config,
                  playerNames: names,
                });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Loading">
          {(props) => (
            <LoadingScreen
              {...props}
              onComplete={() => {
                const { config, playerNames } = props.route.params;
                try {
                  const gameState = assignRolesAndWords(
                    {
                      ...config,
                      playerNames,
                    },
                    categories
                  );
                  props.navigation.navigate('Reveal', { gameState });
                } catch (error) {
                  props.navigation.navigate('Setup');
                }
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Reveal">
          {(props) => (
            <RevealScreen
              {...props}
              players={props.route.params.gameState.players}
              onComplete={() => {
                setLastGameState(props.route.params.gameState);
                props.navigation.navigate('Dashboard', { lastConfig, gameState: props.route.params.gameState });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Dashboard">
          {(props) => (
            <DashboardScreen
              {...props}
              lastConfig={lastConfig}
              gameState={props.route.params?.gameState || lastGameState}
              onNewGame={() => {
                props.navigation.navigate('Setup', { lastConfig });
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const isWeb = Platform.OS === 'web';

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CategoriesProvider>
          <AppWrapper />
        </CategoriesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppWrapper() {
  const { colors } = useThemeContext();

  const AppContent = <AppNavigator />;

  if (isWeb) {
    return (
      <View style={[styles.webContainer, { backgroundColor: colors.webContainerBackground }]}>
        <View style={[styles.appContainer, { backgroundColor: colors.background }]}>
          {AppContent}
        </View>
      </View>
    );
  }

  return AppContent;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    width: '100%',
    maxWidth: 500,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
});
