'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/applications');

const DecisionsComite = [
    { code: 'APPROUVE', label: 'Approuvé', severity: 'success' },
    { code: 'APPROUVE_SOUS_RESERVE', label: 'Approuvé sous réserve', severity: 'warning' },
    { code: 'AJOURNE', label: 'Ajourné', severity: 'info' },
    { code: 'REJETE', label: 'Rejeté', severity: 'danger' }
];

export default function ComiteDemandesPage() {
    const [demandes, setDemandes] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [decisionDialog, setDecisionDialog] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState<any>(null);
    const [decision, setDecision] = useState<any>({});
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadDemandes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDemandes':
                    const list = Array.isArray(data) ? data : data.content || [];
                    // Filter demandes that are in committee
                    setDemandes(list.filter((d: any) => d.statusCode === 'EN_COMITE'));
                    break;
                case 'submitDecision':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Décision enregistrée avec succès', life: 3000 });
                    setDecisionDialog(false);
                    setDecision({});
                    loadDemandes();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType]);

    const loadDemandes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDemandes');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const openDecisionDialog = (rowData: any) => {
        setSelectedDemande(rowData);
        setDecision({
            applicationId: rowData.id,
            amountApproved: rowData.amountRequested
        });
        setDecisionDialog(true);
    };

    const viewDossier = (rowData: any) => {
        router.push(`/credit/demandes?view=${rowData.id}`);
    };

    const submitDecision = () => {
        if (!decision.decisionCode) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Veuillez sélectionner une décision', life: 3000 });
            return;
        }

        fetchData(decision, 'POST', `${BASE_URL}/${selectedDemande.id}/decision`, 'submitDecision');
    };

    const riskLevelTemplate = (rowData: any) => {
        const colors: Record<string, string> = {
            'LOW': 'success',
            'MEDIUM': 'warning',
            'HIGH': 'danger'
        };
        return <Tag value={rowData.riskLevelName || 'Non évalué'} severity={colors[rowData.riskLevelCode] as any || 'secondary'} />;
    };

    const visitRecommendationTemplate = (rowData: any) => {
        if (!rowData.visitRecommendation) return <Tag value="En attente" severity="secondary" />;
        const colors: Record<string, string> = {
            'FAVORABLE': 'success',
            'FAVORABLE_AVEC_RESERVES': 'warning',
            'DEFAVORABLE': 'danger'
        };
        return <Tag value={rowData.visitRecommendationName || rowData.visitRecommendation} severity={colors[rowData.visitRecommendation] as any || 'info'} />;
    };

    const actionsBodyTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => viewDossier(rowData)} tooltip="Voir le Dossier" />
            <Button icon="pi pi-check-square" rounded text severity="success" onClick={() => openDecisionDialog(rowData)} tooltip="Enregistrer Décision" />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-inbox mr-2"></i>
                Demandes à Examiner par le Comité
            </h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const decisionDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setDecisionDialog(false)} />
            <Button label="Enregistrer" icon="pi pi-check" onClick={submitDecision} loading={loading} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <DataTable
                value={demandes}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                loading={loading && callType === 'loadDemandes'}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucune demande en attente d'examen"
                className="p-datatable-sm"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable filter />
                <Column field="clientName" header="Client" sortable filter />
                <Column field="amountRequested" header="Montant Demandé" body={(row) => formatCurrency(row.amountRequested)} sortable />
                <Column field="durationMonths" header="Durée (mois)" sortable />
                <Column field="applicationDate" header="Date Dépôt" body={(row) => formatDate(row.applicationDate)} sortable />
                <Column header="Niveau de Risque" body={riskLevelTemplate} />
                <Column header="Recommandation Visite" body={visitRecommendationTemplate} />
                <Column field="creditOfficerName" header="Agent de Crédit" sortable filter />
                <Column header="Actions" body={actionsBodyTemplate} style={{ width: '120px' }} />
            </DataTable>

            <Dialog
                visible={decisionDialog}
                header="Décision du Comité"
                modal
                style={{ width: '500px' }}
                footer={decisionDialogFooter}
                onHide={() => setDecisionDialog(false)}
            >
                {selectedDemande && (
                    <div>
                        <div className="surface-100 p-3 border-round mb-4">
                            <div className="grid">
                                <div className="col-6">
                                    <p className="text-500 m-0">N° Dossier</p>
                                    <p className="font-bold m-0">{selectedDemande.applicationNumber}</p>
                                </div>
                                <div className="col-6">
                                    <p className="text-500 m-0">Client</p>
                                    <p className="font-bold m-0">{selectedDemande.clientName}</p>
                                </div>
                                <div className="col-6 mt-2">
                                    <p className="text-500 m-0">Montant Demandé</p>
                                    <p className="font-bold m-0">{formatCurrency(selectedDemande.amountRequested)}</p>
                                </div>
                                <div className="col-6 mt-2">
                                    <p className="text-500 m-0">Durée</p>
                                    <p className="font-bold m-0">{selectedDemande.durationMonths} mois</p>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="decisionCode" className="font-semibold">Décision *</label>
                            <Dropdown
                                id="decisionCode"
                                value={decision.decisionCode}
                                options={DecisionsComite}
                                onChange={(e) => setDecision({ ...decision, decisionCode: e.value })}
                                optionLabel="label"
                                optionValue="code"
                                placeholder="Sélectionner une décision"
                                className="w-full"
                            />
                        </div>

                        {(decision.decisionCode === 'APPROUVE' || decision.decisionCode === 'APPROUVE_SOUS_RESERVE') && (
                            <div className="field">
                                <label htmlFor="amountApproved" className="font-semibold">Montant Approuvé</label>
                                <InputNumber
                                    id="amountApproved"
                                    value={decision.amountApproved}
                                    onValueChange={(e) => setDecision({ ...decision, amountApproved: e.value })}
                                    className="w-full"
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                    minFractionDigits={0}
                                />
                            </div>
                        )}

                        <div className="field">
                            <label htmlFor="comments" className="font-semibold">Commentaires / Motif</label>
                            <InputTextarea
                                id="comments"
                                value={decision.comments || ''}
                                onChange={(e) => setDecision({ ...decision, comments: e.target.value })}
                                className="w-full"
                                rows={3}
                                placeholder={decision.decisionCode === 'REJETE' ? 'Motif du rejet (obligatoire)...' : 'Commentaires optionnels...'}
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
