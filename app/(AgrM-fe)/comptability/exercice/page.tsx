'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputMask } from 'primereact/inputmask';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import Cookies from 'js-cookie';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { CptExercice } from '../types';

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

export default function ExercicePage() {
    const [exercices, setExercices] = useState<CptExercice[]>([]);
    const [exercice, setExercice] = useState<CptExercice>(new CptExercice());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);

    // Local form state for masked date inputs (dd/mm/yyyy format)
    const [dateDebutDisplay, setDateDebutDisplay] = useState('');
    const [dateFinDisplay, setDateFinDisplay] = useState('');

    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/comptability/exercices');

    useEffect(() => {
        loadExercices();
        // Load current exercice from cookie
        try {
            const cookieData = Cookies.get('currentExercice');
            if (cookieData) {
                setCurrentExercice(JSON.parse(cookieData));
            }
        } catch (e) {
            console.error('Error parsing currentExercice cookie:', e);
        }
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setExercices(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: 'Exercice cree avec succes',
                        life: 3000
                    });
                    // Set the newly created exercice as current
                    if (data && data.exerciceId) {
                        saveExerciceToCookie(data);
                    }
                    loadExercices();
                    setDialogVisible(false);
                    break;
                case 'update':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: 'Exercice modifie avec succes',
                        life: 3000
                    });
                    // Update cookie if this is the current exercice
                    if (data && data.exerciceId && currentExercice?.exerciceId === data.exerciceId) {
                        saveExerciceToCookie(data);
                    }
                    loadExercices();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: 'Exercice supprime avec succes',
                        life: 3000
                    });
                    loadExercices();
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

    const loadExercices = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const saveExerciceToCookie = (exerciceData: CptExercice) => {
        Cookies.set('currentExercice', JSON.stringify(exerciceData));
        setCurrentExercice(exerciceData);
        toast.current?.show({
            severity: 'info',
            summary: 'Exercice courant',
            detail: `Exercice "${exerciceData.codeExercice}" defini comme exercice courant`,
            life: 3000
        });
    };

    const openNew = () => {
        setExercice(new CptExercice());
        setDateDebutDisplay('');
        setDateFinDisplay('');
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: CptExercice) => {
        setExercice({ ...rowData });
        setDateDebutDisplay(toDisplayDate(rowData.dateDebut));
        setDateFinDisplay(toDisplayDate(rowData.dateFin));
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!exercice.codeExercice || !exercice.description) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir les champs obligatoires (Code et Description)',
                life: 3000
            });
            return;
        }

        // Convert display dates to ISO format for API
        const dataToSend = {
            ...exercice,
            dateDebut: toISODate(dateDebutDisplay),
            dateFin: toISODate(dateFinDisplay),
            userAction: getUserAction()
        };

        if (isEdit && exercice.exerciceId) {
            fetchData(dataToSend, 'PUT', `${BASE_URL}/update/${exercice.exerciceId}`, 'update');
        } else {
            fetchData(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleDelete = (rowData: CptExercice) => {
        confirmDialog({
            message: `Etes-vous sur de vouloir supprimer l'exercice "${rowData.codeExercice}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.exerciceId}`, 'delete');
            }
        });
    };

    const handleSelectExercice = (rowData: CptExercice) => {
        saveExerciceToCookie(rowData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setExercice(prev => ({ ...prev, [name]: value }));
    };

    // Column body templates
    const dateBodyTemplate = (date: string) => {
        return toDisplayDate(date) || '-';
    };

    const clotureBodyTemplate = (rowData: CptExercice) => {
        return (
            <Tag
                value={rowData.cloture ? 'Cloture' : 'Ouvert'}
                severity={rowData.cloture ? 'danger' : 'success'}
            />
        );
    };

    const currentExerciceBodyTemplate = (rowData: CptExercice) => {
        const isCurrent = currentExercice?.exerciceId === rowData.exerciceId;
        return isCurrent ? <Tag value="Courant" severity="info" /> : null;
    };

    const actionBodyTemplate = (rowData: CptExercice) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-check"
                    rounded
                    severity="success"
                    tooltip="Definir comme exercice courant"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleSelectExercice(rowData)}
                />
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
                <i className="pi pi-calendar mr-2"></i>
                Liste des Exercices Comptables
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
                <i className="pi pi-calendar mr-2"></i>
                Exercices Comptables
            </h2>

            {/* Current Exercice Banner */}
            {currentExercice && (
                <div className="mb-4 p-3 surface-100 border-round border-1 surface-border">
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-info-circle text-primary" style={{ fontSize: '1.5rem' }}></i>
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
            )}

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={exercices}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucun exercice trouve"
                stripedRows
                sortField="codeExercice"
                sortOrder={-1}
                className="p-datatable-sm"
            >
                <Column field="codeExercice" header="Code" sortable filter style={{ width: '12%' }} />
                <Column field="description" header="Description" sortable filter style={{ width: '25%' }} />
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
                <Column field="cloture" header="Statut" body={clotureBodyTemplate} sortable style={{ width: '10%' }} />
                <Column header="Courant" body={currentExerciceBodyTemplate} style={{ width: '8%' }} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '15%' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? "Modifier l'Exercice" : 'Nouvel Exercice'}
                style={{ width: '50vw' }}
                footer={dialogFooter}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="codeExercice" className="font-semibold">Code Exercice *</label>
                            <InputText
                                id="codeExercice"
                                name="codeExercice"
                                value={exercice.codeExercice || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: 2025"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-8">
                        <div className="field">
                            <label htmlFor="description" className="font-semibold">Description *</label>
                            <InputText
                                id="description"
                                name="description"
                                value={exercice.description || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Description de l'exercice"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
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

                    <div className="col-12 md:col-4">
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

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="cloture" className="font-semibold block mb-2">Cloture</label>
                            <InputSwitch
                                id="cloture"
                                checked={exercice.cloture || false}
                                onChange={(e) => setExercice(prev => ({ ...prev, cloture: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
