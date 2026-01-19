'use client';

import { useEffect, useRef, useState } from "react";
import { SaisieIndemnite } from "./SaisieIndemnite";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import SaisieIndemniteForm from "./SaisieIndemniteForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import useConsumApi from "../../../../../../hooks/fetchData/useConsumApi";
import { IndemniteParametre } from "../../indemniteParametre/IndemniteParametre";
import { PeriodePaie } from "../../periodePaie/PeriodePaie";
import { API_BASE_URL } from '@/utils/apiConfig';

// Simple employee interface for bulk selection
interface EmployeeBasic {
    matriculeId: string;
    nom: string;
    prenom: string;
}

// Bulk indemnite data (without matriculeId since it will be applied to multiple employees)
interface BulkIndemniteData {
    periodeId: string;
    codeInd: string;
    taux: number;
    montant: number;
}

// Validation function to replace class method (class methods are lost when using spread operator in state)
const isValidSaisieIndemnite = (saisie: SaisieIndemnite): boolean => {
    return saisie.matriculeId.length > 0 &&
           saisie.codeInd.length > 0 &&
           saisie.montant > 0 &&
           saisie.periodeId.length > 0;
};

const SaisieIndemniteComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    
    const [saisieIndemnite, setSaisieIndemnite] = useState<SaisieIndemnite>(new SaisieIndemnite());
    const [saisieIndemniteEdit, setSaisieIndemniteEdit] = useState<SaisieIndemnite>(new SaisieIndemnite());
    const [editSaisieIndemniteDialog, setEditSaisieIndemniteDialog] = useState(false);
    const [saisieIndemnites, setSaisieIndemnites] = useState<SaisieIndemnite[]>([]);
    const [filteredSaisieIndemnites, setFilteredSaisieIndemnites] = useState<SaisieIndemnite[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterPeriodeId, setFilterPeriodeId] = useState<string>('');
    const [filterCodeInd, setFilterCodeInd] = useState<string>('');
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    const [periodePaiesByYear, setPeriodePaiesByYear] = useState<PeriodePaie[]>([]);

    // API hooks
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployeeData, callType: employeeCallType } = useConsumApi('');
    const { data: indemniteParametreData, loading: indemniteParametreLoading, error: indemniteParametreError, fetchData: fetchIndemniteParametres, callType: indemniteParametreCallType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: periodePaieData, loading: periodePaieLoading, error: periodePaieError, fetchData: fetchPeriodePaies, callType: periodePaieCallType } = useConsumApi('');
    const { data: periodePaieByYearData, fetchData: fetchPeriodePaiesByYear, callType: periodePaieByYearCallType } = useConsumApi('');
    const { data: indemnitesByPeriodeData, fetchData: fetchIndemnitesByPeriode, callType: indemnitesByPeriodeCallType } = useConsumApi('');

    const toast = useRef<Toast>(null);

    // State for dropdown options
    const [indemniteParametres, setIndemniteParametres] = useState<IndemniteParametre[]>([]);
    const [periodePaies, setPeriodePaies] = useState<PeriodePaie[]>([]);

    // Selected options
    const [selectedIndemniteParametre, setSelectedIndemniteParametre] = useState<IndemniteParametre | null>(null);
    const [selectedPeriodePaie, setSelectedPeriodePaie] = useState<PeriodePaie | null>(null);

    // Bulk creation states
    const [allEmployees, setAllEmployees] = useState<EmployeeBasic[]>([]);
    const [filteredEmployeesForBulk, setFilteredEmployeesForBulk] = useState<EmployeeBasic[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeBasic[]>([]);
    const [bulkSearchTerm, setBulkSearchTerm] = useState<string>('');
    const [bulkIndemnite, setBulkIndemnite] = useState<BulkIndemniteData>({
        periodeId: '',
        codeInd: '',
        taux: 0,
        montant: 0
    });
    const [selectedBulkPeriodePaie, setSelectedBulkPeriodePaie] = useState<PeriodePaie | null>(null);
    const [selectedBulkIndemniteParametre, setSelectedBulkIndemniteParametre] = useState<IndemniteParametre | null>(null);
    const [bulkBtnLoading, setBulkBtnLoading] = useState<boolean>(false);

    // API hook for fetching all employees
    const { data: allEmployeesData, fetchData: fetchAllEmployees, callType: allEmployeesCallType } = useConsumApi('');

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllIndemniteParametres();
        loadOpenPeriodePaies();
    }, []);

    // Separate useEffect for employee search (to avoid stale data issues)
    useEffect(() => {
        if (employeeData && employeeCallType === 'searchByMatricule') {
            const foundEmployee = employeeData as any;
            setSaisieIndemnite((prev) => {
                const updated = Object.assign(new SaisieIndemnite(), prev);
                updated.employeeFirstName = foundEmployee.prenom;
                updated.employeeLastName = foundEmployee.nom;
                return updated;
            });
            accept('info', 'Employé trouvé', 'Les données de l\'employé ont été chargées.');
            setSearchLoading(false);
        }

        if (employeeError && employeeCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setSearchLoading(false);
        }
    }, [employeeData, employeeError, employeeCallType]);

    // Main data handling useEffect
    useEffect(() => {
        if (data) {
            if (callType === 'loadSaisieIndemnites') {
                setSaisieIndemnites(Array.isArray(data) ? data : [data]);
                setFilteredSaisieIndemnites(Array.isArray(data) ? data : [data]);
            }
        }

        if (searchData && searchCallType === 'searchSaisieIndemnites') {
            const searchResults = Array.isArray(searchData) ? searchData : [searchData];
            setFilteredSaisieIndemnites(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucune indemnité trouvée.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} indemnité(s) trouvée(s).`);
            }
        }

        if (searchError && searchCallType === 'searchSaisieIndemnites') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des indemnités.');
            setFilteredSaisieIndemnites([]);
        }

        if (indemniteParametreData && indemniteParametreCallType === 'loadIndemniteParametres') {
            setIndemniteParametres(Array.isArray(indemniteParametreData) ? indemniteParametreData : [indemniteParametreData]);
        }

        if (periodePaieData && periodePaieCallType === 'loadOpenPeriodePaies') {
            setPeriodePaies(Array.isArray(periodePaieData) ? periodePaieData : [periodePaieData]);
        }

        // Handle all employees data for bulk selection
        if (allEmployeesData && allEmployeesCallType === 'loadAllEmployees') {
            const employeesList = Array.isArray(allEmployeesData) ? allEmployeesData : [allEmployeesData];
            setAllEmployees(employeesList);
            setFilteredEmployeesForBulk(employeesList);
        }

        // Handle bulk creation response
        if (data && callType === 'bulkCreateSaisieIndemnites') {
            accept('success', 'Succès', `${selectedEmployees.length} indemnité(s) créée(s) avec succès.`);
            resetBulkForm();
            setBulkBtnLoading(false);
        }

        handleAfterApiCall();
    }, [data, error, callType, searchData, searchError, indemniteParametreData, periodePaieData, allEmployeesData]);

    // Separate useEffect for periods by year to avoid re-triggering when indemnites are loaded
    useEffect(() => {
        if (periodePaieByYearData && periodePaieByYearCallType === 'loadPeriodePaiesByYear') {
            const periods = Array.isArray(periodePaieByYearData) ? periodePaieByYearData : [periodePaieByYearData];
            setPeriodePaiesByYear(periods);
            // Clear previous selection and data when year changes
            setFilterPeriodeId('');
            setSaisieIndemnites([]);
            setFilteredSaisieIndemnites([]);
            setSearchTerm('');
            setFilterCodeInd('');
        }
    }, [periodePaieByYearData, periodePaieByYearCallType]);

    // Separate useEffect for indemnites by period
    useEffect(() => {
        if (indemnitesByPeriodeData && indemnitesByPeriodeCallType === 'loadIndemnitesByPeriode') {
            const indemnites = Array.isArray(indemnitesByPeriodeData) ? indemnitesByPeriodeData : [indemnitesByPeriodeData];
            setSaisieIndemnites(indemnites);
            setFilteredSaisieIndemnites(indemnites);
            if (indemnites.length === 0) {
                accept('info', 'Information', 'Aucune indemnité trouvée pour cette période.');
            }
        }
    }, [indemnitesByPeriodeData, indemnitesByPeriodeCallType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaisieIndemnite((prev) => {
            const updated = Object.assign(new SaisieIndemnite(), prev);
            (updated as any)[e.target.name] = e.target.value;
            return updated;
        });
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaisieIndemniteEdit((prev) => {
            const updated = Object.assign(new SaisieIndemnite(), prev);
            (updated as any)[e.target.name] = e.target.value;
            return updated;
        });
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setSaisieIndemnite((prev) => {
            const updated = Object.assign(new SaisieIndemnite(), prev);
            (updated as any)[field] = value || 0;
            return updated;
        });
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setSaisieIndemniteEdit((prev) => {
            const updated = Object.assign(new SaisieIndemnite(), prev);
            (updated as any)[field] = value || 0;
            return updated;
        });
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchEmployeeData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        applySearchFilter(value);
    };

    const handleSubmit = () => {
        if (!isValidSaisieIndemnite(saisieIndemnite)) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', saisieIndemnite);
        fetchData(saisieIndemnite, 'Post', `${baseUrl}/api/grh/ficheEmploye/saisie-indemnites/new`, 'createSaisieIndemnite');
    };

    const handleSubmitEdit = () => {
        if (!isValidSaisieIndemnite(saisieIndemniteEdit)) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', saisieIndemniteEdit);
        fetchData(saisieIndemniteEdit, 'Put', `${baseUrl}/api/grh/ficheEmploye/saisie-indemnites/update/${saisieIndemniteEdit.indemniteId}`, 'updateSaisieIndemnite');
    };

    const handleAfterApiCall = () => {
        if (error !== null) {
            // Error handling for all tabs
            if (callType === 'createSaisieIndemnite') {
                // Use the error message from backend (already extracted by useConsumApi hook)
                const errorMessage = (error as any)?.message || 'L\'enregistrement n\'a pas été effectué.';
                accept('warn', 'A votre attention', errorMessage);
            } else if (callType === 'updateSaisieIndemnite') {
                const errorMessage = (error as any)?.message || 'La mise à jour n\'a pas été effectuée.';
                accept('warn', 'A votre attention', errorMessage);
            } else if (callType === 'loadSaisieIndemnites') {
                accept('warn', 'A votre attention', 'Impossible de charger la liste des indemnités.');
            }
        }
        else if (data !== null && error === null) {
            if (callType === 'createSaisieIndemnite') {
                setSaisieIndemnite(new SaisieIndemnite());
                setSelectedIndemniteParametre(null);
                setSelectedPeriodePaie(null);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateSaisieIndemnite') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setSaisieIndemniteEdit(new SaisieIndemnite());
                setSelectedPeriodePaie(null);
                setEditSaisieIndemniteDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterSaisieIndemnite = () => {
        const currentYear = new Date().getFullYear();
        setSearchTerm('');
        setFilterPeriodeId('');
        setFilterCodeInd('');
        setFilterYear(currentYear);
        setSaisieIndemnites([]);
        setFilteredSaisieIndemnites([]);
        loadPeriodePaiesByYear(currentYear);
    };

    const loadSaisieIndemniteToEdit = (data: SaisieIndemnite) => {
        if (data) {
            setEditSaisieIndemniteDialog(true);
            setSaisieIndemniteEdit(data);

            // Set selected indemnite parametre for edit mode
            const indemniteParametre = indemniteParametres.find(ip => ip.codeInd === data.codeInd);
            if (indemniteParametre) setSelectedIndemniteParametre(indemniteParametre);

            // Set selected periode paie for edit mode
            const periodePaie = periodePaies.find(p => p.periodeId === data.periodeId);
            if (periodePaie) setSelectedPeriodePaie(periodePaie);
        }
    };

    const closeSaisieIndemnite = (data: SaisieIndemnite) => {
        if (confirm('Êtes-vous sûr de vouloir clôturer cette indemnité?')) {
            fetchData(null, 'Put', `${baseUrl}/api/grh/ficheEmploye/saisie-indemnites/close/${data.indemniteId}`, 'closeSaisieIndemnite');
        }
    };

    const optionButtons = (data: SaisieIndemnite): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadSaisieIndemniteToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    size="small"
                />
                <Button 
                    icon="pi pi-ban" 
                    onClick={() => closeSaisieIndemnite(data)} 
                    raised 
                    severity='secondary' 
                    tooltip="Clôturer"
                    size="small"
                />
            </div>
        );
    };

    const loadAllData = () => {
        // Load only indemnites for active employees (situationId = '01')
        fetchData(null, 'Get', `${baseUrl}/api/grh/ficheEmploye/saisie-indemnites/findall/active`, 'loadSaisieIndemnites');
    };

    const loadAllIndemniteParametres = () => {
        fetchIndemniteParametres(null, 'Get', `${baseUrl}/api/grh/paie/indemnites/findall`, 'loadIndemniteParametres');
    };

    const loadOpenPeriodePaies = () => {
        // Load only periods where dateCloture is null/empty (not closed)
        fetchPeriodePaies(null, 'Get', `${baseUrl}/api/grh/paie/periods/open`, 'loadOpenPeriodePaies');
    };

    const loadAllEmployeesForBulk = () => {
        // Load only active employees (situationId = '01')
        fetchAllEmployees(null, 'Get', `${baseUrl}/api/grh/employees/findall/active`, 'loadAllEmployees');
    };

    const loadPeriodePaiesByYear = (year: number) => {
        // Load periods for a specific year
        fetchPeriodePaiesByYear(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${year}`, 'loadPeriodePaiesByYear');
    };

    const loadIndemnitesByPeriode = (periodeId: string) => {
        // Load indemnites for a specific period (for active employees only)
        fetchIndemnitesByPeriode(null, 'Get', `${baseUrl}/api/grh/ficheEmploye/saisie-indemnites/findall/periode/${periodeId}`, 'loadIndemnitesByPeriode');
    };

    // Bulk functionality helpers
    const resetBulkForm = () => {
        setBulkIndemnite({
            periodeId: '',
            codeInd: '',
            taux: 0,
            montant: 0
        });
        setSelectedEmployees([]);
        setSelectedBulkPeriodePaie(null);
        setSelectedBulkIndemniteParametre(null);
        setBulkSearchTerm('');
        setFilteredEmployeesForBulk(allEmployees);
    };

    const handleBulkSearchEmployees = (searchValue: string) => {
        setBulkSearchTerm(searchValue);
        if (searchValue.trim() === '') {
            setFilteredEmployeesForBulk(allEmployees);
            return;
        }
        const lowerSearch = searchValue.toLowerCase();
        const filtered = allEmployees.filter(emp =>
            emp.matriculeId.toLowerCase().includes(lowerSearch) ||
            emp.nom.toLowerCase().includes(lowerSearch) ||
            emp.prenom.toLowerCase().includes(lowerSearch)
        );
        setFilteredEmployeesForBulk(filtered);
    };

    const handleBulkDropdownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;

        if (fieldName === 'periodeId') {
            const periodePaie = periodePaies.find(p => p.periodeId === value);
            setBulkIndemnite(prev => ({ ...prev, periodeId: value || '' }));
            setSelectedBulkPeriodePaie(periodePaie || null);
        } else if (fieldName === 'codeInd') {
            const indemniteParametre = indemniteParametres.find(ip => ip.codeInd === value);
            setBulkIndemnite(prev => ({
                ...prev,
                codeInd: value,
                taux: indemniteParametre ? indemniteParametre.taux : 0
            }));
            setSelectedBulkIndemniteParametre(indemniteParametre || null);
        }
    };

    const handleBulkNumberChange = (field: string, value: number | null) => {
        setBulkIndemnite(prev => ({ ...prev, [field]: value || 0 }));
    };

    const handleBulkSubmit = () => {
        // Validation
        if (selectedEmployees.length === 0) {
            accept('warn', 'Validation', 'Veuillez sélectionner au moins un employé.');
            return;
        }
        if (!bulkIndemnite.periodeId) {
            accept('warn', 'Validation', 'Veuillez sélectionner une période.');
            return;
        }
        if (!bulkIndemnite.codeInd) {
            accept('warn', 'Validation', 'Veuillez sélectionner une indemnité.');
            return;
        }
        if (bulkIndemnite.montant <= 0) {
            accept('warn', 'Validation', 'Le montant doit être supérieur à 0.');
            return;
        }

        setBulkBtnLoading(true);

        // Create bulk request payload
        const bulkPayload = {
            matriculeIds: selectedEmployees.map(emp => emp.matriculeId),
            periodeId: bulkIndemnite.periodeId,
            codeInd: bulkIndemnite.codeInd,
            taux: bulkIndemnite.taux,
            montant: bulkIndemnite.montant
        };

        console.log('Bulk indemnite payload:', bulkPayload);
        fetchData(bulkPayload, 'Post', `${baseUrl}/api/grh/ficheEmploye/saisie-indemnites/bulk`, 'bulkCreateSaisieIndemnites');
    };

    const renderBulkEmployeeSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center mb-3">
                <div className="flex align-items-center gap-2">
                    <span className="font-bold">{selectedEmployees.length} employé(s) sélectionné(s)</span>
                    {selectedEmployees.length > 0 && (
                        <Button
                            icon="pi pi-times"
                            label="Désélectionner tout"
                            outlined
                            size="small"
                            onClick={() => setSelectedEmployees([])}
                        />
                    )}
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Rechercher par matricule, nom, prénom"
                        value={bulkSearchTerm}
                        onChange={(e) => handleBulkSearchEmployees(e.target.value)}
                    />
                </span>
            </div>
        );
    };

    const handleYearChange = (year: number | null) => {
        if (year && year >= 2000 && year <= 2100) {
            setFilterYear(year);
            loadPeriodePaiesByYear(year);
        }
    };

    const handlePeriodeSelectForTous = (periodeId: string) => {
        setFilterPeriodeId(periodeId);
        setSearchTerm('');
        setFilterCodeInd('');
        if (periodeId) {
            loadIndemnitesByPeriode(periodeId);
        } else {
            // Clear data if no period is selected
            setSaisieIndemnites([]);
            setFilteredSaisieIndemnites([]);
        }
    };

    const handleIndemniteFilterChange = (codeInd: string) => {
        setFilterCodeInd(codeInd);
        applySearchFilter(searchTerm, codeInd);
    };

    const applySearchFilter = (searchValue: string, codeInd?: string) => {
        let filtered = [...saisieIndemnites];

        // Apply indemnite filter
        const indemniteFilter = codeInd !== undefined ? codeInd : filterCodeInd;
        if (indemniteFilter) {
            filtered = filtered.filter((item: any) => item.codeInd === indemniteFilter);
        }

        // Apply text search filter
        if (searchValue.trim()) {
            const lowerSearch = searchValue.toLowerCase().trim();
            filtered = filtered.filter((item: any) =>
                item.matriculeId.toLowerCase() === lowerSearch ||
                (item.nom && item.nom.toLowerCase() === lowerSearch) ||
                (item.prenom && item.prenom.toLowerCase() === lowerSearch)
            );
        }

        setFilteredSaisieIndemnites(filtered);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            // Pour plusieurs tab - load employees for bulk selection
            loadAllEmployeesForBulk();
        } else if (e.index === 2) {
            // Tous tab - load periods by current year (default)
            const currentYear = new Date().getFullYear();
            setFilterYear(currentYear);
            loadPeriodePaiesByYear(currentYear);
            // Clear previous data
            setSaisieIndemnites([]);
            setFilteredSaisieIndemnites([]);
            setFilterPeriodeId('');
            setSearchTerm('');
            setFilterCodeInd('');
        } else {
            // Nouveau tab - reset form
            setSaisieIndemnite(new SaisieIndemnite());
            setSelectedIndemniteParametre(null);
            setSelectedPeriodePaie(null);
        }
        setActiveIndex(e.index);
    };

    const onDropdownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;

        if (fieldName === 'codeInd') {
            const indemniteParametre = indemniteParametres.find(ip => ip.codeInd === value);
            if (!editSaisieIndemniteDialog) {
                setSaisieIndemnite((prev) => {
                    const updated = Object.assign(new SaisieIndemnite(), prev);
                    updated.codeInd = value;
                    updated.taux = indemniteParametre ? indemniteParametre.taux : 0;
                    return updated;
                });
                setSelectedIndemniteParametre(indemniteParametre || null);
            } else {
                setSaisieIndemniteEdit((prev) => {
                    const updated = Object.assign(new SaisieIndemnite(), prev);
                    updated.codeInd = value;
                    updated.taux = indemniteParametre ? indemniteParametre.taux : 0;
                    return updated;
                });
                setSelectedIndemniteParametre(indemniteParametre || null);
            }
        } else if (fieldName === 'periodeId') {
            const periodePaie = periodePaies.find(p => p.periodeId === value);
            if (!editSaisieIndemniteDialog) {
                setSaisieIndemnite((prev) => {
                    const updated = Object.assign(new SaisieIndemnite(), prev);
                    updated.periodeId = value || '';
                    return updated;
                });
                setSelectedPeriodePaie(periodePaie || null);
            } else {
                setSaisieIndemniteEdit((prev) => {
                    const updated = Object.assign(new SaisieIndemnite(), prev);
                    updated.periodeId = value || '';
                    return updated;
                });
                setSelectedPeriodePaie(periodePaie || null);
            }
        }
    };

    // Format period label for display
    const getPeriodeLabel = (periodeId: string) => {
        const periode = periodePaiesByYear.find(p => p.periodeId === periodeId);
        if (!periode) return periodeId;
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return `${monthNames[periode.mois - 1]} ${periode.annee}`;
    };

    // Format period label for year dropdown (just month name since year is already known)
    const getPeriodeLabelForYear = (periode: PeriodePaie) => {
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return monthNames[periode.mois - 1];
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center flex-wrap gap-2">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterSaisieIndemnite} />
                <div className="flex align-items-center gap-2 flex-wrap">
                    <div className="flex align-items-center gap-1">
                        <label htmlFor="filterYear" className="font-semibold">Année:</label>
                        <InputNumber
                            id="filterYear"
                            value={filterYear}
                            onValueChange={(e) => handleYearChange(e.value ?? null)}
                            useGrouping={false}
                            min={2000}
                            max={2100}
                            className="w-6rem"
                        />
                    </div>
                    <Dropdown
                        value={filterPeriodeId}
                        options={periodePaiesByYear.map(p => ({
                            label: getPeriodeLabelForYear(p),
                            value: p.periodeId
                        }))}
                        onChange={(e) => handlePeriodeSelectForTous(e.value || '')}
                        placeholder="Sélectionner une période"
                        showClear
                        filter
                        className="w-12rem"
                        emptyMessage="Aucune période pour cette année"
                    />
                    <Dropdown
                        value={filterCodeInd}
                        options={indemniteParametres}
                        optionLabel="libelleInd"
                        optionValue="codeInd"
                        onChange={(e) => handleIndemniteFilterChange(e.value || '')}
                        placeholder="Filtrer par indemnité"
                        showClear
                        filter
                        className="w-14rem"
                        disabled={!filterPeriodeId}
                    />
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            placeholder="Recherche par Matricule/Nom"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            disabled={!filterPeriodeId}
                        />
                    </span>
                </div>
            </div>
        );
    };

    const getIndemniteParametreLabel = (codeInd: string) => {
        const indemniteParametre = indemniteParametres.find(ip => ip.codeInd === codeInd);
        return indemniteParametre ? indemniteParametre.libelleInd : codeInd;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF'
        }).format(amount);
    };

    const formatPercentage = (taux: number) => {
        return `${taux}%`;
    };

    const statusBodyTemplate = (rowData: any) => {
        const isActive = !rowData.dateFin;
        const statusLabel = isActive ? 'Actif' : 'Clôturé';
        const badgeClass = isActive ? 'p-badge-success' : 'p-badge-secondary';
        
        return (
            <span className={`p-badge ${badgeClass}`}>
                {statusLabel}
            </span>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Saisie Indemnité"
                visible={editSaisieIndemniteDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditSaisieIndemniteDialog(false)}
            >
                <SaisieIndemniteForm
                    saisieIndemnite={saisieIndemniteEdit}
                    indemniteParametres={indemniteParametres}
                    periodePaies={periodePaies}
                    selectedIndemniteParametre={selectedIndemniteParametre}
                    selectedPeriodePaie={selectedPeriodePaie}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDropDownSelect={onDropdownSelect}
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

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <SaisieIndemniteForm
                        saisieIndemnite={saisieIndemnite}
                        indemniteParametres={indemniteParametres}
                        periodePaies={periodePaies}
                        selectedIndemniteParametre={selectedIndemniteParametre}
                        selectedPeriodePaie={selectedPeriodePaie}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDropDownSelect={onDropdownSelect}
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
                                        setSaisieIndemnite(new SaisieIndemnite());
                                        setSelectedIndemniteParametre(null);
                                        setSelectedPeriodePaie(null);
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
                <TabPanel header="Pour plusieurs">
                    <div className="grid">
                        {/* Left side: Employee selection */}
                        <div className="col-12 lg:col-6">
                            <div className="card">
                                <h5>Sélectionner les employés</h5>
                                <DataTable
                                    value={filteredEmployeesForBulk}
                                    header={renderBulkEmployeeSearch}
                                    selection={selectedEmployees}
                                    onSelectionChange={(e) => setSelectedEmployees(e.value as EmployeeBasic[])}
                                    dataKey="matriculeId"
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 25, 50]}
                                    emptyMessage="Aucun employé trouvé"
                                    selectionMode="multiple"
                                    scrollable
                                    scrollHeight="400px"
                                >
                                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column field="nom" header="Nom" sortable />
                                    <Column field="prenom" header="Prénom" sortable />
                                </DataTable>
                            </div>
                        </div>

                        {/* Right side: Indemnite configuration */}
                        <div className="col-12 lg:col-6">
                            <div className="card">
                                <h5>Configurer l'indemnité</h5>
                                <div className="formgrid grid">
                                    {/* Periode Selection */}
                                    <div className="field col-12">
                                        <label htmlFor="bulkPeriodeId">Période *</label>
                                        <Dropdown
                                            name="periodeId"
                                            value={bulkIndemnite.periodeId}
                                            options={periodePaies.map(p => ({
                                                label: `${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][p.mois - 1]} ${p.annee}`,
                                                value: p.periodeId
                                            }))}
                                            onChange={handleBulkDropdownSelect}
                                            placeholder="Sélectionner la période"
                                            className="w-full"
                                            filter
                                            showClear
                                        />
                                    </div>

                                    {/* Indemnite Selection */}
                                    <div className="field col-12">
                                        <label htmlFor="bulkCodeInd">Indemnité *</label>
                                        <Dropdown
                                            name="codeInd"
                                            value={bulkIndemnite.codeInd}
                                            options={indemniteParametres}
                                            optionLabel="libelleInd"
                                            optionValue="codeInd"
                                            onChange={handleBulkDropdownSelect}
                                            placeholder="Sélectionner l'indemnité"
                                            className="w-full"
                                            filter
                                            showClear
                                        />
                                    </div>

                                    {/* Taux */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="bulkTaux">Taux (%)</label>
                                        <InputNumber
                                            id="bulkTaux"
                                            value={bulkIndemnite.taux}
                                            onValueChange={(e) => handleBulkNumberChange('taux', e.value ?? null)}
                                            mode="decimal"
                                            minFractionDigits={0}
                                            maxFractionDigits={0}
                                            min={0}
                                            max={100}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Montant */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="bulkMontant">Montant *</label>
                                        <InputNumber
                                            id="bulkMontant"
                                            value={bulkIndemnite.montant}
                                            onValueChange={(e) => handleBulkNumberChange('montant', e.value ?? null)}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-FR"
                                            min={0}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Display selected indemnite info */}
                                    {selectedBulkIndemniteParametre && (
                                        <div className="field col-12">
                                            <div className="p-message p-message-info">
                                                <div className="p-message-wrapper flex align-items-center gap-2">
                                                    <span className="p-message-icon pi pi-info-circle"></span>
                                                    <div className="p-message-text">
                                                        <strong>{selectedBulkIndemniteParametre.libelleInd}</strong>
                                                        {' - '}
                                                        Imposable: {selectedBulkIndemniteParametre.imposable ? 'Oui' : 'Non'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary */}
                                    {selectedEmployees.length > 0 && bulkIndemnite.montant > 0 && (
                                        <div className="field col-12">
                                            <div className="p-message p-message-success">
                                                <div className="p-message-wrapper flex align-items-center gap-2">
                                                    <span className="p-message-icon pi pi-calculator"></span>
                                                    <div className="p-message-text">
                                                        <strong>Résumé:</strong> {selectedEmployees.length} employé(s) × {formatCurrency(bulkIndemnite.montant)} = <strong>{formatCurrency(selectedEmployees.length * bulkIndemnite.montant)}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-content-end gap-2 mt-3">
                                    <Button
                                        icon="pi pi-refresh"
                                        label="Réinitialiser"
                                        outlined
                                        onClick={resetBulkForm}
                                    />
                                    <Button
                                        icon="pi pi-check"
                                        label={`Enregistrer pour ${selectedEmployees.length} employé(s)`}
                                        loading={bulkBtnLoading}
                                        onClick={handleBulkSubmit}
                                        disabled={selectedEmployees.length === 0 || !bulkIndemnite.periodeId || !bulkIndemnite.codeInd || bulkIndemnite.montant <= 0}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredSaisieIndemnites}
                                    header={renderSearch}
                                    emptyMessage={"Aucune saisie d'indemnité à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column
                                        field="periodeId"
                                        header="Période"
                                        body={(rowData) => getPeriodeLabel(rowData.periodeId)}
                                        sortable
                                    />
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column field="nom" header="Nom" sortable />
                                    <Column field="prenom" header="Prénom" sortable />
                                    <Column
                                        field="codeInd"
                                        header="Indemnité"
                                        body={(rowData) => getIndemniteParametreLabel(rowData.codeInd)}
                                        sortable
                                    />
                                    <Column
                                        field="taux"
                                        header="Taux"
                                        body={(rowData) => formatPercentage(rowData.taux)}
                                        sortable
                                    />
                                    <Column
                                        field="montant"
                                        header="Montant"
                                        body={(rowData) => formatCurrency(rowData.montant)}
                                        sortable
                                    />
                                    <Column
                                        header="Statut"
                                        body={statusBodyTemplate}
                                        sortable
                                        sortField="dateFin"
                                    />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
};

export default SaisieIndemniteComponent;