import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

const merchantId = Constants.expoConfig?.plugins?.find(
    (p) => p[0] === '@stripe/stripe-react-native')?.[1]?.merchantIdentifier;
if(!merchantId){
    throw new Error('Merchant Identifier not found in app config for stripe-react-native plugin');
}

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;    

export default function ExpoStripeProvider(
    props: Omit<
    React.ComponentProps<typeof StripeProvider>, 
    'publishableKey' | 'merchantIdentifier'>) {

    return <StripeProvider
        publishableKey={publishableKey}
        merchantIdentifier={merchantId}
        urlScheme={Linking.createURL('/')?.split(':')[0]}
        {...props}
    >

    </StripeProvider>
}   