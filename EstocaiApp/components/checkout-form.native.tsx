import { UpdatePlanoRequest } from '@/src/models/usuario';
import { atualizarPlanoUsuario } from "@/src/services/usuarioService";
import { useStripe } from "@stripe/stripe-react-native";
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { Button } from "react-native-paper";
import globalStyles from "../constants/globalStyles";


async function fetchPaymentSheetParams(amount: number): Promise<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
}> {
    return fetch(`/api/payment-sheet`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
    }).then((res) => res.json());

}

export default function CheckoutForm({ amount, cpf, plano }: { amount: number; cpf?: string; plano?: string }) {

    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const initializePaymentSheet = async () => {
        const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams(amount);

        const { error } = await initPaymentSheet({
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
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            if (error.code === 'Canceled') {
                setLoading(false);
                return;
            }
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            Alert.alert('Sucesso', 'Seu pedido foi confirmado!');

            //envia atualização do usuário para o servidor
            const data: UpdatePlanoRequest = {
                cpf: cpf!,
                plano: plano!,
            };
            await atualizarPlanoUsuario(data);

            //redireciona para a tela inicial
            setTimeout(() => {
                //redireciona para a tela inicial
                 router.replace('/(auth)/login');
            }, 100);   
            setLoading(false);
        }
    }

    return (
        <>
            <Button mode="contained" onPress={initializePaymentSheet} style={[globalStyles.primaryButton, { flex: 1 }]}>
                Confirmar Pagamento
            </Button>
            {/* <Button mode="contained" onPress={openPaymentSheet} style={[globalStyles.primaryButton, { flex: 1 }]}>
                Abrir Pagamento
            </Button> */}
        </>

    )
}