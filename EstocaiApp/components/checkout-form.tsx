import { Platform } from 'react-native';

let CheckoutForm: any;
if (Platform.OS === 'web') {
    CheckoutForm = require('./checkout-form.web').default;
} else {
    CheckoutForm = require('./checkout-form.native').default;
}

export default CheckoutForm;