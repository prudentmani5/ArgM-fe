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
import { ColorPicker } from 'primereact/colorpicker';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { ClassificationRetard, ClassificationRetardClass } from '../../types/RemboursementTypes';

export default function ClassificationsRetardPage() {
    const [classifications, setClassifications] = useState<ClassificationRetard[]>([]);
    const [classification, setClassification] = useState<ClassificationRetard>(new ClassificationRetardClass());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/late-payment-classifications');

    useEffect(() => {
        loadClassifications();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setClassifications(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: isEdit ? 'Classification modifiée' : 'Classification créée', life: 3000 });
                    loadClassifications();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Classification supprimée', life: 3000 });
                    loadClassifications();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const loadClassifications = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setClassification(new ClassificationRetardClass());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: ClassificationRetard) => {
        setClassification({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!classification.code || !classification.name || !classification.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir les champs obligatoires', life: 3000 });
            return;
        }

        if (isEdit && classification.id) {
            fetchData(classification, 'PUT', `${BASE_URL}/update/${classification.id}`, 'update');
        } else {
            fetchData(classification, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const confirmDelete = (rowData: ClassificationRetard) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la classification "${rowData.nameFr || rowData.name}" ?`,
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
        setClassification(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setClassification(prev => ({ ...prev, [name]: value }));
    };

    const leftToolbarTemplate = () => {
        return (
            <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} />
        );
    };

    const actionBodyTemplate = (rowData: ClassificationRetard) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const activeBodyTemplate = (rowData: ClassificationRetard) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const colorBodyTemplate = (rowData: ClassificationRetard) => {
        return (
            <div className="flex align-items-center gap-2">
                <div
                    style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: rowData.colorCode || '#cccccc',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <span>{rowData.colorCode}</span>
            </div>
        );
    };

    const provisionBodyTemplate = (rowData: ClassificationRetard) => {
        return rowData.provisionRate ? `${rowData.provisionRate}%` : '-';
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
                <i className="pi pi-exclamation-triangle mr-2"></i>
                Classifications de Retard
            </h2>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={classifications}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                emptyMessage="Aucune classification trouvée"
                stripedRows
            >
                <Column field="code" header="Code" sortable />
                <Column field="nameFr" header="Libellé (FR)" sortable />
                <Column field="name" header="Libellé (EN)" sortable />
                <Column field="minDaysOverdue" header="Jours Min" sortable />
                <Column field="maxDaysOverdue" header="Jours Max" sortable />
                <Column field="provisionRate" header="Taux Provision" body={provisionBodyTemplate} sortable />
                <Column field="colorCode" header="Couleur" body={colorBodyTemplate} />
                <Column field="sortOrder" header="Ordre" sortable />
                <Column field="isActive" header="Statut" body={activeBodyTemplate} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '10rem' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier la Classification' : 'Nouvelle Classification de Retard'}
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
                                value={classification.code || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: RETARD_1_30"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="name" className="font-semibold">Libellé (EN) *</label>
                            <InputText
                                id="name"
                                name="name"
                                value={classification.name || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Late 1-30 days"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="nameFr" className="font-semibold">Libellé (FR) *</label>
                            <InputText
                                id="nameFr"
                                name="nameFr"
                                value={classification.nameFr || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Retard 1-30 jours"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="minDaysOverdue" className="font-semibold">Jours Minimum *</label>
                            <InputNumber
                                id="minDaysOverdue"
                                value={classification.minDaysOverdue || null}
                                onValueChange={(e) => handleNumberChange('minDaysOverdue', e.value ?? null)}
                                className="w-full"
                                min={0}
                                suffix=" jours"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="maxDaysOverdue" className="font-semibold">Jours Maximum *</label>
                            <InputNumber
                                id="maxDaysOverdue"
                                value={classification.maxDaysOverdue || null}
                                onValueChange={(e) => handleNumberChange('maxDaysOverdue', e.value ?? null)}
                                className="w-full"
                                min={0}
                                suffix=" jours"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="provisionRate" className="font-semibold">Taux de Provision (%)</label>
                            <InputNumber
                                id="provisionRate"
                                value={classification.provisionRate || null}
                                onValueChange={(e) => handleNumberChange('provisionRate', e.value ?? null)}
                                className="w-full"
                                min={0}
                                max={100}
                                suffix="%"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-3">
                        <div className="field">
                            <label htmlFor="sortOrder" className="font-semibold">Ordre</label>
                            <InputNumber
                                id="sortOrder"
                                value={classification.sortOrder || null}
                                onValueChange={(e) => handleNumberChange('sortOrder', e.value ?? null)}
                                className="w-full"
                                min={0}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-8">
                        <div className="field">
                            <label htmlFor="colorCode" className="font-semibold">Couleur</label>
                            <div className="flex align-items-center gap-2">
                                <ColorPicker
                                    value={classification.colorCode?.replace('#', '') || 'cccccc'}
                                    onChange={(e) => setClassification(prev => ({ ...prev, colorCode: `#${e.value}` }))}
                                />
                                <InputText
                                    value={classification.colorCode || '#cccccc'}
                                    onChange={(e) => setClassification(prev => ({ ...prev, colorCode: e.target.value }))}
                                    className="w-full"
                                    placeholder="#FF0000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="isActive" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="isActive"
                                checked={classification.isActive ?? true}
                                onChange={(e) => setClassification(prev => ({ ...prev, isActive: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="description" className="font-semibold">Description</label>
                            <InputTextarea
                                id="description"
                                name="description"
                                value={classification.description || ''}
                                onChange={handleChange}
                                className="w-full"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
