'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice, CptJournal } from '../types';
import Cookies from 'js-cookie';

const EditionJournalReport: React.FC = () => {
    const toast = useRef<Toast>(null);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [loading, setLoading] = useState(false);
    const [journaux, setJournaux] = useState<CptJournal[]>([]);

    const [journalId, setJournalId] = useState('');
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');

    const { data: dataJournaux, fetchData: fetchJournaux } = useConsumApi('');

    useEffect(() => {
        const saved = Cookies.get('currentExercice');
        if (saved) {
            try {
                setCurrentExercice(JSON.parse(saved));
            } catch {}
        }
        fetchJournaux(null, 'Get', buildApiUrl('/api/comptability/journaux/findall'), 'loadJournaux');
    }, []);

    useEffect(() => {
        if (dataJournaux) {
            setJournaux(Array.isArray(dataJournaux) ? dataJournaux : [dataJournaux]);
        }
    }, [dataJournaux]);

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
        if (!journalId) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner un journal', life: 3000 });
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
            params.append('journalId', journalId);
            params.append('dateDebut', convertDate(dateDebut));
            params.append('dateFin', convertDate(dateFin));

            const response = await fetch(buildApiUrl(`/api/comptability/reports/journal?${params.toString()}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erreur lors de la génération du rapport');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edition_journal.pdf';
            a.click();
            window.URL.revokeObjectURL(url);

            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rapport Journal généré avec succès', life: 3000 });
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
                <h5><i className="pi pi-file mr-2"></i>Edition Journal</h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="journalId">Journal</label>
                        <Dropdown id="journalId" value={journalId} options={journaux} optionLabel="codeJournal"
                            optionValue="journalId" onChange={(e) => setJournalId(e.value)}
                            placeholder="Sélectionner un journal" filter showClear className="w-full"
                            itemTemplate={(option: CptJournal) => <span>{option.codeJournal} - {option.nomJournal}</span>} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="dateDebut">Date Début</label>
                        <InputMask id="dateDebut" mask="99/99/9999" value={dateDebut} placeholder="jj/mm/aaaa"
                            onChange={(e) => setDateDebut(e.target.value || '')} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="dateFin">Date Fin</label>
                        <InputMask id="dateFin" mask="99/99/9999" value={dateFin} placeholder="jj/mm/aaaa"
                            onChange={(e) => setDateFin(e.target.value || '')} />
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

export default EditionJournalReport;
