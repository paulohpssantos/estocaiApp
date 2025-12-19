import CheckoutForm from "@/components/checkout-form.native";
import { Usuario } from "@/src/models/usuario";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Button } from "react-native-paper";
import colors from "../../constants/colors";
import globalStyles from "../../constants/globalStyles";
import { formatDateBR } from "../../src/utils/formatters";


const plans = [
    { id: "mensal", title: "Plano Mensal", price: "R$ 39,90", note: "" },
    { id: "semestral", title: "Plano Semestral", price: "R$ 220,00", note: "(8,1% off)" },
    { id: "anual", title: "Plano Anual", price: "R$ 420,00", note: "(12,28% off)" },
];

// const planAmountMap: Record<string, number> = {
//     mensal: 39.9,
//     semestral: 220.0,
//     anual: 420.0,
// };

const planAmountMap: Record<string, number> = {
    mensal: 1.00,
    semestral: 1.50,
    anual: 2.00,
};

export default function PlanosScreen() {
    const router = useRouter();
    const route = useRoute();
    const routeParams: any = (route as any).params ?? {};
    const navigation = useNavigation();
    const params = useLocalSearchParams() as { expired?: string } | undefined;
    const isExpired = (params?.expired ?? "false") === "true";
    const [selected, setSelected] = useState<string | null>(null);

    // estado para exibir dados do usuário logado
    const [userPlano, setUserPlano] = useState<string | null>(null);
    const [dataExpiracao, setDataExpiracao] = useState<string | null>(null);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [openedFromDrawer, setOpenedFromDrawer] = useState(false);

    // carrega dados do usuário ao montar a tela
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const usuarioString = await AsyncStorage.getItem("usuario");
                if (!usuarioString) return;
                const usuario = JSON.parse(usuarioString) as Usuario;
                setUsuario(usuario);
                if (mounted) {
                    setUserPlano(usuario.plano);
                    setDataExpiracao(usuario.dataExpiracao);
                }
            } catch (e) {
                console.warn("[PLANOS] erro ao carregar dados do usuário:", e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleCancel = () => {
        if (isExpired) {
            if (Platform.OS === "android") {
                BackHandler.exitApp();
            } else {
                Alert.alert("Encerrar aplicativo", "O período expirou. Feche o aplicativo manualmente para encerrar a sessão.", [
                    { text: "OK" },
                ]);
            }
            return;
        }

        router.replace("/(drawer)/dashboard");

    };

    return (

        <ScrollView contentContainerStyle={[globalStyles.container, styles.container, { paddingBottom: 120 }]}>
            {isExpired ? (
                <Text style={[globalStyles.title, { marginBottom: 24 }]}>
                    Período de teste expirou, selecione um plano para continuar a utilizar.
                </Text>
            ) : (
                <Text style={[globalStyles.title, { marginBottom: 24 }]}>
                    Plano atual: {userPlano}, vence em {formatDateBR(usuario?.dataExpiracao || "")}
                </Text>
            )}

            <View style={styles.list}>
                {plans.map((p) => {
                    const isSelected = selected === p.id;
                    return (
                        <TouchableOpacity
                            key={p.id}
                            style={[styles.card, isSelected && styles.cardSelected]}
                            onPress={() => {
                                setSelected(p.id);
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardInner}>
                                <View style={styles.leftBar} />
                                <View style={styles.cardRow}>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardTitle}>{p.title}</Text>
                                        <Text style={styles.cardPrice}>
                                            {p.price} <Text style={styles.cardNote}>{p.note}</Text>
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                                        size={28}
                                        color={isSelected ? colors.primary : colors.text}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.footerActions}>
                <Button mode="outlined" onPress={handleCancel} labelStyle={{ color: colors.primary }} style={[globalStyles.secondaryButton, { flex: 1, marginRight: 8 }]}>
                    Cancelar
                </Button>
                {/* <Button mode="contained" onPress={handleConfirm} style={[globalStyles.primaryButton, { flex: 1 }]}>
                        Confirmar
                    </Button> */}
                {selected && (
                    <CheckoutForm
                        amount={planAmountMap[selected]}
                        cpf={usuario?.cpf ?? ''}
                        plano={selected}
                    />
                )}
            </View>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    list: {
        width: "100%",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    cardInner: {
        flexDirection: "row",
        alignItems: "center",
    },
    leftBar: {
        width: 6,
        backgroundColor: colors.primary,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        marginRight: 12,
        alignSelf: "stretch",
    },
    cardSelected: {
        borderColor: colors.primary,
        shadowOpacity: 0.08,
        elevation: 3,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
    },
    cardInfo: {
        flex: 1,
        paddingRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 6,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
    },
    cardNote: {
        fontSize: 13,
        fontWeight: "400",
        color: "#666",
    },
    footerActions: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});