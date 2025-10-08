import React from "react";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#f5f5f5",
        },
        headerTintColor: "#333",
        drawerActiveTintColor: colors.background,
        drawerInactiveTintColor: colors.text,
        drawerActiveBackgroundColor: colors.primary,
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: "600",
        },
        drawerStyle: {
          width: 280,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="estabelecimentos"
        options={{
          title: "Estabelecimentos",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="office-building" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="funcionarios"
        options={{
          title: "Funcionários",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="clientes"
        options={{
          title: "Clientes",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />
       <Drawer.Screen
        name="produtos"
        options={{
          title: "Produtos",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="servicos"
        options={{
          title: "Serviços",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ordens"
        options={{
          title: "Ordens de Serviço",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="relatorios"
        options={{
          title: "Relatórios",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

function CustomDrawerContent(props: any) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.background, colors.accent, colors.backgroundLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0, backgroundColor: "transparent" }}>
          <View style={styles.headerRow}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Estocaí</Text>
              <Text style={styles.subtitle}>Sistema de Gestão</Text>
            </View>
          </View>

          <View style={{ flex: 1, paddingTop: 10 }}>
            <DrawerItemList {...props} />
          </View>
        </DrawerContentScrollView>
      </LinearGradient>

      <View style={styles.footer}>
  <Text style={styles.footerText}>© {new Date().getFullYear()} Estocaí</Text>
        <Text style={styles.footerSub}>Sistema de Gestão</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 30,
    borderBottomWidth: 0.3,
    borderColor: colors.borderColor,
    paddingHorizontal: 20,
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.secondary,
  },
  subtitle: {
    color: colors.secondary,
    fontSize: 13,
  },
  footer: {
    padding: 20,
    borderTopWidth: 0.3,
    borderColor: colors.borderColor,
    alignItems: "center",
  },
  footerText: {
    color: colors.secondary,
    fontWeight: "600",
  },
  footerSub: {
    color: colors.mediumGray,
    fontSize: 12,
  },
});
