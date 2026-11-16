import CheckoutForm, { productIdMap } from "@/components/checkout-form.native";
import { Usuario } from "@/src/models/usuario";
import revenuecatService from "@/src/services/revenuecatService";
import { atualizarPlanoUsuario } from "@/src/services/usuarioService";
import { getPlanoStatus, salvarUsuarioAtualizado } from "@/src/utils/plano";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    Linking,
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
    { id: "mensal", displayName: "Mensal", description: "Acesso completo durante 30 dias, renovação automática" },
    { id: "semestral", displayName: "Semestral", description: "Acesso completo durante 6 meses, renovação automática" },
    { id: "anual", displayName: "Anual", description: "Acesso completo durante 12 meses, renovação automática" },
];

const planBenefits: Record<string, string[]> = {
    mensal: [
        "Acesso completo durante 30 dias",
        "Atualizações do app",
        "Suporte prioritário",
    ],
    semestral: [
        "Acesso completo durante 6 meses",
        "Atualizações do app",
        "Suporte prioritário",
    ],
    anual: [
        "Acesso completo durante 12 meses",
        "Atualizações do app",
        "Suporte prioritário",
    ],
};

const planAmountMap: Record<string, number> = {
    mensal: 39.9,
    semestral: 219.90,
    anual: 419.90,
};

function formatCurrencyBR(amount: number | undefined) {
    if (amount == null || Number.isNaN(amount)) return "";
    return `R$ ${amount.toFixed(2).replace('.', ',')}`;
}

//TODO somente para Teste
// const planAmountMap: Record<string, number> = {
//     mensal: 1.00,
//     semestral: 1.50,
//     anual: 2.00,
// };

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
    const [restoring, setRestoring] = useState(false);
    const planoStatus = getPlanoStatus(usuario);

    // Exigido pela App Review (Guideline 3.1.1): botão explícito de "Restaurar Compras"
    const handleRestore = async () => {
        setRestoring(true);
        try {
            const info: any = await revenuecatService.restorePurchases();
            const active: string[] = info?.activeSubscriptions ?? [];
            // Identificadores podem vir como "plano_mensal_v2" ou "plano_mensal_v2:base-plan" (Android)
            const plano = Object.keys(productIdMap).find((key) =>
                active.some((id) => id === productIdMap[key] || id.startsWith(`${productIdMap[key]}:`))
            );

            if (!plano) {
                Alert.alert('Nenhuma compra encontrada', 'Não encontramos assinaturas ativas vinculadas à sua conta da loja.');
                return;
            }

            const cpf = usuario?.cpf;
            if (!cpf) {
                Alert.alert('Aguarde', 'Ainda estamos carregando seus dados. Tente novamente em instantes.');
                return;
            }

            const atualizado = await atualizarPlanoUsuario({ cpf, plano });
            await salvarUsuarioAtualizado(atualizado);
            router.replace('/planos/sucesso?restaurado=true');
        } catch (e: any) {
            console.error('[Planos] restore error', e);
            Alert.alert('Erro', e?.message ?? 'Não foi possível restaurar as compras.');
        } finally {
            setRestoring(false);
        }
    };

     // Ao montar esta tela desabilita o gesto de abrir o drawer e remove o botão de menu.
    // Ao desmontar restaura o comportamento anterior.
    useEffect(() => {
        // coleciona alguns parents (até 5) e aplica as opções no que suportar setOptions
        const parents: any[] = [];
        let p: any = (navigation as any).getParent?.();
        for (let i = 0; i < 5 && p; i++) {
            parents.push(p);
            p = p.getParent?.();
        }

        // desativa gestos / swipe / headerLeft em todos os parents possíveis
        parents.forEach(parent => {
            try {
                parent?.setOptions?.({
                    // para Drawer: swipeEnabled desativa swipe; edgeWidth=0 evita abertura por borda
                    swipeEnabled: false,
                    gestureEnabled: false,
                    edgeWidth: 0,
                });
            } catch (e) { /* noop */ }
        });

        // remove o botão de menu no header desta tela
        navigation.setOptions?.({ headerLeft: () => null });

        return () => {
            // restaura estado anterior ao desmontar
            parents.forEach(parent => {
                try {
                    parent?.setOptions?.({
                        swipeEnabled: true,
                        gestureEnabled: true,
                        edgeWidth: undefined,
                    });
                } catch (e) { /* noop */ }
            });
            navigation.setOptions?.({ headerLeft: undefined });
        };
    }, [navigation]);

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
                    {planoStatus?.isPago
                        ? `Plano atual: ${planoStatus.nome}, ativo até ${formatDateBR(usuario?.dataExpiracao || "")}`
                        : `Você está no teste grátis, válido até ${formatDateBR(usuario?.dataExpiracao || "")}`}
                </Text>
            )}

            <View style={styles.list}>
                {plans.map((p) => {
                    const isSelected = selected === p.id;
                    const isAtual = !!planoStatus?.isPago && !planoStatus.isExpirado && planoStatus.codigo === p.id.toUpperCase();
                    return (
                        <TouchableOpacity
                            key={p.id}
                            style={[styles.card, isAtual && styles.cardAtual, isSelected && styles.cardSelected]}
                            onPress={() => {
                                setSelected(p.id);
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardInner}>
                                <View style={styles.leftBar} />
                                <View style={styles.cardRow}>
                                    <View style={styles.cardInfo}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={styles.cardTitle}>{p.displayName}</Text>
                                            {isAtual && (
                                                <View style={styles.seuPlanoTag}>
                                                    <MaterialCommunityIcons name="crown" size={12} color="#fff" />
                                                    <Text style={styles.seuPlanoText}>Seu plano</Text>
                                                </View>
                                            )}
                                        </View>
                                        {p.description ? <Text style={styles.cardNote}>{p.description}</Text> : null}
                                        <Text style={styles.cardPrice}>
                                            {formatCurrencyBR(planAmountMap[p.id])}
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

            {/* Benefícios e links exigidos pela App Review - substitua as URLs pelos reais */}
            {selected && (
                <>
                    <View style={styles.benefitsContainer}>
                        {planBenefits[selected]?.map((b) => (
                            <Text key={b} style={styles.benefit}>• {b}</Text>
                        ))}
                    </View>
                </>
            )}
            <View style={styles.linksContainer}>
                        <Text style={styles.link} onPress={() => Linking.openURL('https://estocafacil.com.br/privacy-policy/')}>
                            Política de Privacidade
                        </Text>
                        <Text style={styles.link} onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
                            Termos de Uso (EULA)
                        </Text>
                    </View>

            {Platform.OS !== 'web' && (
                <Button
                    mode="text"
                    onPress={handleRestore}
                    loading={restoring}
                    disabled={restoring}
                    labelStyle={{ color: colors.primary }}
                    style={{ marginTop: 8 }}
                >
                    Restaurar Compras
                </Button>
            )}

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
    cardAtual: {
        borderColor: "#b8860b",
        backgroundColor: "#fffdf5",
    },
    seuPlanoTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#b8860b",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    seuPlanoText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
        marginLeft: 4,
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
    linksContainer: {
        marginTop: 12,
        alignItems: "center",
    },
    link: {
        color: colors.primary,
        textDecorationLine: "underline",
        marginVertical: 4,
    },
    benefitsContainer: {
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    benefit: {
        color: "#444",
        fontSize: 13,
        marginVertical: 2,
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