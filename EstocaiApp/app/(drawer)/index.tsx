
import { Usuario } from '@/src/models/usuario';
import { parseDateString } from "@/src/utils/formatters";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const loadAndRedirect = async () => {
      try {
        const usuarioString = await AsyncStorage.getItem("usuario");
        if (!usuarioString) {
          // sem usuário -> mantém comportamento anterior
          router.replace("/(drawer)/dashboard");
          return;
        }

        const usuario = JSON.parse(usuarioString) as Usuario;

        let referenceDate: Date = new Date();
        if (usuario?.ultimoAcesso) {
          const parsed = parseDateString(usuario.ultimoAcesso);
          if (parsed) {
            referenceDate = parsed;
          } else {
            const alt = new Date(usuario.ultimoAcesso);
            if (!isNaN(alt.getTime())) referenceDate = alt;
          }
        }

        // normaliza hoje meia-noite
        const hojeMid = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

        const expDate = parseDateString(usuario?.dataExpiracao);
        if (expDate) {
          const expMid = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
          // se a data atual for maior que a dataExpiracao -> abrir planos (conforme solicitado)
          if (hojeMid.getTime() > expMid.getTime()) {
            router.replace("/planos?expired=true");
            return;
          }
        }

        // caso contrário, vai para dashboard
        router.replace("/(drawer)/dashboard");
      } catch (e) {
        console.warn("Erro ao carregar usuário do AsyncStorage", e);
        router.replace("/(drawer)/dashboard");
      }
    };

    loadAndRedirect();
  }, [router]);

  // enquanto a navegação é processada, não renderiza nada aqui
  return null;
}
