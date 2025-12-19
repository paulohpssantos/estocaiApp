import { UpdatePlanoRequest } from '@/src/models/usuario';
import { fetchPaymentSheetParams } from "@/src/services/stripeService";
import { atualizarPlanoUsuario } from "@/src/services/usuarioService";
import { useStripe } from "@stripe/stripe-react-native";
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { Button } from "react-native-paper";
import globalStyles from "../constants/globalStyles";


export default function CheckoutForm({ amount, cpf, plano }: { amount: number; cpf?: string; plano?: string }) {

    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const initializedRef = useRef(false);

    

    const initializePaymentSheet = async () => {
        try {

            if (initializedRef.current) {
                console.log('[CheckoutForm] initPaymentSheet already initialized');
                return;
            }
            initializedRef.current = true;

            const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams(amount);

           
            console.log('[CheckoutForm] params', { paymentIntent, ephemeralKey, customer });
            if (!paymentIntent || !ephemeralKey || !customer) {
                Alert.alert('Erro', 'Parâmetros de pagamento inválidos.');
                console.error('[CheckoutForm] invalid params', { paymentIntent, ephemeralKey, customer });
                return;
            }

            try {

                //const returnUrl = Linking.createURL('stripe-redirect');
                const returnUrl = Linking.createURL('payment-complete', {
                    scheme: 'estocaiapp',
                });
                console.log('[CheckoutForm] returnURL forced', returnUrl);


                // captura throws nativos
                const result = await initPaymentSheet({
                    customerId: customer,
                    customerEphemeralKeySecret: ephemeralKey,
                    paymentIntentClientSecret: paymentIntent,
                    merchantDisplayName: 'Expo, Inc',
                    allowsDelayedPaymentMethods: true,
                    returnURL: returnUrl,
                    applePay: Platform.OS === 'ios'
                        ? { merchantCountryCode: 'BR' }
                        : undefined,
                });


                console.log('[CheckoutForm] initResult', result);
                if (result?.error) {
                    Alert.alert('InitPaymentSheet error', result.error.message ?? JSON.stringify(result.error));
                    console.error('[CheckoutForm] initPaymentSheet error object', result.error);
                    return;
                }
            } catch (err) {
                console.error('[CheckoutForm] initPaymentSheet threw', err);
                Alert.alert('Erro nativo', (err as any)?.message ?? JSON.stringify(err));
                return;
            }

            setLoading(true);
            openPaymentSheet();
            

        } catch (e: any) {
            initializedRef.current = false;
            console.error('[CheckoutForm] initializePaymentSheet error', e);
            Alert.alert('Erro', e?.message ?? 'Falha ao iniciar o pagamento');
        }
    };

    const openPaymentSheet = async () => {
        try { 


            const { error } = await presentPaymentSheet();


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