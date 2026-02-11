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
import { EtapeRecouvrement, EtapeRecouvrementClass } from '../../types/RemboursementTypes';

export default function EtapesRecouvrementPage() {
    const [etapes, setEtapes] = useState<EtapeRecouvrement[]>([]);
    const [etape, setEtape] = useState<EtapeRecouvrement>(new EtapeRecouvrementClass());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/recovery-stages');

    useEffect(() => {
        loadEtapes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setEtapes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: isEdit ? 'Étape modifiée' : 'Étape créée', life: 3000 });
                    loadEtapes();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Étape supprimée', life: 3000 });
                    loadEtapes();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const loadEtapes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setEtape(new EtapeRecouvrementClass());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: EtapeRecouvrement) => {
        setEtape({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!etape.code || !etape.name || !etape.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir les champs obligatoires', life: 3000 });
            return;
        }

        if (isEdit && etape.id) {
            fetchData(etape, 'PUT', `${BASE_URL}/update/${etape.id}`, 'update');
        } else {
            fetchData(etape, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const confirmDelete = (rowData: EtapeRecouvrement) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer l'étape "${rowData.nameFr || rowData.name}" ?`,
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
        setEtape(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setEtape(prev => ({ ...prev, [name]: value }));
    };

    const leftToolbarTemplate = () => {
        return (
            <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} />
        );
    };

    const actionBodyTemplate = (rowData: EtapeRecouvrement) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const activeBodyTemplate = (rowData: EtapeRecouvrement) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
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
                <i className="pi pi-sitemap mr-2"></i>
                Étapes de Recouvrement
            </h2>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={etapes}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                emptyMessage="Aucune étape trouvée"
                stripedRows
            >
                <Column field="code" header="Code" sortable />
                <Column field="nameFr" header="Nom (FR)" sortable />
                <Column field="name" header="Nom (EN)" sortable />
                <Column field="minDaysOverdue" header="Jours Min" sortable />
                <Column field="maxDaysOverdue" header="Jours Max" sortable />
                <Column field="sortOrder" header="Ordre" sortable />
                <Column field="isActive" header="Statut" body={activeBodyTemplate} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '10rem' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier l\'Étape' : 'Nouvelle Étape de Recouvrement'}
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
                                value={etape.code || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: AMIABLE, PRE_CONTENTIEUX"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="name" className="font-semibold">Nom (EN) *</label>
                            <InputText
                                id="name"
                                name="name"
                                value={etape.name || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Amicable Recovery"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="nameFr" className="font-semibold">Nom (FR) *</label>
                            <InputText
                                id="nameFr"
                                name="nameFr"
                                value={etape.nameFr || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Recouvrement Amiable"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="minDaysOverdue" className="font-semibold">Jours de Retard Minimum</label>
                            <InputNumber
                                id="minDaysOverdue"
                                value={etape.minDaysOverdue || null}
                                onValueChange={(e) => handleNumberChange('minDaysOverdue', e.value ?? null)}
                                className="w-full"
                                min={0}
                                suffix=" jours"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="maxDaysOverdue" className="font-semibold">Jours de Retard Maximum</label>
                            <InputNumber
                                id="maxDaysOverdue"
                                value={etape.maxDaysOverdue || null}
                                onValueChange={(e) => handleNumberChange('maxDaysOverdue', e.value ?? null)}
                                className="w-full"
                                min={0}
                                suffix=" jours"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="sortOrder" className="font-semibold">Ordre</label>
                            <InputNumber
                                id="sortOrder"
                                value={etape.sortOrder || null}
                                onValueChange={(e) => handleNumberChange('sortOrder', e.value ?? null)}
                                className="w-full"
                                min={0}
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="description" className="font-semibold">Description</label>
                            <InputTextarea
                                id="description"
                                name="description"
                                value={etape.description || ''}
                                onChange={handleChange}
                                className="w-full"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="isActive" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="isActive"
                                checked={etape.isActive ?? true}
                                onChange={(e) => setEtape(prev => ({ ...prev, isActive: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
