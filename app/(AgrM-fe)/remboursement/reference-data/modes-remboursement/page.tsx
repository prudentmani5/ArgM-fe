'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { ModeRemboursement, ModeRemboursementClass } from '../../types/RemboursementTypes';

export default function ModesRemboursementPage() {
    const [modes, setModes] = useState<ModeRemboursement[]>([]);
    const [mode, setMode] = useState<ModeRemboursement>(new ModeRemboursementClass());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/repayment-modes');

    useEffect(() => {
        loadModes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setModes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: isEdit ? 'Mode modifié' : 'Mode créé', life: 3000 });
                    loadModes();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Mode supprimé', life: 3000 });
                    loadModes();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const loadModes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setMode(new ModeRemboursementClass());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: ModeRemboursement) => {
        setMode({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!mode.code || !mode.name || !mode.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir les champs obligatoires', life: 3000 });
            return;
        }

        if (isEdit && mode.id) {
            fetchData(mode, 'PUT', `${BASE_URL}/update/${mode.id}`, 'update');
        } else {
            fetchData(mode, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const confirmDelete = (rowData: ModeRemboursement) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le mode "${rowData.nameFr || rowData.name}" ?`,
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
        setMode(prev => ({ ...prev, [name]: value }));
    };

    const leftToolbarTemplate = () => {
        return (
            <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} />
        );
    };

    const actionBodyTemplate = (rowData: ModeRemboursement) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const activeBodyTemplate = (rowData: ModeRemboursement) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const requiresReceiptBodyTemplate = (rowData: ModeRemboursement) => {
        return <Tag value={rowData.requiresReceipt ? 'Oui' : 'Non'} severity={rowData.requiresReceipt ? 'info' : 'secondary'} />;
    };

    const requiresReferenceBodyTemplate = (rowData: ModeRemboursement) => {
        return <Tag value={rowData.requiresReference ? 'Oui' : 'Non'} severity={rowData.requiresReference ? 'info' : 'secondary'} />;
    };

    const requiresJustificationBodyTemplate = (rowData: ModeRemboursement) => {
        return <Tag value={rowData.requiresJustification ? 'Oui' : 'Non'} severity={rowData.requiresJustification ? 'info' : 'secondary'} />;
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
                <i className="pi pi-credit-card mr-2"></i>
                Modes de Remboursement
            </h2>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={modes}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                emptyMessage="Aucun mode de remboursement trouvé"
                stripedRows
            >
                <Column field="code" header="Code" sortable />
                <Column field="nameFr" header="Libellé (FR)" sortable />
                <Column field="name" header="Libellé (EN)" sortable />
                <Column field="description" header="Description" />
                <Column field="requiresReceipt" header="Reçu Requis" body={requiresReceiptBodyTemplate} />
                <Column field="requiresReference" header="Référence Requise" body={requiresReferenceBodyTemplate} />
                <Column field="requiresJustification" header="Justification Requise" body={requiresJustificationBodyTemplate} />
                <Column field="sortOrder" header="Ordre" sortable />
                <Column field="isActive" header="Statut" body={activeBodyTemplate} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '10rem' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier le Mode' : 'Nouveau Mode de Remboursement'}
                style={{ width: '50vw' }}
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
                                value={mode.code || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: CASH, MOBILE_MONEY"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="name" className="font-semibold">Libellé (EN) *</label>
                            <InputText
                                id="name"
                                name="name"
                                value={mode.name || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Cash, Mobile Money"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="nameFr" className="font-semibold">Libellé (FR) *</label>
                            <InputText
                                id="nameFr"
                                name="nameFr"
                                value={mode.nameFr || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Espèces, Mobile Money"
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="description" className="font-semibold">Description</label>
                            <InputTextarea
                                id="description"
                                name="description"
                                value={mode.description || ''}
                                onChange={handleChange}
                                className="w-full"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="sortOrder" className="font-semibold">Ordre d'affichage</label>
                            <InputText
                                id="sortOrder"
                                name="sortOrder"
                                value={mode.sortOrder?.toString() || '0'}
                                onChange={(e) => setMode(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                                className="w-full"
                                type="number"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="isActive" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="isActive"
                                checked={mode.isActive ?? true}
                                onChange={(e) => setMode(prev => ({ ...prev, isActive: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="requiresReceipt" className="font-semibold block mb-2">Reçu Requis</label>
                            <InputSwitch
                                id="requiresReceipt"
                                checked={mode.requiresReceipt || false}
                                onChange={(e) => setMode(prev => ({ ...prev, requiresReceipt: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="requiresReference" className="font-semibold block mb-2">Référence Requise</label>
                            <InputSwitch
                                id="requiresReference"
                                checked={mode.requiresReference || false}
                                onChange={(e) => setMode(prev => ({ ...prev, requiresReference: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="requiresJustification" className="font-semibold block mb-2">Justification Requise</label>
                            <InputSwitch
                                id="requiresJustification"
                                checked={mode.requiresJustification || false}
                                onChange={(e) => setMode(prev => ({ ...prev, requiresJustification: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
