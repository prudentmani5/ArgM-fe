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
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { API_BASE_URL } from '@/utils/apiConfig';
import { formatLocalDate } from '@/utils/dateUtils';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import Cookies from 'js-cookie';

export default function GrhPointageComponent() {
    const [pointages, setPointages] = useState<GrhPointage[]>([]);
    const [selectedPointages, setSelectedPointages] = useState<GrhPointage[]>([]);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [holidayDialog, setHolidayDialog] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [holidayLoading, setHolidayLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');

    // Date filters
    const [dateDebut, setDateDebut] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFin, setDateFin] = useState<Date>(new Date());

    // Holiday form
    const [holidayDate, setHolidayDate] = useState<Date | null>(null);
    const [holidayName, setHolidayName] = useState('');

    // Overtime calculation dialog
    const [overtimeDialog, setOvertimeDialog] = useState(false);
    const [overtimeLoading, setOvertimeLoading] = useState(false);
    const [overtimeMonth, setOvertimeMonth] = useState<number | null>(null);
    const [overtimeYear, setOvertimeYear] = useState<number>(new Date().getFullYear());

    // French months options
    const monthOptions = [
        { label: 'Janvier', value: 1 },
        { label: 'Février', value: 2 },
        { label: 'Mars', value: 3 },
        { label: 'Avril', value: 4 },
        { label: 'Mai', value: 5 },
        { label: 'Juin', value: 6 },
        { label: 'Juillet', value: 7 },
        { label: 'Août', value: 8 },
        { label: 'Septembre', value: 9 },
        { label: 'Octobre', value: 10 },
        { label: 'Novembre', value: 11 },
        { label: 'Décembre', value: 12 }
    ];

    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);

    // API hooks
    const { data, loading, error, fetchData, callType } = useConsumApi('');

    const BASE_URL = `${API_BASE_URL}/api/pointages`;

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

    const openHolidayDialog = () => {
        setHolidayDate(null);
        setHolidayName('');
        setHolidayDialog(true);
    };

    const hideHolidayDialog = () => {
        setHolidayDialog(false);
        setHolidayDate(null);
        setHolidayName('');
    };

    const openOvertimeDialog = () => {
        setOvertimeMonth(null);
        setOvertimeYear(new Date().getFullYear());
        setOvertimeDialog(true);
    };

    const hideOvertimeDialog = () => {
        setOvertimeDialog(false);
        setOvertimeMonth(null);
        setOvertimeYear(new Date().getFullYear());
    };

    const handleCalculateOvertime = async () => {
        if (!overtimeMonth) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un mois');
            return;
        }

        setOvertimeLoading(true);

        try {
            const authToken = Cookies.get('token');

            if (!authToken) {
                showToast('error', 'Erreur', 'Session expirée. Veuillez vous reconnecter.');
                setOvertimeLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/calculate-overtime?month=${overtimeMonth}&year=${overtimeYear}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                showToast('success', 'Succès', `${result.updatedRecords} pointages mis à jour`);
                loadPointages();
                hideOvertimeDialog();
            } else {
                const errorData = await response.json();
                showToast('error', 'Erreur', errorData.error || 'Échec du calcul des heures supplémentaires');
            }
        } catch (error) {
            console.error('Error calculating overtime:', error);
            showToast('error', 'Erreur', 'Erreur lors du calcul des heures supplémentaires');
        } finally {
            setOvertimeLoading(false);
        }
    };

    const handleExcelUpload = async (event: FileUploadHandlerEvent) => {
        const file = event.files[0];

        if (!file) {
            showToast('warn', 'Attention', 'Aucun fichier sélectionné');
            return;
        }

        setUploadLoading(true);
        const formData = new FormData();
        formData.append('file', file);

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

    const handleMarkHoliday = async () => {
        if (!holidayDate || !holidayName.trim()) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une date et entrer le nom du jour férié');
            return;
        }

        setHolidayLoading(true);

        try {
            const authToken = Cookies.get('token');

            if (!authToken) {
                showToast('error', 'Erreur', 'Session expirée. Veuillez vous reconnecter.');
                setHolidayLoading(false);
                return;
            }

            const dateStr = holidayDate.toISOString().split('T')[0];
            const response = await fetch(`${BASE_URL}/mark-holiday?date=${dateStr}&holidayName=${encodeURIComponent(holidayName)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                showToast('success', 'Succès', `${result.updatedRecords} pointages marqués comme "${holidayName}"`);
                loadPointages();
                hideHolidayDialog();
            } else {
                const errorData = await response.json();
                showToast('error', 'Erreur', errorData.error || 'Échec du marquage du jour férié');
            }
        } catch (error) {
            console.error('Error marking holiday:', error);
            showToast('error', 'Erreur', 'Erreur lors du marquage du jour férié');
        } finally {
            setHolidayLoading(false);
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

    const heureSuppBodyTemplate = (rowData: GrhPointage) => {
        if (rowData.heureSupp) {
            return (
                <span className="text-orange-500 font-bold" title={rowData.heureSuppReason || ''}>
                    {rowData.heureSuppReason || 'Oui'}
                </span>
            );
        }
        return <span className="text-gray-400">-</span>;
    };

    const uploadDialogFooter = (
        <div>
            <Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={hideUploadDialog} />
        </div>
    );

    const holidayDialogFooter = (
        <div>
            <Button label="Annuler" icon="pi pi-times" className="p-button-text" onClick={hideHolidayDialog} />
            <Button label="Marquer" icon="pi pi-check" onClick={handleMarkHoliday} loading={holidayLoading} />
        </div>
    );

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Importer Excel" icon="pi pi-upload" className="p-button-info" onClick={openUploadDialog} />
                {/* TODO: Uncomment when features are ready
                <Button label="Jour Férié" icon="pi pi-calendar" className="p-button-warning" onClick={openHolidayDialog} />
                <Button label="Calculer les heures Supp" icon="pi pi-calculator" className="p-button-success" onClick={openOvertimeDialog} />
                */}
            </div>
        );
    };

    const overtimeDialogFooter = (
        <div>
            <Button label="Annuler" icon="pi pi-times" className="p-button-text" onClick={hideOvertimeDialog} />
            <Button label="Calculer" icon="pi pi-check" onClick={handleCalculateOvertime} loading={overtimeLoading} />
        </div>
    );

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center">
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

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Gestion des Pointages</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            {(loading || uploadLoading || holidayLoading || overtimeLoading) && (
                <div className="flex justify-content-center">
                    <ProgressSpinner />
                </div>
            )}

            <DataTable
                value={pointages}
                selection={selectedPointages}
                onSelectionChange={(e) => setSelectedPointages(e.value)}
                dataKey="pointageId"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="Aucun pointage trouvé"
                responsiveLayout="scroll"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                <Column field="matriculeId" header="Matricule" sortable></Column>
                <Column field="nomEmploye" header="Nom Employé" sortable></Column>
                <Column field="datePointage" header="Date" body={(rowData) => formatDate(rowData.datePointage)} sortable></Column>
                <Column field="heureEntree" header="Entrée" body={(rowData) => formatTime(rowData.heureEntree)}></Column>
                <Column field="heureSortie" header="Sortie" body={(rowData) => formatTime(rowData.heureSortie)}></Column>
                <Column field="heureEntree2" header="Entrée 2" body={(rowData) => formatTime(rowData.heureEntree2)}></Column>
                <Column field="heureSortie2" header="Sortie 2" body={(rowData) => formatTime(rowData.heureSortie2)}></Column>
                <Column field="heuresTravaillees" header="H. Travaillées" sortable></Column>
                <Column field="heureSupp" header="H. Supp" body={heureSuppBodyTemplate} sortable></Column>
                <Column field="heureSupp135" header="H.Supp 135" sortable></Column>
                <Column field="heureSupp160" header="H.Supp 160" sortable></Column>
                <Column field="heureSupp200" header="H.Supp 200" sortable></Column>
                <Column field="typePointage" header="Type"></Column>
            </DataTable>

            <Dialog
                visible={uploadDialog}
                style={{ width: '50%' }}
                header="Importer Fichier de Pointage"
                modal
                footer={uploadDialogFooter}
                onHide={hideUploadDialog}
            >
                <div className="card">
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
                        disabled={uploadLoading}
                    />
                </div>
            </Dialog>

            <Dialog
                visible={holidayDialog}
                style={{ width: '400px' }}
                header="Marquer un Jour Férié"
                modal
                footer={holidayDialogFooter}
                onHide={hideHolidayDialog}
            >
                <div className="p-fluid">
                    <div className="field mb-4">
                        <label htmlFor="holidayDate" className="font-bold block mb-2">Date du jour férié</label>
                        <Calendar
                            id="holidayDate"
                            value={holidayDate}
                            onChange={(e) => setHolidayDate(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            placeholder="Sélectionner une date"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="holidayName" className="font-bold block mb-2">Nom du jour férié</label>
                        <InputText
                            id="holidayName"
                            value={holidayName}
                            onChange={(e) => setHolidayName(e.target.value)}
                            placeholder="Ex: Noël, Jour de l'An..."
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={overtimeDialog}
                style={{ width: '400px' }}
                header="Calculer les heures supplémentaires"
                modal
                footer={overtimeDialogFooter}
                onHide={hideOvertimeDialog}
            >
                <div className="p-fluid">
                    <div className="field mb-4">
                        <label htmlFor="overtimeMonth" className="font-bold block mb-2">Mois</label>
                        <Dropdown
                            id="overtimeMonth"
                            value={overtimeMonth}
                            options={monthOptions}
                            onChange={(e) => setOvertimeMonth(e.value)}
                            placeholder="Sélectionner un mois"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="overtimeYear" className="font-bold block mb-2">Exercice</label>
                        <InputNumber
                            id="overtimeYear"
                            value={overtimeYear}
                            onValueChange={(e) => setOvertimeYear(e.value || new Date().getFullYear())}
                            useGrouping={false}
                            min={2020}
                            max={2100}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
