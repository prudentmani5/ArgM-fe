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
        if (!mode.code || !mode.label) {
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
            message: `Êtes-vous sûr de vouloir supprimer le mode "${rowData.label}" ?`,
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
        return <Tag value={rowData.active ? 'Actif' : 'Inactif'} severity={rowData.active ? 'success' : 'danger'} />;
    };

    const requiresBankBodyTemplate = (rowData: ModeRemboursement) => {
        return <Tag value={rowData.requiresBankAccount ? 'Oui' : 'Non'} severity={rowData.requiresBankAccount ? 'info' : 'secondary'} />;
    };

    const requiresMobileBodyTemplate = (rowData: ModeRemboursement) => {
        return <Tag value={rowData.requiresMobileNumber ? 'Oui' : 'Non'} severity={rowData.requiresMobileNumber ? 'info' : 'secondary'} />;
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
                <Column field="label" header="Libellé" sortable />
                <Column field="description" header="Description" />
                <Column field="requiresBankAccount" header="Compte Bancaire" body={requiresBankBodyTemplate} />
                <Column field="requiresMobileNumber" header="N° Mobile" body={requiresMobileBodyTemplate} />
                <Column field="active" header="Statut" body={activeBodyTemplate} />
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
                    <div className="col-12 md:col-6">
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

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="label" className="font-semibold">Libellé *</label>
                            <InputText
                                id="label"
                                name="label"
                                value={mode.label || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Libellé du mode"
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

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="requiresBankAccount" className="font-semibold block mb-2">Compte Bancaire Requis</label>
                            <InputSwitch
                                id="requiresBankAccount"
                                checked={mode.requiresBankAccount || false}
                                onChange={(e) => setMode(prev => ({ ...prev, requiresBankAccount: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="requiresMobileNumber" className="font-semibold block mb-2">N° Mobile Requis</label>
                            <InputSwitch
                                id="requiresMobileNumber"
                                checked={mode.requiresMobileNumber || false}
                                onChange={(e) => setMode(prev => ({ ...prev, requiresMobileNumber: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="active" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="active"
                                checked={mode.active ?? true}
                                onChange={(e) => setMode(prev => ({ ...prev, active: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
