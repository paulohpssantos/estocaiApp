import { UpdatePlanoRequest } from '@/src/models/usuario';
import metaService from '@/src/services/metaService';
import revenuecatService from '@/src/services/revenuecatService';
import { atualizarPlanoUsuario } from "@/src/services/usuarioService";
import { salvarUsuarioAtualizado } from "@/src/utils/plano";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { Button } from "react-native-paper";
import type { PurchasesStoreProduct } from "react-native-purchases";
import globalStyles from "../constants/globalStyles";


export const productIdMap: Record<string, string> = {
    // Use `||` to fallback when env var is falsy (empty string) as well as undefined
    mensal: process.env.IAP_PRODUCT_MENSAL || 'plano_mensal_v2',
    semestral: process.env.IAP_PRODUCT_SEMESTRAL || 'plano_semestral_v2',
    anual: process.env.IAP_PRODUCT_ANUAL || 'plano_anual_v2',
};

export default function CheckoutForm({ amount, cpf, plano }: { amount: number; cpf?: string; plano?: string }) {

    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<PurchasesStoreProduct | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [productError, setProductError] = useState(false);
    const [productErrorMsg, setProductErrorMsg] = useState<string | null>(null);
    const router = useRouter();
    const productId = plano ? productIdMap[plano] : undefined;

    // Loads the store product for the selected plan. Never disables the button permanently:
    // if it fails, the user can tap again and we retry before purchasing.
    const loadProduct = useCallback(async (): Promise<PurchasesStoreProduct | null> => {
        if (!productId || Platform.OS === 'web') return null;
        setLoadingProduct(true);
        try {
            const p = await revenuecatService.getProduct(productId);
            setProduct(p);
            setProductError(!p);
            setProductErrorMsg(p ? null : `Produto "${productId}" não encontrado na loja.`);
            return p;
        } catch (e: any) {
            console.warn('[CheckoutForm] getProduct failed', e);
            setProduct(null);
            setProductError(true);
            setProductErrorMsg(e?.message ?? String(e));
            return null;
        } finally {
            setLoadingProduct(false);
        }
    }, [productId]);

    useEffect(() => {
        setProduct(null);
        setProductError(false);
        setProductErrorMsg(null);
        loadProduct();
    }, [loadProduct]);

    const handlePurchase = async () => {
        if (Platform.OS === 'web') {
            Alert.alert('Pagamento não disponível', 'Compras só são suportadas no aplicativo iOS/Android.');
            return;
        }
        if (!productId) {
            Alert.alert('Erro', 'Produto não configurado para este plano.');
            return;
        }
        if (!cpf) {
            Alert.alert('Aguarde', 'Ainda estamos carregando seus dados. Tente novamente em instantes.');
            return;
        }

        setLoading(true);
        try {
            const storeProduct = product ?? await loadProduct();
            if (!storeProduct) {
                Alert.alert(
                    'Plano indisponível',
                    'Não foi possível carregar o plano na loja. Verifique sua conexão e tente novamente.' +
                    (__DEV__ && productErrorMsg ? `\n\nDetalhe: ${productErrorMsg}` : '')
                );
                return;
            }

            try {
                await revenuecatService.purchaseStoreProduct(storeProduct);
            } catch (e: any) {
                if (revenuecatService.isUserCancelled(e)) return;
                console.error('[CheckoutForm][RevenueCat] purchase error', e);
                Alert.alert('Erro', e?.message ?? 'Falha ao concluir a compra.');
                return;
            }

            metaService.logSubscribe(amount, plano!);
            try {
                const data: UpdatePlanoRequest = { cpf, plano: plano! };
                const atualizado = await atualizarPlanoUsuario(data);
                await salvarUsuarioAtualizado(atualizado);
                router.replace('/planos/sucesso');
            } catch (e) {
                console.error('[CheckoutForm][RevenueCat] backend update error', e);
                Alert.alert('Erro', 'Compra concluída, mas falha ao atualizar o plano no servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button
                    mode="contained"
                    onPress={handlePurchase}
                    loading={loading || loadingProduct}
                    disabled={loading || loadingProduct}
                    style={[globalStyles.primaryButton, { flex: 1 }]}
                >
                    Confirmar Pagamento
                </Button>
            </View>
            {product?.priceString && (
                <Text style={{ marginTop: 8, textAlign: 'center', color: '#666' }}>{product.priceString}</Text>
            )}
            {productError && !loadingProduct && (
                <Text style={{ marginTop: 8, textAlign: 'center', color: '#b00020' }}>
                    Não foi possível carregar o plano. Toque em Confirmar Pagamento para tentar novamente.
                    {__DEV__ && productErrorMsg ? `\n(${productErrorMsg})` : ''}
                </Text>
            )}
        </View>
    )
}
