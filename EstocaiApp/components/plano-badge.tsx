import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../constants/colors";
import { PlanoStatus, textoDiasRestantes } from "../src/utils/plano";

const GOLD = "#b8860b";
const GOLD_BG = "#fff8e1";
const TRIAL = "#e65100";
const TRIAL_BG = "#fff3e0";

/** Selo compacto do plano atual (usado no menu lateral). */
export function PlanoBadge({ status, onPressAssinar }: { status: PlanoStatus | null; onPressAssinar?: () => void }) {
    if (!status) return null;

    if (status.isPago && !status.isExpirado) {
        return (
            <View style={[styles.badge, { backgroundColor: GOLD_BG, borderColor: GOLD }]}>
                <MaterialCommunityIcons name="crown" size={18} color={GOLD} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={[styles.badgeTitle, { color: GOLD }]}>Premium · {status.nome}</Text>
                    <Text style={styles.badgeSub}>Assinatura ativa</Text>
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.badge, { backgroundColor: TRIAL_BG, borderColor: TRIAL }]}
            onPress={onPressAssinar}
            activeOpacity={0.7}
            disabled={!onPressAssinar}
        >
            <MaterialCommunityIcons name="timer-sand" size={18} color={TRIAL} />
            <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={[styles.badgeTitle, { color: TRIAL }]}>
                    {status.isPago ? `${status.nome} · expirado` : `Teste grátis · ${textoDiasRestantes(status.diasRestantes)}`}
                </Text>
                {onPressAssinar && <Text style={[styles.badgeLink, { color: TRIAL }]}>Assinar agora ›</Text>}
            </View>
        </TouchableOpacity>
    );
}

/** Faixa exibida no topo do Dashboard apenas para quem está no teste grátis. */
export function PlanoTrialBanner({ status, onPressVerPlanos }: { status: PlanoStatus | null; onPressVerPlanos: () => void }) {
    if (!status || (status.isPago && !status.isExpirado)) return null;

    const urgente = status.diasRestantes != null && status.diasRestantes <= 2;
    const bg = urgente ? colors.primary : TRIAL_BG;
    const fg = urgente ? "#fff" : TRIAL;

    return (
        <TouchableOpacity style={[styles.banner, { backgroundColor: bg, borderColor: urgente ? colors.primary : TRIAL }]} onPress={onPressVerPlanos} activeOpacity={0.8}>
            <MaterialCommunityIcons name={urgente ? "alert-circle-outline" : "gift-outline"} size={24} color={fg} />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={[styles.bannerTitle, { color: fg }]}>
                    Você está no período de teste grátis
                </Text>
                <Text style={[styles.bannerSub, { color: fg }]}>
                    {status.diasRestantes == null || status.diasRestantes < 0
                        ? "Assine um plano para continuar usando."
                        : status.diasRestantes === 0
                            ? "Seu teste termina hoje. Assine para continuar usando sem interrupções."
                            : `${status.diasRestantes === 1 ? "Falta 1 dia" : `Faltam ${status.diasRestantes} dias`} para o fim do teste. Assine para continuar usando sem interrupções.`}
                </Text>
            </View>
            <Text style={[styles.bannerCta, { color: fg }]}>Ver planos ›</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginTop: 12,
    },
    badgeTitle: { fontWeight: "700", fontSize: 14 },
    badgeSub: { color: colors.mediumGray, fontSize: 12 },
    badgeLink: { fontSize: 12, fontWeight: "600", marginTop: 2 },
    banner: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    bannerTitle: { fontWeight: "700", fontSize: 15 },
    bannerSub: { fontSize: 13, marginTop: 2 },
    bannerCta: { fontWeight: "700", fontSize: 13 },
});
