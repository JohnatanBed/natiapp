import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { historyStyles } from "../styles/HistoryStyles";
import { apiService } from "../services/ApiService";

interface HistoryScreenProps {
    phoneNumber: string;
    onBack: () => void;
}

interface AmountHistory {
    id_amount: number;
    money: number;
    registeredAt: string;
    screenshot?: string;
}

const HistoryScreen = ({ phoneNumber, onBack }: HistoryScreenProps) => {
    const [history, setHistory] = useState<AmountHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Asume que el endpoint devuelve { success, data: [...] }
                const res = await apiService.get<{ success: boolean; data: AmountHistory[] }>(`/amounts/me`);
                setHistory(res.data || []);
            } catch (error) {
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [phoneNumber]);

    return (
        <ScrollView
            style={historyStyles.container}
            contentContainerStyle={historyStyles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
        >
            <View style={historyStyles.header}>
                <Text style={historyStyles.title}>Historial de aportes</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 30 }} />
            ) : history.length === 0 ? (
                <Text style={historyStyles.noHistoryText}>No tienes aportes registrados.</Text>
            ) : (
                history.map(item => (
                    <View key={item.id_amount} style={historyStyles.historyItem}>
                        <Text style={historyStyles.amountText}>
                            Aporte: ${Number(item.money).toLocaleString('es-CO')}
                        </Text>
                        <Text style={historyStyles.dateText}>
                            Fecha: {new Date(item.registeredAt).toLocaleString('es-CO')}
                        </Text>
                        {item.screenshot && (
                            <Text style={historyStyles.screenshotText}>📎 Comprobante adjunto</Text>
                        )}
                    </View>
                ))
            )}

            <TouchableOpacity onPress={onBack} style={historyStyles.backButton}>
                <Text style={historyStyles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default HistoryScreen;