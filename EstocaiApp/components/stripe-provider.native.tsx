import Constants from "expo-constants";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";

type Props = { children?: React.ReactNode; [key: string]: any };

export default function ExpoStripeProvider(props: Props) {
  const [StripeProviderComp, setStripeProviderComp] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("@stripe/stripe-react-native");
        if (!mounted) return;
        setStripeProviderComp(() => mod.StripeProvider);
      } catch (e) {
        console.warn("[StripeProvider] failed to load @stripe/stripe-react-native:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const merchantId =
    Constants.expoConfig?.plugins?.find((p: any) => p[0] === "@stripe/stripe-react-native")?.[1]
      ?.merchantIdentifier ?? undefined;

  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const urlScheme = Linking.createURL("/")?.split(":")[0] ?? undefined;

  if (!StripeProviderComp) {
    return <>{props.children}</>;
  }

  return (
    <StripeProviderComp
      publishableKey={publishableKey}
      merchantIdentifier={merchantId}
      urlScheme={urlScheme}
      {...props}
    >
      {props.children}
    </StripeProviderComp>
  );
}
