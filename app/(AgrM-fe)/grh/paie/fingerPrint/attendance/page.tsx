'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GrhPointage } from './GrhPointage';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toolbar } from 'primereact/toolbar';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { API_BASE_URL } from '@/utils/apiConfig';
import { formatLocalDate } from '@/utils/dateUtils';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import Cookies from 'js-cookie';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';

export default function GrhPointageComponent() {
    const [pointages, setPointages] = useState<GrhPointage[]>([]);
    const [selectedPointages, setSelectedPointages] = useState<GrhPointage[]>([]);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');

    // Single employee upload
    const [singleUploadDialog, setSingleUploadDialog] = useState(false);
    const [singleUploadLoading, setSingleUploadLoading] = useState(false);
    const [singleUploadMatricule, setSingleUploadMatricule] = useState('');

    // Date filters - Default: 20th of previous month to 19th of current month
    const getDefaultDateDebut = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() - 1, 20);
    };
    const getDefaultDateFin = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 19);
    };
    const [dateDebut, setDateDebut] = useState<Date>(getDefaultDateDebut());
    const [dateFin, setDateFin] = useState<Date>(getDefaultDateFin());

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [pointageToDelete, setPointageToDelete] = useState<GrhPointage | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Edit dialog
    const [editDialog, setEditDialog] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [pointageToEdit, setPointageToEdit] = useState<GrhPointage | null>(null);
    const [editNomEmploye, setEditNomEmploye] = useState('');

    // Retard detail dialog
    const [retardDetailDialog, setRetardDetailDialog] = useState(false);
    const [retardDetailPointage, setRetardDetailPointage] = useState<GrhPointage | null>(null);

    // Periode selection for upload
    const [periodes, setPeriodes] = useState<any[]>([]);
    const [selectedPeriode, setSelectedPeriode] = useState<any | null>(null);

    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const singleFileUploadRef = useRef<FileUpload>(null);

    // API hooks
    const { data, loading, error, fetchData, callType } = useConsumApi('');

    const BASE_URL = `${API_BASE_URL}/api/pointages`;
    const BASE_URL_PERIODE = `${API_BASE_URL}/api/grh/paie/periods`;

    // Handle API responses
    useEffect(() => {
        if (data && callType === 'loadPointages') {
            setPointages(Array.isArray(data) ? data : []);
        }
        if (error && callType === 'loadPointages') {
            showToast('error', 'Erreur', 'Échec du chargement des pointages');
        }
    }, [data, error, callType]);

    useEffect(() => {
        loadPointages();
    }, [dateDebut, dateFin]);

    useEffect(() => {
        fetchOpenPeriodes();
    }, []);

    const fetchOpenPeriodes = async () => {
        try {
            const authToken = Cookies.get('token');
            const response = await fetch(`${BASE_URL_PERIODE}/open`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPeriodes(data);
                // Auto-select first open period
                if (data.length > 0) {
                    setSelectedPeriode(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching periodes:', error);
        }
    };

    const getMonthName = (mois: number): string => {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return months[mois - 1] || '';
    };

    const loadPointages = () => {
        const dateDebutStr = formatLocalDate(dateDebut);
        const dateFinStr = formatLocalDate(dateFin);
        fetchData(null, 'Get', `${BASE_URL}/daterange?dateDebut=${dateDebutStr}&dateFin=${dateFinStr}`, 'loadPointages');
    };

    const openUploadDialog = () => {
        setUploadDialog(true);
    };

    const hideUploadDialog = () => {
        setUploadDialog(false);
        if (fileUploadRef.current) {
            fileUploadRef.current.clear();
        }
    };

    const openSingleUploadDialog = () => {
        setSingleUploadMatricule('');
        setSingleUploadDialog(true);
    };

    const hideSingleUploadDialog = () => {
        setSingleUploadDialog(false);
        setSingleUploadMatricule('');
        if (singleFileUploadRef.current) {
            singleFileUploadRef.current.clear();
        }
    };

    const confirmDelete = (pointage: GrhPointage) => {
        setPointageToDelete(pointage);
        setDeleteDialog(true);
    };

    const handleDelete = async () => {
        if (!pointageToDelete) return;
        setDeleteLoading(true);
        try {
            const authToken = Cookies.get('token');

            if (!authToken) {
                showToast('error', 'Erreur', 'Session expirée. Veuillez vous reconnecter.');
                setDeleteLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/delete/${pointageToDelete.pointageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` },
                credentials: 'include'
            });

            if (response.ok) {
                showToast('success', 'Succès', 'Pointage supprimé');
                loadPointages();
            } else {
                showToast('error', 'Erreur', 'Échec de la suppression');
            }
        } catch (error) {
            console.error('Error deleting pointage:', error);
            showToast('error', 'Erreur', 'Erreur lors de la suppression');
        } finally {
            setDeleteLoading(false);
            setDeleteDialog(false);
            setPointageToDelete(null);
        }
    };

    // Edit functions
    const openEditDialog = (pointage: GrhPointage) => {
        setPointageToEdit({ ...pointage });
        setEditNomEmploye(pointage.nomEmploye || '');
        setEditDialog(true);
    };

    const hideEditDialog = () => {
        setEditDialog(false);
        setPointageToEdit(null);
        setEditNomEmploye('');
    };

    // Retard detail functions
    const openRetardDetailDialog = (pointage: GrhPointage) => {
        setRetardDetailPointage(pointage);
        setRetardDetailDialog(true);
    };

    const hideRetardDetailDialog = () => {
        setRetardDetailDialog(false);
        setRetardDetailPointage(null);
    };

    const handleEditCheckboxChange = (e: CheckboxChangeEvent) => {
        if (!pointageToEdit) return;
        const name = e.target.name as string;
        setPointageToEdit({ ...pointageToEdit, [name]: e.checked });
    };

    const handleEditRetardChange = (value: number | null) => {
        if (!pointageToEdit) return;
        setPointageToEdit({ ...pointageToEdit, retard: value });
    };

    const handleUpdate = async () => {
        if (!pointageToEdit) return;
        setEditLoading(true);
        try {
            const authToken = Cookies.get('token');
            if (!authToken) {
                showToast('error', 'Erreur', 'Session expirée. Veuillez vous reconnecter.');
                setEditLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/update/${pointageToEdit.pointageId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pointageToEdit),
                credentials: 'include'
            });

            if (response.ok) {
                showToast('success', 'Succès', 'Pointage mis à jour');
                loadPointages();
                hideEditDialog();
            } else {
                showToast('error', 'Erreur', 'Échec de la mise à jour');
            }
        } catch (error) {
            console.error('Error updating pointage:', error);
            showToast('error', 'Erreur', 'Erreur lors de la mise à jour');
        } finally {
            setEditLoading(false);
        }
    };

    const handleExcelUpload = async (event: FileUploadHandlerEvent) => {
        const file = event.files[0];

        if (!file) {
            showToast('warn', 'Attention', 'Aucun fichier sélectionné');
            return;
        }

        if (!selectedPeriode) {
            showToast('error', 'Erreur', 'Veuillez sélectionner une période de paie');
            return;
        }

        setUploadLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('periodeId', selectedPeriode.periodeId);

        try {
            const authToken = Cookies.get('token');

            if (!authToken) {
                showToast('error', 'Erreur', 'Session expirée. Veuillez vous reconnecter.');
                setUploadLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/upload-excel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                showToast('success', 'Succès', `${result.recordsProcessed} pointages traités avec succès`);
                loadPointages();
                hideUploadDialog();
            } else {
                const errorData = await response.json();
                showToast('error', 'Erreur', errorData.error || 'Échec du traitement du fichier');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast('error', 'Erreur', 'Erreur lors du téléchargement du fichier');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleSingleEmployeeUpload = async (event: FileUploadHandlerEvent) => {
        const file = event.files[0];

        if (!file) {
            showToast('warn', 'Attention', 'Aucun fichier sélectionné');
            return;
        }

        if (!selectedPeriode) {
            showToast('error', 'Erreur', 'Veuillez sélectionner une période de paie');
            return;
        }

        if (!singleUploadMatricule || singleUploadMatricule.trim() === '') {
            showToast('error', 'Erreur', 'Veuillez entrer le matricule de l\'employé');
            return;
        }

        setSingleUploadLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('periodeId', selectedPeriode.periodeId);
        formData.append('matriculeId', singleUploadMatricule.trim());

        try {
            const authToken = Cookies.get('token');

            if (!authToken) {
                showToast('error', 'Erreur', 'Session expirée. Veuillez vous reconnecter.');
                setSingleUploadLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/upload-excel-single`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                showToast('success', 'Succès', `${result.recordsProcessed} pointages traités pour l'employé ${singleUploadMatricule}`);
                loadPointages();
                hideSingleUploadDialog();
            } else {
                const errorData = await response.json();
                showToast('error', 'Erreur', errorData.error || 'Échec du traitement du fichier');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast('error', 'Erreur', 'Erreur lors du téléchargement du fichier');
        } finally {
            setSingleUploadLoading(false);
        }
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const formatTime = (time: Date | null) => {
        if (!time) return '';
        return new Date(time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    // Filter pointages based on globalFilter (for employee search)
    const getFilteredPointages = () => {
        if (!globalFilter || globalFilter.trim() === '') {
            return pointages;
        }
        const filterLower = globalFilter.toLowerCase();
        return pointages.filter((p) =>
            p.matriculeId?.toLowerCase().includes(filterLower) ||
            p.nomEmploye?.toLowerCase().includes(filterLower) ||
            p.groupeNom?.toLowerCase().includes(filterLower)
        );
    };

    const filteredPointages = getFilteredPointages();

    // Get unique employee from filtered data (for display purposes)
    const getFilteredEmployeeInfo = () => {
        if (filteredPointages.length === 0) return null;
        const uniqueMatricules = [...new Set(filteredPointages.map(p => p.matriculeId))];
        if (uniqueMatricules.length === 1) {
            const emp = filteredPointages[0];
            return { matriculeId: emp.matriculeId, nomEmploye: emp.nomEmploye };
        }
        return null; // Multiple employees
    };

    const filteredEmployee = getFilteredEmployeeInfo();

    // Calculate total retard and jours prestés (from filtered data)
    const calculateRetardSummary = () => {
        let totalRetardMinutes = 0;
        let countedRecords = 0;

        filteredPointages.forEach((pointage) => {
            // Only count non-justified retards (same logic as backend)
            if (pointage.retard !== null && pointage.retard > 0) {
                const isJustified = pointage.hasJustifiedExit || pointage.hasALeave || pointage.hasJustifiedRetard;
                if (!isJustified) {
                    totalRetardMinutes += pointage.retard;
                    countedRecords++;
                }
            }
        });

        // Convert to days: 480 minutes = 1 working day (8 hours)
        const MINUTES_PER_DAY = 480;
        const retardInDays = totalRetardMinutes / MINUTES_PER_DAY;

        // Jours prestés = 30 - retard days (same formula as backend SaisiePaieService)
        const joursPrestes = Math.max(0, 30 - retardInDays);

        return {
            totalRetardMinutes,
            retardInDays: retardInDays.toFixed(2),
            joursPrestes: joursPrestes.toFixed(2),
            countedRecords
        };
    };

    const retardSummary = calculateRetardSummary();

    const retardBodyTemplate = (rowData: GrhPointage) => {
        if (rowData.retard === null) return <span className="text-gray-400">-</span>;
        if (rowData.retard === 0) return <span className="text-green-500">À l'heure</span>;

        // If retard is justified (has justified exit, on leave, or manually marked as justified), show in orange instead of red
        const isJustified = rowData.hasJustifiedExit || rowData.hasALeave || rowData.hasJustifiedRetard;
        if (isJustified) {
            return (
                <span className="text-orange-500" title="Retard justifié">
                    {rowData.retard} min (J)
                </span>
            );
        }
        return <span className="text-red-500 font-bold">{rowData.retard} min</span>;
    };

    const hasJustifiedExitBodyTemplate = (rowData: GrhPointage) => {
        if (rowData.hasJustifiedExit === null) return <span className="text-gray-400">-</span>;
        return rowData.hasJustifiedExit
            ? <span className="p-tag p-tag-info">Oui</span>
            : <span className="text-gray-400">Non</span>;
    };

    const hasALeaveBodyTemplate = (rowData: GrhPointage) => {
        if (rowData.hasALeave === null) return <span className="text-gray-400">-</span>;
        return rowData.hasALeave
            ? <span className="p-tag p-tag-warning">En congé</span>
            : <span className="text-gray-400">Non</span>;
    };

    const actionBodyTemplate = (rowData: GrhPointage) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-text"
                    onClick={() => openRetardDetailDialog(rowData)}
                    tooltip="Détails du retard"
                />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-success p-button-text"
                    onClick={() => openEditDialog(rowData)}
                    tooltip="Modifier"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-text"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Supprimer"
                />
            </div>
        );
    };

    const uploadDialogFooter = (
        <div>
            <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={hideUploadDialog} />
        </div>
    );

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Importer Excel" icon="pi pi-upload" className="p-button-info" onClick={openUploadDialog} />
                <Button label="Importer pour un seul employé" icon="pi pi-user" className="p-button-warning" onClick={openSingleUploadDialog} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher employé..."
                    />
                </span>
                <Calendar
                    value={dateDebut}
                    onChange={(e) => e.value && setDateDebut(e.value)}
                    dateFormat="dd/mm/yy"
                    placeholder="Date début"
                    showIcon
                />
                <Calendar
                    value={dateFin}
                    onChange={(e) => e.value && setDateFin(e.value)}
                    dateFormat="dd/mm/yy"
                    placeholder="Date fin"
                    showIcon
                />
                <Button
                    icon="pi pi-refresh"
                    className="p-button-rounded"
                    onClick={loadPointages}
                    loading={loading}
                />
            </div>
        );
    };


    return (
        <div className="card">
            <Toast ref={toast} />

            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            {(loading || uploadLoading || deleteLoading || editLoading || singleUploadLoading) && (
                <div className="flex justify-content-center">
                    <ProgressSpinner />
                </div>
            )}

            {/* Summary Panel - Total Retard and Jours Prestés */}
            {filteredPointages.length > 0 && (
                <div className="mb-4">
                    {/* Employee Header when filtering for a single employee */}
                    {filteredEmployee && (
                        <div className="surface-card shadow-1 p-3 border-round mb-3 flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center bg-primary border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-user text-white text-xl"></i>
                            </div>
                            <div>
                                <div className="text-900 font-bold text-lg">{filteredEmployee.nomEmploye}</div>
                                <span className="text-500">Matricule: {filteredEmployee.matriculeId}</span>
                            </div>
                        </div>
                    )}
                    {!filteredEmployee && globalFilter && (
                        <div className="surface-card shadow-1 p-3 border-round mb-3">
                            <i className="pi pi-info-circle text-blue-500 mr-2"></i>
                            <span className="text-600">Recherchez un employé spécifique pour voir son total individuel</span>
                        </div>
                    )}
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="surface-card shadow-2 p-3 border-round">
                                <div className="flex justify-content-between mb-3">
                                    <div>
                                        <span className="block text-500 font-medium mb-2">Total Retard</span>
                                        <div className="text-900 font-medium text-xl">
                                            {retardSummary.totalRetardMinutes} min
                                        </div>
                                    </div>
                                    <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                        <i className="pi pi-clock text-orange-500 text-xl"></i>
                                    </div>
                                </div>
                                <span className="text-500 text-sm">{retardSummary.countedRecords} retards non justifiés</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="surface-card shadow-2 p-3 border-round">
                                <div className="flex justify-content-between mb-3">
                                    <div>
                                        <span className="block text-500 font-medium mb-2">Équivalent en Jours</span>
                                        <div className="text-900 font-medium text-xl">
                                            {retardSummary.retardInDays} jours
                                        </div>
                                    </div>
                                    <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                        <i className="pi pi-calendar-minus text-red-500 text-xl"></i>
                                    </div>
                                </div>
                                <span className="text-500 text-sm">480 min = 1 jour de travail</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="surface-card shadow-2 p-3 border-round">
                                <div className="flex justify-content-between mb-3">
                                    <div>
                                        <span className="block text-500 font-medium mb-2">Jours Prestés</span>
                                        <div className="text-green-500 font-medium text-xl">
                                            {retardSummary.joursPrestes} / 30 jours
                                        </div>
                                    </div>
                                    <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                        <i className="pi pi-check-circle text-green-500 text-xl"></i>
                                    </div>
                                </div>
                                <span className="text-500 text-sm">Formule: 30 - (retard / 480)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DataTable
                value={pointages}
                selection={selectedPointages}
                onSelectionChange={(e) => setSelectedPointages(e.value)}
                dataKey="pointageId"
                paginator
                rows={25}
                rowsPerPageOptions={[10, 25, 50, 100]}
                globalFilter={globalFilter}
                emptyMessage="Aucun pointage trouvé"
                responsiveLayout="scroll"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                <Column field="matriculeId" header="Matricule" sortable></Column>
                <Column field="nomEmploye" header="Nom Employé" sortable></Column>
                <Column field="datePointage" header="Date" body={(rowData) => formatDate(rowData.datePointage)} sortable></Column>
                <Column field="heureEntree" header="Entrée" body={(rowData) => formatTime(rowData.heureEntree)}></Column>
                <Column field="hasJustifiedExit" header="Sortie Justifiée" body={hasJustifiedExitBodyTemplate} sortable></Column>
                <Column field="hasALeave" header="En Congé" body={hasALeaveBodyTemplate} sortable></Column>
                <Column field="heureSortie" header="Sortie" body={(rowData) => formatTime(rowData.heureSortie)}></Column>
                <Column field="heureEntree2" header="Entrée 2" body={(rowData) => formatTime(rowData.heureEntree2)}></Column>
                <Column field="heureSortie2" header="Sortie 2" body={(rowData) => formatTime(rowData.heureSortie2)}></Column>
                <Column field="retard" header="Retard" body={retardBodyTemplate} sortable></Column>
                <Column field="heuresTravaillees" header="H. Travaillées" sortable></Column>
                <Column field="groupeNom" header="Groupe" sortable></Column>
                <Column body={actionBodyTemplate} header="Actions" style={{ width: '8rem' }}></Column>
            </DataTable>

            <Dialog
                visible={uploadDialog}
                style={{ width: '500px' }}
                header="Importer Fichier de Pointage"
                modal
                footer={uploadDialogFooter}
                onHide={hideUploadDialog}
            >
                <div className="p-fluid">
                    <div className="field mb-4">
                        <label htmlFor="periode" className="font-bold">Période de Paie *</label>
                        <Dropdown
                            id="periode"
                            value={selectedPeriode}
                            options={periodes}
                            onChange={(e) => setSelectedPeriode(e.value)}
                            optionLabel="periodeId"
                            itemTemplate={(option: any) => (
                                <span>{getMonthName(option.mois)} {option.annee}</span>
                            )}
                            valueTemplate={(option: any) => option ? (
                                <span>{getMonthName(option.mois)} {option.annee}</span>
                            ) : (
                                <span>Sélectionner la période</span>
                            )}
                            placeholder="Sélectionner la période"
                            className="w-full"
                        />
                        {selectedPeriode && (
                            <small className="text-gray-500">
                                Du {selectedPeriode.dateDebut} au {selectedPeriode.dateFin}
                            </small>
                        )}
                    </div>

                    <p className="mb-3">
                        Sélectionnez un fichier Excel (.xls, .xlsx) contenant les données de pointage.
                        Le fichier doit contenir les colonnes: AC-No., No., Name, Time, State, New State, Exception
                    </p>
                    <FileUpload
                        ref={fileUploadRef}
                        name="file"
                        customUpload
                        uploadHandler={handleExcelUpload}
                        accept=".xls,.xlsx"
                        maxFileSize={52428800}
                        emptyTemplate={<p className="m-0">Glissez-déposez le fichier ici.</p>}
                        chooseLabel="Choisir"
                        uploadLabel={uploadLoading ? "Chargement..." : "Télécharger"}
                        cancelLabel="Annuler"
                        disabled={uploadLoading || !selectedPeriode}
                    />
                </div>
            </Dialog>

            <Dialog
                visible={singleUploadDialog}
                style={{ width: '500px' }}
                header="Importer Pointage pour un Seul Employé"
                modal
                footer={
                    <div>
                        <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={hideSingleUploadDialog} />
                    </div>
                }
                onHide={hideSingleUploadDialog}
            >
                <div className="p-fluid">
                    <div className="field mb-4">
                        <label htmlFor="singlePeriode" className="font-bold">Période de Paie *</label>
                        <Dropdown
                            id="singlePeriode"
                            value={selectedPeriode}
                            options={periodes}
                            onChange={(e) => setSelectedPeriode(e.value)}
                            optionLabel="periodeId"
                            itemTemplate={(option: any) => (
                                <span>{getMonthName(option.mois)} {option.annee}</span>
                            )}
                            valueTemplate={(option: any) => option ? (
                                <span>{getMonthName(option.mois)} {option.annee}</span>
                            ) : (
                                <span>Sélectionner la période</span>
                            )}
                            placeholder="Sélectionner la période"
                            className="w-full"
                        />
                        {selectedPeriode && (
                            <small className="text-gray-500">
                                Du {selectedPeriode.dateDebut} au {selectedPeriode.dateFin}
                            </small>
                        )}
                    </div>

                    <div className="field mb-4">
                        <label htmlFor="matriculeId" className="font-bold">Matricule de l'Employé *</label>
                        <InputText
                            id="matriculeId"
                            value={singleUploadMatricule}
                            onChange={(e) => setSingleUploadMatricule(e.target.value)}
                            placeholder="Entrez le matricule (ex: 1440)"
                            className="w-full"
                        />
                        <small className="text-gray-500">
                            Les pointages existants de cet employé pour la période seront supprimés et remplacés.
                        </small>
                    </div>

                    <p className="mb-3">
                        Sélectionnez un fichier Excel (.xls, .xlsx) contenant les données de pointage.
                        Seules les lignes correspondant au matricule spécifié seront traitées.
                    </p>
                    <FileUpload
                        ref={singleFileUploadRef}
                        name="file"
                        customUpload
                        uploadHandler={handleSingleEmployeeUpload}
                        accept=".xls,.xlsx"
                        maxFileSize={52428800}
                        emptyTemplate={<p className="m-0">Glissez-déposez le fichier ici.</p>}
                        chooseLabel="Choisir"
                        uploadLabel={singleUploadLoading ? "Chargement..." : "Télécharger"}
                        cancelLabel="Annuler"
                        disabled={singleUploadLoading || !selectedPeriode || !singleUploadMatricule.trim()}
                    />
                </div>
            </Dialog>

            <Dialog
                visible={deleteDialog}
                style={{ width: '400px' }}
                header="Confirmer la suppression"
                modal
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteDialog(false)} />
                        <Button label="Supprimer" icon="pi pi-trash" className="p-button-danger" onClick={handleDelete} loading={deleteLoading} />
                    </div>
                }
                onHide={() => setDeleteDialog(false)}
            >
                <p>Voulez-vous vraiment supprimer le pointage de <strong>{pointageToDelete?.nomEmploye}</strong> du <strong>{pointageToDelete?.datePointage ? formatDate(pointageToDelete.datePointage) : ''}</strong> ?</p>
            </Dialog>

            <Dialog
                visible={editDialog}
                style={{ width: '450px' }}
                header="Modifier le Retard"
                modal
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" className="p-button-text" onClick={hideEditDialog} />
                        <Button label="Enregistrer" icon="pi pi-check" className="p-button-success" onClick={handleUpdate} loading={editLoading} />
                    </div>
                }
                onHide={hideEditDialog}
            >
                {pointageToEdit && (
                    <div className="p-fluid">
                        <div className="mb-4 p-3 surface-100 border-round">
                            <div className="font-bold text-lg">{editNomEmploye}</div>
                            <div className="text-500">
                                {pointageToEdit.datePointage ? formatDate(pointageToEdit.datePointage) : ''}
                                {pointageToEdit.groupeNom && (
                                    <span className="ml-2">
                                        <i className="pi pi-users mr-1"></i>{pointageToEdit.groupeNom}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="field mb-4">
                            <label htmlFor="editRetard" className="font-bold mb-2 block">
                                <i className="pi pi-clock mr-2"></i>Minutes de Retard
                            </label>
                            <InputNumber
                                id="editRetard"
                                value={pointageToEdit.retard}
                                onValueChange={(e) => handleEditRetardChange(e.value ?? null)}
                                min={0}
                                max={480}
                                suffix=" min"
                                showButtons
                                buttonLayout="horizontal"
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                className="w-full"
                            />
                            <small className="text-500 mt-1 block">
                                <i className="pi pi-info-circle mr-1"></i>
                                0 = à l'heure, max 480 min (8h)
                            </small>
                        </div>

                        <div className="field-checkbox mb-3 p-3 surface-50 border-round">
                            <Checkbox
                                inputId="hasJustifiedRetard"
                                name="hasJustifiedRetard"
                                checked={pointageToEdit.hasJustifiedRetard ?? false}
                                onChange={handleEditCheckboxChange}
                            />
                            <label htmlFor="hasJustifiedRetard" className="ml-2 font-medium">
                                Retard Justifié
                            </label>
                            <div className="text-500 text-sm mt-1 ml-4">
                                Si coché, le retard ne sera pas comptabilisé dans les pénalités
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            <Dialog
                visible={retardDetailDialog}
                style={{ width: '500px' }}
                header="Détails du Calcul de Retard"
                modal
                footer={
                    <div>
                        <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={hideRetardDetailDialog} />
                    </div>
                }
                onHide={hideRetardDetailDialog}
            >
                {retardDetailPointage && (
                    <div className="p-fluid">
                        <div className="mb-4 p-3 surface-100 border-round">
                            <div className="text-xl font-bold mb-2">{retardDetailPointage.nomEmploye}</div>
                            <div className="text-500">Matricule: {retardDetailPointage.matriculeId}</div>
                            <div className="text-500">Date: {retardDetailPointage.datePointage ? formatDate(retardDetailPointage.datePointage) : '-'}</div>
                        </div>

                        <div className="mb-3">
                            <div className="font-semibold mb-2">
                                <i className="pi pi-users mr-2"></i>Groupe d'horaire
                            </div>
                            <div className="pl-4">
                                {retardDetailPointage.groupeNom ? (
                                    <div>
                                        <span className="p-tag p-tag-info">{retardDetailPointage.groupeNom}</span>
                                        {(retardDetailPointage.groupeHeureDebut || retardDetailPointage.groupeHeureFin) && (
                                            <div className="mt-2 text-600">
                                                <i className="pi pi-clock mr-1"></i>
                                                Horaire prévu: <strong>{retardDetailPointage.groupeHeureDebut || '-'}</strong> → <strong>{retardDetailPointage.groupeHeureFin || '-'}</strong>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-orange-500">Aucun groupe assigné</span>
                                )}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="font-semibold mb-2">
                                <i className="pi pi-sign-in mr-2"></i>Présence de l'employé
                            </div>
                            <div className="pl-4 surface-50 p-3 border-round">
                                <div className="grid">
                                    <div className="col-6">
                                        <div className="text-500 text-sm mb-1">Arrivée</div>
                                        {retardDetailPointage.heureEntree ? (
                                            <span className="text-lg font-semibold text-primary">{formatTime(retardDetailPointage.heureEntree)}</span>
                                        ) : (
                                            <span className="text-gray-400">Non enregistrée</span>
                                        )}
                                    </div>
                                    <div className="col-6">
                                        <div className="text-500 text-sm mb-1">Départ</div>
                                        {retardDetailPointage.heureSortie ? (
                                            <span className="text-lg font-semibold">{formatTime(retardDetailPointage.heureSortie)}</span>
                                        ) : (
                                            <span className="text-gray-400">Non enregistrée</span>
                                        )}
                                    </div>
                                </div>
                                {(retardDetailPointage.heureEntree2 || retardDetailPointage.heureSortie2) && (
                                    <div className="grid mt-2 pt-2 border-top-1 surface-border">
                                        <div className="col-6">
                                            <div className="text-500 text-sm mb-1">Arrivée 2</div>
                                            {retardDetailPointage.heureEntree2 ? (
                                                <span className="text-lg font-semibold text-primary">{formatTime(retardDetailPointage.heureEntree2)}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </div>
                                        <div className="col-6">
                                            <div className="text-500 text-sm mb-1">Départ 2</div>
                                            {retardDetailPointage.heureSortie2 ? (
                                                <span className="text-lg font-semibold">{formatTime(retardDetailPointage.heureSortie2)}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="font-semibold mb-2">
                                <i className="pi pi-calculator mr-2"></i>Calcul du retard
                            </div>
                            <div className="pl-4 surface-50 p-3 border-round">
                                {retardDetailPointage.retard === null ? (
                                    <div className="text-gray-500">
                                        <i className="pi pi-info-circle mr-2"></i>
                                        Retard non calculé (groupe d'horaire non trouvé ou heure d'entrée manquante)
                                    </div>
                                ) : retardDetailPointage.retard === 0 ? (
                                    <div className="text-green-500">
                                        <i className="pi pi-check-circle mr-2"></i>
                                        À l'heure (dans la tolérance de 10 minutes)
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-2">
                                            <span className="text-red-500 font-bold text-xl">{retardDetailPointage.retard} minutes</span>
                                            <span className="text-500 ml-2">de retard</span>
                                        </div>
                                        <div className="text-sm text-600">
                                            <i className="pi pi-info-circle mr-1"></i>
                                            Une tolérance de 10 minutes est appliquée avant de compter le retard.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="font-semibold mb-2">
                                <i className="pi pi-flag mr-2"></i>Statut de justification
                            </div>
                            <div className="pl-4">
                                <div className="flex flex-column gap-2">
                                    <div className="flex align-items-center gap-2">
                                        {retardDetailPointage.hasJustifiedRetard ? (
                                            <span className="p-tag p-tag-success">
                                                <i className="pi pi-check mr-1"></i>Retard justifié manuellement
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">
                                                <i className="pi pi-times mr-1"></i>Retard non justifié manuellement
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex align-items-center gap-2">
                                        {retardDetailPointage.hasJustifiedExit ? (
                                            <span className="p-tag p-tag-info">
                                                <i className="pi pi-sign-out mr-1"></i>Sortie justifiée ce jour
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">
                                                <i className="pi pi-times mr-1"></i>Pas de sortie justifiée
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex align-items-center gap-2">
                                        {retardDetailPointage.hasALeave ? (
                                            <span className="p-tag p-tag-warning">
                                                <i className="pi pi-calendar mr-1"></i>En congé ce jour
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">
                                                <i className="pi pi-times mr-1"></i>Pas en congé
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(retardDetailPointage.hasJustifiedExit || retardDetailPointage.hasALeave || retardDetailPointage.hasJustifiedRetard) && retardDetailPointage.retard !== null && retardDetailPointage.retard > 0 && (
                            <div className="mt-3 p-3 surface-warning border-round">
                                <i className="pi pi-info-circle mr-2 text-orange-500"></i>
                                <span className="text-orange-700">
                                    Ce retard est considéré comme justifié et n'est pas comptabilisé dans les pénalités.
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
}
