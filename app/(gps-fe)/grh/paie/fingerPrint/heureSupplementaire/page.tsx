'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SaisieHeureSupplementaire } from './SaisieHeureSupplementaire';
import { Button } from 'primereact/button';
import { DataTable, DataTableRowEditCompleteEvent } from 'primereact/datatable';
import { Column, ColumnEditorOptions } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { PeriodePaie } from '../../periodePaie/PeriodePaie';
import { API_BASE_URL } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { stringToDate, dateToString } from '@/utils/dateUtils';

// Career info with employee details from /api/grh/carriere/findall
interface CarriereWithEmployee {
    matriculeId: string;
    nom: string;
    prenom: string;
    base: number;
    fonctionId: string;
    departmentId: string;
}

// French months names
const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Get today's date in yyyy-MM-dd format
const getTodayDateStr = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function HeureSupplementaireComponent() {
    const [heuresSupp, setHeuresSupp] = useState<SaisieHeureSupplementaire[]>([]);
    const [filteredHeuresSupp, setFilteredHeuresSupp] = useState<SaisieHeureSupplementaire[]>([]);
    const [modifiedRows, setModifiedRows] = useState<Set<string>>(new Set());
    const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>('');
    const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateStr());
    const [openPeriodes, setOpenPeriodes] = useState<PeriodePaie[]>([]);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [allCarrieres, setAllCarrieres] = useState<CarriereWithEmployee[]>([]);
    const [periodsLoading, setPeriodsLoading] = useState(true);

    const toast = useRef<Toast>(null);
    const baseUrl = `${API_BASE_URL}`;

    // API hooks
    const { data: openPeriodesData, fetchData: fetchOpenPeriodes, callType: openPeriodesCallType } = useConsumApi('');
    const { data: carrieresData, fetchData: fetchCarrieres, callType: carrieresCallType } = useConsumApi('');
    const { data: existingHsData, fetchData: fetchExistingHs, callType: existingHsCallType } = useConsumApi('');
    const { data: saveData, error: saveError, fetchData: saveHeuresSupp, callType: saveCallType } = useConsumApi('');

    // Load all carrieres and open periods on mount
    useEffect(() => {
        fetchCarrieres(null, 'Get', `${baseUrl}/api/grh/carriere/findall`, 'loadCarrieres');
        loadOpenPeriodes();
    }, []);

    // Handle carrieres loading
    useEffect(() => {
        if (carrieresData && carrieresCallType === 'loadCarrieres') {
            const carrieres = Array.isArray(carrieresData) ? carrieresData : [carrieresData];
            setAllCarrieres(carrieres);
        }
    }, [carrieresData, carrieresCallType]);

    // Handle open periods loading
    useEffect(() => {
        if (openPeriodesData && openPeriodesCallType === 'loadOpenPeriodes') {
            const periods = Array.isArray(openPeriodesData) ? openPeriodesData : [openPeriodesData];
            setOpenPeriodes(periods);
            setPeriodsLoading(false);
        }
    }, [openPeriodesData, openPeriodesCallType]);

    // Handle existing HS data merge
    useEffect(() => {
        if (existingHsData && existingHsCallType === 'loadExistingHs') {
            const existingList = Array.isArray(existingHsData) ? existingHsData : [];

            // Create a map for quick lookup using matriculeId + dateSaisie as key
            const existingMap = new Map<string, any>();
            existingList.forEach((item: any) => {
                const key = `${item.matriculeId}_${item.dateSaisie || ''}`;
                existingMap.set(key, item);
            });

            // Merge existing data with employee list
            const updatedList = heuresSupp.map(hs => {
                const key = `${hs.matriculeId}_${hs.dateSaisie}`;
                const existing = existingMap.get(key);
                if (existing) {
                    const updated = Object.assign(new SaisieHeureSupplementaire(), hs);
                    updated.id = existing.id;
                    updated.hs135 = existing.hs135 || 0;
                    updated.hs160 = existing.hs160 || 0;
                    updated.hs200 = existing.hs200 || 0;
                    updated.calculateMontants();
                    return updated;
                }
                return hs;
            });
            setHeuresSupp(updatedList);
            setFilteredHeuresSupp(updatedList);
            setLoading(false);
        }
    }, [existingHsData, existingHsCallType]);

    // Handle save response
    useEffect(() => {
        if (saveData && saveCallType === 'saveHeuresSupp') {
            showToast('success', 'Succès', 'Les heures supplémentaires ont été enregistrées.');
            setModifiedRows(new Set());
            setSaveLoading(false);
            // Reload data
            if (selectedPeriodeId && selectedDateStr) {
                loadDataForPeriodAndDate(selectedPeriodeId, selectedDateStr);
            }
        }
        if (saveError && saveCallType === 'saveHeuresSupp') {
            showToast('error', 'Erreur', 'Échec de l\'enregistrement.');
            setSaveLoading(false);
        }
    }, [saveData, saveError, saveCallType]);

    const loadOpenPeriodes = () => {
        setPeriodsLoading(true);
        fetchOpenPeriodes(null, 'Get', `${baseUrl}/api/grh/paie/periods/open`, 'loadOpenPeriodes');
    };

    const loadDataForPeriodAndDate = (periodeId: string, dateSaisie: string) => {
        if (!periodeId || !dateSaisie || allCarrieres.length === 0) {
            setHeuresSupp([]);
            setFilteredHeuresSupp([]);
            return;
        }

        setLoading(true);
        setModifiedRows(new Set());
        setGlobalFilter('');

        // Create initial heuresSupp entries from carrieres
        const initialData: SaisieHeureSupplementaire[] = allCarrieres.map((carriere: CarriereWithEmployee) => {
            const hs = new SaisieHeureSupplementaire();
            hs.matriculeId = carriere.matriculeId;
            hs.nom = carriere.nom || '';
            hs.prenom = carriere.prenom || '';
            hs.periodeId = periodeId;
            hs.dateSaisie = dateSaisie;
            hs.calculateMontants();
            return hs;
        });

        setHeuresSupp(initialData);
        setFilteredHeuresSupp(initialData);

        // Fetch existing HS data for this period
        fetchExistingHs(null, 'Get', `${baseUrl}/api/grh/paie/saisie-paie/overtime/periode/${periodeId}`, 'loadExistingHs');
    };

    const handlePeriodChange = (periodeId: string) => {
        setSelectedPeriodeId(periodeId);
        if (periodeId && selectedDateStr) {
            loadDataForPeriodAndDate(periodeId, selectedDateStr);
        } else {
            setHeuresSupp([]);
            setFilteredHeuresSupp([]);
        }
    };

    const handleDateChange = (date: Date | null | undefined) => {
        const dateStr = dateToString(date);
        // Extract just the date part (yyyy-MM-dd) without time
        const datePart = dateStr ? dateStr.split(' ')[0] : '';
        setSelectedDateStr(datePart);
        if (selectedPeriodeId && datePart) {
            loadDataForPeriodAndDate(selectedPeriodeId, datePart);
        } else {
            setHeuresSupp([]);
            setFilteredHeuresSupp([]);
        }
    };

    const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
        const { newData, index } = e;

        // Find the actual index in the full heuresSupp array
        const matriculeId = newData.matriculeId;
        const fullListIndex = heuresSupp.findIndex(hs => hs.matriculeId === matriculeId);

        if (fullListIndex === -1) return;

        const updatedHeuresSupp = [...heuresSupp];

        // Create proper instance and recalculate
        const updated = Object.assign(new SaisieHeureSupplementaire(), newData);
        updated.calculateMontants();
        updatedHeuresSupp[fullListIndex] = updated;

        setHeuresSupp(updatedHeuresSupp);

        // Update filtered list too
        const filteredIndex = filteredHeuresSupp.findIndex(hs => hs.matriculeId === matriculeId);
        if (filteredIndex !== -1) {
            const updatedFiltered = [...filteredHeuresSupp];
            updatedFiltered[filteredIndex] = updated;
            setFilteredHeuresSupp(updatedFiltered);
        }

        // Track modified row
        setModifiedRows(prev => new Set(prev).add(updated.matriculeId));
    };

    const numberEditor = (options: ColumnEditorOptions) => {
        return (
            <InputNumber
                value={options.value}
                onValueChange={(e) => options.editorCallback?.(e.value ?? 0)}
                mode="decimal"
                minFractionDigits={0}
                maxFractionDigits={2}
                min={0}
                className="w-full"
            />
        );
    };

    const handleSave = () => {
        if (modifiedRows.size === 0) {
            showToast('info', 'Information', 'Aucune modification à enregistrer.');
            return;
        }

        setSaveLoading(true);

        // Get only modified rows
        const dataToSave = heuresSupp.filter(hs => modifiedRows.has(hs.matriculeId));

        // Save to SaisiePaie overtime endpoint
        saveHeuresSupp(dataToSave, 'Post', `${baseUrl}/api/grh/paie/saisie-paie/overtime/bulk-save`, 'saveHeuresSupp');
    };

    const handleSaveAll = () => {
        if (heuresSupp.length === 0) {
            showToast('info', 'Information', 'Aucune donnée à enregistrer.');
            return;
        }

        // Filter only rows with overtime hours > 0
        const dataToSave = heuresSupp.filter(hs => hs.hs135 > 0 || hs.hs160 > 0 || hs.hs200 > 0);

        if (dataToSave.length === 0) {
            showToast('info', 'Information', 'Aucune heure supplémentaire saisie.');
            return;
        }

        setSaveLoading(true);
        saveHeuresSupp(dataToSave, 'Post', `${baseUrl}/api/grh/paie/saisie-paie/overtime/bulk-save`, 'saveHeuresSupp');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const getPeriodeLabel = (periode: PeriodePaie) => {
        const monthName = MONTH_NAMES[periode.mois - 1] || '';
        return `${monthName} ${periode.annee}`;
    };

    // Apply search filter
    const applyFilter = (filterValue: string) => {
        setGlobalFilter(filterValue);
        if (!filterValue.trim()) {
            setFilteredHeuresSupp(heuresSupp);
            return;
        }

        const lowerFilter = filterValue.toLowerCase().trim();
        const filtered = heuresSupp.filter(hs =>
            hs.matriculeId.toLowerCase().includes(lowerFilter) ||
            hs.nom.toLowerCase().includes(lowerFilter) ||
            hs.prenom.toLowerCase().includes(lowerFilter)
        );
        setFilteredHeuresSupp(filtered);
    };

    // Calculate grand totals for the entire period (not filtered)
    const totalHs135 = heuresSupp.reduce((sum, hs) => sum + (hs.hs135 || 0), 0);
    const totalHs160 = heuresSupp.reduce((sum, hs) => sum + (hs.hs160 || 0), 0);
    const totalHs200 = heuresSupp.reduce((sum, hs) => sum + (hs.hs200 || 0), 0);
    const totalHeures = totalHs135 + totalHs160 + totalHs200;

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center">
                <div className="flex align-items-center gap-2">
                    <label htmlFor="periodeSelect" className="font-semibold">Période:</label>
                    <Dropdown
                        id="periodeSelect"
                        value={selectedPeriodeId}
                        options={openPeriodes.map(p => ({
                            label: getPeriodeLabel(p),
                            value: p.periodeId
                        }))}
                        onChange={(e) => handlePeriodChange(e.value || '')}
                        placeholder="Sélectionner une période"
                        showClear
                        filter
                        className="w-12rem"
                        emptyMessage="Aucune période ouverte"
                        disabled={openPeriodes.length === 0}
                    />
                </div>
                <div className="flex align-items-center gap-2">
                    <label htmlFor="dateSelect" className="font-semibold">Date:</label>
                    <Calendar
                        id="dateSelect"
                        value={stringToDate(selectedDateStr)}
                        onChange={(e) => handleDateChange(e.value as Date | null)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        placeholder="Sélectionner une date"
                        className="w-10rem"
                        disabled={!selectedPeriodeId}
                    />
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Rechercher..."
                        value={globalFilter}
                        onChange={(e) => applyFilter(e.target.value)}
                        disabled={!selectedPeriodeId || !selectedDateStr}
                    />
                </span>
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    icon="pi pi-refresh"
                    label="Actualiser"
                    outlined
                    onClick={() => {
                        loadOpenPeriodes();
                        if (allCarrieres.length === 0) {
                            fetchCarrieres(null, 'Get', `${baseUrl}/api/grh/carriere/findall`, 'loadCarrieres');
                        }
                        if (selectedPeriodeId && selectedDateStr) {
                            loadDataForPeriodAndDate(selectedPeriodeId, selectedDateStr);
                        }
                    }}
                    disabled={loading}
                />
                <Button
                    icon="pi pi-save"
                    label={`Enregistrer (${modifiedRows.size})`}
                    onClick={handleSave}
                    disabled={modifiedRows.size === 0 || saveLoading || !selectedDateStr}
                    loading={saveLoading}
                    severity="success"
                />
                <Button
                    icon="pi pi-save"
                    label="Enregistrer tout"
                    onClick={handleSaveAll}
                    disabled={heuresSupp.length === 0 || saveLoading || !selectedDateStr}
                    loading={saveLoading}
                    severity="info"
                />
            </div>
        );
    };

    const rowClassName = (data: SaisieHeureSupplementaire) => {
        return modifiedRows.has(data.matriculeId) ? 'bg-yellow-50' : '';
    };

    const footer = (
        <div className="flex flex-wrap justify-content-between gap-4 p-3 surface-100 border-round">
            <div className="flex flex-column">
                <span className="font-semibold text-primary">HS 135%</span>
                <span className="text-lg">{totalHs135}h</span>
            </div>
            <div className="flex flex-column">
                <span className="font-semibold text-primary">HS 160%</span>
                <span className="text-lg">{totalHs160}h</span>
            </div>
            <div className="flex flex-column">
                <span className="font-semibold text-primary">HS 200%</span>
                <span className="text-lg">{totalHs200}h</span>
            </div>
            <div className="flex flex-column">
                <span className="font-semibold text-green-600">Total Heures</span>
                <span className="text-xl font-bold text-green-600">{totalHeures}h</span>
            </div>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Show message if no open periods */}
            {!periodsLoading && openPeriodes.length === 0 && (
                <Message
                    severity="warn"
                    text="Aucune période de paie ouverte. Veuillez ouvrir une période dans la gestion des périodes avant de saisir les heures supplémentaires."
                    className="mb-4 w-full"
                />
            )}

            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            {loading && (
                <div className="flex justify-content-center p-4">
                    <ProgressSpinner />
                </div>
            )}

            {!loading && (
                <DataTable
                    value={filteredHeuresSupp}
                    editMode="row"
                    dataKey="matriculeId"
                    onRowEditComplete={onRowEditComplete}
                    paginator
                    rows={15}
                    rowsPerPageOptions={[15, 30, 50, 100]}
                    emptyMessage={
                        openPeriodes.length === 0
                            ? "Aucune période ouverte disponible"
                            : !selectedPeriodeId
                                ? "Sélectionnez une période"
                                : !selectedDateStr
                                    ? "Sélectionnez une date"
                                    : "Aucun employé trouvé"
                    }
                    responsiveLayout="scroll"
                    rowClassName={rowClassName}
                    footer={footer}
                    sortField="nom"
                    sortOrder={1}
                    scrollable
                    scrollHeight="500px"
                >
                    <Column field="matriculeId" header="Matricule" sortable frozen style={{ width: '12%' }} />
                    <Column field="nom" header="Nom" sortable frozen style={{ width: '15%' }} />
                    <Column field="prenom" header="Prénom" sortable style={{ width: '15%' }} />
                    <Column
                        field="hs135"
                        header="HS 135%"
                        editor={(options) => numberEditor(options)}
                        sortable
                        style={{ width: '14%' }}
                    />
                    <Column
                        field="hs160"
                        header="HS 160%"
                        editor={(options) => numberEditor(options)}
                        sortable
                        style={{ width: '12%' }}
                    />
                    <Column
                        field="hs200"
                        header="HS 200%"
                        editor={(options) => numberEditor(options)}
                        sortable
                        style={{ width: '12%' }}
                    />
                    <Column
                        field="totalHeures"
                        header="Total Heures"
                        body={(data) => <span className="font-bold">{data.totalHeures}h</span>}
                        style={{ width: '12%' }}
                    />
                    <Column
                        rowEditor
                        headerStyle={{ width: '7%', minWidth: '6rem' }}
                        bodyStyle={{ textAlign: 'center' }}
                    />
                </DataTable>
            )}
        </div>
    );
}
