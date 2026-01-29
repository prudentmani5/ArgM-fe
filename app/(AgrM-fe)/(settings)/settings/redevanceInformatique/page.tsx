'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { RedevanceInformatique } from './RedevanceInformatique';
import { API_BASE_URL } from '@/utils/apiConfig';

function RedevanceInformatiqueComponent() {
    const [redevance, setRedevance] = useState<RedevanceInformatique>(new RedevanceInformatique());
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const { data, loading: apiLoading, error, fetchData, callType } = useConsumApi('');

    const BASE_URL = `${API_BASE_URL}/redevance-informatique`;

    useEffect(() => {
        loadRedevance();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadRedevance') {
                setRedevance(data);
            } else if (callType === 'updateRedevance') {
                setRedevance(data);
                showToast('success', 'Succès', 'Le montant de la redevance informatique a été mis à jour avec succès.');
                setLoading(false);
            }
        }

        if (error) {
            showToast('error', 'Erreur', 'Une erreur s\'est produite lors de l\'opération.');
            setLoading(false);
        }
    }, [data, error, callType]);

    const loadRedevance = () => {
        fetchData(null, 'GET', BASE_URL, 'loadRedevance');
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        setRedevance(prev => ({
            ...prev,
            montant: e.value || 0
        }));
    };

    const handleUpdate = () => {
        if (redevance.montant < 0) {
            showToast('warn', 'Attention', 'Le montant ne peut pas être négatif.');
            return;
        }

        setLoading(true);
        fetchData(null, 'PUT', `${BASE_URL}/update?montant=${redevance.montant}`, 'updateRedevance');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR').format(amount);
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="grid">
                <div className="col-12">
                    <Card title="Redevance Informatique">
                        <p className="mb-4 text-color-secondary">
                            Gérer le montant de la redevance informatique.
                        </p>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label htmlFor="montant" className="font-bold">
                                    Montant de la Redevance Informatique *
                                </label>
                                <InputNumber
                                    id="montant"
                                    name="montant"
                                    value={redevance.montant}
                                    onValueChange={handleNumberChange}
                                    mode="currency"
                                    currency="FBU"
                                    locale="fr-FR"
                                    minFractionDigits={0}
                                    min={0}
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label className="font-bold">Montant Actuel</label>
                                <div className="mt-2 p-3 surface-100 border-round">
                                    <span className="text-2xl font-bold text-primary">
                                        {formatCurrency(redevance.montant)} FBU
                                    </span>
                                </div>
                            </div>

                            <div className="field col-12">
                                <Button
                                    label="Mettre à jour"
                                    icon="pi pi-check"
                                    loading={loading || apiLoading}
                                    onClick={handleUpdate}
                                    className="w-full md:w-auto"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

export default RedevanceInformatiqueComponent;
