import { useEffect, useState }
from "react";

import {
  Text,
} from "react-native";

import { NavigationContainer }
from "@react-navigation/native";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import HomeScreen
from "./screens/HomeScreen";

import RankingScreen
from "./screens/RankingScreen";

import TasksScreen
from "./screens/TasksScreen";

import ProfileScreen
from "./screens/ProfileScreen";

import LoginScreen
from "./screens/LoginScreen";

import { supabase }
from "./supabase";

const Tab =
  createBottomTabNavigator();

export default function App() {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    checkUser();

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setUser(
          session?.user ?? null
        );
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  async function checkUser() {

    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(
      session?.user ?? null
    );

    setLoading(false);
  }

  if (loading) {

    return null;
  }

  if (!user) {

    return (
      <LoginScreen
        onLogin={setUser}
      />
    );
  }

  return (

    <NavigationContainer>

      <Tab.Navigator

        screenOptions={({ route }) => ({

          headerShown: false,

          tabBarActiveTintColor:
            "#f12626",

          tabBarInactiveTintColor:
            "#999",

          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: "#fff",
            borderRadius: 0,
            borderTopWidth: 0,

            shadowColor: "#000",

            shadowOpacity: 0.08,

            shadowRadius: 0,

            shadowOffset: {
              width: 0,
              height: 10,
            },
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700",
            marginBottom: 0,
          },

          tabBarIcon: () => {

            const icons = {
              Start: "🏠",
              Ranking: "🏆",
              Zadania: "✅",
              Profil: "👤",
            };

            return (

              <Text
                style={{
                  fontSize: 22,
                }}
              >
                {icons[route.name]}
              </Text>

            );
          },

        })}
      >

        <Tab.Screen
          name="Start"
          children={() =>
            <HomeScreen user={user} />
          }
        />

        <Tab.Screen
          name="Ranking"
          component={RankingScreen}
        />

        <Tab.Screen
          name="Zadania"
          component={TasksScreen}
        />

        <Tab.Screen
          name="Profil"
          children={() =>
            <ProfileScreen user={user} />
          }
        />

      </Tab.Navigator>

    </NavigationContainer>

  );
}