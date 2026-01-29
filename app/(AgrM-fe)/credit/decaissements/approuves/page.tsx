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
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/applications');

const ModesDecaissement = [
    { code: 'CASH', label: 'Espèces' },
    { code: 'VIREMENT', label: 'Virement Bancaire' },
    { code: 'CHEQUE', label: 'Chèque' },
    { code: 'MOBILE_MONEY', label: 'Mobile Money' }
];

export default function DecaissementsApprouvesPage() {
    const [demandes, setDemandes] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [disbursementDialog, setDisbursementDialog] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState<any>(null);
    const [disbursement, setDisbursement] = useState<any>({});
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadDemandes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDemandes':
                    const list = Array.isArray(data) ? data : data.content || [];
                    // Filter approved demandes ready for disbursement
                    setDemandes(list.filter((d: any) =>
                        d.statusCode === 'APPROUVE' ||
                        d.statusCode === 'APPROUVE_SOUS_RESERVE' ||
                        d.statusCode === 'PRET_DECAISSEMENT'
                    ));
                    break;
                case 'disburse':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Décaissement effectué avec succès', life: 3000 });
                    setDisbursementDialog(false);
                    setDisbursement({});
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

    const openDisbursementDialog = (rowData: any) => {
        setSelectedDemande(rowData);
        setDisbursement({
            applicationId: rowData.id,
            disbursementDate: new Date().toISOString(),
            amount: rowData.amountApproved || rowData.amountRequested
        });
        setDisbursementDialog(true);
    };

    const submitDisbursement = () => {
        if (!disbursement.disbursementMode) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Veuillez sélectionner un mode de décaissement', life: 3000 });
            return;
        }

        fetchData(disbursement, 'POST', `${BASE_URL}/${selectedDemande.id}/disburse`, 'disburse');
    };

    const statusBodyTemplate = (rowData: any) => {
        const colors: Record<string, string> = {
            'APPROUVE': 'success',
            'APPROUVE_SOUS_RESERVE': 'warning',
            'PRET_DECAISSEMENT': 'info'
        };
        return <Tag value={rowData.statusName || rowData.statusCode} severity={colors[rowData.statusCode] as any || 'info'} />;
    };

    const actionsBodyTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-money-bill"
                rounded
                severity="success"
                onClick={() => openDisbursementDialog(rowData)}
                tooltip="Effectuer le Décaissement"
            />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">
                <i className="pi pi-check-circle mr-2"></i>
                Demandes Approuvées - En Attente de Décaissement
            </h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const disbursementDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setDisbursementDialog(false)} />
            <Button label="Décaisser" icon="pi pi-money-bill" severity="success" onClick={submitDisbursement} loading={loading} />
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
                emptyMessage="Aucune demande approuvée en attente"
                className="p-datatable-sm"
            >
                <Column field="applicationNumber" header="N° Dossier" sortable filter />
                <Column field="clientName" header="Client" sortable filter />
                <Column field="amountApproved" header="Montant Approuvé" body={(row) => formatCurrency(row.amountApproved || row.amountRequested)} sortable />
                <Column field="durationMonths" header="Durée (mois)" sortable />
                <Column field="approvalDate" header="Date Approbation" body={(row) => formatDate(row.approvalDate)} sortable />
                <Column header="Statut" body={statusBodyTemplate} />
                <Column field="branchName" header="Agence" sortable filter />
                <Column header="Actions" body={actionsBodyTemplate} style={{ width: '100px' }} />
            </DataTable>

            <Dialog
                visible={disbursementDialog}
                header="Décaissement du Crédit"
                modal
                style={{ width: '500px' }}
                footer={disbursementDialogFooter}
                onHide={() => setDisbursementDialog(false)}
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
                                <div className="col-12 mt-2">
                                    <p className="text-500 m-0">Montant Approuvé</p>
                                    <p className="font-bold text-xl text-green-600 m-0">{formatCurrency(selectedDemande.amountApproved || selectedDemande.amountRequested)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="disbursementDate" className="font-semibold">Date de Décaissement *</label>
                            <Calendar
                                id="disbursementDate"
                                value={disbursement.disbursementDate ? new Date(disbursement.disbursementDate) : new Date()}
                                onChange={(e) => setDisbursement({ ...disbursement, disbursementDate: (e.value as Date)?.toISOString() })}
                                className="w-full"
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="disbursementMode" className="font-semibold">Mode de Décaissement *</label>
                            <Dropdown
                                id="disbursementMode"
                                value={disbursement.disbursementMode}
                                options={ModesDecaissement}
                                onChange={(e) => setDisbursement({ ...disbursement, disbursementMode: e.value })}
                                optionLabel="label"
                                optionValue="code"
                                placeholder="Sélectionner un mode"
                                className="w-full"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="reference" className="font-semibold">Référence de Paiement</label>
                            <InputText
                                id="reference"
                                value={disbursement.reference || ''}
                                onChange={(e) => setDisbursement({ ...disbursement, reference: e.target.value })}
                                className="w-full"
                                placeholder="N° chèque, référence virement..."
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="notes" className="font-semibold">Notes</label>
                            <InputTextarea
                                id="notes"
                                value={disbursement.notes || ''}
                                onChange={(e) => setDisbursement({ ...disbursement, notes: e.target.value })}
                                className="w-full"
                                rows={2}
                                placeholder="Notes optionnelles..."
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
