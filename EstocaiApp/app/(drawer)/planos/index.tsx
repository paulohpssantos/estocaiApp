import { createCheckoutSession } from "@/src/services/stripeService";
import { atualizarPlanoUsuario } from "@/src/services/usuarioService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation, useRoute } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "react-native-paper";
import colors from "../../../constants/colors";
import globalStyles from "../../../constants/globalStyles";
import { formatDateBR } from "../../../src/utils/formatters";

const plans = [
    { id: "mensal", title: "Plano Mensal", price: "R$ 39,90", note: "" },
    { id: "semestral", title: "Plano Semestral", price: "R$ 220,00", note: "(8,1% off)" },
    { id: "anual", title: "Plano Anual", price: "R$ 420,00", note: "(12,28% off)" },
];

export default function PlanosScreen() {
    const router = useRouter();
    const route = useRoute();
    const routeParams: any = (route as any).params ?? {};
    const navigation = useNavigation();
    const params = useLocalSearchParams() as { expired?: string };
    const isExpired = params?.expired === "true";
    const [selected, setSelected] = useState<string | null>(null);

    // estado para exibir dados do usuário logado
    const [userPlano, setUserPlano] = useState<string | null>(null);
    const [dataExpiracao, setDataExpiracao] = useState<string | null>(null);
    const [openedFromDrawer, setOpenedFromDrawer] = useState(false);

    // carrega dados do usuário ao montar a tela
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // tenta ler objeto completo do usuário
                const raw = await AsyncStorage.getItem("usuario") || await AsyncStorage.getItem("user");
                if (raw) {
                    try {
                        const u = JSON.parse(raw);
                        if (mounted) {
                            setUserPlano(u?.plano ?? u?.plan ?? null);
                            setDataExpiracao(u?.dataExpiracao ?? u?.data_expiracao ?? u?.expirationDate ?? null);
                        }
                        return;
                    } catch {
                        // não é JSON, continua para chaves individuais
                    }
                }
                // tenta chaves individuais
                const plano = await AsyncStorage.getItem("plano") || await AsyncStorage.getItem("userPlano");
                const venc = await AsyncStorage.getItem("dataExpiracao") || await AsyncStorage.getItem("userDataExpiracao");
                if (mounted) {
                    setUserPlano(plano);
                    setDataExpiracao(venc);
                }
            } catch (e) {
                console.warn("[PLANOS] erro ao carregar dados do usuário:", e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions?.({ headerLeft: () => null });

        const modifiedParents: any[] = [];
        let p: any | undefined = navigation.getParent?.();

        // tenta detectar se foi aberto pelo drawer via param (recomendado: passe { openedFromDrawer: true } ao navegar)
        if (routeParams.openedFromDrawer) {
            setOpenedFromDrawer(true);
        }

        while (p) {
            if (typeof p.setOptions === "function") {
                try {
                    p.setOptions({
                        swipeEnabled: !isExpired,
                        gestureEnabled: !isExpired,
                        drawerLockMode: isExpired ? "locked-closed" : "unlocked",
                    });
                    modifiedParents.push(p);
                } catch (e) {
                    console.warn("[PLANOS] não foi possível setOptions no parent:", e);
                }
            }
            // fallback: detectar drawer inspecionando o state/type ou id do parent
            try {
                const state = p.getState?.();
                const id = typeof p.getId === "function" ? p.getId() : undefined;
                if (state && state.type === "drawer") {
                    setOpenedFromDrawer(true);
                } else if (typeof id === "string" && id.toLowerCase().includes("drawer")) {
                    setOpenedFromDrawer(true);
                }
            } catch {}
            p = p.getParent?.();
        }

        if (isExpired) {
            try {
                let target: any | undefined = navigation;
                while (target) {
                    const state = target.getState?.();
                    if (state && state.type === "drawer") {
                        target.dispatch?.(DrawerActions.closeDrawer());
                        break;
                    }
                    target = target.getParent?.();
                }
            } catch (e) {
                console.warn("[PLANOS] erro ao fechar drawer via dispatch:", e);
            }
        }

        return () => {
            modifiedParents.forEach((parent) => {
                try {
                    parent.setOptions({
                        swipeEnabled: true,
                        gestureEnabled: true,
                        drawerLockMode: "unlocked",
                    });
                } catch (e) {
                    // ignore
                }
            });
        };
    }, [navigation, isExpired]);

    const createStripeAndOpen = async (amountStr: string) => {
        const amountCents = Math.round(Number(amountStr.replace(/[^\d.-]/g, '')) * 100);
        const successUrl = "estocaiapp://stripe-return?target=dashboard";
        const cancelUrl = "estocaiapp://stripe-return?target=planos";

        let subscription: any;

        const onUrl = ({ url }: { url: string }) => {
            try {
                const parsed = new URL(url);
                const target = parsed.searchParams.get('target');
                const sessionId = parsed.searchParams.get('session_id') ?? parsed.searchParams.get('sessionId');
                const ok = parsed.searchParams.get('status') === 'success' || !!sessionId;

                if (ok) {
                    const planLabel = selected ?? 'plano';
                    // primeiro alerta de confirmação do plano; ao OK atualiza usuário e navega
                    Alert.alert(
                        `Plano ${planLabel} confirmado com sucesso!`,
                        undefined,
                        [
                            {
                                text: 'OK',
                                onPress: async () => {
                                    try {
                                        // tenta obter CPF do storage (ajuste a chave se for diferente)
                                        const cpf = (await AsyncStorage.getItem('cpf')) ?? (await AsyncStorage.getItem('userCpf')) ?? '';
                                        if (!cpf) {
                                            console.warn('[PLANO] cpf não encontrado no storage, atualizando sem cpf');
                                        }
                                        // chama service para atualizar plano (ajuste payload conforme modelo UpdatePlanoRequest)
                                        await atualizarPlanoUsuario({ cpf, plano: selected ?? '' });
                                    } catch (e) {
                                        console.warn('[PLANO] erro ao atualizar plano do usuário', e);
                                        Alert.alert('Aviso', 'Não foi possível atualizar o plano no servidor.');
                                    } finally {
                                        if (target === 'dashboard') {
                                            router.replace('/(drawer)/dashboard');
                                        } else {
                                            router.replace('/(drawer)/ordens');
                                        }
                                    }
                                }
                            }
                        ],
                        { cancelable: false }
                    );
                } else {
                    Alert.alert('Pagamento', 'Cancelado ou falhou');
                }
            } catch (e) {
                console.warn('[STRIPE] deep link parse error', e);
            } finally {
                try { subscription?.remove?.(); } catch { }
            }
        };

        try {
            subscription = (Linking as any).addEventListener ? (Linking as any).addEventListener('url', onUrl) : (Linking as any).addListener('url', onUrl);

            const body = {
                amount: amountCents,
                currency: 'brl',
                name: `Plano ${selected ?? ''}`,
                successUrl,
                cancelUrl,
                metadata: { plan: selected ?? '' },
            };

            const resp = await createCheckoutSession(body);
            const hosted = resp.checkoutUrl || resp.hostedUrl || resp.url;
            if (!hosted || !/^https?:\/\//.test(hosted)) throw new Error('URL de checkout inválida');

            const can = await Linking.canOpenURL(hosted);
            if (!can) throw new Error('Não foi possível abrir checkout no dispositivo');
            await Linking.openURL(hosted);
        } catch (err: any) {
            console.warn('[STRIPE] create/open error', err);
            Alert.alert('Erro', err?.message ?? 'Falha ao abrir o checkout');
            try { subscription?.remove?.(); } catch { }
        }
    };

    const handleConfirm = () => {
        if (!selected) { Alert.alert('Atenção', 'Selecione um plano antes de confirmar.'); return; }
        const amount = selected === 'mensal' ? '1.00' : selected === 'semestral' ? '1.50' : '2.00';
        createStripeAndOpen(amount);
    };

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
        if (openedFromDrawer) {
            router.replace("/(drawer)/dashboard");
        } else {
            router.back();
        }
        
    };

    return (
        <ScrollView contentContainerStyle={[globalStyles.container, styles.container, { paddingBottom: 120 }]}>
            {openedFromDrawer && userPlano && dataExpiracao ? (
                <Text style={[globalStyles.title, { marginBottom: 24 }]}>
                    Plano atual: {userPlano}, vence em {formatDateBR(dataExpiracao)}
                </Text>
            ) : (
                <Text style={[globalStyles.title, { marginBottom: 24 }]}>
                    Período de teste expirou, selecione um plano para continuar a utilizar.
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
                <Button mode="contained" onPress={handleConfirm} style={[globalStyles.primaryButton, { flex: 1 }]}>
                    Confirmar
                </Button>
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