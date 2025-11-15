import React, { useState, useEffect } from "react";
import { ScrollView, View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { loanStyles } from "../styles/LoanScreen";
import { apiService } from "../services/ApiService";

interface LoanScreenProps {
    phoneNumber: string;
    onBack: () => void;
    handleDelete: (id: number) => void;
}

interface Evaluation {
    viable: boolean;
    maxLoan: number;
    ratio: number;
    reason: string;
}

const LoanScreen = ({ phoneNumber, onBack }: LoanScreenProps) => {
    const [message, setMessage] = useState('');
    const [loan, setLoan] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [myLoans, setMyLoans] = useState<Array<{
        request_date: any; id_loan: number; amount: number; status: string; created_at?: string
    }>>([]);
    const estadoEnEspañol = (estado: string) => {
        switch (estado) {
            case 'pending': return 'Pendiente';
            case 'approved': return 'Aprobado';
            case 'rejected': return 'Rechazado';
            default: return estado;
        }
    };

    useEffect(() => {
        const fetchTotal = async () => {
            try {
                const { total } = await apiService.get<{ success: boolean; message: string; total: number }>(`/amounts/me`);
                setTotalAmount(total || 0);
            } catch {
                setTotalAmount(0);
            }
        };
        fetchTotal();
        const fetchLoans = async () => {
            try {
                const res = await apiService.get<any>('/loans/me');
                if (res && res.data) setMyLoans(res.data);
                else setMyLoans([]);
            } catch (e) {
                console.error('Error fetching loans:', e);
                setMyLoans([]);
            }
        };
        fetchLoans();
    }, [phoneNumber]);

    const evaluateLoanRequest = (requested: number, currentTotal: number): Evaluation => {
        const maxPercentage = 0.5;
        const minLoan = 50000;
        const hardCap = currentTotal * 0.5;
        if (currentTotal < 100000) {
            return { viable: false, maxLoan: 0, ratio: 0, reason: 'No tienes acumulado suficiente para préstamos.' };
        }
        const maxLoanByPercentage = Math.floor(currentTotal * maxPercentage);
        const maxLoan = Math.min(maxLoanByPercentage, hardCap);
        const ratio = requested / currentTotal;

        if (requested < minLoan)
            return { viable: false, maxLoan, ratio, reason: `El monto debe ser superior a $${formatCurrency(minLoan)}` };

        if (requested > hardCap)
            return { viable: false, maxLoan, ratio, reason: `El monto no debe superar los $${formatCurrency(hardCap)}` };

        if (requested > maxLoan)
            return {
                viable: false,
                maxLoan,
                ratio,
                reason: `Máximo permitido ahora: $${formatCurrency(maxLoan)} (50% de tu acumulado)`
            };

        return { viable: true, maxLoan, ratio, reason: 'Solicitud viable. Puedes continuar.' };
    };

    const formatCurrency = (n: number) =>
        n.toLocaleString('es-CO');

    const handleRequestLoan = async () => {
        if (!loan) {
            setMessage('Ingresa un monto.');
            return;
        }
        const requested = Number(loan);
        if (isNaN(requested) || requested <= 0) {
            setMessage('Monto inválido.');
            return;
        }
        const evalResult = evaluateLoanRequest(requested, totalAmount);
        setEvaluation(evalResult);
        if (!evalResult.viable) {
            setMessage(evalResult.reason);
            return;
        }

        Alert.alert(
            'Confirmar solicitud',
            `Solicitar préstamo de $${formatCurrency(requested)} ?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            await apiService.post('/loans', { amount: requested });
                            setMessage('Préstamo solicitado correctamente.');
                            setLoan('');
                            setEvaluation(null);
                            // Refresh loans list after creating a loan
                            try {
                                const resp = await apiService.get<any>('/loans/me');
                                if (resp && resp.data) setMyLoans(resp.data);
                            } catch (e) {
                                console.error('Error refreshing loans:', e);
                            }
                        } catch {
                            setMessage('Error al solicitar el préstamo.');
                        } finally {
                            setSubmitting(false);
                            setTimeout(() => setMessage(''), 3500);
                        }
                    }
                }
            ]
        );
    };

    const handleChangeLoan = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setLoan(numericValue);
        if (numericValue && totalAmount > 0) {
            const evalResult = evaluateLoanRequest(Number(numericValue), totalAmount);
            console.error(evalResult);
            setEvaluation(evalResult);
            setMessage(evalResult.reason);
        } else {
            setEvaluation(null);
            setMessage('');
        }
    };

    const displayedLoan = loan
        ? Number(loan).toLocaleString('es-CO')
        : '';

    const disabled = !loan || submitting || (evaluation ? !evaluation.viable : false);

    const handleDelete = async (id: number) => {
        try {
            setSubmitting(true);
            await apiService.delete(`/loans/${id}`);
            setMessage('Préstamo eliminado correctamente.');
            // Refresh loans list after deleting a loan
            try {
                const resp = await apiService.get<any>('/loans/me');
                if (resp && resp.data) setMyLoans(resp.data);
            } catch (e) {
                console.error('Error refreshing loans:', e);
            }
        } catch {
            setMessage('Error al eliminar el préstamo.');
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage(''), 3500);
        }
    };

    return (
        <ScrollView
            style={loanStyles.container}
            contentContainerStyle={loanStyles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
        >
            <View style={loanStyles.header}>
                <Text style={loanStyles.title}>Solicitar Préstamo</Text>
            </View>

            <View style={loanStyles.content}>
                <View style={loanStyles.formContainer}>
                    <View style={loanStyles.inputGroup}>
                        <Text style={loanStyles.label}>Monto solicitado</Text>
                        <View style={loanStyles.loanContainer}>
                            <Text style={loanStyles.currencySymbol}>$</Text>
                            <TextInput
                                style={loanStyles.loanInput}
                                value={displayedLoan}
                                onChangeText={handleChangeLoan}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        loanStyles.requestButton,
                        disabled && loanStyles.buttonDisabled
                    ]}
                    onPress={handleRequestLoan}
                    disabled={disabled}
                >
                    <Text style={loanStyles.requestButtonText}>
                        {submitting ? 'Enviando...' : 'Solicitar'}
                    </Text>
                </TouchableOpacity>

                {message !== '' && (
                    <View
                        style={[
                            loanStyles.messageContainer,
                            evaluation
                                ? (evaluation.viable
                                    ? loanStyles.successContainer
                                    : loanStyles.errorContainer)
                                : loanStyles.infoContainer
                        ]}
                    >
                        <Text
                            style={
                                evaluation
                                    ? (evaluation.viable
                                        ? loanStyles.successText
                                        : loanStyles.errorText)
                                    : loanStyles.infoText
                            }
                        >
                            {message}
                        </Text>
                    </View>
                )}

                {/* Lista de préstamos del usuario */}
                <View style={loanStyles.loanListContainer}>
                    <Text style={loanStyles.loanListTitle}>Mis préstamos</Text>
                    {myLoans.length === 0 ? (
                        <Text style={loanStyles.noLoansText}>No hay préstamos registrados.</Text>
                    ) : (
                        myLoans.map((l) => (
                            (() => {
                                return (
                                    <View key={l.id_loan} style={loanStyles.loanItem}>
                                        <Text style={loanStyles.loanAmount}>Monto: ${Number(l.amount).toLocaleString('es-CO')}</Text>
                                        <Text style={loanStyles.loanStatus}>
                                            Estado: <Text style={[
                                                l.status === 'approved' && loanStyles.statusApproved,
                                                l.status === 'rejected' && loanStyles.statusRejected,
                                                l.status === 'pending' && loanStyles.statusPending,
                                            ]}>{estadoEnEspañol(l.status)}</Text>
                                        </Text>
                                        {(l.request_date) && (
                                            <Text style={loanStyles.loanDate}>
                                                Solicitado: {new Date(l.request_date).toLocaleString('es-CO')}
                                            </Text>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert(
                                                    "Eliminar préstamo",
                                                    "¿Estás seguro de que deseas eliminar este préstamo?",
                                                    [
                                                        {
                                                            text: "Cancelar",
                                                            style: "cancel"
                                                        },
                                                        {
                                                            text: "Eliminar",
                                                            onPress: () => handleDelete(l.id_loan)
                                                        }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Text style={loanStyles.deleteButtonText}>Eliminar</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })()
                        ))
                    )}
                </View>



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
