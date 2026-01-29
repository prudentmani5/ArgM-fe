// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { StorageEntry } from './StorageEntry';
import StorageEntryForm from './StorageEntryForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent, InputNumberValueChangeEvent } from 'primereact';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { Entrepos } from '../../(settings)/settings/entrepot/Entrepos';
import { Marchandise } from '../../(settings)/settings/marchandise/Marchandise';
import { Barge } from '../../(settings)/settings/barge/Barge';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Importer } from '../../(settings)/settings/importateur/Importer';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { Provenance } from '../../(settings)/settings/provenance/Provenance';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { dateToString } from '@/utils/dateUtils';
import { createPeriodSearch } from '@/utils/PeriodSearch';

function StorageEntryComponent() {
    const [storageEntry, setStorageEntry] = useState<StorageEntry>(new StorageEntry());
    const [storageEntryEdit, setStorageEntryEdit] = useState<StorageEntry>(new StorageEntry());
    const [editStorageEntryDialog, setEditStorageEntryDialog] = useState(false);
    const [storageEntries, setStorageEntries] = useState<StorageEntry[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [entrepos, setEntrepos] = useState<Entrepos[]>([]);
    const [marchandises, setMarchandises] = useState<Marchandise[]>([]);
    const [barges, setBarges] = useState<Barge[]>([]);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);

    // Initialize with default dates - first day of current month and today
    const getDefaultStartDate = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    };

    const getDefaultEndDate = () => {
        return new Date();
    };

    const [startDate, setStartDate] = useState<Date | null>(getDefaultStartDate());
    const [endDate, setEndDate] = useState<Date | null>(getDefaultEndDate());
    const [selectedEntrepot, setSelectedEntrepot] = useState<number | null>(null);
    const [ltExists, setLtExists] = useState<boolean>(false);
    const [ltChecked, setLtChecked] = useState<boolean>(false);

    // Main API calls
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: entreposData, loading: entreposLoading, error: entreposError, fetchData: fetchEntreposData, callType: entreposCallType } = useConsumApi('');
    const { data: marchandiseData, loading: marchandiseLoading, error: marchandiseError, fetchData: fetchMarchandiseData, callType: marchandiseCallType } = useConsumApi('');
    const { data: bargeData, loading: bargeLoading, error: bargeError, fetchData: fetchBargeData, callType: bargeCallType } = useConsumApi('');
    const { data: importateurData, loading: importateurLoading, error: importateurError, fetchData: fetchImportateurData, callType: importateurCallType } = useConsumApi('');
    const { data: provenanceData, loading: provenanceLoading, error: provenanceError, fetchData: fetchProvenanceData, callType: provenanceCallType } = useConsumApi('');
    const { data: ltCheckData, loading: ltCheckLoading, error: ltCheckError, fetchData: fetchLtCheck, callType: ltCheckCallType } = useConsumApi('');
    
    // PDF Report API calls
    const { data: pdfEntrepotData, loading: pdfEntrepotLoading, error: pdfEntrepotError, fetchData: fetchPdfEntrepot, callType: pdfEntrepotCallType } = useConsumApi('');
    const { data: pdfAllData, loading: pdfAllLoading, error: pdfAllError, fetchData: fetchPdfAll, callType: pdfAllCallType } = useConsumApi('');

    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const importateurValueRef = useRef('');
    const [importateurFilter, setImportateurFilter] = useState('');
    const [destinataireFilter, setDestinataireFilter] = useState('');
    const [provenances, setProvenances] = useState<Provenance[]>([]);
    const [lastValidatedLt, setLastValidatedLt] = useState<string>('');

    const BASE_URL = `${API_BASE_URL}/storageentries`;
    const URL_ENTREPOT = `${API_BASE_URL}/entrepos/findall`;
    const URL_MARCHANDISE = `${API_BASE_URL}/marchandises/findall`;
    const URL_BARGE = `${API_BASE_URL}/barges/findall`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;
    const URL_PROVENANCE = `${API_BASE_URL}/provenances/findall`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadEntrepos();
        loadMarchandises();
        loadBarges();
        loadAllImportateurs();
        loadAllProvenances();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadStorageEntries') {
                setStorageEntries(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
        if (entreposData) {
            if (entreposCallType === 'loadEntrepos') {
                setEntrepos(Array.isArray(entreposData) ? entreposData : [entreposData]);
            }
        }
        if (marchandiseData) {
            if (marchandiseCallType === 'loadMarchandises') {
                setMarchandises(Array.isArray(marchandiseData) ? marchandiseData : [marchandiseData]);
            }
        }
        if (bargeData) {
            if (bargeCallType === 'loadBarges') {
                setBarges(Array.isArray(bargeData) ? bargeData : [bargeData]);
            }
        }
        if (importateurData && importateurCallType === 'loadAllImportateur' && importateurData.content) {
            const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
            if (newItems.length > 0) {
                setImportateurs(prev => [...prev, ...newItems]);
            }
        }
        if (ltCheckData && ltCheckCallType === 'checkLtExists') {
            setLtChecked(true);
            setLtExists(ltCheckData);
            if (ltCheckData) {
                accept('warn', 'Attention', 'La Lettre de transport existe déjà, veuillez mettre une autre lettre de transport');
            }
        }
    }, [data, entreposData, marchandiseData, bargeData, importateurData, ltCheckData]);

    // Handle PDF responses
    useEffect(() => {
        if (pdfEntrepotData && pdfEntrepotCallType === 'exportPdfEntrepot') {
            // Handle blob data for PDF download
            const blob = new Blob([pdfEntrepotData], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `rapport_entrees_stock_entrepot_${selectedEntrepot}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            accept('success', 'Succès', 'Rapport généré avec succès');
        }

        if (pdfEntrepotError && pdfEntrepotCallType === 'exportPdfEntrepot') {
            accept('error', 'Erreur', 'Erreur lors de la génération du rapport par entrepôt');
        }
    }, [pdfEntrepotData, pdfEntrepotError]);

    useEffect(() => {
        if (pdfAllData && pdfAllCallType === 'exportPdfAll') {
            // Handle blob data for PDF download
            const blob = new Blob([pdfAllData], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'rapport_entrees_stock_global.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            accept('success', 'Succès', 'Rapport global généré avec succès');
        }

        if (pdfAllError && pdfAllCallType === 'exportPdfAll') {
            accept('error', 'Erreur', 'Erreur lors de la génération du rapport global');
        }
    }, [pdfAllData, pdfAllError]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (importateurValueRef.current) {
                loadAllImportateurs(importateurValueRef.current, 0, 20);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [importateurFilter]);

    useEffect(() => {
        if (provenanceData && provenanceCallType === 'loadAllProvenances') {
            setProvenances(Array.isArray(provenanceData) ? provenanceData : [provenanceData]);
        }
    }, [provenanceData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStorageEntry((prev) => ({ ...prev, [e.target.name]: e.target.value }));

        if (e.target.name === 'lt') {
            const newValue = e.target.value.trim();

            if (newValue === '' || (ltChecked && newValue !== lastValidatedLt)) {
                setLtExists(false);
                setLtChecked(false);
                setLastValidatedLt('');
            }
        }
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStorageEntryEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLtBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const ltValue = e.target.value.trim();

        if (ltValue && ltValue !== '' && (!ltChecked || ltValue !== lastValidatedLt)) {
            setLastValidatedLt(ltValue);
            fetchLtCheck(null, 'GET', `${BASE_URL}/exists/${encodeURIComponent(ltValue)}`, 'checkLtExists');
        }
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setStorageEntry((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setStorageEntryEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setStorageEntry((prev) => ({ ...prev, [field]: dateToString(value) }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setStorageEntryEdit((prev) => ({ ...prev, [field]: dateToString(value) }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setStorageEntry((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (e.target.name === 'marchandiseId') {
            const selectedMarchandise = marchandises.find(m => m.marchandiseId === e.target.value);
            if (selectedMarchandise) {
                // You can add any marchandise-specific logic here if needed
            }
        }
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setStorageEntryEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (e.target.name === 'marchandiseId') {
            const selectedMarchandise = marchandises.find(m => m.marchandiseId === e.target.value);
            if (selectedMarchandise) {
                // You can add any marchandise-specific logic here if needed
            }
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStorageEntry((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStorageEntryEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleSubmit = () => {
        // Check if LT exists before submitting
        if (ltExists) {
            accept('warn', 'Attention', 'Impossible d\'enregistrer: La Lettre de transport existe déjà');
            return;
        }

        // Check if LT field is empty
        if (!storageEntry.lt || storageEntry.lt.trim() === '') {
            accept('warn', 'Attention', 'La Lettre de transport est obligatoire');
            return;
        }

        if(!storageEntry.entreposId || storageEntry.entreposId === 0){
            accept('warn', 'Attention', 'Le magasin est obligatoire');
            return;
        }

        if(!storageEntry.marchandiseId || storageEntry.marchandiseId === 0){
            accept('warn', 'Attention', 'La marchandise est obligatoire');
            return;
        }

        if(!storageEntry.poidsEntre || storageEntry.poidsEntre === 0){
            accept('warn', 'Attention', 'Le poid entré est obligatoire');
            return;
        }

        if(!storageEntry.provenanceId || storageEntry.provenanceId === 0){
            accept('warn', 'Attention', 'La provenance est obligatoire');
            return;
        }

        if(!storageEntry.bargeId || storageEntry.bargeId === 0){
            accept('warn', 'Attention', 'La barge est obligatoire');
            return;
        }

        if(!storageEntry.importateurId || storageEntry.importateurId === 0){
            accept('warn', 'Attention', 'L\'Importateur est obligatoire');
            return;
        }

        if(!storageEntry.destinataire || storageEntry.destinataire === 0){
            accept('warn', 'Attention', 'Le destinataire est obligatoire');
            return;
        }
            

        setBtnLoading(true);
        fetchData(storageEntry, 'POST', `${BASE_URL}/new`, 'createStorageEntry');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(storageEntryEdit, 'PUT', `${BASE_URL}/update/${storageEntryEdit.lt}`, 'updateStorageEntry');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateStorageEntry') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateStorageEntry') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des entrées de stock.');
        } else if (data !== null && error === null) {
            if (callType === 'createStorageEntry') {
                setStorageEntry(new StorageEntry());
                setLtExists(false);
                setLtChecked(false);
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateStorageEntry') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setStorageEntryEdit(new StorageEntry());
                setEditStorageEntryDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterStorageEntry = () => {
        setStorageEntry(new StorageEntry());
        setLtExists(false);
        setLtChecked(false);
        setLastValidatedLt('');
    };

    const resetFiltersToDefault = () => {
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setSelectedEntrepot(null);
        loadAllData();
    };

    const loadStorageEntryToEdit = (data: StorageEntry) => {
        if (data) {
            setEditStorageEntryDialog(true);
            setStorageEntryEdit(data);
        }
    };

    const loadEntrepos = () => {
        fetchEntreposData(null, 'GET', `${URL_ENTREPOT}`, 'loadEntrepos');
    };

    const loadMarchandises = () => {
        fetchMarchandiseData(null, 'GET', `${URL_MARCHANDISE}`, 'loadMarchandises');
    };

    const loadBarges = () => {
        fetchBargeData(null, 'GET', `${URL_BARGE}`, 'loadBarges');
    };

    const loadAllImportateurs = (searchName: string = '', page: number = 0, size: number = 20) => {
        let pageNumber = 0;
        let sizeNumber = 20;

        if (Number.isNaN(page) || page === 0 || page === 1) {
            setLoadedPages(new Set([0]));
            setImportateurs([]);
        } else {
            pageNumber = page;
        }

        if (Number.isNaN(size) || size === 0) {
            sizeNumber = 20;
        } else {
            sizeNumber = size;
        }

        const url = `${URL_IMPORTATEUR}?actif=true&query=${encodeURIComponent(searchName)}&page=${pageNumber}&size=${sizeNumber}`;
        fetchImportateurData(null, "GET", url, "loadAllImportateur");
    };

    const handleLazyLoading = (e: VirtualScrollerLazyEvent) => {
        const pageSize = e.last - e.first;
        const pageNumber = Math.floor(e.first / pageSize);

        if (!loadedPages.has(pageNumber)) {
            setLoadedPages(prev => new Set(prev).add(pageNumber));
            loadAllImportateurs(importateurFilter, pageNumber, pageSize);
        }
    };

    const handleImportateurFilterChange = (value: string) => {
        importateurValueRef.current = value;
        setImportateurFilter(value);
    };

    const handleImportateurFilterChangeEdit = (value: string) => {
        importateurValueRef.current = value;
        setImportateurFilter(value);
    };

    // PDF Export Functions using useConsumApi
    const generatePdfReportByEntrepot = () => {
        if (!selectedEntrepot) {
            accept('warn', 'Attention', 'Veuillez sélectionner un entrepôt pour générer le rapport');
            return;
        }

        const periodSearch = createPeriodSearch(startDate, endDate);
        const url = `${BASE_URL}/report/entrepot?entreposId=${selectedEntrepot}`;

        // Use useConsumApi with blob response type and POST method
        fetchPdfEntrepot(periodSearch, 'POST', url, 'exportPdfEntrepot', false, 'blob');
    };

    const generatePdfReportAll = () => {
        const periodSearch = createPeriodSearch(startDate, endDate);
        const url = `${BASE_URL}/report/all`;

        // Use useConsumApi with blob response type and POST method
        fetchPdfAll(periodSearch, 'POST', url, 'exportPdfAll', false, 'blob');
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadStorageEntryToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        let url = `${BASE_URL}/findall`;
        const params = new URLSearchParams();

        if (startDate) {
            // Set start date to beginning of day
            const startOfDay = new Date(startDate);
            startOfDay.setHours(0, 0, 0, 0);
            params.append('startDate', startOfDay.toISOString());
        }
        if (endDate) {
            // Set end date to end of day
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            params.append('endDate', endOfDay.toISOString());
        }
        if (selectedEntrepot) {
            params.append('entreposId', selectedEntrepot.toString());
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        fetchData(null, 'GET', url, 'loadStorageEntries');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            // Load data with default dates when switching to "Tous" tab
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="field col-4">
                    <Button
                        type="button"
                        icon="pi pi-refresh"
                        outlined
                        onClick={resetFiltersToDefault}
                        tooltip="Réinitialiser les filtres"
                        tooltipOptions={{position: 'top'}}
                    />
                </div>
                <div className="formgrid grid p-fluid">
                    <div className="field col-3">
                        <label htmlFor="startDate">Date Début</label>
                        <Calendar
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.value as Date)}
                            showTime={false}
                            dateFormat="dd/mm/yy"
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="endDate">Date Fin</label>
                        <Calendar
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.value as Date)}
                            showTime={false}
                            dateFormat="dd/mm/yy"
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="filterEntrepot">Entrepôt</label>
                        <Dropdown
                            id="filterEntrepot"
                            value={selectedEntrepot}
                            options={entrepos}
                            onChange={(e) => setSelectedEntrepot(e.value)}
                            optionLabel="nom"
                            optionValue="entreposId"
                            placeholder="Filtrer par entrepôt"
                            filter
                            filterBy="nom"
                            showClear
                        />
                    </div>
                    <div className="field col-3 flex align-items-end gap-2">
                        <Button
                            icon="pi pi-filter"
                            onClick={loadAllData}
                            tooltip="Filtrer les données"
                            tooltipOptions={{position: 'top'}}
                        />
                        <Button
                            icon="pi pi-file-pdf"
                            onClick={generatePdfReportByEntrepot}
                            loading={pdfEntrepotLoading}
                            severity="danger"
                            tooltip="Rapport PDF par entrepôt"
                            tooltipOptions={{position: 'top'}}
                            disabled={!selectedEntrepot}
                        />
                        <Button
                            icon="pi pi-file-export"
                            onClick={generatePdfReportAll}
                            loading={pdfAllLoading}
                            severity="success"
                            tooltip="Rapport PDF global"
                            tooltipOptions={{position: 'top'}}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const formatDate = (date: string | Date | null) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('fr-FR');
    };

    const loadAllProvenances = () => {
        fetchProvenanceData(null, 'GET', URL_PROVENANCE, 'loadAllProvenances');
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Entrée de Stock"
                visible={editStorageEntryDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditStorageEntryDialog(false)}>
                <StorageEntryForm
                    storageEntry={storageEntryEdit}
                    entrepots={entrepos}
                    marchandises={marchandises}
                    barges={barges}
                    importateurs={importateurs}
                    loadingStatus={importateurLoading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    importateurFilter={importateurFilter}
                    destinataireFilter={destinataireFilter}
                    onImportateurFilterChange={handleImportateurFilterChangeEdit}
                    provenances={provenances}
                    handleLtBlur={() => { }} // No validation needed for edit mode
                    ltExists={false}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditStorageEntryDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <StorageEntryForm
                        storageEntry={storageEntry}
                        entrepots={entrepos}
                        marchandises={marchandises}
                        barges={barges}
                        importateurs={importateurs}
                        loadingStatus={importateurLoading}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleLazyLoading={handleLazyLoading}
                        importateurFilter={importateurFilter}
                        destinataireFilter={destinataireFilter}
                        onImportateurFilterChange={handleImportateurFilterChange}
                        provenances={provenances}
                        handleLtBlur={handleLtBlur}
                        ltExists={ltExists}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterStorageEntry} />
                            </div>
                            <div className="md:field md:col-3">
                                <Button
                                    icon="pi pi-check"
                                    label="Enregistrer"
                                    loading={btnLoading}
                                    onClick={handleSubmit}
                                    disabled={ltExists || !storageEntry.lt}
                                />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Consultation">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={storageEntries}
                                    header={renderSearch}
                                    emptyMessage={"Pas d'entrées de stock à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field="lt" header="Lettre Transport" sortable />
                                    <Column field="dateEntree" header="Date Entrée" body={(rowData) => formatDate(rowData.dateEntree)} sortable />
                                    <Column field="noConteneur" header="N° Conteneur" sortable />
                                    <Column field="typeTransport" header="Type Transport" sortable />
                                    <Column field="poidsEntre" header="Poids (kg)" sortable />
                                    <Column field="exportation" header="Exportation" body={(rowData) => rowData.exportation ? 'Oui' : 'Non'} sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default StorageEntryComponent;