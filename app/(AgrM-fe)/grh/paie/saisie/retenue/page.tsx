'use client';

import { useEffect, useRef, useState } from "react";
import { SaisieRetenue } from "./SaisieRetenue";
import useConsumApi from "../../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import SaisieRetenueForm from "./SaisieRetenueForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { CheckboxChangeEvent } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { RetenueParametre } from "../../../settings/retenueParametre/RetenueParametre";
import { Banque } from "../../../settings/banque/Banque";
import { PeriodePaie } from "../../periodePaie/PeriodePaie";
import { API_BASE_URL } from '@/utils/apiConfig';

// Simple employee interface for bulk selection
interface EmployeeBasic {
    matriculeId: string;
    nom: string;
    prenom: string;
}

// Bulk retenue data (without matriculeId since it will be applied to multiple employees)
interface BulkRetenueData {
    periodeId: string;
    codeRet: string;
    taux: number;
    montant: number;
    codeBanque?: string;
    compte?: string;
    reference?: string;
}

const SaisieRetenueComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    
    const [saisieRetenue, setSaisieRetenue] = useState<SaisieRetenue>(new SaisieRetenue());
    const [saisieRetenueEdit, setSaisieRetenueEdit] = useState<SaisieRetenue>(new SaisieRetenue());
    const [editSaisieRetenueDialog, setEditSaisieRetenueDialog] = useState(false);
    const [saisieRetenues, setSaisieRetenues] = useState<SaisieRetenue[]>([]);
    const [filteredSaisieRetenues, setFilteredSaisieRetenues] = useState<SaisieRetenue[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterPeriodeId, setFilterPeriodeId] = useState<string>('');
    const [filterCodeRet, setFilterCodeRet] = useState<string>('');
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    const [periodePaiesByYear, setPeriodePaiesByYear] = useState<PeriodePaie[]>([]);

    // API hooks
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployeeData, callType: employeeCallType } = useConsumApi('');
    const { data: retenueParametreData, loading: retenueParametreLoading, error: retenueParametreError, fetchData: fetchRetenueParametres, callType: retenueParametreCallType } = useConsumApi('');
    const { data: banqueData, loading: banqueLoading, error: banqueError, fetchData: fetchBanques, callType: banqueCallType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: periodePaieData, loading: periodePaieLoading, error: periodePaieError, fetchData: fetchPeriodePaies, callType: periodePaieCallType } = useConsumApi('');
    const { data: allPeriodePaieData, fetchData: fetchAllPeriodePaies, callType: allPeriodePaieCallType } = useConsumApi('');
    const { data: periodePaieByYearData, fetchData: fetchPeriodePaiesByYear, callType: periodePaieByYearCallType } = useConsumApi('');
    const { data: retenuesByPeriodeData, fetchData: fetchRetenuesByPeriode, callType: retenuesByPeriodeCallType } = useConsumApi('');

    const toast = useRef<Toast>(null);

    // State for dropdown options
    const [retenueParametres, setRetenueParametres] = useState<RetenueParametre[]>([]);
    const [banques, setBanques] = useState<Banque[]>([]);
    const [periodePaies, setPeriodePaies] = useState<PeriodePaie[]>([]);
    const [allPeriodePaies, setAllPeriodePaies] = useState<PeriodePaie[]>([]); // For filter in Tous tab

    // Selected options
    const [selectedRetenueParametre, setSelectedRetenueParametre] = useState<RetenueParametre | null>(null);
    const [selectedBanque, setSelectedBanque] = useState<Banque | null>(null);
    const [selectedPeriodePaie, setSelectedPeriodePaie] = useState<PeriodePaie | null>(null);

    // Bulk creation states
    const [allEmployees, setAllEmployees] = useState<EmployeeBasic[]>([]);
    const [filteredEmployeesForBulk, setFilteredEmployeesForBulk] = useState<EmployeeBasic[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeBasic[]>([]);
    const [bulkSearchTerm, setBulkSearchTerm] = useState<string>('');
    const [bulkRetenue, setBulkRetenue] = useState<BulkRetenueData>({
        periodeId: '',
        codeRet: '',
        taux: 0,
        montant: 0,
        codeBanque: '',
        compte: '',
        reference: ''
    });
    const [selectedBulkPeriodePaie, setSelectedBulkPeriodePaie] = useState<PeriodePaie | null>(null);
    const [selectedBulkRetenueParametre, setSelectedBulkRetenueParametre] = useState<RetenueParametre | null>(null);
    const [selectedBulkBanque, setSelectedBulkBanque] = useState<Banque | null>(null);
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
        loadAllRetenueParametres();
        loadAllBanques();
        loadOpenPeriodePaies();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadSaisieRetenues') {
                setSaisieRetenues(Array.isArray(data) ? data : [data]);
                setFilteredSaisieRetenues(Array.isArray(data) ? data : [data]);
            }
        }
        
        if (employeeData && employeeCallType === 'searchByMatricule') {
            if (employeeData) {
                const foundEmployee = employeeData as any;
                setSaisieRetenue((prev) => {
                    const updated = Object.assign(new SaisieRetenue(), prev);
                    updated.employeeFirstName = foundEmployee.prenom;
                    updated.employeeLastName = foundEmployee.nom;
                    return updated;
                });
                // No toast here - the employee name fields being populated is sufficient feedback
            }
            setSearchLoading(false);
        }
        
        if (employeeError && employeeCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setSearchLoading(false);
        }

        if (searchData && searchCallType === 'searchSaisieRetenues') {
            const searchResults = Array.isArray(searchData) ? searchData : [searchData];
            setFilteredSaisieRetenues(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucune retenue trouvée.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} retenue(s) trouvée(s).`);
            }
        }

        if (searchError && searchCallType === 'searchSaisieRetenues') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des retenues.');
            setFilteredSaisieRetenues([]);
        }
        
        if (retenueParametreData && retenueParametreCallType === 'loadRetenueParametres') {
            setRetenueParametres(Array.isArray(retenueParametreData) ? retenueParametreData : [retenueParametreData]);
        }

        if (banqueData && banqueCallType === 'loadBanques') {
            setBanques(Array.isArray(banqueData) ? banqueData : [banqueData]);
        }

        if (periodePaieData && periodePaieCallType === 'loadOpenPeriodePaies') {
            setPeriodePaies(Array.isArray(periodePaieData) ? periodePaieData : [periodePaieData]);
        }

        if (allPeriodePaieData && allPeriodePaieCallType === 'loadAllPeriodePaies') {
            setAllPeriodePaies(Array.isArray(allPeriodePaieData) ? allPeriodePaieData : [allPeriodePaieData]);
        }

        // Handle all employees data for bulk selection
        if (allEmployeesData && allEmployeesCallType === 'loadAllEmployees') {
            const employeesList = Array.isArray(allEmployeesData) ? allEmployeesData : [allEmployeesData];
            setAllEmployees(employeesList);
            setFilteredEmployeesForBulk(employeesList);
        }

        // Handle bulk creation response
        if (data && callType === 'bulkCreateSaisieRetenues') {
            accept('success', 'Succès', `${selectedEmployees.length} retenue(s) créée(s) avec succès.`);
            resetBulkForm();
            setBulkBtnLoading(false);
        }

        // Handle close retenue response - reload data with current filter
        if (data && callType === 'closeSaisieRetenue') {
            accept('success', 'Succès', 'La retenue a été clôturée avec succès.');
            if (filterPeriodeId) {
                loadRetenuesByPeriode(filterPeriodeId);
            }
        }

        // Handle activate retenue response - reload data with current filter
        if (data && callType === 'activateSaisieRetenue') {
            accept('success', 'Succès', 'La retenue a été activée avec succès.');
            if (filterPeriodeId) {
                loadRetenuesByPeriode(filterPeriodeId);
            }
        }

        // Handle errors for close/activate operations
        if (error && callType === 'closeSaisieRetenue') {
            accept('error', 'Erreur', 'Impossible de clôturer la retenue.');
        }
        if (error && callType === 'activateSaisieRetenue') {
            accept('error', 'Erreur', 'Impossible d\'activer la retenue.');
        }
    }, [data, employeeData, employeeError, searchData, searchError, retenueParametreData, banqueData, allEmployeesData, periodePaieData, error]);

    // Separate useEffect for create/update retenue operations - only triggers when data/error/callType changes together
    useEffect(() => {
        if (callType === 'createSaisieRetenue' || callType === 'updateSaisieRetenue') {
            handleAfterApiCall(activeIndex);
        }
    }, [data, error, callType]);

    // Separate useEffect for periods by year to avoid re-triggering when retenues are loaded
    useEffect(() => {
        if (periodePaieByYearData && periodePaieByYearCallType === 'loadPeriodePaiesByYear') {
            const periods = Array.isArray(periodePaieByYearData) ? periodePaieByYearData : [periodePaieByYearData];
            setPeriodePaiesByYear(periods);
            // Clear previous selection and data when year changes
            setFilterPeriodeId('');
            setSaisieRetenues([]);
            setFilteredSaisieRetenues([]);
            setSearchTerm('');
        }
    }, [periodePaieByYearData, periodePaieByYearCallType]);

    // Separate useEffect for retenues by period
    useEffect(() => {
        if (retenuesByPeriodeData && retenuesByPeriodeCallType === 'loadRetenuesByPeriode') {
            const retenues = Array.isArray(retenuesByPeriodeData) ? retenuesByPeriodeData : [retenuesByPeriodeData];
            setSaisieRetenues(retenues);

            // Apply current filters after loading data
            let filtered = [...retenues];
            if (filterCodeRet) {
                filtered = filtered.filter((item: any) => item.codeRet === filterCodeRet);
            }
            if (searchTerm.trim()) {
                const lowerSearch = searchTerm.toLowerCase().trim();
                filtered = filtered.filter((item: any) =>
                    item.matriculeId.toLowerCase() === lowerSearch ||
                    (item.nom && item.nom.toLowerCase() === lowerSearch) ||
                    (item.prenom && item.prenom.toLowerCase() === lowerSearch)
                );
            }
            setFilteredSaisieRetenues(filtered);

            if (retenues.length === 0) {
                accept('info', 'Information', 'Aucune retenue trouvée pour cette période.');
            }
        }
    }, [retenuesByPeriodeData, retenuesByPeriodeCallType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaisieRetenue((prev) => {
            const updated = Object.assign(new SaisieRetenue(), prev);
            updated[e.target.name as keyof SaisieRetenue] = e.target.value as any;
            return updated;
        });
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaisieRetenueEdit((prev) => {
            const updated = Object.assign(new SaisieRetenue(), prev);
            updated[e.target.name as keyof SaisieRetenue] = e.target.value as any;
            return updated;
        });
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setSaisieRetenue((prev) => {
            const updated = Object.assign(new SaisieRetenue(), prev);
            updated[field as keyof SaisieRetenue] = (value || 0) as any;
            return updated;
        });
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setSaisieRetenueEdit((prev) => {
            const updated = Object.assign(new SaisieRetenue(), prev);
            updated[field as keyof SaisieRetenue] = (value || 0) as any;
            return updated;
        });
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        const fieldName = e.target.name;
        const checked = e.checked || false;

        if (fieldName === 'actif') {
            setSaisieRetenue((prev) => {
                const updated = Object.assign(new SaisieRetenue(), prev);
                updated.setActif(checked);
                return updated;
            });
        } else if (fieldName === 'cloture') {
            setSaisieRetenue((prev) => {
                const updated = Object.assign(new SaisieRetenue(), prev);
                updated.setCloture(checked);
                return updated;
            });
        }
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        const fieldName = e.target.name;
        const checked = e.checked || false;

        if (fieldName === 'actif') {
            setSaisieRetenueEdit((prev) => {
                const updated = Object.assign(new SaisieRetenue(), prev);
                updated.setActif(checked);
                return updated;
            });
        } else if (fieldName === 'cloture') {
            setSaisieRetenueEdit((prev) => {
                const updated = Object.assign(new SaisieRetenue(), prev);
                updated.setCloture(checked);
                return updated;
            });
        }
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
        if (!saisieRetenue.isValid() || !saisieRetenue.periodeId) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', saisieRetenue);
        fetchData(saisieRetenue, 'Post', `${baseUrl}/api/grh/paie/saisie-retenues/new`, 'createSaisieRetenue');
    };

    const handleSubmitEdit = () => {
        if (!saisieRetenueEdit.isValid()) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', saisieRetenueEdit);
        fetchData(saisieRetenueEdit, 'Put', `${baseUrl}/api/grh/paie/saisie-retenues/update/${saisieRetenueEdit.id}`, 'updateSaisieRetenue');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType === 'createSaisieRetenue') {
                // The useConsumApi hook extracts error.message from backend response
                const errorMessage = (error as any)?.message || 'L\'enregistrement n\'a pas été effectué.';
                accept('warn', 'A votre attention', errorMessage);
            } else if (callType === 'updateSaisieRetenue')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des retenues.');
        else if (data !== null && error === null) {
            if (callType === 'createSaisieRetenue') {
                setSaisieRetenue(new SaisieRetenue());
                setSelectedRetenueParametre(null);
                setSelectedBanque(null);
                setSelectedPeriodePaie(null);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateSaisieRetenue') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setSaisieRetenueEdit(new SaisieRetenue());
                setSelectedPeriodePaie(null);
                setEditSaisieRetenueDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterSaisieRetenue = () => {
        const currentYear = new Date().getFullYear();
        setSearchTerm('');
        setFilterPeriodeId('');
        setFilterCodeRet('');
        setFilterYear(currentYear);
        setSaisieRetenues([]);
        setFilteredSaisieRetenues([]);
        loadPeriodePaiesByYear(currentYear);
    };

    const applySearchFilter = (searchValue: string, codeRet?: string) => {
        let filtered = [...saisieRetenues];

        // Apply retenue filter
        const retenueFilter = codeRet !== undefined ? codeRet : filterCodeRet;
        if (retenueFilter) {
            filtered = filtered.filter((item: any) => item.codeRet === retenueFilter);
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

        setFilteredSaisieRetenues(filtered);
    };

    const loadSaisieRetenueToEdit = (data: SaisieRetenue) => {
        if (data) {
            setEditSaisieRetenueDialog(true);
            // Create a proper SaisieRetenue instance from the plain object
            const saisieRetenueInstance = Object.assign(new SaisieRetenue(), data);
            setSaisieRetenueEdit(saisieRetenueInstance);

            // Set selected options for edit mode
            const retenueParametre = retenueParametres.find(rp => rp.codeRet === data.codeRet);
            if (retenueParametre) setSelectedRetenueParametre(retenueParametre);

            const banque = banques.find(b => b.codeBanque === data.codeBanque);
            if (banque) setSelectedBanque(banque);

            // Set selected periode paie for edit mode
            const periodePaie = periodePaies.find(p => p.periodeId === data.periodeId);
            if (periodePaie) setSelectedPeriodePaie(periodePaie);
        }
    };

    const closeSaisieRetenue = (data: any) => {
        if (confirm('Êtes-vous sûr de vouloir clôturer cette retenue? Cette action est irréversible.')) {
            fetchData(null, 'Put', `${baseUrl}/api/grh/paie/saisie-retenues/close/${data.id}`, 'closeSaisieRetenue');
        }
    };

    const activateSaisieRetenue = (data: any) => {
        if (confirm('Êtes-vous sûr de vouloir activer cette retenue?')) {
            fetchData(null, 'Put', `${baseUrl}/api/grh/paie/saisie-retenues/activate/${data.id}`, 'activateSaisieRetenue');
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        const canModify = !(data.cloture || false);
        const isActive = (data.actif || false) && !(data.cloture || false);
        const isClosed = data.cloture || false;
        
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadSaisieRetenueToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    size="small"
                />
                {canModify && !isActive && !isClosed && (
                    <Button 
                        icon="pi pi-check" 
                        onClick={() => activateSaisieRetenue(data)} 
                        raised 
                        severity='success' 
                        tooltip="Activer"
                        size="small"
                    />
                )}
                {canModify && isActive && (
                    <Button 
                        icon="pi pi-ban" 
                        onClick={() => closeSaisieRetenue(data)} 
                        raised 
                        severity='secondary' 
                        tooltip="Clôturer"
                        size="small"
                    />
                )}
            </div>
        );
    };

    const loadAllData = () => {
        // Load retenues only for active employees (situationId = '01')
        fetchData(null, 'Get', `${baseUrl}/api/grh/paie/saisie-retenues/findall/active`, 'loadSaisieRetenues');
    };

    const loadAllRetenueParametres = () => {
        fetchRetenueParametres(null, 'Get', `${baseUrl}/api/grh/paie/retenues/findall`, 'loadRetenueParametres');
    };

    const loadAllBanques = () => {
        fetchBanques(null, 'Get', `${baseUrl}/banques/findall`, 'loadBanques');
    };

    const loadOpenPeriodePaies = () => {
        // Load only periods where dateCloture is null/empty (not closed)
        fetchPeriodePaies(null, 'Get', `${baseUrl}/api/grh/paie/periods/open`, 'loadOpenPeriodePaies');
    };

    const loadAllPeriodePaies = () => {
        // Load all periods for filter in Tous tab
        fetchAllPeriodePaies(null, 'Get', `${baseUrl}/api/grh/paie/periods/findall`, 'loadAllPeriodePaies');
    };

    const loadPeriodePaiesByYear = (year: number) => {
        // Load periods for a specific year
        fetchPeriodePaiesByYear(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${year}`, 'loadPeriodePaiesByYear');
    };

    const loadRetenuesByPeriode = (periodeId: string) => {
        // Load retenues for a specific period
        fetchRetenuesByPeriode(null, 'Get', `${baseUrl}/api/grh/paie/saisie-retenues/findall/periode/${periodeId}`, 'loadRetenuesByPeriode');
    };

    const loadAllEmployeesForBulk = () => {
        // Load only active employees (situationId = '01')
        fetchAllEmployees(null, 'Get', `${baseUrl}/api/grh/employees/findall/active`, 'loadAllEmployees');
    };

    // Bulk functionality helpers
    const resetBulkForm = () => {
        setBulkRetenue({
            periodeId: '',
            codeRet: '',
            taux: 0,
            montant: 0,
            codeBanque: '',
            compte: '',
            reference: ''
        });
        setSelectedEmployees([]);
        setSelectedBulkPeriodePaie(null);
        setSelectedBulkRetenueParametre(null);
        setSelectedBulkBanque(null);
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
            setBulkRetenue(prev => ({ ...prev, periodeId: value || '' }));
            setSelectedBulkPeriodePaie(periodePaie || null);
        } else if (fieldName === 'codeRet') {
            const retenueParametre = retenueParametres.find(rp => rp.codeRet === value);
            setBulkRetenue(prev => ({ ...prev, codeRet: value }));
            setSelectedBulkRetenueParametre(retenueParametre || null);
        } else if (fieldName === 'codeBanque') {
            const banque = banques.find(b => b.codeBanque === value);
            setBulkRetenue(prev => ({ ...prev, codeBanque: value }));
            setSelectedBulkBanque(banque || null);
        }
    };

    const handleBulkNumberChange = (field: string, value: number | null) => {
        setBulkRetenue(prev => ({ ...prev, [field]: value || 0 }));
    };

    const handleBulkTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBulkRetenue(prev => ({ ...prev, [name]: value }));
    };

    const handleBulkSubmit = () => {
        // Validation
        if (selectedEmployees.length === 0) {
            accept('warn', 'Validation', 'Veuillez sélectionner au moins un employé.');
            return;
        }
        if (!bulkRetenue.periodeId) {
            accept('warn', 'Validation', 'Veuillez sélectionner une période.');
            return;
        }
        if (!bulkRetenue.codeRet) {
            accept('warn', 'Validation', 'Veuillez sélectionner une retenue.');
            return;
        }
        if (bulkRetenue.montant <= 0) {
            accept('warn', 'Validation', 'Le montant doit être supérieur à 0.');
            return;
        }

        setBulkBtnLoading(true);

        // Create bulk request payload
        const bulkPayload = {
            matriculeIds: selectedEmployees.map(emp => emp.matriculeId),
            periodeId: bulkRetenue.periodeId,
            codeRet: bulkRetenue.codeRet,
            taux: bulkRetenue.taux,
            montant: bulkRetenue.montant,
            codeBanque: bulkRetenue.codeBanque || null,
            compte: bulkRetenue.compte || null,
            reference: bulkRetenue.reference || null
        };

        console.log('Bulk retenue payload:', bulkPayload);
        fetchData(bulkPayload, 'Post', `${baseUrl}/api/grh/paie/saisie-retenues/bulk`, 'bulkCreateSaisieRetenues');
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
            setSaisieRetenues([]);
            setFilteredSaisieRetenues([]);
            setFilterPeriodeId('');
            setSearchTerm('');
        } else {
            // Nouveau tab - reset form
            setSaisieRetenue(new SaisieRetenue());
            setSelectedRetenueParametre(null);
            setSelectedBanque(null);
            setSelectedPeriodePaie(null);
        }
        setActiveIndex(e.index);
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
        setFilterCodeRet('');
        if (periodeId) {
            loadRetenuesByPeriode(periodeId);
        } else {
            // Clear data if no period is selected
            setSaisieRetenues([]);
            setFilteredSaisieRetenues([]);
        }
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

    const onDropdownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;

        if (fieldName === 'codeRet') {
            const retenueParametre = retenueParametres.find(rp => rp.codeRet === value);
            if (!editSaisieRetenueDialog) {
                setSaisieRetenue((prev) => {
                    const updated = Object.assign(new SaisieRetenue(), prev);
                    updated.codeRet = value;
                    return updated;
                });
                setSelectedRetenueParametre(retenueParametre || null);
            } else {
                setSaisieRetenueEdit((prev) => {
                    const updated = Object.assign(new SaisieRetenue(), prev);
                    updated.codeRet = value;
                    return updated;
                });
                setSelectedRetenueParametre(retenueParametre || null);
            }
        } else if (fieldName === 'codeBanque') {
            const banque = banques.find(b => b.codeBanque === value);
            if (!editSaisieRetenueDialog) {
                setSaisieRetenue((prev) => {
                    const updated = Object.assign(new SaisieRetenue(), prev);
                    updated.codeBanque = value;
                    return updated;
                });
                setSelectedBanque(banque || null);
            } else {
                setSaisieRetenueEdit((prev) => {
                    const updated = Object.assign(new SaisieRetenue(), prev);
                    updated.codeBanque = value;
                    return updated;
                });
                setSelectedBanque(banque || null);
            }
        } else if (fieldName === 'periodeId') {
            const periodePaie = periodePaies.find(p => p.periodeId === value);
            if (!editSaisieRetenueDialog) {
                setSaisieRetenue((prev) => {
                    const updated = Object.assign(new SaisieRetenue(), prev);
                    updated.periodeId = value || '';
                    return updated;
                });
                setSelectedPeriodePaie(periodePaie || null);
            } else {
                setSaisieRetenueEdit((prev) => {
                    const updated = Object.assign(new SaisieRetenue(), prev);
                    updated.periodeId = value || '';
                    return updated;
                });
                setSelectedPeriodePaie(periodePaie || null);
            }
        }
    };

    // Format period label for display
    const getPeriodeLabel = (periodeId: string) => {
        const periode = allPeriodePaies.find(p => p.periodeId === periodeId) ||
                       periodePaiesByYear.find(p => p.periodeId === periodeId);
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

    const handleRetenueFilterChange = (codeRet: string) => {
        setFilterCodeRet(codeRet);
        applySearchFilter(searchTerm, codeRet);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center flex-wrap gap-2">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterSaisieRetenue} />
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
                        value={filterCodeRet}
                        options={retenueParametres}
                        optionLabel="libelleRet"
                        optionValue="codeRet"
                        onChange={(e) => handleRetenueFilterChange(e.value || '')}
                        placeholder="Filtrer par retenue"
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

    const getRetenueParametreLabel = (codeRet: string) => {
        const retenueParametre = retenueParametres.find(rp => rp.codeRet === codeRet);
        return retenueParametre ? retenueParametre.libelleRet : codeRet;
    };

    const getBanqueLabel = (codeBanque: string) => {
        const banque = banques.find(b => b.codeBanque === codeBanque);
        return banque ? banque.libelleBanque : codeBanque;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF'
        }).format(amount);
    };

    const statusBodyTemplate = (rowData: any) => {
        let statusLabel = '';
        let badgeClass = '';
        
        if (rowData.cloture) {
            statusLabel = 'Clôturé';
            badgeClass = 'p-badge-secondary';
        } else if (rowData.actif) {
            statusLabel = 'Actif';
            badgeClass = 'p-badge-success';
        } else {
            statusLabel = 'Inactif';
            badgeClass = 'p-badge-warning';
        }
        
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
                header="Modifier Saisie Retenue"
                visible={editSaisieRetenueDialog}
                style={{ width: '90vw' }}
                modal
                onHide={() => setEditSaisieRetenueDialog(false)}
            >
                <SaisieRetenueForm
                    saisieRetenue={saisieRetenueEdit}
                    retenueParametres={retenueParametres}
                    banques={banques}
                    periodePaies={periodePaies}
                    selectedRetenueParametre={selectedRetenueParametre}
                    selectedBanque={selectedBanque}
                    selectedPeriodePaie={selectedPeriodePaie}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDropDownSelect={onDropdownSelect}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    isEditMode={true}
                />
                <div className="flex justify-content-end mt-3">
                    <Button
                        icon="pi pi-check"
                        label="Modifier"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                        disabled={saisieRetenueEdit.cloture || false}
                    />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <SaisieRetenueForm
                        saisieRetenue={saisieRetenue}
                        retenueParametres={retenueParametres}
                        banques={banques}
                        periodePaies={periodePaies}
                        selectedRetenueParametre={selectedRetenueParametre}
                        selectedBanque={selectedBanque}
                        selectedPeriodePaie={selectedPeriodePaie}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDropDownSelect={onDropdownSelect}
                        handleCheckboxChange={handleCheckboxChange}
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
                                        setSaisieRetenue(new SaisieRetenue());
                                        setSelectedRetenueParametre(null);
                                        setSelectedBanque(null);
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

                        {/* Right side: Retenue configuration */}
                        <div className="col-12 lg:col-6">
                            <div className="card">
                                <h5>Configurer la retenue</h5>
                                <div className="formgrid grid">
                                    {/* Periode Selection */}
                                    <div className="field col-12">
                                        <label htmlFor="bulkPeriodeId">Période *</label>
                                        <Dropdown
                                            name="periodeId"
                                            value={bulkRetenue.periodeId}
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

                                    {/* Retenue Selection */}
                                    <div className="field col-12">
                                        <label htmlFor="bulkCodeRet">Retenue *</label>
                                        <Dropdown
                                            name="codeRet"
                                            value={bulkRetenue.codeRet}
                                            options={retenueParametres}
                                            optionLabel="libelleRet"
                                            optionValue="codeRet"
                                            onChange={handleBulkDropdownSelect}
                                            placeholder="Sélectionner la retenue"
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
                                            value={bulkRetenue.taux}
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
                                            value={bulkRetenue.montant}
                                            onValueChange={(e) => handleBulkNumberChange('montant', e.value ?? null)}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-FR"
                                            min={0}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Banque Selection */}
                                    <div className="field col-12">
                                        <label htmlFor="bulkCodeBanque">Banque</label>
                                        <Dropdown
                                            name="codeBanque"
                                            value={bulkRetenue.codeBanque}
                                            options={banques}
                                            optionLabel="libelleBanque"
                                            optionValue="codeBanque"
                                            onChange={handleBulkDropdownSelect}
                                            placeholder="Sélectionner la banque"
                                            className="w-full"
                                            filter
                                            showClear
                                        />
                                    </div>

                                    {/* Compte */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="bulkCompte">Compte</label>
                                        <InputText
                                            id="bulkCompte"
                                            name="compte"
                                            value={bulkRetenue.compte || ''}
                                            onChange={handleBulkTextChange}
                                            maxLength={200}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Reference */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="bulkReference">Référence</label>
                                        <InputText
                                            id="bulkReference"
                                            name="reference"
                                            value={bulkRetenue.reference || ''}
                                            onChange={handleBulkTextChange}
                                            maxLength={30}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Display selected retenue info */}
                                    {selectedBulkRetenueParametre && (
                                        <div className="field col-12">
                                            <div className="p-message p-message-info">
                                                <div className="p-message-wrapper flex align-items-center gap-2">
                                                    <span className="p-message-icon pi pi-info-circle"></span>
                                                    <div className="p-message-text">
                                                        <strong>{selectedBulkRetenueParametre.libelleRet}</strong>
                                                        {' - '}
                                                        Imposable: {selectedBulkRetenueParametre.imposable ? 'Oui' : 'Non'}
                                                        {' | '}
                                                        Crédit: {selectedBulkRetenueParametre.estCredit ? 'Oui' : 'Non'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary */}
                                    {selectedEmployees.length > 0 && bulkRetenue.montant > 0 && (
                                        <div className="field col-12">
                                            <div className="p-message p-message-success">
                                                <div className="p-message-wrapper flex align-items-center gap-2">
                                                    <span className="p-message-icon pi pi-calculator"></span>
                                                    <div className="p-message-text">
                                                        <strong>Résumé:</strong> {selectedEmployees.length} employé(s) × {formatCurrency(bulkRetenue.montant)} = <strong>{formatCurrency(selectedEmployees.length * bulkRetenue.montant)}</strong>
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
                                        disabled={selectedEmployees.length === 0 || !bulkRetenue.periodeId || !bulkRetenue.codeRet || bulkRetenue.montant <= 0}
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
                                    value={filteredSaisieRetenues}
                                    header={renderSearch}
                                    emptyMessage={"Aucune saisie de retenue à afficher"}
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
                                        field="codeRet"
                                        header="Retenue"
                                        body={(rowData) => getRetenueParametreLabel(rowData.codeRet)}
                                        sortable
                                    />
                                    <Column
                                        field="taux"
                                        header="Taux"
                                        sortable
                                    />
                                    <Column
                                        field="montant"
                                        header="Montant"
                                        body={(rowData) => formatCurrency(rowData.montant)}
                                        sortable
                                    />
                                    <Column
                                        field="codeBanque"
                                        header="Banque"
                                        body={(rowData) => rowData.codeBanque ? getBanqueLabel(rowData.codeBanque) : '-'}
                                        sortable
                                    />
                                    <Column field="reference" header="Référence" />
                                    <Column
                                        header="Statut"
                                        body={statusBodyTemplate}
                                        sortable
                                        sortField="actif"
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

export default SaisieRetenueComponent;