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
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import Cookies from 'js-cookie';

const BASE_URL = buildApiUrl('/api/credit/applications');
const DISBURSEMENT_URL = buildApiUrl('/api/credit/disbursements');
const SAVINGS_ACCOUNTS_URL = buildApiUrl('/api/savings-accounts');

const ModesDecaissement = [
    { code: 'ESPECES', label: 'Espèces' },
    { code: 'VIREMENT', label: 'Virement Bancaire' },
    { code: 'CHEQUE', label: 'Chèque' },
    { code: 'MOBILE_MONEY', label: 'Mobile Money' },
    { code: 'COMPTE_EPARGNE', label: 'Versement sur Compte Épargne' }
];

export default function DecaissementsApprouvesPage() {
    const [demandes, setDemandes] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [disbursementDialog, setDisbursementDialog] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState<any>(null);
    const [disbursement, setDisbursement] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadDemandes();
        loadSavingsAccounts();
    }, []);

    // Load savings accounts to map account numbers
    const loadSavingsAccounts = async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${SAVINGS_ACCOUNTS_URL}/findallactive`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include'
            });
            if (response.ok) {
                const accountsData = await response.json();
                setSavingsAccounts(Array.isArray(accountsData) ? accountsData : accountsData?.content || []);
            }
        } catch (err) {
            console.error('Error loading savings accounts:', err);
        }
    };

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDemandes':
                    const list = Array.isArray(data) ? data : data.content || [];
                    // Filter approved demandes ready for disbursement
                    const approvedStatuses = [
                        'APPROVED',
                        'APPROVED_CONDITIONS',
                        'APPROUVE',
                        'APPROUVE_SOUS_RESERVE',
                        'APPROUVE_MONTANT_REDUIT',
                        'PRET_DECAISSEMENT',
                        'READY_DISBURSEMENT'
                    ];
                    const filtered = list.filter((d: any) =>
                        approvedStatuses.includes(d.status?.code)
                    );
                    // Enrich with account numbers if available
                    if (savingsAccounts.length > 0) {
                        const enriched = filtered.map((d: any) => ({
                            ...d,
                            accountNumber: savingsAccounts.find(a => a.id === d.savingsAccountId)?.accountNumber || '-'
                        }));
                        setDemandes(enriched);
                    } else {
                        setDemandes(filtered);
                    }
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    }, [data, error, callType, savingsAccounts]);

    // Re-enrich demandes when savings accounts load
    useEffect(() => {
        if (savingsAccounts.length > 0 && demandes.length > 0) {
            const enriched = demandes.map((d: any) => ({
                ...d,
                accountNumber: savingsAccounts.find(a => a.id === d.savingsAccountId)?.accountNumber || '-'
            }));
            // Only update if account numbers have changed
            const hasChanges = enriched.some((e: any, i: number) => e.accountNumber !== demandes[i]?.accountNumber);
            if (hasChanges) {
                setDemandes(enriched);
            }
        }
    }, [savingsAccounts]);

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
            amount: rowData.amountApproved || rowData.amountRequested,
            targetSavingsAccountId: rowData.savingsAccountId || null
        });
        setDisbursementDialog(true);
    };

    const submitDisbursement = async () => {
        if (!disbursement.disbursementMode) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Veuillez sélectionner un mode de décaissement', life: 3000 });
            return;
        }

        // Validate that the application has a linked savings account for COMPTE_EPARGNE mode
        if (disbursement.disbursementMode === 'COMPTE_EPARGNE' && !selectedDemande?.savingsAccountId) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Ce client n\'a pas de compte épargne lié à cette demande', life: 3000 });
            return;
        }

        setSubmitting(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${DISBURSEMENT_URL}/disburse/${selectedDemande.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify({
                    applicationId: disbursement.applicationId,
                    disbursementDate: disbursement.disbursementDate,
                    amount: disbursement.amount,
                    disbursementModeCode: disbursement.disbursementMode,
                    reference: disbursement.reference,
                    notes: disbursement.notes,
                    targetSavingsAccountId: disbursement.disbursementMode === 'COMPTE_EPARGNE' ? disbursement.targetSavingsAccountId : null,
                    userAction: getUserAction()
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erreur lors du décaissement');
            }

            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Décaissement effectué avec succès', life: 3000 });
            setDisbursementDialog(false);
            setDisbursement({});
            loadDemandes();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: err.message || 'Erreur lors du décaissement', life: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    const clientBodyTemplate = (rowData: any) => {
        const client = rowData.client;
        return client ? `${client.firstName} ${client.lastName}` : '-';
    };

    const accountNumberBodyTemplate = (rowData: any) => {
        // Use the enriched accountNumber field, or look it up from savingsAccounts
        if (rowData.accountNumber && rowData.accountNumber !== '-') {
            return rowData.accountNumber;
        }
        const account = savingsAccounts.find(a => a.id === rowData.savingsAccountId);
        return account?.accountNumber || '-';
    };

    const statusBodyTemplate = (rowData: any) => {
        const status = rowData.status;
        return status ? (
            <Tag value={status.nameFr || status.name} style={{ backgroundColor: status.color || '#22c55e' }} />
        ) : (
            <Tag value="-" severity="info" />
        );
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
            <Button label="Décaisser" icon="pi pi-money-bill" severity="success" onClick={submitDisbursement} loading={submitting} />
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
                sortField="applicationDate"
                sortOrder={-1}
            >
                <Column field="applicationNumber" header="N° Dossier" sortable filter />
                <Column header="Client" body={clientBodyTemplate} sortable filter />
                <Column header="N° Compte" body={accountNumberBodyTemplate} sortable filter />
                <Column field="amountApproved" header="Montant Approuvé" body={(row) => formatCurrency(row.amountApproved || row.amountRequested)} sortable />
                <Column field="durationMonths" header="Durée (mois)" sortable />
                <Column field="applicationDate" header="Date Demande" body={(row) => formatDate(row.applicationDate)} sortable />
                <Column header="Statut" body={statusBodyTemplate} />
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
                                    <p className="font-bold m-0">
                                        {selectedDemande.client ?
                                            `${selectedDemande.client.firstName} ${selectedDemande.client.lastName}` :
                                            '-'}
                                    </p>
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
                                onChange={(e) => setDisbursement({ ...disbursement, disbursementMode: e.value, targetSavingsAccountId: e.value === 'COMPTE_EPARGNE' ? (selectedDemande?.savingsAccountId || null) : null })}
                                optionLabel="label"
                                optionValue="code"
                                placeholder="Sélectionner un mode"
                                className="w-full"
                            />
                        </div>

                        {disbursement.disbursementMode === 'COMPTE_EPARGNE' && (
                            <div className="field">
                                <label className="font-semibold">Compte Épargne Destinataire</label>
                                {selectedDemande?.savingsAccountId ? (
                                    <div className="surface-100 p-3 border-round">
                                        <div className="flex justify-content-between align-items-center">
                                            <div>
                                                <i className="pi pi-wallet mr-2 text-primary"></i>
                                                <span className="font-semibold">
                                                    {savingsAccounts.find(a => a.id === selectedDemande.savingsAccountId)?.accountNumber || `Compte #${selectedDemande.savingsAccountId}`}
                                                </span>
                                            </div>
                                            <Tag value="Compte lié" severity="success" />
                                        </div>
                                        <small className="text-500 block mt-2">
                                            Le montant sera versé automatiquement sur ce compte épargne
                                        </small>
                                    </div>
                                ) : (
                                    <div className="surface-100 p-3 border-round border-1 border-red-300">
                                        <i className="pi pi-exclamation-triangle text-red-500 mr-2"></i>
                                        <span className="text-red-600">Ce client n'a pas de compte épargne lié à cette demande</span>
                                    </div>
                                )}
                            </div>
                        )}

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
