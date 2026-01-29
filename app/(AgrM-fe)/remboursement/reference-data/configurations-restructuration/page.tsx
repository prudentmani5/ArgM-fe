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

interface RestructurationConfig {
    id?: number;
    configName?: string;
    maxRestructurationsPerLoan?: number;
    restructuringFeeMinPercent?: number;
    restructuringFeeMaxPercent?: number;
    maxTermExtensionPercent?: number;
    minDaysOverdueRequired?: number;
    requiresApproval?: boolean;
    approvalLevel?: string;
    description?: string;
    active?: boolean;
}

class RestructurationConfigClass implements RestructurationConfig {
    id?: number;
    configName?: string = '';
    maxRestructurationsPerLoan?: number = 1;
    restructuringFeeMinPercent?: number = 2;
    restructuringFeeMaxPercent?: number = 5;
    maxTermExtensionPercent?: number = 50;
    minDaysOverdueRequired?: number = 30;
    requiresApproval?: boolean = true;
    approvalLevel?: string = '';
    description?: string = '';
    active?: boolean = true;
}

export default function ConfigurationsRestructurationPage() {
    const [configurations, setConfigurations] = useState<RestructurationConfig[]>([]);
    const [configuration, setConfiguration] = useState<RestructurationConfig>(new RestructurationConfigClass());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/restructuring-configurations');

    useEffect(() => {
        loadConfigurations();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setConfigurations(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: isEdit ? 'Configuration modifiée' : 'Configuration créée', life: 3000 });
                    loadConfigurations();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Configuration supprimée', life: 3000 });
                    loadConfigurations();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const loadConfigurations = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setConfiguration(new RestructurationConfigClass());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: RestructurationConfig) => {
        setConfiguration({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!configuration.configName) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir les champs obligatoires', life: 3000 });
            return;
        }

        if (isEdit && configuration.id) {
            fetchData(configuration, 'PUT', `${BASE_URL}/update/${configuration.id}`, 'update');
        } else {
            fetchData(configuration, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const confirmDelete = (rowData: RestructurationConfig) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la configuration "${rowData.configName}" ?`,
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
        setConfiguration(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setConfiguration(prev => ({ ...prev, [name]: value }));
    };

    const leftToolbarTemplate = () => {
        return (
            <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} />
        );
    };

    const actionBodyTemplate = (rowData: RestructurationConfig) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const activeBodyTemplate = (rowData: RestructurationConfig) => {
        return <Tag value={rowData.active ? 'Actif' : 'Inactif'} severity={rowData.active ? 'success' : 'danger'} />;
    };

    const approvalBodyTemplate = (rowData: RestructurationConfig) => {
        return <Tag value={rowData.requiresApproval ? 'Oui' : 'Non'} severity={rowData.requiresApproval ? 'warning' : 'secondary'} />;
    };

    const feeRangeBodyTemplate = (rowData: RestructurationConfig) => {
        return `${rowData.restructuringFeeMinPercent || 0}% - ${rowData.restructuringFeeMaxPercent || 0}%`;
    };

    const extensionBodyTemplate = (rowData: RestructurationConfig) => {
        return `Max ${rowData.maxTermExtensionPercent || 0}%`;
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
                <i className="pi pi-refresh mr-2"></i>
                Configurations de Restructuration
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <p className="m-0">
                    <i className="pi pi-info-circle mr-2"></i>
                    <strong>Règles de restructuration:</strong>
                    <br />
                    <span className="ml-4">- Maximum 1 restructuration par crédit</span>
                    <br />
                    <span className="ml-4">- Frais de restructuration: 2% à 5% du capital restant dû</span>
                    <br />
                    <span className="ml-4">- Extension maximale de la durée: 50% de la durée initiale</span>
                </p>
            </div>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={configurations}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                emptyMessage="Aucune configuration trouvée"
                stripedRows
            >
                <Column field="configName" header="Nom" sortable />
                <Column field="maxRestructurationsPerLoan" header="Max Restructurations" sortable />
                <Column header="Frais" body={feeRangeBodyTemplate} />
                <Column header="Extension Durée" body={extensionBodyTemplate} />
                <Column field="minDaysOverdueRequired" header="Jours Retard Min" sortable />
                <Column field="requiresApproval" header="Approbation" body={approvalBodyTemplate} />
                <Column field="active" header="Statut" body={activeBodyTemplate} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '10rem' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier la Configuration' : 'Nouvelle Configuration de Restructuration'}
                style={{ width: '70vw' }}
                footer={dialogFooter}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="configName" className="font-semibold">Nom de la Configuration *</label>
                            <InputText
                                id="configName"
                                name="configName"
                                value={configuration.configName || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Restructuration Standard"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="maxRestructurationsPerLoan" className="font-semibold">Max Restructurations par Crédit</label>
                            <InputNumber
                                id="maxRestructurationsPerLoan"
                                value={configuration.maxRestructurationsPerLoan || null}
                                onValueChange={(e) => handleNumberChange('maxRestructurationsPerLoan', e.value ?? null)}
                                className="w-full"
                                min={1}
                                max={5}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="restructuringFeeMinPercent" className="font-semibold">Frais Min (%)</label>
                            <InputNumber
                                id="restructuringFeeMinPercent"
                                value={configuration.restructuringFeeMinPercent || null}
                                onValueChange={(e) => handleNumberChange('restructuringFeeMinPercent', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                suffix="%"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="restructuringFeeMaxPercent" className="font-semibold">Frais Max (%)</label>
                            <InputNumber
                                id="restructuringFeeMaxPercent"
                                value={configuration.restructuringFeeMaxPercent || null}
                                onValueChange={(e) => handleNumberChange('restructuringFeeMaxPercent', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                suffix="%"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="maxTermExtensionPercent" className="font-semibold">Extension Max Durée (%)</label>
                            <InputNumber
                                id="maxTermExtensionPercent"
                                value={configuration.maxTermExtensionPercent || null}
                                onValueChange={(e) => handleNumberChange('maxTermExtensionPercent', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                suffix="%"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="minDaysOverdueRequired" className="font-semibold">Jours de Retard Minimum Requis</label>
                            <InputNumber
                                id="minDaysOverdueRequired"
                                value={configuration.minDaysOverdueRequired || null}
                                onValueChange={(e) => handleNumberChange('minDaysOverdueRequired', e.value ?? null)}
                                className="w-full"
                                min={0}
                                suffix=" jours"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="approvalLevel" className="font-semibold">Niveau d'Approbation</label>
                            <InputText
                                id="approvalLevel"
                                name="approvalLevel"
                                value={configuration.approvalLevel || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: MANAGER, DIRECTOR"
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="description" className="font-semibold">Description</label>
                            <InputTextarea
                                id="description"
                                name="description"
                                value={configuration.description || ''}
                                onChange={handleChange}
                                className="w-full"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="requiresApproval" className="font-semibold block mb-2">Approbation Requise</label>
                            <InputSwitch
                                id="requiresApproval"
                                checked={configuration.requiresApproval ?? true}
                                onChange={(e) => setConfiguration(prev => ({ ...prev, requiresApproval: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="active" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="active"
                                checked={configuration.active ?? true}
                                onChange={(e) => setConfiguration(prev => ({ ...prev, active: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
