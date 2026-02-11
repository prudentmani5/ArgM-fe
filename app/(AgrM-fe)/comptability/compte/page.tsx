'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptCompte } from '../types';

export default function ComptePage() {
    const [comptes, setComptes] = useState<CptCompte[]>([]);
    const [compte, setCompte] = useState<CptCompte>(new CptCompte());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/comptability/comptes');

    const typeCompteOptions = [
        { label: 'Detail', value: 0 },
        { label: 'Titre', value: 1 },
        { label: 'Total', value: 2 }
    ];

    const sensOptions = [
        { label: 'Debit', value: 'D' },
        { label: 'Credit', value: 'C' }
    ];

    useEffect(() => {
        loadComptes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setComptes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: isEdit ? 'Compte modifie avec succes' : 'Compte cree avec succes',
                        life: 3000
                    });
                    loadComptes();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: 'Compte supprime avec succes',
                        life: 3000
                    });
                    loadComptes();
                    break;
            }
        }
        if (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: error.message || 'Une erreur est survenue',
                life: 3000
            });
        }
    }, [data, error, callType]);

    const loadComptes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setCompte(new CptCompte());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: CptCompte) => {
        setCompte({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!compte.codeCompte || !compte.libelle) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir les champs obligatoires (Code Compte et Libelle)',
                life: 3000
            });
            return;
        }

        const dataWithUser = { ...compte, userAction: getUserAction() };
        if (isEdit && compte.compteId) {
            fetchData(dataWithUser, 'PUT', `${BASE_URL}/update/${compte.compteId}`, 'update');
        } else {
            fetchData(dataWithUser, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleDelete = (rowData: CptCompte) => {
        confirmDialog({
            message: `Etes-vous sur de vouloir supprimer le compte "${rowData.codeCompte} - ${rowData.libelle}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.compteId}`, 'delete');
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompte(prev => ({ ...prev, [name]: value }));
    };

    // Column body templates
    const typeCompteBodyTemplate = (rowData: CptCompte) => {
        const labels: { [key: number]: string } = { 0: 'Detail', 1: 'Titre', 2: 'Total' };
        const severities: { [key: number]: 'info' | 'warning' | 'success' } = { 0: 'info', 1: 'warning', 2: 'success' };
        return <Tag value={labels[rowData.typeCompte] || 'Detail'} severity={severities[rowData.typeCompte] || 'info'} />;
    };

    const actifBodyTemplate = (rowData: CptCompte) => {
        return <Tag value={rowData.actif ? 'Actif' : 'Inactif'} severity={rowData.actif ? 'success' : 'danger'} />;
    };

    const actionBodyTemplate = (rowData: CptCompte) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => handleDelete(rowData)} />
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} />
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">
                <i className="pi pi-book mr-2"></i>
                Plan Comptable SYSCOHADA
            </h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

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
                <i className="pi pi-book mr-2"></i>
                Plan Comptable SYSCOHADA
            </h2>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={comptes}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucun compte trouve"
                stripedRows
                sortField="codeCompte"
                sortOrder={1}
                className="p-datatable-sm"
            >
                <Column field="codeCompte" header="Code Compte" sortable filter style={{ width: '12%' }} />
                <Column field="libelle" header="Libelle" sortable filter style={{ width: '30%' }} />
                <Column field="typeCompte" header="Type" body={typeCompteBodyTemplate} sortable style={{ width: '10%' }} />
                <Column field="sens" header="Sens" sortable style={{ width: '8%' }} />
                <Column field="actif" header="Statut" body={actifBodyTemplate} sortable style={{ width: '10%' }} />
                <Column field="codeBudget" header="Code Budget" sortable style={{ width: '10%' }} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '10%' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier le Compte' : 'Nouveau Compte'}
                style={{ width: '60vw' }}
                footer={dialogFooter}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="codeCompte" className="font-semibold">Code Compte *</label>
                            <InputText
                                id="codeCompte"
                                name="codeCompte"
                                value={compte.codeCompte || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: 101000"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-8">
                        <div className="field">
                            <label htmlFor="libelle" className="font-semibold">Libelle *</label>
                            <InputText
                                id="libelle"
                                name="libelle"
                                value={compte.libelle || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Libelle du compte"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="typeCompte" className="font-semibold">Type de Compte</label>
                            <Dropdown
                                id="typeCompte"
                                value={compte.typeCompte}
                                options={typeCompteOptions}
                                onChange={(e) => setCompte(prev => ({ ...prev, typeCompte: e.value }))}
                                className="w-full"
                                placeholder="Selectionner le type"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="sens" className="font-semibold">Sens</label>
                            <Dropdown
                                id="sens"
                                value={compte.sens || ''}
                                options={sensOptions}
                                onChange={(e) => setCompte(prev => ({ ...prev, sens: e.value }))}
                                className="w-full"
                                placeholder="Selectionner le sens"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="actif" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="actif"
                                checked={compte.actif ?? true}
                                onChange={(e) => setCompte(prev => ({ ...prev, actif: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="codeBudget" className="font-semibold">Code Budget</label>
                            <InputText
                                id="codeBudget"
                                name="codeBudget"
                                value={compte.codeBudget || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="compteBanque" className="font-semibold">Compte Banque</label>
                            <InputText
                                id="compteBanque"
                                name="compteBanque"
                                value={compte.compteBanque || ''}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label className="font-semibold block mb-2">Options analytiques</label>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="activite"
                                        checked={compte.activite || false}
                                        onChange={(e) => setCompte(prev => ({ ...prev, activite: e.checked ?? false }))}
                                    />
                                    <label htmlFor="activite" className="ml-2">Activite</label>
                                </div>
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="financement"
                                        checked={compte.financement || false}
                                        onChange={(e) => setCompte(prev => ({ ...prev, financement: e.checked ?? false }))}
                                    />
                                    <label htmlFor="financement" className="ml-2">Financement</label>
                                </div>
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="geographique"
                                        checked={compte.geographique || false}
                                        onChange={(e) => setCompte(prev => ({ ...prev, geographique: e.checked ?? false }))}
                                    />
                                    <label htmlFor="geographique" className="ml-2">Geographique</label>
                                </div>
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="collectif"
                                        checked={compte.collectif || false}
                                        onChange={(e) => setCompte(prev => ({ ...prev, collectif: e.checked ?? false }))}
                                    />
                                    <label htmlFor="collectif" className="ml-2">Collectif</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
