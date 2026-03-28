'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice } from '../types';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';

const GrandLivreReport: React.FC = () => {
    const toast = useRef<Toast>(null);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [loading, setLoading] = useState(false);

    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);
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
        const d = new Date(value);
        return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    };

    const toIso = (d: Date | null) => {
        if (!d) return '';
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleGenerate = async () => {
        if (!currentExercice) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucun exercice sélectionné', life: 3000 });
            return;
        }
        if (!dateDebut || !dateFin) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner les dates de début et de fin', life: 3000 });
            return;
        }

        setLoading(true);
        try {
            const token = Cookies.get('token');
            const params = new URLSearchParams();
            params.append('exerciceId', currentExercice.exerciceId);
            params.append('dateDebut', toIso(dateDebut));
            params.append('dateFin', toIso(dateFin));
            if (compteDebut) params.append('compteDebut', compteDebut);
            if (compteFin) params.append('compteFin', compteFin);

            const response = await fetch(buildApiUrl(`/api/comptability/reports/grand-livre?${params.toString()}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erreur lors de la génération du rapport');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'grand_livre.pdf';
            a.click();
            window.URL.revokeObjectURL(url);

            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rapport Grand Livre généré avec succès', life: 3000 });
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
                <h5><i className="pi pi-book mr-2"></i>Grand Livre</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateDebut">Date Début</label>
                        <Calendar id="dateDebut" value={dateDebut} onChange={(e) => setDateDebut(e.value as Date | null)}
                            dateFormat="dd/mm/yy" showIcon placeholder="Sélectionner une date" className="w-full" />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateFin">Date Fin</label>
                        <Calendar id="dateFin" value={dateFin} onChange={(e) => setDateFin(e.value as Date | null)}
                            dateFormat="dd/mm/yy" showIcon placeholder="Sélectionner une date" className="w-full" />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="compteDebut">Compte Début</label>
                        <InputText id="compteDebut" value={compteDebut} onChange={(e) => setCompteDebut(e.target.value)}
                            placeholder="Ex: 100000" />
                    </div>
                    <div className="field col-12 md:col-3">
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

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['ACCOUNTING_REPORT_VIEW']}>
            <GrandLivreReport />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
