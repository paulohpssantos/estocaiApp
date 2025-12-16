import { UpdatePlanoRequest } from '@/src/models/usuario';
import { fetchPaymentSheetParams } from "@/src/services/stripeService";
import { atualizarPlanoUsuario } from "@/src/services/usuarioService";
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button } from "react-native-paper";
import globalStyles from "../constants/globalStyles";

// async function fetchPaymentSheetParams(amount: number): Promise<{
//     paymentIntent: string;
//     ephemeralKey: string;
//     customer: string;
// }> {
//     return fetch(`/api/payment-sheet`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ amount }),
//     }).then((res) => res.json());
// }

export default function CheckoutForm({ amount, cpf, plano }: { amount: number; cpf?: string; plano?: string }) {

    // dynamically loaded stripe api
    const [stripeApi, setStripeApi] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const mod = await import("@stripe/stripe-react-native");
                if (!mounted) return;
                // prefer named exports initPaymentSheet/presentPaymentSheet if available
                setStripeApi(mod);
            } catch (e) {
                console.warn("[CheckoutForm] failed to load stripe native module:", e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const initializePaymentSheet = async () => {
        try {

            const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams(amount);

            const initFn = stripeApi?.initPaymentSheet;
            if (typeof initFn !== "function") {
                Alert.alert("Erro", "initPaymentSheet não disponível. Verifique a versão do @stripe/stripe-react-native.");
                return;
            }

            const { error } = await initFn({
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: paymentIntent,
                merchantDisplayName: 'Expo, Inc',
                allowsDelayedPaymentMethods: true,
                returnURL: Linking.createURL('stripe-redirect'),
                applePay: {
                    merchantCountryCode: 'BR',
                },
            });

            if (!error) {
                setLoading(true);
                openPaymentSheet();
            }
        } catch (e: any) {
            console.error('[CheckoutForm] initializePaymentSheet error', e);
            Alert.alert('Erro', e?.message ?? 'Falha ao iniciar o pagamento');
        }
    };

    const openPaymentSheet = async () => {
        try {
            const presentFn = stripeApi?.presentPaymentSheet;
            if (typeof presentFn !== "function") {
                Alert.alert("Erro", "presentPaymentSheet não disponível. Verifique a versão do @stripe/stripe-react-native.");
                return;
            }

            const { error } = await presentFn();

            if (error) {
                if (error.code === 'Canceled') {
                    setLoading(false);
                    return;
                }
                Alert.alert(`Error code: ${error.code}`, error.message);
            } else {
                Alert.alert('Sucesso', 'Seu pedido foi confirmado!');

                // envia atualização do usuário para o servidor
                const data: UpdatePlanoRequest = {
                    cpf: cpf!,
                    plano: plano!,
                };
                await atualizarPlanoUsuario(data);

                // redireciona para a tela de login
                setTimeout(() => {
                    router.replace('/(auth)/login');
                }, 100);
                setLoading(false);
            }
        } catch (e: any) {
            console.error('[CheckoutForm] openPaymentSheet error', e);
            Alert.alert('Erro', e?.message ?? 'Falha ao abrir o pagamento');
            setLoading(false);
        }
    }

    return (
        <>
            <Button mode="contained" onPress={initializePaymentSheet} style={[globalStyles.primaryButton, { flex: 1 }]}>
                Confirmar Pagamento
            </Button>
        </>
    )
}