'use client';

import { useEffect, useRef, useState } from "react";
import { SaisiePrime } from "./SaisiePrime";
import useConsumApi from "../../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import SaisiePrimeForm from "./SaisiePrimeForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { PrimeParametre } from "../../../settings/primeParametre/PrimeParametre";
import { PeriodePaie } from "../../periodePaie/PeriodePaie";
import { API_BASE_URL } from '@/utils/apiConfig';

const SaisiePrimeComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    
    const [saisiePrime, setSaisiePrime] = useState<SaisiePrime>(new SaisiePrime());
    const [saisiePrimeEdit, setSaisiePrimeEdit] = useState<SaisiePrime>(new SaisiePrime());
    const [editSaisiePrimeDialog, setEditSaisiePrimeDialog] = useState(false);
    const [saisiePrimes, setSaisiePrimes] = useState<SaisiePrime[]>([]);
    const [filteredSaisiePrimes, setFilteredSaisiePrimes] = useState<SaisiePrime[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterPeriodeId, setFilterPeriodeId] = useState<string>('');
    const [filterCodePrime, setFilterCodePrime] = useState<string>('');
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    const [periodePaiesByYear, setPeriodePaiesByYear] = useState<PeriodePaie[]>([]);

    // API hooks
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployeeData, callType: employeeCallType } = useConsumApi('');
    const { data: primeParametreData, loading: primeParametreLoading, error: primeParametreError, fetchData: fetchPrimeParametres, callType: primeParametreCallType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: periodePaieData, loading: periodePaieLoading, error: periodePaieError, fetchData: fetchPeriodePaies, callType: periodePaieCallType } = useConsumApi('');
    const { data: periodePaieByYearData, fetchData: fetchPeriodePaiesByYear, callType: periodePaieByYearCallType } = useConsumApi('');
    const { data: primesByPeriodeData, fetchData: fetchPrimesByPeriode, callType: primesByPeriodeCallType } = useConsumApi('');

    const toast = useRef<Toast>(null);

    // State for dropdown options
    const [primeParametres, setPrimeParametres] = useState<PrimeParametre[]>([]);
    const [periodePaies, setPeriodePaies] = useState<PeriodePaie[]>([]);

    // Selected options
    const [selectedPrimeParametre, setSelectedPrimeParametre] = useState<PrimeParametre | null>(null);
    const [selectedPeriodePaie, setSelectedPeriodePaie] = useState<PeriodePaie | null>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllPrimeParametres();
        loadOpenPeriodePaies();
    }, []);

    // Handle main API calls (create/update)
    useEffect(() => {
        if (data) {
            if (callType === 'loadSaisiePrimes') {
                setSaisiePrimes(Array.isArray(data) ? data : [data]);
                setFilteredSaisiePrimes(Array.isArray(data) ? data : [data]);
            }
        }
        handleAfterApiCall();
    }, [data, error, callType]);

    // Handle employee search separately
    useEffect(() => {
        if (employeeData && employeeCallType === 'searchByMatricule') {
            // Populate form with found employee data
            if (employeeData) {
                const foundEmployee = employeeData as any;
                setSaisiePrime((prev) => {
                    const updated = Object.assign(new SaisiePrime(), prev);
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
    }, [employeeData, employeeError, employeeCallType]);

    // Handle search results
    useEffect(() => {
        if (searchData && searchCallType === 'searchSaisiePrimes') {
            const searchResults = Array.isArray(searchData) ? searchData : [searchData];
            setFilteredSaisiePrimes(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucune prime trouvée.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} prime(s) trouvée(s).`);
            }
        }

        if (searchError && searchCallType === 'searchSaisiePrimes') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des primes.');
            setFilteredSaisiePrimes([]);
        }
    }, [searchData, searchError, searchCallType]);

    // Handle dropdown data loading
    useEffect(() => {
        if (primeParametreData && primeParametreCallType === 'loadPrimeParametres') {
            setPrimeParametres(Array.isArray(primeParametreData) ? primeParametreData : [primeParametreData]);
        }
    }, [primeParametreData, primeParametreCallType]);

    useEffect(() => {
        if (periodePaieData && periodePaieCallType === 'loadOpenPeriodePaies') {
            setPeriodePaies(Array.isArray(periodePaieData) ? periodePaieData : [periodePaieData]);
        }
    }, [periodePaieData, periodePaieCallType]);

    // Separate useEffect for periods by year to avoid re-triggering when primes are loaded
    useEffect(() => {
        if (periodePaieByYearData && periodePaieByYearCallType === 'loadPeriodePaiesByYear') {
            const periods = Array.isArray(periodePaieByYearData) ? periodePaieByYearData : [periodePaieByYearData];
            setPeriodePaiesByYear(periods);
            // Clear previous selection and data when year changes
            setFilterPeriodeId('');
            setSaisiePrimes([]);
            setFilteredSaisiePrimes([]);
            setSearchTerm('');
            setFilterCodePrime('');
        }
    }, [periodePaieByYearData, periodePaieByYearCallType]);

    // Separate useEffect for primes by period
    useEffect(() => {
        if (primesByPeriodeData && primesByPeriodeCallType === 'loadPrimesByPeriode') {
            const primes = Array.isArray(primesByPeriodeData) ? primesByPeriodeData : [primesByPeriodeData];
            setSaisiePrimes(primes);

            // Apply existing filters to the newly loaded data
            let filtered = [...primes];
            if (filterCodePrime) {
                filtered = filtered.filter((item: any) => item.codePrime === filterCodePrime);
            }
            if (searchTerm.trim()) {
                const lowerSearch = searchTerm.toLowerCase().trim();
                filtered = filtered.filter((item: any) =>
                    item.matriculeId.toLowerCase() === lowerSearch ||
                    (item.nom && item.nom.toLowerCase() === lowerSearch) ||
                    (item.prenom && item.prenom.toLowerCase() === lowerSearch)
                );
            }
            setFilteredSaisiePrimes(filtered);

            if (primes.length === 0) {
                accept('info', 'Information', 'Aucune prime trouvée pour cette période.');
            }
        }
    }, [primesByPeriodeData, primesByPeriodeCallType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaisiePrime((prev) => {
            const updated = Object.assign(new SaisiePrime(), prev);
            updated[e.target.name as keyof SaisiePrime] = e.target.value as any;
            return updated;
        });
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaisiePrimeEdit((prev) => {
            const updated = Object.assign(new SaisiePrime(), prev);
            updated[e.target.name as keyof SaisiePrime] = e.target.value as any;
            return updated;
        });
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setSaisiePrime((prev) => {
            const updated = Object.assign(new SaisiePrime(), prev);
            updated[field as keyof SaisiePrime] = (value || 0) as any;
            return updated;
        });
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setSaisiePrimeEdit((prev) => {
            const updated = Object.assign(new SaisiePrime(), prev);
            updated[field as keyof SaisiePrime] = (value || 0) as any;
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
        if (!saisiePrime.isValid() || !saisiePrime.periodeId) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', saisiePrime);
        fetchData(saisiePrime, 'Post', `${baseUrl}/api/grh/paie/saisie-primes/new`, 'createSaisiePrime');
    };

    const handleSubmitEdit = () => {
        if (!saisiePrimeEdit.isValid()) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', saisiePrimeEdit);
        fetchData(saisiePrimeEdit, 'Put', `${baseUrl}/api/grh/paie/saisie-primes/update/${saisiePrimeEdit.id}`, 'updateSaisiePrime');
    };

    const handleAfterApiCall = () => {
        if (error !== null) {
            if (callType === 'createSaisiePrime') {
                const errorMessage = (error as any)?.message || 'L\'enregistrement n\'a pas été effectué.';
                accept('warn', 'A votre attention', errorMessage);
            } else if (callType === 'updateSaisiePrime') {
                const errorMessage = (error as any)?.message || 'La mise à jour n\'a pas été effectuée.';
                accept('warn', 'A votre attention', errorMessage);
            } else if (callType === 'loadSaisiePrimes') {
                accept('warn', 'A votre attention', 'Impossible de charger la liste des primes.');
            }
        }
        else if (data !== null && error === null) {
            if (callType === 'createSaisiePrime') {
                setSaisiePrime(new SaisiePrime());
                setSelectedPrimeParametre(null);
                setSelectedPeriodePaie(null);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateSaisiePrime') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setSaisiePrimeEdit(new SaisiePrime());
                setSelectedPeriodePaie(null);
                setEditSaisiePrimeDialog(false);
                // Reload primes for current period if in Tous tab
                if (filterPeriodeId) {
                    loadPrimesByPeriode(filterPeriodeId);
                }
            } else if (callType === 'closeSaisiePrime') {
                accept('info', 'OK', 'La prime a été clôturée avec succès.');
                // Reload primes for current period and reapply filters
                if (filterPeriodeId) {
                    loadPrimesByPeriode(filterPeriodeId);
                }
            }
        }
        setBtnLoading(false);
    };

    const clearFilterSaisiePrime = () => {
        const currentYear = new Date().getFullYear();
        setSearchTerm('');
        setFilterPeriodeId('');
        setFilterCodePrime('');
        setFilterYear(currentYear);
        setSaisiePrimes([]);
        setFilteredSaisiePrimes([]);
        loadPeriodePaiesByYear(currentYear);
    };

    const applySearchFilter = (searchValue: string, codePrime?: string) => {
        let filtered = [...saisiePrimes];

        // Apply prime filter
        const primeFilter = codePrime !== undefined ? codePrime : filterCodePrime;
        if (primeFilter) {
            filtered = filtered.filter((item: any) => item.codePrime === primeFilter);
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

        setFilteredSaisiePrimes(filtered);
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
        setFilterCodePrime('');
        if (periodeId) {
            loadPrimesByPeriode(periodeId);
        } else {
            // Clear data if no period is selected
            setSaisiePrimes([]);
            setFilteredSaisiePrimes([]);
        }
    };

    const handlePrimeFilterChange = (codePrime: string) => {
        setFilterCodePrime(codePrime);
        applySearchFilter(searchTerm, codePrime);
    };

    const loadSaisiePrimeToEdit = (data: SaisiePrime) => {
        if (data) {
            setEditSaisiePrimeDialog(true);
            // Create a proper SaisiePrime instance from the plain object
            const saisiePrimeInstance = Object.assign(new SaisiePrime(), data);
            setSaisiePrimeEdit(saisiePrimeInstance);

            // Set selected prime parametre for edit mode
            const primeParametre = primeParametres.find(pp => pp.codePrime === data.codePrime);
            if (primeParametre) setSelectedPrimeParametre(primeParametre);

            // Set selected periode paie for edit mode
            const periodePaie = periodePaies.find(p => p.periodeId === data.periodeId);
            if (periodePaie) setSelectedPeriodePaie(periodePaie);
        }
    };

    const closeSaisiePrime = (data: SaisiePrime) => {
        if (confirm('Êtes-vous sûr de vouloir clôturer cette prime?')) {
            fetchData(null, 'Put', `${baseUrl}/api/grh/paie/saisie-primes/close/${data.id}`, 'closeSaisiePrime');
        }
    };

    const optionButtons = (data: SaisiePrime): React.ReactNode => {
        const isActive = !data.dateFin;
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadSaisiePrimeToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    size="small"
                />
                {isActive && (
                    <Button 
                        icon="pi pi-ban" 
                        onClick={() => closeSaisiePrime(data)} 
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
        // Load only primes for active employees (situationId = '01')
        fetchData(null, 'Get', `${baseUrl}/api/grh/paie/saisie-primes/findall/active`, 'loadSaisiePrimes');
    };

    const loadAllPrimeParametres = () => {
        fetchPrimeParametres(null, 'Get', `${baseUrl}/api/grh/paie/primes/findall`, 'loadPrimeParametres');
    };

    const loadOpenPeriodePaies = () => {
        // Load only periods where dateCloture is null/empty (not closed)
        fetchPeriodePaies(null, 'Get', `${baseUrl}/api/grh/paie/periods/open`, 'loadOpenPeriodePaies');
    };

    const loadPeriodePaiesByYear = (year: number) => {
        // Load periods for a specific year
        fetchPeriodePaiesByYear(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${year}`, 'loadPeriodePaiesByYear');
    };

    const loadPrimesByPeriode = (periodeId: string) => {
        // Load primes for a specific period (for active employees only)
        fetchPrimesByPeriode(null, 'Get', `${baseUrl}/api/grh/paie/saisie-primes/findall/periode/${periodeId}`, 'loadPrimesByPeriode');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            // Tous tab - load periods by current year (default)
            const currentYear = new Date().getFullYear();
            setFilterYear(currentYear);
            loadPeriodePaiesByYear(currentYear);
            // Clear previous data
            setSaisiePrimes([]);
            setFilteredSaisiePrimes([]);
            setFilterPeriodeId('');
            setSearchTerm('');
            setFilterCodePrime('');
        } else {
            // Nouveau tab - reset form
            setSaisiePrime(new SaisiePrime());
            setSelectedPrimeParametre(null);
            setSelectedPeriodePaie(null);
        }
        setActiveIndex(e.index);
    };

    const onDropdownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;

        if (fieldName === 'codePrime') {
            const primeParametre = primeParametres.find(pp => pp.codePrime === value);
            if (!editSaisiePrimeDialog) {
                setSaisiePrime((prev) => {
                    const updated = Object.assign(new SaisiePrime(), prev);
                    updated.codePrime = value;
                    updated.taux = primeParametre ? primeParametre.taux : 0;
                    return updated;
                });
                setSelectedPrimeParametre(primeParametre || null);
            } else {
                setSaisiePrimeEdit((prev) => {
                    const updated = Object.assign(new SaisiePrime(), prev);
                    updated.codePrime = value;
                    updated.taux = primeParametre ? primeParametre.taux : 0;
                    return updated;
                });
                setSelectedPrimeParametre(primeParametre || null);
            }
        } else if (fieldName === 'periodeId') {
            const periodePaie = periodePaies.find(p => p.periodeId === value);
            if (!editSaisiePrimeDialog) {
                setSaisiePrime((prev) => {
                    const updated = Object.assign(new SaisiePrime(), prev);
                    updated.periodeId = value || '';
                    return updated;
                });
                setSelectedPeriodePaie(periodePaie || null);
            } else {
                setSaisiePrimeEdit((prev) => {
                    const updated = Object.assign(new SaisiePrime(), prev);
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterSaisiePrime} />
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
                        value={filterCodePrime}
                        options={primeParametres}
                        optionLabel="libellePrime"
                        optionValue="codePrime"
                        onChange={(e) => handlePrimeFilterChange(e.value || '')}
                        placeholder="Filtrer par prime"
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

    const getPrimeParametreLabel = (codePrime: string) => {
        const primeParametre = primeParametres.find(pp => pp.codePrime === codePrime);
        return primeParametre ? primeParametre.libellePrime : codePrime;
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
                header="Modifier Saisie Prime"
                visible={editSaisiePrimeDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditSaisiePrimeDialog(false)}
            >
                <SaisiePrimeForm
                    saisiePrime={saisiePrimeEdit}
                    primeParametres={primeParametres}
                    periodePaies={periodePaies}
                    selectedPrimeParametre={selectedPrimeParametre}
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
                    <SaisiePrimeForm
                        saisiePrime={saisiePrime}
                        primeParametres={primeParametres}
                        periodePaies={periodePaies}
                        selectedPrimeParametre={selectedPrimeParametre}
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
                                        setSaisiePrime(new SaisiePrime());
                                        setSelectedPrimeParametre(null);
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
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredSaisiePrimes}
                                    header={renderSearch}
                                    emptyMessage={"Aucune saisie de prime à afficher"}
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
                                        field="codePrime"
                                        header="Prime"
                                        body={(rowData) => getPrimeParametreLabel(rowData.codePrime)}
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

export default SaisiePrimeComponent;