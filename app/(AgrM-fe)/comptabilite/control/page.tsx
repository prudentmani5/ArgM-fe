'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import useConsumApi from '@/hooks/fetchData/useConsumApi';
import CptControlForm from './CptControlForm';
import { CptEcriture } from '../ecriture/CptEcriture';
import { CptExercice } from '../exercice/CptExercice';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/utils/apiConfig';



const CptControlComponent: React.FC = () => {

    const toast = useRef<Toast>(null);

    const [ecritures, setEcritures] = useState<CptEcriture[]>([]);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const { data, fetchData, callType, error } = useConsumApi('');

    const showToast = (severity: 'success' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    }
    // 🔥  Chargement automatique au démarrage
    useEffect(() => {
        const savedExercice: any = Cookies.get('currentExercice');

        if (savedExercice) {
            const exercice = JSON.parse(savedExercice);
            setCurrentExercice(exercice);
            console.log("Exercice === " + currentExercice?.codeExercice);
        }

    }, []);

    // 🔥  Réception des données de l’API
    useEffect(() => {
        if (callType === 'loadUnbalanced' && data) {
            if (Array.isArray(data)) setEcritures(data);
        }

        if (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: error.message,
                life: 3000
            });
        }
    }, [data, error]);

    // 🔥 Appel backend pour récupérer les écritures non équilibrées
    const loadEcrituresNonEquilibrees = () => {

        const baseUrl = `${API_BASE_URL}/ecritures/unbalanced`;
        let params: string[] = [];
        if (!currentExercice) {
            showToast('warn', 'Exercice manquant', `Veuillez préciser l'exercice`);
            return;
        }

        params.push(`exercice=${encodeURIComponent(currentExercice.exerciceId)}`);
        const url = baseUrl + (params.length > 0 ? '?' + params.join('&') : '');
        fetchData(
            null,
            'GET',
            url,
            'loadUnbalanced'
        );

    };

    // Format date
    const formatDate = (value: string) => {
        if (!value) return '';
        const d = new Date(value);
        return d.toLocaleDateString('fr-FR');
    };

    return (
        <div className="card p-3">

            <Toast ref={toast} />

            {/* Le formulaire simple */}
            <CptControlForm
                handleChargement={loadEcrituresNonEquilibrees}
            />

            {/* La table */}
            <div className="card mt-3">
                <h5>Liste des pièces non équilibrées</h5>

                <DataTable
                    value={ecritures}
                    stripedRows
                    showGridlines
                    scrollable
                    scrollHeight="450px"
                    emptyMessage="Aucune donnée trouvéé."
                    size="small"
                >
                    <Column field="pieceId" header="Pièce" style={{ width: '100px' }} />
                    <Column field="numeroPiece" header="N° Pièce" style={{ width: '70px' }} />
                    <Column field="reference" header="Ref Pièce" style={{ width: '50px' }} />
                    <Column field="brouillardId" header="Brouillard" style={{ width: '120px' }} />
                    <Column field="codeCompte" header="Compte" style={{ width: '80px' }} />
                    <Column field="libelle" header="Libellé" style={{ width: '300px' }} />
                    <Column
                        field="dateEcriture"
                        header="Date"
                        body={(row) => formatDate(row.dateEcriture)}
                        style={{ width: '80px' }}
                    />
                    <Column field="soldeCompte" header="Solde" style={{ width: '100px', textAlign: 'right' }} body={(rowData) => rowData.debit ? rowData.debit.toLocaleString('fr-FR') : '0'} />
                 </DataTable>
            </div>

        </div>
    );
};

export default CptControlComponent;
