import { StyleSheet } from "react-native";

export const historyStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: '#16a34a',
        padding: 20,
        paddingTop: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
        historyItem: {
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            marginTop: 12,
            marginHorizontal: 10,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
            borderWidth: 1,
            borderColor: '#e5e7eb',
        },
        amountText: {
            fontSize: 18,
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: 8,
        },
        dateText: {
            fontSize: 15,
            color: '#6b7280',
            marginBottom: 4,
        },
        screenshotText: {
            fontSize: 14,
            color: '#2563eb',
            marginBottom: 4,
        },
        noHistoryText: {
            fontSize: 16,
            color: '#6b7280',
            textAlign: 'center',
            fontStyle: 'italic',
            marginTop: 30,
        },
        backButton: {
            marginTop: 30,
            alignItems: 'center',
        },
        backButtonText: {
            color: '#16a34a',
            fontSize: 17,
            fontWeight: '600',
        },
});