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
    code?: string;
    name?: string;
    nameFr?: string;
    minAmount?: number;
    minDaysOverdue?: number;
    requiresDgApproval?: boolean;
    provisionRate?: number;
    expectedRecoveryRateMin?: number;
    expectedRecoveryRateMax?: number;
    description?: string;
    isActive?: boolean;
}

class SeuilContentieuxClass implements SeuilContentieux {
    id?: number;
    code?: string = '';
    name?: string = '';
    nameFr?: string = '';
    minAmount?: number = 0;
    minDaysOverdue?: number = 120;
    requiresDgApproval?: boolean = true;
    provisionRate?: number = 100;
    expectedRecoveryRateMin?: number = 30;
    expectedRecoveryRateMax?: number = 50;
    description?: string = '';
    isActive?: boolean = true;
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
        if (!seuil.code || !seuil.name || !seuil.nameFr) {
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
            message: `Êtes-vous sûr de vouloir supprimer le seuil "${rowData.nameFr || rowData.name}" ?`,
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
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const dgApprovalBodyTemplate = (rowData: SeuilContentieux) => {
        return (
            <Tag
                value={rowData.requiresDgApproval ? 'Approbation DG' : 'Standard'}
                severity={rowData.requiresDgApproval ? 'danger' : 'secondary'}
                icon={rowData.requiresDgApproval ? 'pi pi-lock' : undefined}
            />
        );
    };

    const provisionBodyTemplate = (rowData: SeuilContentieux) => {
        return rowData.provisionRate ? `${rowData.provisionRate}%` : '-';
    };

    const recoveryRateBodyTemplate = (rowData: SeuilContentieux) => {
        if (!rowData.expectedRecoveryRateMin && !rowData.expectedRecoveryRateMax) return '-';
        return `${rowData.expectedRecoveryRateMin || 0}% - ${rowData.expectedRecoveryRateMax || 0}%`;
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
                <Column field="code" header="Code" sortable />
                <Column field="nameFr" header="Nom (FR)" sortable />
                <Column field="name" header="Nom (EN)" sortable />
                <Column field="minAmount" header="Montant Min" body={(row) => formatCurrency(row.minAmount)} sortable />
                <Column field="minDaysOverdue" header="Jours Retard Min" sortable />
                <Column field="provisionRate" header="Taux Provision" body={provisionBodyTemplate} sortable />
                <Column header="Taux Récupération" body={recoveryRateBodyTemplate} />
                <Column field="requiresDgApproval" header="Approbation DG" body={dgApprovalBodyTemplate} />
                <Column field="isActive" header="Statut" body={activeBodyTemplate} />
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
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="code" className="font-semibold">Code *</label>
                            <InputText
                                id="code"
                                name="code"
                                value={seuil.code || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: SEUIL_DG"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="name" className="font-semibold">Nom (EN) *</label>
                            <InputText
                                id="name"
                                name="name"
                                value={seuil.name || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: DG Approval Threshold"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="nameFr" className="font-semibold">Nom (FR) *</label>
                            <InputText
                                id="nameFr"
                                name="nameFr"
                                value={seuil.nameFr || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Seuil Approbation DG"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="minAmount" className="font-semibold">Montant Minimum (FBU) *</label>
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

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="minDaysOverdue" className="font-semibold">Jours de Retard Minimum *</label>
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

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="provisionRate" className="font-semibold">Taux de Provision (%)</label>
                            <InputNumber
                                id="provisionRate"
                                value={seuil.provisionRate || null}
                                onValueChange={(e) => handleNumberChange('provisionRate', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                suffix="%"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="expectedRecoveryRateMin" className="font-semibold">Taux Récupération Min (%)</label>
                            <InputNumber
                                id="expectedRecoveryRateMin"
                                value={seuil.expectedRecoveryRateMin || null}
                                onValueChange={(e) => handleNumberChange('expectedRecoveryRateMin', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                suffix="%"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="expectedRecoveryRateMax" className="font-semibold">Taux Récupération Max (%)</label>
                            <InputNumber
                                id="expectedRecoveryRateMax"
                                value={seuil.expectedRecoveryRateMax || null}
                                onValueChange={(e) => handleNumberChange('expectedRecoveryRateMax', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                suffix="%"
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

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="requiresDgApproval" className="font-semibold block mb-2">Approbation DG Requise</label>
                            <InputSwitch
                                id="requiresDgApproval"
                                checked={seuil.requiresDgApproval ?? true}
                                onChange={(e) => setSeuil(prev => ({ ...prev, requiresDgApproval: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="isActive" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="isActive"
                                checked={seuil.isActive ?? true}
                                onChange={(e) => setSeuil(prev => ({ ...prev, isActive: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
