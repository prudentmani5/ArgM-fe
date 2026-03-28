'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptTypeJournal } from '../types';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';

function TypeJournalPage() {
    const { can } = useAuthorizedAction();
    const [types, setTypes] = useState<CptTypeJournal[]>([]);
    const [typeJournal, setTypeJournal] = useState<CptTypeJournal>(new CptTypeJournal());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/comptability/types-journaux');

    useEffect(() => {
        loadTypes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setTypes(Array.isArray(data) ? data : []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succès',
                        detail: isEdit ? 'Type de journal modifié avec succès' : 'Type de journal créé avec succès',
                        life: 3000
                    });
                    loadTypes();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Type de journal supprimé avec succès',
                        life: 3000
                    });
                    loadTypes();
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

    const loadTypes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setTypeJournal(new CptTypeJournal());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: CptTypeJournal) => {
        setTypeJournal({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!typeJournal.code || !typeJournal.libelle) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir le code et le libellé',
                life: 3000
            });
            return;
        }

        const dataWithUser = { ...typeJournal, userAction: getUserAction() };
        if (isEdit && typeJournal.typeJournalId) {
            fetchData(dataWithUser, 'PUT', `${BASE_URL}/update/${typeJournal.typeJournalId}`, 'update');
        } else {
            fetchData(dataWithUser, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleDelete = (rowData: CptTypeJournal) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le type "${rowData.code} - ${rowData.libelle}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.typeJournalId}`, 'delete');
            }
        });
    };

    const actifBodyTemplate = (rowData: CptTypeJournal) => {
        return <Tag value={rowData.actif ? 'Actif' : 'Inactif'} severity={rowData.actif ? 'success' : 'danger'} />;
    };

    const actionBodyTemplate = (rowData: CptTypeJournal) => {
        return (
            <div className="flex gap-2">
                {can('ACCOUNTING_TYPE_JOURNAL_EDIT') && <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />}
                {can('ACCOUNTING_TYPE_JOURNAL_DELETE') && <Button icon="pi pi-trash" rounded severity="danger" onClick={() => handleDelete(rowData)} />}
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return can('ACCOUNTING_TYPE_JOURNAL_CREATE') ? <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} /> : null;
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">
                <i className="pi pi-tags mr-2"></i>
                Liste des Types de Journal
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
        <ProtectedPage authorities={['SUPER_ADMIN', 'ACCOUNTING_TYPE_JOURNAL_VIEW', 'ACCOUNTING_TYPE_JOURNAL_CREATE', 'ACCOUNTING_TYPE_JOURNAL_EDIT', 'ACCOUNTING_TYPE_JOURNAL_DELETE']}>
            <div className="card">
                <Toast ref={toast} />
                <ConfirmDialog />

                <h2 className="mb-4">
                    <i className="pi pi-tags mr-2"></i>
                    Types de Journal
                </h2>

                <Toolbar className="mb-4" left={leftToolbarTemplate} />

                <DataTable
                    value={types}
                    loading={loading && callType === 'getall'}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    globalFilter={globalFilter}
                    header={header}
                    emptyMessage="Aucun type de journal trouvé"
                    stripedRows
                    sortField="code"
                    sortOrder={1}
                    className="p-datatable-sm"
                >
                    <Column field="code" header="Code" sortable filter style={{ width: '15%' }} />
                    <Column field="libelle" header="Libellé" sortable filter />
                    <Column field="actif" header="Statut" body={actifBodyTemplate} sortable style={{ width: '12%' }} />
                    <Column header="Actions" body={actionBodyTemplate} style={{ width: '12%' }} />
                </DataTable>

                <Dialog
                    visible={dialogVisible}
                    onHide={() => setDialogVisible(false)}
                    header={isEdit ? 'Modifier le Type de Journal' : 'Nouveau Type de Journal'}
                    style={{ width: '35vw' }}
                    footer={dialogFooter}
                    modal
                >
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText
                                    id="code"
                                    value={typeJournal.code || ''}
                                    onChange={(e) => setTypeJournal(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                    className="w-full"
                                    placeholder="Ex: BQ"
                                    maxLength={10}
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-8">
                            <div className="field">
                                <label htmlFor="libelle" className="font-semibold">Libellé *</label>
                                <InputText
                                    id="libelle"
                                    value={typeJournal.libelle || ''}
                                    onChange={(e) => setTypeJournal(prev => ({ ...prev, libelle: e.target.value }))}
                                    className="w-full"
                                    placeholder="Ex: Banque"
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="field">
                                <label htmlFor="actif" className="font-semibold block mb-2">Actif</label>
                                <InputSwitch
                                    id="actif"
                                    checked={typeJournal.actif}
                                    onChange={(e) => setTypeJournal(prev => ({ ...prev, actif: e.value ?? true }))}
                                />
                            </div>
                        </div>
                    </div>
                </Dialog>
            </div>
        </ProtectedPage>
    );
}

export default TypeJournalPage;
