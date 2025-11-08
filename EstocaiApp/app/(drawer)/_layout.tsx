import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList
} from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        name="produtos/index"
        options={{
          title: "Produtos",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="produtos/novo"
        options={{
          title: "Novo Produto",
          drawerItemStyle: { display: 'none' },
        }}
      />
      

      <Drawer.Screen
        name="servicos/index"
        options={{
          title: "Serviços",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="servicos/novo"
        options={{
          title: "Novo Serviço",
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="ordens/index"
        options={{
          title: "Ordens de Serviço",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ordens/novo"
        options={{
          title: "Nova Ordem de Serviço",
          drawerItemStyle: { display: 'none' },
        }}
      />
     
      {/* Relatórios principal (não será exibido no DrawerItemList) */}
      <Drawer.Screen
        name="relatorios"
        options={{
          title: "Relatórios",
          drawerItemStyle: { display: 'none' },
        }}
      />

      {/* Submenus de Relatórios */}
      <Drawer.Screen
        name="relatorios/clientes"
        options={{
          title: "Relatórios - Clientes",
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="relatorios/estabelecimentos"
        options={{
          title: "Relatórios - Estabelecimentos",
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="relatorios/funcionarios"
        options={{
          title: "Relatórios - Funcionários",
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="relatorios/ordens"
        options={{
          title: "Relatórios - Ordens de Serviço",
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="relatorios/produtos"
        options={{
          title: "Relatórios - Produtos",
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="relatorios/servicos"
        options={{
          title: "Relatórios - Serviços",
          drawerItemStyle: { display: 'none' },
        }}
      />

    </Drawer>
  );
}

function CustomDrawerContent(props: any) {
  const { logout } = useAuth();
  const router = useRouter();
  const [relatoriosOpen, setRelatoriosOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Erro", "Falha ao sair");
    }
  };

  // Navegação manual para relatórios
  const goTo = (route: string) => {
    props.navigation.navigate(route);
  };

  // Verifica se algum submenu de relatórios está ativo
  const activeRoute = props.state.routes[props.state.index]?.name;
  const isRelatorioActive = activeRoute && activeRoute.startsWith("relatorios/");

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
            {/* Renderiza todos os itens exceto relatórios */}
            {(() => {
              const filteredRoutes = props.state.routes.filter(
                (route: any) => !route.name.startsWith("relatorios/")
              );
              let newIndex = props.state.index;
              if (!filteredRoutes[newIndex]) {
                newIndex = 0;
              }
              return (
                <DrawerItemList
                  {...props}
                  state={{
                    ...props.state,
                    routes: filteredRoutes,
                    index: newIndex,
                  }}
                />
              );
            })()}

            {/* Botão Relatórios com estilo igual aos demais */}
            <TouchableOpacity
              style={[
                styles.drawerItem,
                isRelatorioActive && styles.drawerItemActive,
              ]}
              onPress={() => setRelatoriosOpen(!relatoriosOpen)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="chart-bar"
                size={22}
                color={isRelatorioActive ? colors.background : colors.text}
              />
              <Text
                style={[
                  styles.drawerLabel,
                  isRelatorioActive && styles.drawerLabelActive,
                ]}
              >
                Relatórios
              </Text>
              <MaterialIcons
                name={relatoriosOpen ? "expand-less" : "expand-more"}
                size={22}
                color={isRelatorioActive ? colors.background : colors.text}
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
            {relatoriosOpen && (
              <View style={{ marginLeft: 32 }}>
                <TouchableOpacity style={styles.subDrawerItem} onPress={() => goTo("relatorios/clientes")}>
                  <MaterialIcons name="person-outline" size={20} color={colors.secondary} />
                  <Text style={styles.subDrawerLabel}>Clientes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subDrawerItem} onPress={() => goTo("relatorios/estabelecimentos")}>
                  <MaterialCommunityIcons name="office-building" size={20} color={colors.secondary} />
                  <Text style={styles.subDrawerLabel}>Estabelecimentos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subDrawerItem} onPress={() => goTo("relatorios/funcionarios")}>
                  <MaterialIcons name="people" size={20} color={colors.secondary} />
                  <Text style={styles.subDrawerLabel}>Funcionários</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subDrawerItem} onPress={() => goTo("relatorios/ordens")}>
                  <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.secondary} />
                  <Text style={styles.subDrawerLabel}>Ordens de Serviço</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subDrawerItem} onPress={() => goTo("relatorios/produtos")}>
                  <MaterialCommunityIcons name="cube-outline" size={20} color={colors.secondary} />
                  <Text style={styles.subDrawerLabel}>Produtos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subDrawerItem} onPress={() => goTo("relatorios/servicos")}>
                  <MaterialCommunityIcons name="cog-outline" size={20} color={colors.secondary} />
                  <Text style={styles.subDrawerLabel}>Serviços</Text>
                </TouchableOpacity>
              </View>
            )}
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
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: "transparent",
  },
  drawerItemActive: {
    backgroundColor: colors.primary,
  },
  drawerLabel: {
    marginLeft: 12,
    fontWeight: "600",
    fontSize: 15,
    color: colors.text,
  },
  drawerLabelActive: {
    color: colors.background,
  },
  subDrawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: 1,
  },
  subDrawerLabel: {
    marginLeft: 10,
    color: colors.secondary,
    fontSize: 14,
  },
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