// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { Ref, useEffect, useMemo, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { EntreeVehPort } from './EntreeVehPort';
import EntreeVehPortForm from './EntreeVehPortForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown, DropdownChangeEvent, DropdownFilterEvent } from 'primereact/dropdown';
import { Marchandise } from '../../../(settings)/settings/marchandise/Marchandise';
import { CategorieVehiculeEntrepot } from '../../../(settings)/settings/categorieVehicule/CategorieVehiculeEntrepot';
import { Importer } from '../../../(settings)/settings/importateur/Importer';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { debounce } from 'chart.js/helpers';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { API_BASE_URL } from '@/utils/apiConfig';
import { useAuthorities } from '../../../../../hooks/useAuthorities';
import { dateToString, stringToDate, formatLocalDateTime } from '@/utils/dateUtils';

let check = 0;

type DropdownPTOptions = {
    filterInput?: {
        value?: string;
        onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    };
    // Add other sections as needed
};

function EntreeVehPortComponent() {
    const [entreeVehPort, setEntreeVehPort] = useState<EntreeVehPort>(new EntreeVehPort());
    const [entreeVehPortEdit, setEntreeVehPortEdit] = useState<EntreeVehPort>(new EntreeVehPort());
    const [editEntreeVehPortDialog, setEditEntreeVehPortDialog] = useState(false);
    const [entreeVehPorts, setEntreeVehPorts] = useState<EntreeVehPort[]>([]);
    const [marchandises, setMarchandises] = useState<Marchandise[]>([]);
    const [catVehicules, setCatVehicules] = useState<CategorieVehiculeEntrepot[]>([]);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { hasAuthority, hasAnyAuthority } = useAuthorities();

    // Date filters - default to first day of month to today
    const getDefaultStartDate = (): string => {
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return formatLocalDateTime(firstOfMonth);
    };
    const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
    const [endDate, setEndDate] = useState<string>(formatLocalDateTime(new Date()));
    const [selectedCategorieId, setSelectedCategorieId] = useState<string | null>(null);
    const [searchPlaque, setSearchPlaque] = useState<string>('');

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: marchandiseData, loading: mrLoading, error: mrError, fetchData: mrFetchData, callType: mrCallType } = useConsumApi('');
    const { data: catVehicleData, loading: cvLoading, error: cvError, fetchData: cvFetchData, callType: cvCallType } = useConsumApi('');
    const { data: importateurData, loading: impLoading, error: impError, fetchData: impFetchData, callType: impCallType } = useConsumApi('');
    const { data: pdfData, loading: pdfLoading, error: pdfError, fetchData: fetchPdfData, callType: pdfCallType } = useConsumApi('');
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [triggerImportateurApiCall, setTriggerImportateurApiCall] = useState<Boolean>(false);
    const [filterValue, setFilterValue] = useState('');
    const filterValueRef = useRef('');
    const toast = useRef<Toast>(null);

    const BASE_URL = `${API_BASE_URL}/entree_veh_port`;
    const URL_MARCHANDISE = `${API_BASE_URL}/marchandises/findByActifTrue`;
    const URL_CATEGORIE_VEHICLE = `${API_BASE_URL}/categorievehiculeentrepot/findall`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllMarchandises();
        loadAllCatVehicles();
        loadAllImportateurs();
        // console.log(' Je passe ' + ++check);
    }, []);


    useEffect(() => {
        if (data) {
            if (callType === 'loadEntreeVehPorts') {
                setEntreeVehPorts(Array.isArray(data) ? data : [data]);
            }

        }
        if (marchandiseData) {
            setMarchandises(Array.isArray(marchandiseData) ? marchandiseData : [marchandiseData]);
        }
        if (catVehicleData) {
            setCatVehicules(Array.isArray(catVehicleData) ? catVehicleData : [catVehicleData]);
        }
        if (importateurData?.content) {
            const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
            if (newItems.length > 0) {
                setImportateurs(prev => [...prev, ...newItems]);
            }
        }
        handleAfterApiCall(activeIndex);
    }, [data, marchandiseData, catVehicleData, importateurData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (filterValueRef.current) {
                loadAllImportateurs(filterValueRef.current, 0, 20);
            }
        }, 300); // 300ms debounce delay

        return () => clearTimeout(timer);
    }, [filterValue]);

    // Handle PDF export responses
    useEffect(() => {
        if (pdfData && pdfCallType === 'exportPdfReport') {
            // Handle blob data for PDF download
            const blob = new Blob([pdfData], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            const dateStr = new Date().toISOString().split('T')[0];
            link.download = `rapport_entree_vehicules_${dateStr}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            accept('success', 'Succès', 'Rapport PDF généré avec succès');
        }

        if (pdfError && pdfCallType === 'exportPdfReport') {
            accept('error', 'Erreur', 'Erreur lors de la génération du rapport PDF');
        }
    }, [pdfData, pdfError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntreeVehPort((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntreeVehPortEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (value: number | null, field: string) => {
        setEntreeVehPort((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (value: number | null, field: string) => {
        setEntreeVehPortEdit((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setEntreeVehPort((prev) => ({ ...prev, [field]: dateToString(value) }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setEntreeVehPortEdit((prev) => ({ ...prev, [field]: dateToString(value) }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntreeVehPort((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntreeVehPortEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setEntreeVehPort((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setEntreeVehPortEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        // Validate mandatory fields
        if (!entreeVehPort.categorieVehId || entreeVehPort.categorieVehId.trim() === '') {
            accept('warn', 'Champ obligatoire', 'Veuillez sélectionner une Catégorie Véhicule');
            return;
        }

        if (!entreeVehPort.clientId || entreeVehPort.clientId === 0) {
            accept('warn', 'Champ obligatoire', 'Veuillez sélectionner un Client');
            return;
        }

        if (!entreeVehPort.plaque || entreeVehPort.plaque.trim() === '') {
            accept('warn', 'Champ obligatoire', 'Veuillez saisir la Plaque du véhicule');
            return;
        }

        if (!entreeVehPort.lt || entreeVehPort.lt.trim() === '') {
            accept('warn', 'Champ obligatoire', 'Veuillez saisir le LT');
            return;
        }

        if (!entreeVehPort.marchandiseId || entreeVehPort.marchandiseId === 0) {
            accept('warn', 'Champ obligatoire', 'Veuillez sélectionner une Marchandise');
            return;
        }

        if (!entreeVehPort.etat || entreeVehPort.etat.trim() === '') {
            accept('warn', 'Champ obligatoire', 'Veuillez saisir l\'État du véhicule');
            return;
        }

        setBtnLoading(true);
        fetchData(entreeVehPort, 'POST', `${BASE_URL}/new`, 'createEntreeVehPort');
        console.log(JSON.stringify(entreeVehPort));
    };

    const handleSubmitEdit = () => {
        // Validate mandatory fields
        if (!entreeVehPortEdit.categorieVehId || entreeVehPortEdit.categorieVehId.trim() === '') {
            accept('warn', 'Champ obligatoire', 'Veuillez sélectionner une Catégorie Véhicule');
            return;
        }

        if (!entreeVehPortEdit.clientId || entreeVehPortEdit.clientId === 0) {
            accept('warn', 'Champ obligatoire', 'Veuillez sélectionner un Client');
            return;
        }

        if (!entreeVehPortEdit.plaque || entreeVehPortEdit.plaque.trim() === '') {
            accept('warn', 'Champ obligatoire', 'Veuillez saisir la Plaque du véhicule');
            return;
        }

        if (!entreeVehPortEdit.lt || entreeVehPortEdit.lt.trim() === '') {
            accept('warn', 'Champ obligatoire', 'Veuillez saisir le LT');
            return;
        }

        if (!entreeVehPortEdit.marchandiseId || entreeVehPortEdit.marchandiseId === 0) {
            accept('warn', 'Champ obligatoire', 'Veuillez sélectionner une Marchandise');
            return;
        }

        if (!entreeVehPortEdit.etat || entreeVehPortEdit.etat.trim() === '') {
            accept('warn', 'Champ obligatoire', 'Veuillez saisir l\'État du véhicule');
            return;
        }

        setBtnLoading(true);
        fetchData(entreeVehPortEdit, 'PUT', `${BASE_URL}/update/${entreeVehPortEdit.entreeVehPortId}`, 'updateEntreeVehPort');
        console.log(JSON.stringify(entreeVehPortEdit));
    };

    const handleAfterApiCall = (chooseenTab: number) => {

       
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateEntreeVehPort') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateEntreeVehPort') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        }
        else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des entrées véhicules.');
        }
        else if (data !== null && error === null) {

            if (callType === 'createEntreeVehPort') {
                setEntreeVehPort(new EntreeVehPort());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateEntreeVehPort') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setEntreeVehPortEdit(new EntreeVehPort());
                setEditEntreeVehPortDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterEntreeVehPort = () => {
        setEntreeVehPort(new EntreeVehPort());
    };

    const loadEntreeVehPortToEdit = (data: EntreeVehPort) => {
        if (data) {
            setEditEntreeVehPortDialog(true);
            setEntreeVehPortEdit(data);
        }
    };

    const loadAllMarchandises = () => {
        mrFetchData(null, "GET", URL_MARCHANDISE, "loadAllMarchandises");
    }
    const loadAllCatVehicles = () => {
        cvFetchData(null, "GET", URL_CATEGORIE_VEHICLE, "loadAllCatVehicles");
    }
    const loadAllImportateurs = (searchName: string = '', page: number = 0, size: number = 20) => {

        let pageNumber = 0;
        let sizeNumber = 20;

        if (Number.isNaN(page) || page === 0 || page === 1) {
            setLoadedPages(new Set([0])); // Reset tracked pages on first load
            setImportateurs([]); // Clear existing data
        } else {
            pageNumber = page;

        }
        if (Number.isNaN(size) || size === 0) {
            sizeNumber = 20
        }
        else
            sizeNumber = size

        const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search?query=${encodeURIComponent(searchName)}&page=${pageNumber}&size=${sizeNumber}`;
        impFetchData(null, "GET", URL_IMPORTATEUR, "loadAllImportateur");
        console.log(" ====|| === " + URL_IMPORTATEUR);

    }

    const handleLazyLoading = (e: VirtualScrollerLazyEvent) => {
        const pageSize = e.last - e.first;
        const pageNumber = Math.floor(e.first / pageSize);

        if (!loadedPages.has(pageNumber)) {

            setLoadedPages(prev => new Set(prev).add(pageNumber)); // Mark page as loaded
            loadAllImportateurs(filterValue, 0, 20);
        }

    }

    const handleFilterChange = (value: string) => {
        filterValueRef.current = value;
        setFilterValue(value);
        // Don't call loadAllImportateurs here
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadEntreeVehPortToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const formatDateColumn = (rowData: any): string => {
        if (!rowData.dateCreation) return '';
        const date = new Date(rowData.dateCreation);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const loadAllData = () => {
        let url = `${BASE_URL}/findall`;
        const params = new URLSearchParams();

        if (startDate && startDate.trim() !== '') {
            const startDateObj = stringToDate(startDate);
            if (startDateObj) {
                startDateObj.setHours(0, 0, 0, 0);
                params.append('dateDebut', startDateObj.toISOString().split('T')[0]);
            }
        }
        if (endDate && endDate.trim() !== '') {
            const endDateObj = stringToDate(endDate);
            if (endDateObj) {
                endDateObj.setHours(23, 59, 59, 999);
                params.append('dateFin', endDateObj.toISOString().split('T')[0]);
            }
        }
        if (selectedCategorieId) {
            params.append('categorieVehId', selectedCategorieId);
        }
        if (searchPlaque && searchPlaque.trim() !== '') {
            params.append('plaque', searchPlaque.trim());
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        fetchData(null, 'GET', url, 'loadEntreeVehPorts');
    };

    const handleSearch = () => {
        loadAllData();
    };

    const clearSearch = () => {
        setStartDate(getDefaultStartDate());
        setEndDate(formatLocalDateTime(new Date()));
        setSelectedCategorieId(null);
        setSearchPlaque('');
        loadAllData();
    };

    const generatePdfReport = () => {
        let url = `${BASE_URL}/report/pdf`;
        const params = new URLSearchParams();

        if (startDate && startDate.trim() !== '') {
            const startDateObj = stringToDate(startDate);
            if (startDateObj) {
                startDateObj.setHours(0, 0, 0, 0);
                params.append('dateDebut', startDateObj.toISOString().split('T')[0]);
            }
        }
        if (endDate && endDate.trim() !== '') {
            const endDateObj = stringToDate(endDate);
            if (endDateObj) {
                endDateObj.setHours(23, 59, 59, 999);
                params.append('dateFin', endDateObj.toISOString().split('T')[0]);
            }
        }
        if (selectedCategorieId) {
            params.append('categorieVehId', selectedCategorieId);
        }
        if (searchPlaque && searchPlaque.trim() !== '') {
            params.append('plaque', searchPlaque.trim());
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        // Use useConsumApi with blob response type
        fetchPdfData(null, 'GET', url, 'exportPdfReport', false, 'blob');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche des entrées véhicules</h5>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Rechercher"
                            onClick={handleSearch}
                            loading={loading}
                        />
                        <Button
                            icon="pi pi-times"
                            label="Effacer"
                            outlined
                            onClick={clearSearch}
                        />
                        <Button
                            icon="pi pi-file-pdf"
                            label="Exporter PDF"
                            severity="danger"
                            onClick={generatePdfReport}
                            loading={pdfLoading}
                        />
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-3">
                        <label htmlFor="dateDebut">Date Début</label>
                        <Calendar
                            id="dateDebut"
                            value={stringToDate(startDate)}
                            onChange={(e) => setStartDate(dateToString(e.value as Date))}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="dateFin">Date Fin</label>
                        <Calendar
                            id="dateFin"
                            value={stringToDate(endDate)}
                            onChange={(e) => setEndDate(dateToString(e.value as Date))}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="categorieVehicule">Catégorie Véhicule</label>
                        <Dropdown
                            id="categorieVehicule"
                            value={selectedCategorieId}
                            options={catVehicules}
                            onChange={(e) => setSelectedCategorieId(e.value)}
                            optionLabel="libelle"
                            optionValue="id"
                            placeholder="Filtrer par catégorie"
                            filter
                            filterBy="libelle"
                            showClear
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="searchPlaque">Plaque</label>
                        <InputText
                            id="searchPlaque"
                            value={searchPlaque}
                            onChange={(e) => setSearchPlaque(e.target.value)}
                            placeholder="Rechercher par plaque"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Entrée Véhicule Port"
                visible={editEntreeVehPortDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditEntreeVehPortDialog(false)}
            >
                <EntreeVehPortForm
                    entreeVehPort={entreeVehPortEdit}
                    catVehicules={catVehicules}
                    marchandises={marchandises}
                    importateurs={importateurs}
                    loadingStatus={impLoading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    onFilterChange={handleFilterChange}
                    filterValue={filterValue}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditEntreeVehPortDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                {hasAuthority('ENTREE_VEHICULE_CREATE') && (
                    <TabPanel header="Nouveau">
                        <EntreeVehPortForm
                            entreeVehPort={entreeVehPort}
                            catVehicules={catVehicules}
                            marchandises={marchandises}
                            importateurs={importateurs}
                            loadingStatus={impLoading}
                            handleChange={handleChange}
                            handleNumberChange={handleNumberChange}
                            handleDateChange={handleDateChange}
                            handleDropdownChange={handleDropdownChange}
                            handleCheckboxChange={handleCheckboxChange}
                            handleLazyLoading={handleLazyLoading}
                            onFilterChange={handleFilterChange}
                            filterValue={filterValue}
                        />
                        <div className="card p-fluid">
                            <div className="formgrid grid">
                                <div className="md:col-offset-3 md:field md:col-3">
                                    <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterEntreeVehPort} />
                                </div>
                                <div className="md:field md:col-3">
                                    <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}
                {hasAnyAuthority(['ENTREE_VEHICULE_CONSULTATION', 'ENTREE_VEHICULE_UPDATE']) && (
                    <TabPanel header="Consultation">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable value={entreeVehPorts} header={renderSearch} emptyMessage={"Pas d'entrée véhicule à afficher"} paginator
                                        rows={10}
                                        rowsPerPageOptions={[10, 20, 30]}>
                                        <Column field="categorieVehLibelle" header="Catégorie" />
                                        <Column field="clientNom" header="Client" />
                                        <Column field="plaque" header="Plaque" />
                                        <Column field="marque" header="Marque" />
                                        <Column field="lt" header="LT" />
                                        <Column field="marchandiseNom" header="Marchandise" />
                                        <Column field="poids" header="Poids" />
                                        <Column field="etat" header="État" />
                                        <Column header="Date" body={formatDateColumn} />
                                        <Column field="couleur" header="Couleur" />
                                        {hasAuthority('ENTREE_VEHICULE_UPDATE') && (
                                            <Column header="Options" body={optionButtons} />
                                        )}
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}
            </TabView>
        </>
    );
}

export default EntreeVehPortComponent;