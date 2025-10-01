import React, { useState } from "react";
import { ScrollView, View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { loanStyles } from "../styles/LoanScreen";

interface LoanScreenProps {
    phoneNumber: string;
    onBack: () => void;
}

const LoanScreen = ({ phoneNumber, onBack }: LoanScreenProps) => {
    const [message, setMessage] = useState('');
    const [loan, setLoan] = useState('');

    const handleRequestLoan = async () => {
        if (!loan || loan.trim() === '') {
            Alert.alert('Error', 'Ingresa un valor para prestar...');
            return;
        }

        const loanAmount = parseFloat(loan);
        if (isNaN(loanAmount) || loanAmount <= 0) {
            setMessage('Ingresa un monto válido.');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        try {
            // Aquí conectarías con tu API
            // await apiService.requestLoan({ phoneNumber, amount: loanAmount, reason });

            setMessage('Solicitud enviada correctamente.');
            setLoan('');
        } catch (error) {
            setMessage('Error al enviar la solicitud.');
        }

        setTimeout(() => setMessage(''), 3000);
    };

    const formatNumber = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (!numericValue) return '';

        return Number(numericValue).toLocaleString('es-CO');
    }

    return (
        <ScrollView style={loanStyles.container}>
            <View style={loanStyles.header}>
                <Text style={loanStyles.title}>
                    Solicitar Préstamo
                </Text>
            </View>

            <View style={loanStyles.content}>
                <View style={loanStyles.formContainer}>
                    <View style={loanStyles.inputGroup}>
                        <Text style={loanStyles.label}>Monto solicitado</Text>
                        <View style={loanStyles.loanContainer}>
                            <Text style={loanStyles.currencySymbol}>$</Text>
                            <TextInput
                                style={loanStyles.loanInput}
                                value={formatNumber(loan)}
                                onChangeText={(text) => {
                                    const numericValue = text.replace(/[^0-9]/g, '');
                                    setLoan(numericValue);
                                }}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={loanStyles.requestButton}
                    onPress={handleRequestLoan}
                    disabled={!loan}
                >
                    <Text style={loanStyles.requestButtonText}>Solicitar</Text>
                </TouchableOpacity>

                {message !== '' && (
                    <Text style={loanStyles.message}>{message}</Text>
                )}

                {/* Aquí podrías mostrar el historial de préstamos */}
                <Text style={loanStyles.subtitle}>Historial de Préstamos</Text>
                {/* <LoanHistoryList phoneNumber={phoneNumber} /> */}

                <TouchableOpacity
                    onPress={onBack}
                    style={loanStyles.backButton}
                >
                    <Text style={loanStyles.backButtonText}>← Volver</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default LoanScreen;