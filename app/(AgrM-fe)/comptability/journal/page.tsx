'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptJournal } from '../types';

export default function JournalPage() {
    const [journaux, setJournaux] = useState<CptJournal[]>([]);
    const [journal, setJournal] = useState<CptJournal>(new CptJournal());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/comptability/journaux');

    const typeJournalOptions = [
        { label: 'AN - A Nouveau', value: 'AN' },
        { label: 'AC - Achat', value: 'AC' },
        { label: 'VT - Vente', value: 'VT' },
        { label: 'BQ - Banque', value: 'BQ' },
        { label: 'CA - Caisse', value: 'CA' },
        { label: 'OD - Operations Diverses', value: 'OD' },
        { label: 'CR - Credit', value: 'CR' },
        { label: 'EP - Epargne', value: 'EP' },
        { label: 'SA - Salaires', value: 'SA' },
        { label: 'AM - Amortissements', value: 'AM' }
    ];

    useEffect(() => {
        loadJournaux();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setJournaux(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: isEdit ? 'Journal modifie avec succes' : 'Journal cree avec succes',
                        life: 3000
                    });
                    loadJournaux();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: 'Journal supprime avec succes',
                        life: 3000
                    });
                    loadJournaux();
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

    const loadJournaux = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setJournal(new CptJournal());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: CptJournal) => {
        setJournal({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!journal.codeJournal || !journal.nomJournal) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir les champs obligatoires (Code Journal et Nom Journal)',
                life: 3000
            });
            return;
        }

        const dataWithUser = { ...journal, userAction: getUserAction() };
        if (isEdit && journal.journalId) {
            fetchData(dataWithUser, 'PUT', `${BASE_URL}/update/${journal.journalId}`, 'update');
        } else {
            fetchData(dataWithUser, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleDelete = (rowData: CptJournal) => {
        confirmDialog({
            message: `Etes-vous sur de vouloir supprimer le journal "${rowData.codeJournal} - ${rowData.nomJournal}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.journalId}`, 'delete');
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setJournal(prev => ({ ...prev, [name]: value }));
    };

    // Column body templates
    const enDeviseBodyTemplate = (rowData: CptJournal) => {
        return <Tag value={rowData.enDevise ? 'Oui' : 'Non'} severity={rowData.enDevise ? 'info' : 'secondary'} />;
    };

    const typeJournalBodyTemplate = (rowData: CptJournal) => {
        const option = typeJournalOptions.find(o => o.value === rowData.typeJournal);
        return <span>{option ? option.label : rowData.typeJournal}</span>;
    };

    const actionBodyTemplate = (rowData: CptJournal) => {
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
                <i className="pi pi-file mr-2"></i>
                Liste des Journaux Comptables
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
                <i className="pi pi-file mr-2"></i>
                Journaux Comptables
            </h2>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={journaux}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucun journal trouve"
                stripedRows
                sortField="codeJournal"
                sortOrder={1}
                className="p-datatable-sm"
            >
                <Column field="codeJournal" header="Code Journal" sortable filter style={{ width: '15%' }} />
                <Column field="nomJournal" header="Nom du Journal" sortable filter style={{ width: '30%' }} />
                <Column field="typeJournal" header="Type" body={typeJournalBodyTemplate} sortable style={{ width: '20%' }} />
                <Column field="enDevise" header="En Devise" body={enDeviseBodyTemplate} sortable style={{ width: '12%' }} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '10%' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier le Journal' : 'Nouveau Journal'}
                style={{ width: '50vw' }}
                footer={dialogFooter}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="codeJournal" className="font-semibold">Code Journal *</label>
                            <InputText
                                id="codeJournal"
                                name="codeJournal"
                                value={journal.codeJournal || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: JR-BQ01"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-8">
                        <div className="field">
                            <label htmlFor="nomJournal" className="font-semibold">Nom du Journal *</label>
                            <InputText
                                id="nomJournal"
                                name="nomJournal"
                                value={journal.nomJournal || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Nom du journal"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="typeJournal" className="font-semibold">Type de Journal</label>
                            <Dropdown
                                id="typeJournal"
                                value={journal.typeJournal || ''}
                                options={typeJournalOptions}
                                onChange={(e) => setJournal(prev => ({ ...prev, typeJournal: e.value }))}
                                className="w-full"
                                placeholder="Selectionner le type"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="compteId" className="font-semibold">Compte associe (optionnel)</label>
                            <InputText
                                id="compteId"
                                name="compteId"
                                value={journal.compteId || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="ID du compte associe"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="enDevise" className="font-semibold block mb-2">En Devise</label>
                            <InputSwitch
                                id="enDevise"
                                checked={journal.enDevise || false}
                                onChange={(e) => setJournal(prev => ({ ...prev, enDevise: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
