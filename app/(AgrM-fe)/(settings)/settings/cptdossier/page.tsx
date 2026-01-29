'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { CptDossier } from './CptDossier';
import CptDossierForm from './CptDossierForm';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';

const CptDossierPage = () => {
    const [cptDossier, setCptDossier] = useState<CptDossier>(new CptDossier());
    const [cptDossierEdit, setCptDossierEdit] = useState<CptDossier>(new CptDossier());
    const [cptDossiers, setCptDossiers] = useState<CptDossier[]>([]);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const toast = useRef<Toast>(null);

    useEffect(() => {
        loadAllCptDossiers();
    }, []);

    useEffect(() => {
        if (data && callType === 'loadCptDossiers') {
            setCptDossiers(Array.isArray(data) ? data : [data]);
        } else if (data && callType === 'createCptDossier') {
            accept('info', 'Succès', 'Dossier comptable créé avec succès');
            loadAllCptDossiers();
            setCptDossier(new CptDossier());
        } else if (data && callType === 'updateCptDossier') {
            accept('info', 'Succès', 'Dossier comptable modifié avec succès');
            loadAllCptDossiers();
            setDialogVisible(false);
        }
    }, [data, callType]);

    useEffect(() => {
        if (error) {
            accept('warn', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [error]);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const loadAllCptDossiers = () => {
        fetchData(null, 'Get', buildApiUrl('/cptdossiers/findall'), 'loadCptDossiers');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCptDossier((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCptDossierEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setCptDossier((prev) => ({ ...prev, [name]: value }));
    };

    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setCptDossierEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setCptDossier((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChangeEdit = (name: string, value: Date | null) => {
        setCptDossierEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setCptDossier((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setCptDossierEdit((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cptDossier.nomDossier) {
            accept('warn', 'Attention', 'Le nom du dossier est obligatoire');
            return;
        }
        fetchData(cptDossier, 'Post', buildApiUrl('/cptdossiers/new'), 'createCptDossier');
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cptDossierEdit.nomDossier) {
            accept('warn', 'Attention', 'Le nom du dossier est obligatoire');
            return;
        }
        fetchData(
            cptDossierEdit,
            'Put',
            buildApiUrl(`/cptdossiers/update/${cptDossierEdit.dossierId}`),
            'updateCptDossier'
        );
    };

    const openEditDialog = (rowData: CptDossier) => {
        setCptDossierEdit({ ...rowData });
        setDialogVisible(true);
    };

    const actionBodyTemplate = (rowData: CptDossier) => {
        return (
            <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-success p-button-sm"
                onClick={() => openEditDialog(rowData)}
                tooltip="Modifier"
            />
        );
    };

    const booleanBodyTemplate = (value: boolean) => {
        return value ? (
            <i className="pi pi-check-circle" style={{ color: 'green' }}></i>
        ) : (
            <i className="pi pi-times-circle" style={{ color: 'red' }}></i>
        );
    };

    const header = (
        <div className="flex justify-content-between">
            <h5 className="m-0">Liste des Dossiers Comptables</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <input
                    type="search"
                    className="p-inputtext p-component"
                    placeholder="Rechercher..."
                    onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
                />
            </span>
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h5>Gestion des Dossiers Comptables</h5>
                    <TabView>
                        <TabPanel header="Nouveau Dossier">
                            <form onSubmit={handleSubmit}>
                                <CptDossierForm
                                    cptDossier={cptDossier}
                                    handleChange={handleChange}
                                    handleNumberChange={handleNumberChange}
                                    handleDateChange={handleDateChange}
                                    handleCheckboxChange={handleCheckboxChange}
                                />
                                <div className="flex justify-content-end mt-3">
                                    <Button
                                        label="Enregistrer"
                                        icon="pi pi-check"
                                        type="submit"
                                        loading={loading && callType === 'createCptDossier'}
                                    />
                                </div>
                            </form>
                        </TabPanel>

                        <TabPanel header="Tous les Dossiers">
                            <DataTable
                                value={cptDossiers}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                dataKey="dossierId"
                                filterDisplay="row"
                                loading={loading && callType === 'loadCptDossiers'}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucun dossier comptable trouvé"
                                responsiveLayout="scroll"
                            >
                                <Column
                                    field="dossierId"
                                    header="ID"
                                    sortable
                                    style={{ minWidth: '5rem' }}
                                />
                                <Column
                                    field="nomDossier"
                                    header="Nom du Dossier"
                                    sortable
                                    filter
                                    filterPlaceholder="Rechercher par nom"
                                    style={{ minWidth: '12rem' }}
                                />
                                <Column
                                    field="nif"
                                    header="NIF"
                                    sortable
                                    filter
                                    filterPlaceholder="Rechercher par NIF"
                                    style={{ minWidth: '10rem' }}
                                />
                                <Column
                                    field="typeEntite"
                                    header="Type d'Entité"
                                    sortable
                                    filter
                                    filterPlaceholder="Rechercher par type"
                                    style={{ minWidth: '10rem' }}
                                />
                                <Column
                                    field="email"
                                    header="Email"
                                    sortable
                                    style={{ minWidth: '12rem' }}
                                />
                                <Column
                                    field="tel"
                                    header="Téléphone"
                                    sortable
                                    style={{ minWidth: '10rem' }}
                                />
                                <Column
                                    field="assujetiTVA"
                                    header="TVA"
                                    body={(rowData) => booleanBodyTemplate(rowData.assujetiTVA)}
                                    sortable
                                    style={{ minWidth: '6rem', textAlign: 'center' }}
                                />
                                <Column
                                    field="province"
                                    header="Province"
                                    sortable
                                    filter
                                    filterPlaceholder="Rechercher par province"
                                    style={{ minWidth: '10rem' }}
                                />
                                <Column
                                    field="centreFiscale"
                                    header="Centre Fiscal"
                                    sortable
                                    filter
                                    filterPlaceholder="Rechercher par centre"
                                    style={{ minWidth: '12rem' }}
                                />
                                <Column
                                    header="Actions"
                                    body={actionBodyTemplate}
                                    exportable={false}
                                    style={{ minWidth: '8rem', textAlign: 'center' }}
                                />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>
            </div>

            <Dialog
                visible={dialogVisible}
                style={{ width: '80vw' }}
                header="Modifier le Dossier Comptable"
                modal
                className="p-fluid"
                onHide={() => setDialogVisible(false)}
            >
                <form onSubmit={handleSubmitEdit}>
                    <CptDossierForm
                        cptDossier={cptDossierEdit}
                        handleChange={handleChangeEdit}
                        handleNumberChange={handleNumberChangeEdit}
                        handleDateChange={handleDateChangeEdit}
                        handleCheckboxChange={handleCheckboxChangeEdit}
                    />
                    <div className="flex justify-content-end mt-3 gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            type="button"
                            className="p-button-text"
                            onClick={() => setDialogVisible(false)}
                        />
                        <Button
                            label="Modifier"
                            icon="pi pi-check"
                            type="submit"
                            loading={loading && callType === 'updateCptDossier'}
                        />
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default CptDossierPage;
