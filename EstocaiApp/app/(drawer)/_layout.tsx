import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList
} from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Alert, Button, Image, StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import { useAuth } from "../../src/context/AuthContext";

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
        name="estabelecimentos/index"
        options={{
          title: "Estabelecimentos",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="office-building" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="estabelecimentos/novo"
        options={{
          title: "Novo Estabelecimento",
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="funcionarios/index"
        options={{
          title: "Funcionários",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="funcionarios/novo"
        options={{
          title: "Novo Funcionário",
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="clientes/index"
        options={{
          title: "Clientes",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="clientes/novo"
        options={{
          title: "Novo Cliente",
          drawerItemStyle: { display: 'none' },
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
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Erro", "Falha ao sair");
    }
  };

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
          <Button title="Sair" onPress={handleLogout} color={colors.primary} />
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
  logoutButton: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
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
