'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import Cookies from 'js-cookie';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptBrouillard, CptExercice, CptJournal } from '../types';

// Helper: convert dd/mm/yyyy to yyyy-mm-dd (ISO)
const toISODate = (ddmmyyyy: string): string => {
    if (!ddmmyyyy || ddmmyyyy.includes('_')) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return '';
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
};

// Helper: convert yyyy-mm-dd (ISO) to dd/mm/yyyy
const toDisplayDate = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('T')[0].split('-');
    if (parts.length !== 3) return '';
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
};

export default function BrouillardPage() {
    const [brouillards, setBrouillards] = useState<CptBrouillard[]>([]);
    const [brouillard, setBrouillard] = useState<CptBrouillard>(new CptBrouillard());
    const [journaux, setJournaux] = useState<CptJournal[]>([]);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');

    // Local form state for masked date inputs (dd/mm/yyyy format)
    const [dateDebutDisplay, setDateDebutDisplay] = useState('');
    const [dateFinDisplay, setDateFinDisplay] = useState('');

    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: journauxData, loading: loadingJournaux, error: journauxError, fetchData: fetchJournaux, callType: journauxCallType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/comptability/brouillards');

    useEffect(() => {
        // Load current exercice from cookie
        try {
            const cookieData = Cookies.get('currentExercice');
            if (cookieData) {
                const exercice = JSON.parse(cookieData);
                setCurrentExercice(exercice);
            }
        } catch (e) {
            console.error('Error parsing currentExercice cookie:', e);
        }

        // Load journaux for dropdown
        fetchJournaux(null, 'GET', `${BASE_URL}/findJournaux`, 'loadJournaux');
    }, []);

    // Load brouillards when exercice is set
    useEffect(() => {
        if (currentExercice?.exerciceId) {
            loadBrouillards();
        }
    }, [currentExercice]);

    // Handle journaux data
    useEffect(() => {
        if (journauxData && journauxCallType === 'loadJournaux') {
            setJournaux(Array.isArray(journauxData) ? journauxData : journauxData.content || []);
        }
        if (journauxError) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: journauxError.message || 'Erreur de chargement des journaux',
                life: 3000
            });
        }
    }, [journauxData, journauxError, journauxCallType]);

    // Handle brouillard CRUD responses
    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setBrouillards(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: isEdit ? 'Brouillard modifie avec succes' : 'Brouillard cree avec succes',
                        life: 3000
                    });
                    loadBrouillards();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: 'Brouillard supprime avec succes',
                        life: 3000
                    });
                    loadBrouillards();
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

    const loadBrouillards = () => {
        if (currentExercice?.exerciceId) {
            fetchData(null, 'GET', `${BASE_URL}/findbyexercice/${currentExercice.exerciceId}`, 'getall');
        }
    };

    const openNew = () => {
        if (!currentExercice?.exerciceId) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez selectionner un exercice courant dans la page Exercices',
                life: 3000
            });
            return;
        }
        const newBrouillard = new CptBrouillard();
        newBrouillard.exerciceId = currentExercice.exerciceId;
        setBrouillard(newBrouillard);
        setDateDebutDisplay('');
        setDateFinDisplay('');
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: CptBrouillard) => {
        setBrouillard({ ...rowData });
        setDateDebutDisplay(toDisplayDate(rowData.dateDebut));
        setDateFinDisplay(toDisplayDate(rowData.dateFin));
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!brouillard.codeBrouillard || !brouillard.description || !brouillard.journalId) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir les champs obligatoires (Code, Description et Journal)',
                life: 3000
            });
            return;
        }

        // Convert display dates to ISO format and include exercice
        const dataToSend = {
            ...brouillard,
            dateDebut: toISODate(dateDebutDisplay),
            dateFin: toISODate(dateFinDisplay),
            exerciceId: currentExercice?.exerciceId || brouillard.exerciceId,
            userAction: getUserAction()
        };

        if (isEdit && brouillard.brouillardId) {
            fetchData(dataToSend, 'PUT', `${BASE_URL}/update/${brouillard.brouillardId}`, 'update');
        } else {
            fetchData(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleDelete = (rowData: CptBrouillard) => {
        confirmDialog({
            message: `Etes-vous sur de vouloir supprimer le brouillard "${rowData.codeBrouillard}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.brouillardId}`, 'delete');
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBrouillard(prev => ({ ...prev, [name]: value }));
    };

    // Column body templates
    const dateBodyTemplate = (date: string) => {
        return toDisplayDate(date) || '-';
    };

    const valideBodyTemplate = (rowData: CptBrouillard) => {
        return (
            <Tag
                value={rowData.valide ? 'Valide' : 'Brouillon'}
                severity={rowData.valide ? 'success' : 'warning'}
            />
        );
    };

    const actionBodyTemplate = (rowData: CptBrouillard) => {
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
                <i className="pi pi-file-edit mr-2"></i>
                Liste des Brouillards
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
                <i className="pi pi-file-edit mr-2"></i>
                Brouillards Comptables
            </h2>

            {/* Exercice Banner */}
            {currentExercice ? (
                <div className="mb-4 p-3 surface-100 border-round border-1 surface-border">
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-calendar text-primary" style={{ fontSize: '1.5rem' }}></i>
                        <div>
                            <span className="font-semibold text-primary">Exercice courant : </span>
                            <span className="font-bold">{currentExercice.codeExercice}</span>
                            <span className="ml-2 text-600">- {currentExercice.description}</span>
                            <span className="ml-2 text-600">
                                ({toDisplayDate(currentExercice.dateDebut)} - {toDisplayDate(currentExercice.dateFin)})
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-4 p-3 bg-yellow-50 border-round border-1 border-yellow-200">
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-exclamation-triangle text-yellow-600" style={{ fontSize: '1.5rem' }}></i>
                        <span className="text-yellow-700">
                            Aucun exercice courant selectionne. Veuillez selectionner un exercice dans la page Exercices.
                        </span>
                    </div>
                </div>
            )}

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={brouillards}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucun brouillard trouve"
                stripedRows
                sortField="codeBrouillard"
                sortOrder={1}
                className="p-datatable-sm"
            >
                <Column field="codeBrouillard" header="Code" sortable filter style={{ width: '12%' }} />
                <Column field="description" header="Description" sortable filter style={{ width: '25%' }} />
                <Column field="codeJournal" header="Journal" sortable filter style={{ width: '12%' }} />
                <Column
                    field="dateDebut"
                    header="Date Debut"
                    body={(rowData) => dateBodyTemplate(rowData.dateDebut)}
                    sortable
                    style={{ width: '12%' }}
                />
                <Column
                    field="dateFin"
                    header="Date Fin"
                    body={(rowData) => dateBodyTemplate(rowData.dateFin)}
                    sortable
                    style={{ width: '12%' }}
                />
                <Column field="valide" header="Statut" body={valideBodyTemplate} sortable style={{ width: '10%' }} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '12%' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier le Brouillard' : 'Nouveau Brouillard'}
                style={{ width: '55vw' }}
                footer={dialogFooter}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="codeBrouillard" className="font-semibold">Code Brouillard *</label>
                            <InputText
                                id="codeBrouillard"
                                name="codeBrouillard"
                                value={brouillard.codeBrouillard || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: BR-001"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-8">
                        <div className="field">
                            <label htmlFor="description" className="font-semibold">Description *</label>
                            <InputText
                                id="description"
                                name="description"
                                value={brouillard.description || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Description du brouillard"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="journalId" className="font-semibold">Journal *</label>
                            <Dropdown
                                id="journalId"
                                value={brouillard.journalId || ''}
                                options={journaux}
                                optionLabel="codeJournal"
                                optionValue="journalId"
                                onChange={(e) => {
                                    const selectedJournal = journaux.find(j => j.journalId === e.value);
                                    setBrouillard(prev => ({
                                        ...prev,
                                        journalId: e.value,
                                        codeJournal: selectedJournal?.codeJournal || ''
                                    }));
                                }}
                                className="w-full"
                                placeholder="Selectionner un journal"
                                filter
                                showClear
                                loading={loadingJournaux}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="valide" className="font-semibold block mb-2">Valide</label>
                            <InputSwitch
                                id="valide"
                                checked={brouillard.valide || false}
                                onChange={(e) => setBrouillard(prev => ({ ...prev, valide: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="dateDebut" className="font-semibold">Date Debut</label>
                            <InputMask
                                id="dateDebut"
                                value={dateDebutDisplay}
                                onChange={(e) => setDateDebutDisplay(e.target.value ?? '')}
                                mask="99/99/9999"
                                placeholder="jj/mm/aaaa"
                                slotChar="jj/mm/aaaa"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="dateFin" className="font-semibold">Date Fin</label>
                            <InputMask
                                id="dateFin"
                                value={dateFinDisplay}
                                onChange={(e) => setDateFinDisplay(e.target.value ?? '')}
                                mask="99/99/9999"
                                placeholder="jj/mm/aaaa"
                                slotChar="jj/mm/aaaa"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Show exercice info */}
                {currentExercice && (
                    <div className="mt-3 p-3 surface-100 border-round">
                        <p className="text-sm text-color-secondary m-0">
                            <i className="pi pi-info-circle mr-2"></i>
                            Ce brouillard sera associe a l'exercice <strong>{currentExercice.codeExercice}</strong> ({currentExercice.description})
                        </p>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
