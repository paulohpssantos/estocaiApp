# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Pagamentos no app (RevenueCat / IAP)

Este projeto usa RevenueCat para gerenciar assinaturas (iOS e Android) e integra IAP quando necessário.

- Produtos e entitlements devem ser configurados no painel do RevenueCat e associados aos product IDs no App Store / Play Console.

Passos importantes para habilitar IAP no iOS

Se usar diretamente o IAP nativo, instale a dependência:

```bash
expo install expo-in-app-purchases
```

Criar os produtos (Product IDs) no App Store Connect e anotar os identificadores.
Definir as variáveis de ambiente (ex.: via EAS Secrets ou .env local):

 - `IAP_PRODUCT_MENSAL` — product id para o plano mensal
 - `IAP_PRODUCT_SEMESTRAL` — product id para o plano semestral
 - `IAP_PRODUCT_ANUAL` — product id para o plano anual

Teste: IAP deve ser testado em dispositivo físico iOS (não funciona no simulador). Use uma conta sandbox do App Store Connect.

Variáveis do RevenueCat (adicionar via EAS secrets ou app.json extra):

- `REVENUECAT_IOS_API_KEY`
- `REVENUECAT_ANDROID_API_KEY`

Segurança e recibos

- Recomendo validar recibos/assinaturas no servidor (verificação com a App Store / RevenueCat webhooks) para evitar fraudes.
- Para compras críticas, registre e verifique as transações no backend antes de provisionar o plano ao usuário.

Testes rápidos

- Android/iOS (RevenueCat/IAP): execute em dispositivo físico e use contas de teste (sandbox/TestFlight) para validar compras, restaurações e renovações.

Se quiser, posso:

- adicionar um wrapper em `src/services` para IAP (recomendado),
- atualizar scripts de build para injetar variáveis de ambiente, ou
- documentar um passo-a-passo para configurar produtos no App Store Connect.
