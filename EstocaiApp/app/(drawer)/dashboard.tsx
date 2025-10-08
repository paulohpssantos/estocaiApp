import { View, Text, StyleSheet } from 'react-native';
import { Provider as PaperProvider, Button } from 'react-native-paper';

export default function Dashboard() {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>🏠 Dashboard</Text>
        <Button mode="contained" onPress={() => console.log('Material Button Pressed!')} style={{ marginTop: 20 }}>
          Material Button
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
});
