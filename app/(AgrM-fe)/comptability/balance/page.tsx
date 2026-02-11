'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice } from '../types';
import Cookies from 'js-cookie';

const typeOptions = [
    { label: 'Générale', value: 'G' },
    { label: 'Auxiliaire', value: 'A' },
    { label: 'Âgée', value: 'AG' }
];

const BalanceReport: React.FC = () => {
    const toast = useRef<Toast>(null);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [loading, setLoading] = useState(false);

    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [type, setType] = useState('G');
    const [compteDebut, setCompteDebut] = useState('');
    const [compteFin, setCompteFin] = useState('');

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
        const date = new Date(value);
        return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
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
        if (!dateDebut || !dateFin) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez saisir les dates de début et de fin', life: 3000 });
            return;
        }

        setLoading(true);
        try {
            const token = Cookies.get('token');
            const params = new URLSearchParams();
            params.append('exerciceId', currentExercice.exerciceId);
            params.append('dateDebut', convertDate(dateDebut));
            params.append('dateFin', convertDate(dateFin));
            params.append('type', type);
            if (compteDebut) params.append('compteDebut', compteDebut);
            if (compteFin) params.append('compteFin', compteFin);

            const response = await fetch(buildApiUrl(`/api/comptability/reports/balance?${params.toString()}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erreur lors de la génération du rapport');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'balance.pdf';
            a.click();
            window.URL.revokeObjectURL(url);

            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rapport Balance généré avec succès', life: 3000 });
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
                <h5><i className="pi pi-chart-bar mr-2"></i>Balance</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateDebut">Date Début</label>
                        <InputMask id="dateDebut" mask="99/99/9999" value={dateDebut} placeholder="jj/mm/aaaa"
                            onChange={(e) => setDateDebut(e.target.value || '')} />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateFin">Date Fin</label>
                        <InputMask id="dateFin" mask="99/99/9999" value={dateFin} placeholder="jj/mm/aaaa"
                            onChange={(e) => setDateFin(e.target.value || '')} />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label htmlFor="type">Type</label>
                        <Dropdown id="type" value={type} options={typeOptions} onChange={(e) => setType(e.value)}
                            placeholder="Sélectionner" className="w-full" />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label htmlFor="compteDebut">Compte Début</label>
                        <InputText id="compteDebut" value={compteDebut} onChange={(e) => setCompteDebut(e.target.value)}
                            placeholder="Ex: 100000" />
                    </div>
                    <div className="field col-12 md:col-2">
                        <label htmlFor="compteFin">Compte Fin</label>
                        <InputText id="compteFin" value={compteFin} onChange={(e) => setCompteFin(e.target.value)}
                            placeholder="Ex: 999999" />
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

export default BalanceReport;
