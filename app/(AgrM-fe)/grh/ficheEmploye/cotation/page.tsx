'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { Cotation } from "./Cotation";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Column } from "primereact/column";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import CotationForm from "./CotationForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Notation } from "../../settings/notation/Notation";
import { GrhRensIdentification } from "../grhRensIdentification/GrhRensIdentification";
import { API_BASE_URL } from '@/utils/apiConfig';

// Interface for cotation with calculated new salary
interface CotationWithNewSalary extends Cotation {
    newBase?: number;
    increasePercent?: number;
    increaseAmount?: number;
}

// Interface for paginated response from backend
interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// Interface for uncoted employee
interface UncotedEmployee {
    matriculeId: string;
    nom: string;
    prenom: string;
    situationId: string;
}

const CotationComponent = () => {
    const baseUrl = `${API_BASE_URL}`;

    const [cotation, setCotation] = useState<Cotation>(new Cotation());
    const [cotationEdit, setCotationEdit] = useState<Cotation>(new Cotation());
    const [editCotationDialog, setEditCotationDialog] = useState(false);
    const [cotations, setCotations] = useState<Cotation[]>([]);
    const [filteredCotations, setFilteredCotations] = useState<Cotation[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchExercice, setSearchExercice] = useState<number>(new Date().getFullYear());

    // Pagination state for "Tous" tab
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [tableLoading, setTableLoading] = useState<boolean>(false);

    // Debounce ref for search
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // State for "Appliquer la note" tab
    const [applyNoteExercice, setApplyNoteExercice] = useState<number>(new Date().getFullYear());
    const [cotationsForApply, setCotationsForApply] = useState<CotationWithNewSalary[]>([]);
    const [filteredCotationsForApply, setFilteredCotationsForApply] = useState<CotationWithNewSalary[]>([]);
    const [applyNoteSearchTerm, setApplyNoteSearchTerm] = useState<string>('');
    const [applyBtnLoading, setApplyBtnLoading] = useState<boolean>(false);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: notationData, loading: notationsLoading, error: notationError, fetchData: fetchNotations, callType: notationCallType } = useConsumApi('');
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployee, callType: employeeCallType } = useConsumApi('');
    const { data: carriereData, loading: carriereLoading, error: carriereError, fetchData: fetchCarriere, callType: carriereCallType } = useConsumApi('');
    const { data: searchCotationData, fetchData: fetchSearchCotation, callType: searchCotationCallType } = useConsumApi('');
    const { data: applyNoteCotationData, fetchData: fetchApplyNoteCotations, callType: applyNoteCotationCallType } = useConsumApi('');
    const { data: applyNoteResultData, error: applyNoteError, fetchData: fetchApplyNote, callType: applyNoteCallType } = useConsumApi('');
    const { data: uncotedData, loading: uncotedLoading, fetchData: fetchUncotedEmployees, callType: uncotedCallType } = useConsumApi('');

    // State for uncoted employees dialog
    const [uncotedEmployees, setUncotedEmployees] = useState<UncotedEmployee[]>([]);
    const [uncotedDialogVisible, setUncotedDialogVisible] = useState(false);

    const toast = useRef<Toast>(null);
    const lastProcessedCallType = useRef<string | null>(null);
    const lastProcessedUncotedCallType = useRef<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Track current matricule being searched to prevent race conditions
    const [currentSearchMatricule, setCurrentSearchMatricule] = useState<string>('');

    // State for dropdown options
    const [notations, setNotations] = useState<Notation[]>([]);
    // Separate notation states for create vs edit to prevent data leakage
    const [selectedNotationNew, setSelectedNotationNew] = useState<Notation | null>(null);
    const [selectedNotationEdit, setSelectedNotationEdit] = useState<Notation | null>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllNotations();
    }, []);

    useEffect(() => {
        if ((data || error) && (callType === 'createCotation' || callType === 'updateCotation') && lastProcessedCallType.current !== callType) {
            lastProcessedCallType.current = callType;
            handleAfterApiCall(activeIndex);
        }

        if (notationData && notationCallType === 'loadNotations') {
            setNotations(Array.isArray(notationData) ? notationData : [notationData]);
        }

        if (employeeData && employeeCallType === 'searchByMatricule') {
            const foundEmployee = employeeData as GrhRensIdentification;
            // Only apply data if this response matches the current search matricule (prevents race conditions)
            if (foundEmployee.matriculeId === currentSearchMatricule || foundEmployee.matriculeId === cotation.matriculeId) {
                setCotation(prev => ({
                    ...prev,
                    employeeName: foundEmployee.nom,
                    employeeFirstName: foundEmployee.prenom,
                    statut: foundEmployee.situationId
                }));
                accept('info', 'Employé trouvé', 'Les données de l\'employé ont été chargées.');
            }
            setSearchLoading(false);
        }

        if (employeeError && employeeCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setCotation(prev => ({
                ...prev,
                employeeName: '',
                employeeFirstName: '',
                statut: '',
                baseAncienne: 0
            }));
            setSearchLoading(false);
        }

        // Handle career data response
        if (carriereData && carriereCallType === 'searchCarriere') {
            const carriere = carriereData as any;
            // Only apply if response matches current search (prevents race conditions)
            if (carriere.matriculeId === currentSearchMatricule || carriere.matriculeId === cotation.matriculeId) {
                setCotation(prev => ({
                    ...prev,
                    baseAncienne: carriere.base || 0
                }));
            }
        }

        // Handle search cotation data response (paginated)
        if (searchCotationData && searchCotationCallType === 'searchCotationsPaginated') {
            const paginatedData = searchCotationData as PaginatedResponse<Cotation>;
            if (paginatedData.content) {
                setCotations(paginatedData.content);
                setFilteredCotations(paginatedData.content);
                setTotalRecords(paginatedData.totalElements);
            }
            setTableLoading(false);
        }

        // Handle apply note cotations data response
        if (applyNoteCotationData && applyNoteCotationCallType === 'loadApplyNoteCotations') {
            const results = Array.isArray(applyNoteCotationData) ? applyNoteCotationData : [applyNoteCotationData];
            const cotationsWithSalaries = calculateNewSalaries(results);
            setCotationsForApply(cotationsWithSalaries);
            setFilteredCotationsForApply(cotationsWithSalaries);
            setApplyNoteSearchTerm('');
        }

        // Handle apply note result response
        if (applyNoteResultData && applyNoteCallType === 'applyNote') {
            setApplyBtnLoading(false);
            if (applyNoteResultData.success) {
                accept('success', 'Succ\u00e8s', `Les salaires de ${applyNoteResultData.updatedCount} employé(s) ont été mis à jour.`);
                // Reload the data to show updated values
                loadCotationsForApplyNote(applyNoteExercice);
            } else {
                accept('error', 'Erreur', applyNoteResultData.error || 'Une erreur est survenue.');
            }
        }

        if (applyNoteError && applyNoteCallType === 'applyNote') {
            setApplyBtnLoading(false);
            accept('error', 'Erreur', 'Une erreur est survenue lors de la mise à jour des salaires.');
        }

        // Handle uncoted employees data
        if (uncotedData && uncotedCallType === 'loadUncotedEmployees' && lastProcessedUncotedCallType.current !== uncotedCallType) {
            lastProcessedUncotedCallType.current = uncotedCallType;
            setUncotedEmployees(Array.isArray(uncotedData) ? uncotedData : []);
            setUncotedDialogVisible(true);
        }
    }, [data, error, callType, notationData, employeeData, employeeError, carriereData, searchCotationData, applyNoteCotationData, applyNoteCotationCallType, applyNoteResultData, applyNoteCallType, applyNoteError, uncotedData, uncotedCallType, currentSearchMatricule, cotation.matriculeId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editCotationDialog) {
            setCotation((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setCotationEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleNumberChange = (name: string, value: number | null) => {
        if (!editCotationDialog) {
            setCotation((prev) => ({ ...prev, [name]: value || 0 }));
        } else {
            setCotationEdit((prev) => ({ ...prev, [name]: value || 0 }));
        }
    };

    const handleDropdownChange = (name: string, value: any) => {
        if (name === 'cote') {
            const notation = notations.find(n => n.notations === value);
            if (notation) {
                // Use separate state for create vs edit
                if (!editCotationDialog) {
                    setSelectedNotationNew(notation);
                    setCotation((prev) => ({
                        ...prev,
                        [name]: notation.notations,
                        nbrPoints1: notation.limite1,
                        nbrPoints2: notation.limite2
                    }));
                } else {
                    setSelectedNotationEdit(notation);
                    setCotationEdit((prev) => ({
                        ...prev,
                        [name]: notation.notations,
                        nbrPoints1: notation.limite1,
                        nbrPoints2: notation.limite2
                    }));
                }
            }
        } else {
            if (!editCotationDialog) {
                setCotation((prev) => ({ ...prev, [name]: value }));
            } else {
                setCotationEdit((prev) => ({ ...prev, [name]: value }));
            }
        }
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        // Cancel any pending requests to prevent race conditions
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Track the current matricule being searched
        setCurrentSearchMatricule(matriculeId);
        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);

        // Pass abort controller to API calls
        fetchEmployee(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule', false, 'json', abortControllerRef.current);
        // Also fetch career data to get baseAncienne
        fetchCarriere(null, 'Get', baseUrl + '/api/grh/carriere/' + matriculeId, 'searchCarriere', false, 'json', abortControllerRef.current);
    };

    // Load cotations with pagination
    const loadCotationsPaginated = useCallback((exercice: number, page: number, size: number, matricule?: string) => {
        setTableLoading(true);
        let url = `${baseUrl}/api/grh/cotations/search/paginated?exercice=${exercice}&page=${page}&size=${size}`;
        if (matricule && matricule.trim() !== '') {
            url += `&matricule=${encodeURIComponent(matricule.trim())}`;
        }
        fetchSearchCotation(null, 'Get', url, 'searchCotationsPaginated');
    }, [baseUrl, fetchSearchCotation]);

    // Handle page change in DataTable
    const onPageChange = (event: DataTablePageEvent) => {
        setFirst(event.first);
        setRows(event.rows);
        const page = Math.floor(event.first / event.rows);
        loadCotationsPaginated(searchExercice, page, event.rows, searchTerm);
    };

    // Debounced search function
    const debouncedSearch = useCallback((matricule: string, exercice: number) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            setFirst(0); // Reset to first page when searching
            loadCotationsPaginated(exercice, 0, rows, matricule);
        }, 500);
    }, [loadCotationsPaginated, rows]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value, searchExercice);
    };

    const handleSearchExerciceChange = (e: any) => {
        const value = e.value || new Date().getFullYear();
        setSearchExercice(value);
        setFirst(0); // Reset to first page when changing exercice
        loadCotationsPaginated(value, 0, rows, searchTerm);
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        lastProcessedCallType.current = null;
        console.log('Data sent to the backend:', cotation);
        fetchData(cotation, 'Post', baseUrl + '/api/grh/cotations/new', 'createCotation');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        lastProcessedCallType.current = null;
        console.log('Data sent to the backend:', cotationEdit);
        fetchData(cotationEdit, 'Put', baseUrl + '/api/grh/cotations/update/' + cotationEdit.cotationId, 'updateCotation');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        // Clear any existing toasts before showing new message
        toast.current?.clear();

        if (error !== null && chosenTab === 0) {
            const errorMessage = error.message || 'L\'enregistrement n\'a pas été effectué.';
            if (callType !== 'updateCotation')
                accept('warn', 'A votre attention', errorMessage);
            else if (callType === 'updateCotation')
                accept('warn', 'A votre attention', error.message || 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des cotations.');
        else if (data !== null && error === null) {
            if (callType === 'createCotation') {
                setCotation(new Cotation());
                setSelectedNotationNew(null);
                setCurrentSearchMatricule('');
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateCotation') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setCotationEdit(new Cotation());
                setSelectedNotationEdit(null);
                setEditCotationDialog(false);
                // Reload with current pagination
                loadCotationsPaginated(searchExercice, Math.floor(first / rows), rows, searchTerm);
            }
        }
        setBtnLoading(false);
    };

    const clearFilterCotation = () => {
        const currentYear = new Date().getFullYear();
        setSearchTerm('');
        setSearchExercice(currentYear);
        setFirst(0);
        loadCotationsPaginated(currentYear, 0, rows, '');
    };

    const loadCotationToEdit = (data: Cotation) => {
        if (data) {
            setEditCotationDialog(true);
            setCotationEdit(data);

            // Find and set the selected notation for edit (separate from create state)
            const notation = notations.find(n => n.notations === data.cote);
            if (notation) {
                setSelectedNotationEdit(notation);
            }
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCotationToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    };

    const loadAllNotations = () => {
        fetchNotations(null, 'Get', baseUrl + '/notations/findall', 'loadNotations');
    };

    // Calculate increase percentage based on noteObtenue
    const calculateIncreasePercent = (noteObtenue: number): number => {
        if (noteObtenue >= 90 && noteObtenue <= 100) return 9;  // Elite
        if (noteObtenue >= 75 && noteObtenue < 90) return 7;    // Tr\u00e8s Bon (75-89.99)
        if (noteObtenue >= 60 && noteObtenue < 75) return 5;    // Bon (60-74.99)
        if (noteObtenue >= 50 && noteObtenue < 60) return 3;    // Assez Bon (50-59.99)
        return 3; // Insuffisant (<50) - bare minimum 3%
    };

    // Get note category label based on noteObtenue
    const getNoteCategoryLabel = (noteObtenue: number): string => {
        if (noteObtenue >= 90 && noteObtenue <= 100) return 'Elite';
        if (noteObtenue >= 75 && noteObtenue < 90) return 'Tr\u00e8s Bon';
        if (noteObtenue >= 60 && noteObtenue < 75) return 'Bon';
        if (noteObtenue >= 50 && noteObtenue < 60) return 'Assez Bon';
        return 'Insuffisant';
    };

    // Get severity for Tag component based on noteObtenue
    const getNoteSeverity = (noteObtenue: number): "success" | "info" | "warning" | "danger" | null => {
        if (noteObtenue >= 90) return 'success';
        if (noteObtenue >= 75) return 'info';
        if (noteObtenue >= 60) return null;
        if (noteObtenue >= 50) return 'warning';
        return 'danger';
    };

    // Calculate new salaries for cotations
    const calculateNewSalaries = (cotationsList: Cotation[]): CotationWithNewSalary[] => {
        return cotationsList.map(cot => {
            const increasePercent = calculateIncreasePercent(cot.noteObtenue);
            const increaseAmount = (cot.baseAncienne * increasePercent) / 100;
            const newBase = cot.baseAncienne + increaseAmount;
            return {
                ...cot,
                increasePercent,
                increaseAmount,
                newBase
            };
        });
    };

    // Load uncoted employees for the current exercice
    const loadUncotedEmployees = () => {
        lastProcessedUncotedCallType.current = null;
        fetchUncotedEmployees(null, 'Get', `${baseUrl}/api/grh/cotations/uncoted/${searchExercice}`, 'loadUncotedEmployees');
    };

    // Load cotations for "Appliquer la note" tab
    const loadCotationsForApplyNote = (exercice: number) => {
        fetchApplyNoteCotations(null, 'Get', `${baseUrl}/api/grh/cotations/exercice/${exercice}`, 'loadApplyNoteCotations');
    };

    // Handle exercice change in "Appliquer la note" tab
    const handleApplyNoteExerciceChange = (e: any) => {
        const value = e.value || new Date().getFullYear();
        setApplyNoteExercice(value);
        loadCotationsForApplyNote(value);
    };

    // Handle search in "Appliquer la note" tab
    const handleApplyNoteSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setApplyNoteSearchTerm(value);

        if (value.trim() === '') {
            setFilteredCotationsForApply(cotationsForApply);
        } else {
            const filtered = cotationsForApply.filter(cot =>
                cot.matriculeId.toLowerCase().includes(value.toLowerCase()) ||
                (cot.employeeName && cot.employeeName.toLowerCase().includes(value.toLowerCase())) ||
                (cot.employeeFirstName && cot.employeeFirstName.toLowerCase().includes(value.toLowerCase()))
            );
            setFilteredCotationsForApply(filtered);
        }
    };

    // Apply notes to update salaries
    const handleApplyNotes = () => {
        const eligibleCotations = cotationsForApply.filter(cot => cot.increasePercent && cot.increasePercent > 0);

        if (eligibleCotations.length === 0) {
            accept('warn', 'Attention', 'Aucun employé éligible pour une augmentation.');
            return;
        }

        confirmDialog({
            message: `\u00cates-vous s\u00fbr de vouloir appliquer les augmentations à ${eligibleCotations.length} employé(s) ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, appliquer',
            rejectLabel: 'Annuler',
            accept: () => {
                setApplyBtnLoading(true);
                const updates = eligibleCotations.map(cot => ({
                    matriculeId: cot.matriculeId,
                    newBase: cot.newBase
                }));

                fetchApplyNote(
                    { updates },
                    'Put',
                    `${baseUrl}/api/grh/carriere/apply-note`,
                    'applyNote'
                );
            }
        });
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        // Cancel any pending API calls to prevent race conditions
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // Always reset the "Nouveau" tab state to prevent data leakage
        setCotation(new Cotation());
        setSelectedNotationNew(null);
        setCurrentSearchMatricule('');
        setSearchLoading(false);

        if (e.index === 1) {
            // Load first page of cotations when switching to "Tous" tab
            setFirst(0);
            loadCotationsPaginated(searchExercice, 0, rows, searchTerm);
        } else if (e.index === 2) {
            loadCotationsForApplyNote(applyNoteExercice);
        }
        setActiveIndex(e.index);
    };

    const formatNumber = (value: number, decimals: number = 2) => {
        return value?.toFixed(decimals) || '0.00';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', {
            style: 'currency',
            currency: 'BIF'
        }).format(value || 0);
    };

    const nbrPoints1BodyTemplate = (rowData: Cotation) => {
        return formatNumber(rowData.nbrPoints1, 2);
    };

    const nbrPoints2BodyTemplate = (rowData: Cotation) => {
        return formatNumber(rowData.nbrPoints2, 2);
    };

    const noteObtenueBodyTemplate = (rowData: Cotation) => {
        return formatNumber(rowData.noteObtenue, 2);
    };

    const baseAncienneBodyTemplate = (rowData: Cotation) => {
        return formatCurrency(rowData.baseAncienne);
    };

    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <div className="flex gap-2">
                <Button
                    icon="pi pi-filter-slash"
                    label="Réinitialiser"
                    outlined
                    onClick={clearFilterCotation}
                />
                <Button
                    icon="pi pi-users"
                    label="Afficher les employés non cotés"
                    severity="warning"
                    outlined
                    loading={uncotedLoading}
                    onClick={loadUncotedEmployees}
                />
                <div className="p-inputgroup" style={{ width: '200px' }}>
                    <span className="p-inputgroup-addon">Exercice</span>
                    <InputNumber
                        value={searchExercice}
                        onValueChange={handleSearchExerciceChange}
                        min={2000}
                        max={2099}
                        useGrouping={false}
                    />
                </div>
            </div>
            <div className="flex gap-2 align-items-center">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        placeholder="Rechercher par Matricule"
                    />
                </span>
                <Button
                    icon="pi pi-search"
                    loading={tableLoading}
                    onClick={() => loadCotationsPaginated(searchExercice, 0, rows, searchTerm)}
                    tooltip="Rechercher"
                />
            </div>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Dialog
                header="Modifier Cotation"
                visible={editCotationDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => {
                    setEditCotationDialog(false);
                    setCotationEdit(new Cotation());
                    setSelectedNotationEdit(null);
                }}
            >
                <CotationForm
                    cotation={cotationEdit}
                    notations={notations}
                    selectedNotation={selectedNotationEdit}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleDropdownChange={handleDropdownChange}
                    isEditMode={true}
                />
                <div className="flex justify-content-end mt-3">
                    <Button
                        icon="pi pi-check"
                        label="Modifier"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />
                </div>
            </Dialog>

            {/* Dialog for uncoted employees */}
            <Dialog
                header={`Employés non cotés pour l'exercice ${searchExercice}`}
                visible={uncotedDialogVisible}
                style={{ width: '60vw' }}
                modal
                onHide={() => setUncotedDialogVisible(false)}
            >
                <DataTable
                    value={uncotedEmployees}
                    emptyMessage="Tous les employés actifs ont été cotés pour cet exercice."
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 20, 30]}
                >
                    <Column field="matriculeId" header="Matricule" sortable />
                    <Column field="nom" header="Nom" sortable />
                    <Column field="prenom" header="Prénom" sortable />
                </DataTable>
                <div className="flex justify-content-between align-items-center mt-3">
                    <span className="text-sm text-500">
                        {uncotedEmployees.length} employé(s) non coté(s)
                    </span>
                    <Button
                        icon="pi pi-times"
                        label="Fermer"
                        outlined
                        onClick={() => setUncotedDialogVisible(false)}
                    />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <CotationForm
                        cotation={cotation}
                        notations={notations}
                        selectedNotation={selectedNotationNew}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDropdownChange={handleDropdownChange}
                        handleMatriculeBlur={handleMatriculeBlur}
                        searchLoading={searchLoading}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => {
                                        // Cancel any pending requests
                                        if (abortControllerRef.current) {
                                            abortControllerRef.current.abort();
                                            abortControllerRef.current = null;
                                        }
                                        setCotation(new Cotation());
                                        setSelectedNotationNew(null);
                                        setCurrentSearchMatricule('');
                                        setSearchLoading(false);
                                    }}
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button
                                    icon="pi pi-check"
                                    label="Enregistrer"
                                    loading={btnLoading || searchLoading}
                                    onClick={handleSubmit}
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
                                    value={filteredCotations}
                                    header={renderSearch}
                                    emptyMessage={"Pas de cotations à afficher"}
                                    lazy
                                    paginator
                                    first={first}
                                    rows={rows}
                                    totalRecords={totalRecords}
                                    onPage={onPageChange}
                                    rowsPerPageOptions={[10, 20, 30]}
                                    loading={tableLoading}
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} cotations"
                                >
                                    <Column field="cotationId" header="Code" sortable />
                                    <Column field="exercice" header="Exercice" sortable />
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column field="employeeName" header="Nom" sortable />
                                    <Column field="employeeFirstName" header="Prénom" sortable />
                                    <Column field="cote" header="Notation" sortable />
                                    <Column field="statut" header="Statut" sortable />
                                    <Column header="Points1" body={nbrPoints1BodyTemplate} sortable />
                                    <Column header="Points2" body={nbrPoints2BodyTemplate} sortable />
                                    <Column header="Note Obtenue" body={noteObtenueBodyTemplate} sortable />
                                    <Column header="Base Ancienne" body={baseAncienneBodyTemplate} sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Appliquer la note">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <div className="flex justify-content-between align-items-center mb-3">
                                    <div className="flex gap-2 align-items-center">
                                        <div className="p-inputgroup" style={{ width: '200px' }}>
                                            <span className="p-inputgroup-addon">Exercice</span>
                                            <InputNumber
                                                value={applyNoteExercice}
                                                onValueChange={handleApplyNoteExerciceChange}
                                                min={2000}
                                                max={2099}
                                                useGrouping={false}
                                            />
                                        </div>
                                        <Button
                                            icon="pi pi-refresh"
                                            outlined
                                            onClick={() => loadCotationsForApplyNote(applyNoteExercice)}
                                            tooltip="Recharger"
                                        />
                                        <span className="p-input-icon-left">
                                            <i className="pi pi-search" />
                                            <InputText
                                                value={applyNoteSearchTerm}
                                                onChange={handleApplyNoteSearch}
                                                placeholder="Rechercher..."
                                                style={{ width: '200px' }}
                                            />
                                        </span>
                                    </div>
                                    <div className="flex gap-2 align-items-center">
                                        <span className="text-sm text-500">
                                            {cotationsForApply.filter(c => (c.increasePercent ?? 0) > 0).length} employé(s) éligible(s)
                                            {applyNoteSearchTerm && ` (${filteredCotationsForApply.length} affiché(s))`}
                                        </span>
                                        <Button
                                            icon="pi pi-check"
                                            label="Appliquer les augmentations"
                                            severity="success"
                                            loading={applyBtnLoading}
                                            onClick={handleApplyNotes}
                                            disabled={cotationsForApply.filter(c => (c.increasePercent ?? 0) > 0).length === 0}
                                        />
                                    </div>
                                </div>
                                <DataTable
                                    value={filteredCotationsForApply}
                                    emptyMessage={"Pas de cotations à afficher. Sélectionnez un exercice."}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                    sortField="noteObtenue"
                                    sortOrder={-1}
                                >
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column field="employeeName" header="Nom" sortable />
                                    <Column field="employeeFirstName" header="Prénom" sortable />
                                    <Column
                                        field="noteObtenue"
                                        header="Note Obtenue"
                                        body={(rowData: CotationWithNewSalary) => formatNumber(rowData.noteObtenue, 2)}
                                        sortable
                                    />
                                    <Column
                                        field="baseAncienne"
                                        header="Base Ancienne"
                                        body={(rowData: CotationWithNewSalary) => formatCurrency(rowData.baseAncienne)}
                                        sortable
                                    />
                                    <Column field="cote" header="Cote" sortable />
                                    <Column
                                        header="Catégorie"
                                        body={(rowData: CotationWithNewSalary) => (
                                            <Tag
                                                value={getNoteCategoryLabel(rowData.noteObtenue)}
                                                severity={getNoteSeverity(rowData.noteObtenue)}
                                            />
                                        )}
                                        sortable
                                        sortField="noteObtenue"
                                    />
                                    <Column
                                        header="Augmentation"
                                        body={(rowData: CotationWithNewSalary) => (
                                            rowData.increasePercent && rowData.increasePercent > 0
                                                ? `+${rowData.increasePercent}%`
                                                : '-'
                                        )}
                                    />
                                    <Column
                                        header="Montant"
                                        body={(rowData: CotationWithNewSalary) => (
                                            rowData.increaseAmount && rowData.increaseAmount > 0
                                                ? formatCurrency(rowData.increaseAmount)
                                                : '-'
                                        )}
                                    />
                                    <Column
                                        header="Nouvelle Base"
                                        body={(rowData: CotationWithNewSalary) => (
                                            rowData.newBase && rowData.increasePercent && rowData.increasePercent > 0
                                                ? <strong>{formatCurrency(rowData.newBase)}</strong>
                                                : formatCurrency(rowData.baseAncienne)
                                        )}
                                    />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
};

export default CotationComponent;
