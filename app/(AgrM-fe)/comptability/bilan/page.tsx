'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice } from '../types';
import Cookies from 'js-cookie';

const typeOptions = [
    { label: 'Détaillé', value: 'D' },
    { label: 'Synthétique', value: 'S' }
];

const BilanReport: React.FC = () => {
    const toast = useRef<Toast>(null);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState('');
    const [type, setType] = useState('D');

    useEffect(() => {
        const saved = Cookies.get('currentExercice');
        if (saved) {
            try {
                setCurrentExercice(JSON.parse(saved));
            } catch {}
        }
    }, []);

    const formatDate = (value: string) => {
        if (!value) return '';
        const d = new Date(value);
        return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    };

    const convertDate = (ddmmyyyy: string) => {
        if (!ddmmyyyy) return '';
        const [dd, mm, yyyy] = ddmmyyyy.split('/');
        return yyyy && mm && dd ? `${yyyy}-${mm}-${dd}` : '';
    };

    const handleGenerate = async () => {
        if (!currentExercice) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucun exercice sélectionné', life: 3000 });
            return;
        }
        if (!date) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez saisir la date', life: 3000 });
            return;
        }

        setLoading(true);
        try {
            const token = Cookies.get('token');
            const params = new URLSearchParams();
            params.append('exerciceId', currentExercice.exerciceId);
            params.append('date', convertDate(date));
            params.append('type', type);

            const response = await fetch(buildApiUrl(`/api/comptability/reports/bilan?${params.toString()}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erreur lors de la génération du rapport');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bilan.pdf';
            a.click();
            window.URL.revokeObjectURL(url);

            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rapport Bilan généré avec succès', life: 3000 });
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.message, life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-3 mt-2">
            <Toast ref={toast} />

            {/* Exercice banner */}
            <div className="card mb-3" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #2196F3' }}>
                <div className="flex align-items-center justify-content-between p-3">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-calendar text-2xl text-primary"></i>
                        <div>
                            <div className="font-bold text-lg">
                                {currentExercice ? (
                                    <>Exercice: <span className="text-primary">{currentExercice.codeExercice}</span></>
                                ) : (
                                    <span className="text-orange-500">Aucun exercice sélectionné</span>
                                )}
                            </div>
                            {currentExercice && (
                                <div className="text-sm text-600">
                                    {currentExercice.description} - Du {formatDate(currentExercice.dateDebut)} au {formatDate(currentExercice.dateFin)}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button icon="pi pi-refresh" label="Actualiser" size="small" outlined onClick={() => {
                        const saved = Cookies.get('currentExercice');
                        if (saved) {
                            try { setCurrentExercice(JSON.parse(saved)); } catch {}
                        }
                    }} />
                </div>
            </div>

            {/* Report form */}
            <div className="card p-fluid">
                <h5><i className="pi pi-chart-pie mr-2"></i>Bilan</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="date">Date</label>
                        <InputMask id="date" mask="99/99/9999" value={date} placeholder="jj/mm/aaaa"
                            onChange={(e) => setDate(e.target.value || '')} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="type">Type</label>
                        <Dropdown id="type" value={type} options={typeOptions} onChange={(e) => setType(e.value)}
                            placeholder="Sélectionner" className="w-full" />
                    </div>
                </div>
                <div className="flex justify-content-end mt-3">
                    <Button icon="pi pi-file-pdf" label="Générer" onClick={handleGenerate} loading={loading}
                        severity="success" />
                </div>
            </div>
        </div>
    );
};

export default BilanReport;
