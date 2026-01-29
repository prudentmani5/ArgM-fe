'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

interface SeuilContentieux {
    id?: number;
    thresholdName?: string;
    minAmount?: number;
    maxAmount?: number;
    minDaysOverdue?: number;
    requiresDGApproval?: boolean;
    autoEscalate?: boolean;
    escalationLevel?: string;
    description?: string;
    active?: boolean;
}

class SeuilContentieuxClass implements SeuilContentieux {
    id?: number;
    thresholdName?: string = '';
    minAmount?: number = 0;
    maxAmount?: number;
    minDaysOverdue?: number = 90;
    requiresDGApproval?: boolean = false;
    autoEscalate?: boolean = false;
    escalationLevel?: string = '';
    description?: string = '';
    active?: boolean = true;
}

export default function SeuilsContentieuxPage() {
    const [seuils, setSeuils] = useState<SeuilContentieux[]>([]);
    const [seuil, setSeuil] = useState<SeuilContentieux>(new SeuilContentieuxClass());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/litigation-thresholds');

    useEffect(() => {
        loadSeuils();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setSeuils(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: isEdit ? 'Seuil modifié' : 'Seuil créé', life: 3000 });
                    loadSeuils();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Seuil supprimé', life: 3000 });
                    loadSeuils();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const loadSeuils = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setSeuil(new SeuilContentieuxClass());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: SeuilContentieux) => {
        setSeuil({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!seuil.thresholdName) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir les champs obligatoires', life: 3000 });
            return;
        }

        if (isEdit && seuil.id) {
            fetchData(seuil, 'PUT', `${BASE_URL}/update/${seuil.id}`, 'update');
        } else {
            fetchData(seuil, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const confirmDelete = (rowData: SeuilContentieux) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le seuil "${rowData.thresholdName}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSeuil(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setSeuil(prev => ({ ...prev, [name]: value }));
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const leftToolbarTemplate = () => {
        return (
            <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} />
        );
    };

    const actionBodyTemplate = (rowData: SeuilContentieux) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const activeBodyTemplate = (rowData: SeuilContentieux) => {
        return <Tag value={rowData.active ? 'Actif' : 'Inactif'} severity={rowData.active ? 'success' : 'danger'} />;
    };

    const dgApprovalBodyTemplate = (rowData: SeuilContentieux) => {
        return (
            <Tag
                value={rowData.requiresDGApproval ? 'Approbation DG' : 'Standard'}
                severity={rowData.requiresDGApproval ? 'danger' : 'secondary'}
                icon={rowData.requiresDGApproval ? 'pi pi-lock' : undefined}
            />
        );
    };

    const autoEscalateBodyTemplate = (rowData: SeuilContentieux) => {
        return <Tag value={rowData.autoEscalate ? 'Auto' : 'Manuel'} severity={rowData.autoEscalate ? 'info' : 'secondary'} />;
    };

    const amountRangeBodyTemplate = (rowData: SeuilContentieux) => {
        const min = formatCurrency(rowData.minAmount);
        const max = rowData.maxAmount ? formatCurrency(rowData.maxAmount) : '∞';
        return `${min} - ${max}`;
    };

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setDialogVisible(false)} />
            <Button label="Enregistrer" icon="pi pi-check" onClick={handleSave} loading={loading && (callType === 'create' || callType === 'update')} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="mb-4">
                <i className="pi pi-exclamation-circle mr-2"></i>
                Seuils de Contentieux
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <p className="m-0">
                    <i className="pi pi-info-circle mr-2"></i>
                    <strong>Approbation du Directeur Général:</strong>
                    <br />
                    <span className="ml-4">Requise pour tout dossier contentieux supérieur à 500 000 FBU</span>
                </p>
            </div>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={seuils}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                emptyMessage="Aucun seuil trouvé"
                stripedRows
                sortField="minAmount"
                sortOrder={1}
            >
                <Column field="thresholdName" header="Nom du Seuil" sortable />
                <Column header="Plage de Montants" body={amountRangeBodyTemplate} />
                <Column field="minDaysOverdue" header="Jours Retard Min" sortable />
                <Column field="requiresDGApproval" header="Approbation" body={dgApprovalBodyTemplate} />
                <Column field="autoEscalate" header="Escalade" body={autoEscalateBodyTemplate} />
                <Column field="escalationLevel" header="Niveau Escalade" />
                <Column field="active" header="Statut" body={activeBodyTemplate} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '10rem' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier le Seuil' : 'Nouveau Seuil de Contentieux'}
                style={{ width: '60vw' }}
                footer={dialogFooter}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="thresholdName" className="font-semibold">Nom du Seuil *</label>
                            <InputText
                                id="thresholdName"
                                name="thresholdName"
                                value={seuil.thresholdName || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Seuil DG Approbation"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="escalationLevel" className="font-semibold">Niveau d'Escalade</label>
                            <InputText
                                id="escalationLevel"
                                name="escalationLevel"
                                value={seuil.escalationLevel || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: DG, COMITE_CREDIT"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="minAmount" className="font-semibold">Montant Minimum (FBU)</label>
                            <InputNumber
                                id="minAmount"
                                value={seuil.minAmount || null}
                                onValueChange={(e) => handleNumberChange('minAmount', e.value ?? null)}
                                className="w-full"
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="maxAmount" className="font-semibold">Montant Maximum (FBU)</label>
                            <InputNumber
                                id="maxAmount"
                                value={seuil.maxAmount || null}
                                onValueChange={(e) => handleNumberChange('maxAmount', e.value ?? null)}
                                className="w-full"
                                mode="currency"
                                currency="BIF"
                                locale="fr-BI"
                            />
                            <small className="text-500">Laisser vide pour illimité</small>
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="minDaysOverdue" className="font-semibold">Jours de Retard Minimum</label>
                            <InputNumber
                                id="minDaysOverdue"
                                value={seuil.minDaysOverdue || null}
                                onValueChange={(e) => handleNumberChange('minDaysOverdue', e.value ?? null)}
                                className="w-full"
                                min={0}
                                suffix=" jours"
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="description" className="font-semibold">Description</label>
                            <InputTextarea
                                id="description"
                                name="description"
                                value={seuil.description || ''}
                                onChange={handleChange}
                                className="w-full"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="requiresDGApproval" className="font-semibold block mb-2">Approbation DG Requise</label>
                            <InputSwitch
                                id="requiresDGApproval"
                                checked={seuil.requiresDGApproval || false}
                                onChange={(e) => setSeuil(prev => ({ ...prev, requiresDGApproval: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="autoEscalate" className="font-semibold block mb-2">Escalade Automatique</label>
                            <InputSwitch
                                id="autoEscalate"
                                checked={seuil.autoEscalate || false}
                                onChange={(e) => setSeuil(prev => ({ ...prev, autoEscalate: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="active" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="active"
                                checked={seuil.active ?? true}
                                onChange={(e) => setSeuil(prev => ({ ...prev, active: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
