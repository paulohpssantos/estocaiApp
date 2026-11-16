import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import colors from "../../constants/colors";
import globalStyles from "../../constants/globalStyles";
import { formatDateBR } from "../../src/utils/formatters";
import { getPlanoStatus, getUsuarioSalvo, PlanoStatus } from "../../src/utils/plano";

const BENEFICIOS = [
    "Acesso completo a todas as funcionalidades",
    "Atualizações do app",
    "Suporte prioritário",
];

export default function PlanoSucessoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams() as { restaurado?: string };
    const restaurado = params?.restaurado === "true";
    const [status, setStatus] = useState<PlanoStatus | null>(null);

    useEffect(() => {
        getUsuarioSalvo().then((u) => setStatus(getPlanoStatus(u)));
    }, []);

    const irParaApp = () => router.replace("/(drawer)/dashboard");

    // Botão "voltar" do Android leva para o app, não de volta ao checkout
    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            irParaApp();
            return true;
        });
        return () => sub.remove();
    }, []);

    return (
        <ScrollView contentContainerStyle={[globalStyles.container, styles.container]}>
            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="check-bold" size={56} color="#fff" />
            </View>

            <Text style={styles.title}>{restaurado ? "Assinatura restaurada!" : "Assinatura ativada!"}</Text>
            <Text style={styles.subtitle}>
                {restaurado
                    ? "Encontramos sua assinatura e ela já está ativa novamente."
                    : "Obrigado por assinar o Estoca Fácil. Seu plano já está disponível."}
            </Text>

            {status && (
                <View style={styles.planCard}>
                    <MaterialCommunityIcons name="crown" size={28} color="#b8860b" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.planName}>Plano {status.nome}</Text>
                        {status.dataExpiracao ? (
                            <Text style={styles.planSub}>Ativo até {formatDateBR(status.dataExpiracao)}</Text>
                        ) : null}
                    </View>
                </View>
            )}

            <View style={styles.benefits}>
                <Text style={styles.benefitsTitle}>O que está liberado para você</Text>
                {BENEFICIOS.map((b) => (
                    <View key={b} style={styles.benefitRow}>
                        <MaterialCommunityIcons name="check-circle" size={20} color={colors.green} />
                        <Text style={styles.benefitText}>{b}</Text>
                    </View>
                ))}
            </View>

            <Button mode="contained" onPress={irParaApp} style={[globalStyles.primaryButton, { alignSelf: "stretch", marginTop: 24 }]}>
                Começar a usar
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.green,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.text,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: colors.mediumGray,
        textAlign: "center",
        marginTop: 8,
    },
    planCard: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: "#fff8e1",
        borderColor: "#b8860b",
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
    },
    planName: { fontSize: 18, fontWeight: "700", color: colors.text },
    planSub: { fontSize: 14, color: colors.mediumGray, marginTop: 2 },
    benefits: {
        alignSelf: "stretch",
        marginTop: 24,
    },
    benefitsTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 8 },
    benefitRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
    benefitText: { marginLeft: 8, fontSize: 15, color: colors.text, flex: 1 },
});
