import { UpdatePlanoRequest } from '@/src/models/usuario';
import revenuecatService from '@/src/services/revenuecatService';
import { atualizarPlanoUsuario } from "@/src/services/usuarioService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { Button } from "react-native-paper";
import globalStyles from "../constants/globalStyles";


const productIdMap: Record<string, string> = {
    // Use `||` to fallback when env var is falsy (empty string) as well as undefined
    mensal: process.env.IAP_PRODUCT_MENSAL || 'plano_mensal_v2',
    semestral: process.env.IAP_PRODUCT_SEMESTRAL || 'plano_semestral_v2',
    anual: process.env.IAP_PRODUCT_ANUAL || 'plano_anual_v2',
};

export default function CheckoutForm({ amount, cpf, plano }: { amount: number; cpf?: string; plano?: string }) {

    const [loading, setLoading] = useState(false);
    const [offeringsAvailable, setOfferingsAvailable] = useState<boolean | null>(null);
    const [loadingOfferings, setLoadingOfferings] = useState(false);
    const router = useRouter();
    const isIos = (Platform.OS as any) === 'ios';

    useEffect(() => {
        // Check RevenueCat offerings on mount so we can disable purchase when empty
        let mounted = true;
        (async () => {
            try {
                setLoadingOfferings(true);
                const offerings = await revenuecatService.getOfferings();
                if (!mounted) return;
                const hasPackages = !!(
                    offerings && (
                        (offerings.current && offerings.current.availablePackages && offerings.current.availablePackages.length > 0) ||
                        (offerings.all && Object.keys(offerings.all).length > 0)
                    )
                );
                setOfferingsAvailable(hasPackages);
            } catch (e) {
                console.warn('[CheckoutForm] getOfferings failed', e);
                if (mounted) setOfferingsAvailable(false);
            } finally {
                if (mounted) setLoadingOfferings(false);
            }
        })();

        // No native IAP listeners here — RevenueCat purchase will be handled synchronously
        return () => { mounted = false; };
    }, [cpf, plano, router]);

    const initializePaymentSheet = async () => {
        try {
            // Prevent attempts to use RevenueCat on web (not supported)
            if (Platform.OS === 'web') {
                Alert.alert('Pagamento não disponível', 'Compras só são suportadas no aplicativo iOS/Android.');
                return;
            }
            if (offeringsAvailable === false) {
                Alert.alert('Produtos indisponíveis', 'Nenhuma oferta configurada no RevenueCat. Tente novamente mais tarde.');
                return;
            }
            if (Platform.OS === 'ios') {
                // IAP flow for iOS
                const productId = plano ? productIdMap[plano] : undefined;
                if (!productId || (typeof productId === 'string' && productId.trim() === '')) {
                    Alert.alert('Erro', 'Produto IAP não configurado para este plano.');
                    return;
                }
                setLoading(true);
                try {
                    const purchaserInfo = await revenuecatService.purchaseProduct(productId);
                    // On success, update backend and navigate
                    try {
                        const data: UpdatePlanoRequest = { cpf: cpf!, plano: plano! };
                        await atualizarPlanoUsuario(data);
                        Alert.alert('Sucesso', 'Compra realizada com sucesso!');
                        setTimeout(() => router.replace('/(auth)/login'), 100);
                    } catch (e) {
                        console.error('[CheckoutForm][RevenueCat] backend update error', e);
                        Alert.alert('Erro', 'Compra concluída, mas falha ao atualizar o plano no servidor.');
                    }
                } catch (e: any) {
                    console.error('[CheckoutForm][RevenueCat] purchase error', e);
                    Alert.alert('Erro', e?.message ?? 'Falha ao iniciar compra.');
                } finally {
                    setLoading(false);
                }
                return;
            }

            // Use RevenueCat for purchases on all platforms
            const productId = plano ? productIdMap[plano] : undefined;
            if (!productId || (typeof productId === 'string' && productId.trim() === '')) {
                Alert.alert('Erro', 'Produto IAP não configurado para este plano.');
                return;
            }
            setLoading(true);
            try {
                const purchaserInfo = await revenuecatService.purchaseProduct(productId);
                try {
                    const data: UpdatePlanoRequest = { cpf: cpf!, plano: plano! };
                    await atualizarPlanoUsuario(data);
                    Alert.alert('Sucesso', 'Compra realizada com sucesso!');
                    setTimeout(() => router.replace('/(auth)/login'), 100);
                } catch (e) {
                    console.error('[CheckoutForm][RevenueCat] backend update error', e);
                    Alert.alert('Erro', 'Compra concluída, mas falha ao atualizar o plano no servidor.');
                }
            } catch (e: any) {
                console.error('[CheckoutForm][RevenueCat] purchase error', e);
                Alert.alert('Erro', e?.message ?? 'Falha ao iniciar compra.');
            } finally {
                setLoading(false);
            }

        } catch (e: any) {
            console.error('[CheckoutForm] initializePaymentSheet error', e);
            Alert.alert('Erro', e?.message ?? 'Falha ao iniciar o pagamento');
            setLoading(false);
        }
    };

    // Payment sheet removed — RevenueCat handles purchases directly.

    return (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button
                    mode="contained"
                    onPress={initializePaymentSheet}
                    loading={loading}
                    disabled={loadingOfferings || offeringsAvailable === false}
                    style={[globalStyles.primaryButton, { flex: 1 }]}
                >
                    Confirmar Pagamento
                </Button>
            </View>
            {loadingOfferings && (
                <Text style={{ marginTop: 8, textAlign: 'center', color: '#666' }}>Verificando disponibilidade de ofertas...</Text>
            )}
            {offeringsAvailable === false && (
                <Text style={{ marginTop: 8, textAlign: 'center', color: '#b00020' }}>
                    Nenhuma oferta disponível no momento. Por favor, tente novamente mais tarde.
                </Text>
            )}
        </>
    )
}