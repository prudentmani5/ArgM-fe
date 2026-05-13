'use client';

import { useEffect, useRef, useState } from "react";
import { RappelPaie } from "./RappelPaie";
import useConsumApi from "../../../../../../hooks/fetchData/useConsumApi";
import useConsumApiWithPromise from "../../../../../../hooks/fetchData/useConsumApiWIthPromise";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import RappelPaieForm from "./RappelPaieForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { PeriodePaie } from "../../periodePaie/PeriodePaie";
import { API_BASE_URL } from '@/utils/apiConfig';

// Simple employee interface for bulk selection
interface EmployeeBasic {
    matriculeId: string;
    nom: string;
    prenom: string;
}

const RappelPaieComponent = () => {
    const baseUrl = `${API_BASE_URL}`;

    const [rappelPaie, setRappelPaie] = useState<RappelPaie>(new RappelPaie());
    const [rappelPaieEdit, setRappelPaieEdit] = useState<RappelPaie>(new RappelPaie());
    const [editRappelPaieDialog, setEditRappelPaieDialog] = useState(false);
    const [rappelPaies, setRappelPaies] = useState<RappelPaie[]>([]);
    const [filteredRappelPaies, setFilteredRappelPaies] = useState<RappelPaie[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterPeriodeId, setFilterPeriodeId] = useState<string>('');
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    const [periodePaiesByYear, setPeriodePaiesByYear] = useState<PeriodePaie[]>([]);

    // API hooks
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployeeData, callType: employeeCallType } = useConsumApi('');
    const { data: periodePaieData, loading: periodePaieLoading, error: periodePaieError, fetchData: fetchPeriodePaies, callType: periodePaieCallType } = useConsumApi('');
    const { data: periodePaieByYearData, fetchData: fetchPeriodePaiesByYear, callType: periodePaieByYearCallType } = useConsumApi('');
    const { data: rappelsByPeriodeData, fetchData: fetchRappelsByPeriode, callType: rappelsByPeriodeCallType } = useConsumApi('');
    const { data: deleteData, error: deleteError, fetchData: fetchDelete, callType: deleteCallType } = useConsumApi('');
    const { fetchDataPromise } = useConsumApiWithPromise('');

    const toast = useRef<Toast>(null);

    // State for dropdown options
    const [periodePaies, setPeriodePaies] = useState<PeriodePaie[]>([]);

    // Selected options
    const [selectedPeriodePaie, setSelectedPeriodePaie] = useState<PeriodePaie | null>(null);

    // Bulk creation states
    const [allEmployees, setAllEmployees] = useState<EmployeeBasic[]>([]);
    const [filteredEmployeesForBulk, setFilteredEmployeesForBulk] = useState<EmployeeBasic[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeBasic[]>([]);
    const [bulkSearchTerm, setBulkSearchTerm] = useState<string>('');
    const [bulkRappel, setBulkRappel] = useState({
        periodeId: '',
        rappPositifImp: 0,
        rappPositifNonImp: 0,
        rappNegatifImp: 0,
        rappNegatifNonImp: 0
    });
    const [selectedBulkPeriodePaie, setSelectedBulkPeriodePaie] = useState<PeriodePaie | null>(null);
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
        loadOpenPeriodePaies();
    }, []);

    useEffect(() => {
        if (employeeData && employeeCallType === 'searchByMatricule') {
            if (employeeData) {
                const foundEmployee = employeeData as any;
                setRappelPaie((prev) => {
                    const updated = Object.assign(new RappelPaie(), prev);
                    updated.prenom = foundEmployee.prenom;
                    updated.nom = foundEmployee.nom;
                    return updated;
                });
            }
            setSearchLoading(false);
        }

        if (employeeError && employeeCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setSearchLoading(false);
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
        if (data && callType === 'bulkCreateRappelPaie') {
            accept('success', 'Succès', `${selectedEmployees.length} rappel(s) créé(s) avec succès.`);
            resetBulkForm();
            setBulkBtnLoading(false);
        }

        if (error && callType === 'bulkCreateRappelPaie') {
            const errorMessage = (error as any)?.message || 'L\'enregistrement en masse n\'a pas été effectué.';
            accept('error', 'Erreur', errorMessage);
            setBulkBtnLoading(false);
        }

    }, [data, employeeData, employeeError, periodePaieData, allEmployeesData, error]);

    // Handle delete rappel response
    useEffect(() => {
        if (deleteData && deleteCallType === 'deleteRappelPaie') {
            accept('success', 'Succès', 'Le rappel a été supprimé avec succès.');
            if (filterPeriodeId) {
                loadRappelsByPeriode(filterPeriodeId);
            }
        }

        if (deleteError && deleteCallType === 'deleteRappelPaie') {
            const errorMessage = (deleteError as any)?.message || 'Impossible de supprimer le rappel.';
            accept('error', 'Erreur', errorMessage);
        }
    }, [deleteData, deleteError, deleteCallType]);

    // Separate useEffect for create/update operations
    useEffect(() => {
        if (callType === 'createRappelPaie' || callType === 'updateRappelPaie') {
            handleAfterApiCall(activeIndex);
        }
    }, [data, error, callType]);

    // Separate useEffect for periods by year
    useEffect(() => {
        if (periodePaieByYearData && periodePaieByYearCallType === 'loadPeriodePaiesByYear') {
            const periods = Array.isArray(periodePaieByYearData) ? periodePaieByYearData : [periodePaieByYearData];
            setPeriodePaiesByYear(periods);
            setFilterPeriodeId('');
            setRappelPaies([]);
            setFilteredRappelPaies([]);
            setSearchTerm('');
        }
    }, [periodePaieByYearData, periodePaieByYearCallType]);

    // Separate useEffect for rappels by period
    useEffect(() => {
        if (rappelsByPeriodeData && rappelsByPeriodeCallType === 'loadRappelsByPeriode') {
            const rappels = Array.isArray(rappelsByPeriodeData) ? rappelsByPeriodeData : [rappelsByPeriodeData];
            setRappelPaies(rappels);

            let filtered = [...rappels];
            if (searchTerm.trim()) {
                const lowerSearch = searchTerm.toLowerCase().trim();
                filtered = filtered.filter((item: any) =>
                    item.matriculeId.toLowerCase() === lowerSearch ||
                    (item.nom && item.nom.toLowerCase() === lowerSearch) ||
                    (item.prenom && item.prenom.toLowerCase() === lowerSearch)
                );
            }
            setFilteredRappelPaies(filtered);

            if (rappels.length === 0) {
                accept('info', 'Information', 'Aucun rappel trouvé pour cette période.');
            }
        }
    }, [rappelsByPeriodeData, rappelsByPeriodeCallType]);

    const handleMatriculeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRappelPaie((prev) => {
            const updated = Object.assign(new RappelPaie(), prev);
            updated.matriculeId = e.target.value;
            return updated;
        });
    };

    const handleMatriculeChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRappelPaieEdit((prev) => {
            const updated = Object.assign(new RappelPaie(), prev);
            updated.matriculeId = e.target.value;
            return updated;
        });
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setRappelPaie((prev) => {
            const updated = Object.assign(new RappelPaie(), prev);
            (updated as any)[field] = value || 0;
            return updated;
        });
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setRappelPaieEdit((prev) => {
            const updated = Object.assign(new RappelPaie(), prev);
            (updated as any)[field] = value || 0;
            return updated;
        });
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        setSearchLoading(true);
        fetchEmployeeData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        applySearchFilter(value);
    };

    const handleSubmit = async () => {
        if (!rappelPaie.isValid()) {
            accept('warn', 'Validation', 'Veuillez remplir le matricule et la période.');
            return;
        }

        setBtnLoading(true);
        try {
            const existing = await fetchDataPromise({
                url: `${baseUrl}/api/grh/paie/rappel-paie/employee/${rappelPaie.matriculeId}/period/${rappelPaie.periodeId}`,
                method: 'GET'
            });
            if (Array.isArray(existing) && existing.length > 0) {
                accept('warn', 'Doublon', 'Un rappel existe déjà pour cet employé dans cette période.');
                setBtnLoading(false);
                return;
            }
        } catch (err) {
            accept('error', 'Erreur', 'Impossible de vérifier les doublons.');
            setBtnLoading(false);
            return;
        }

        fetchData(rappelPaie, 'Post', `${baseUrl}/api/grh/paie/rappel-paie/new`, 'createRappelPaie');
    };

    const handleSubmitEdit = () => {
        if (!rappelPaieEdit.isValid()) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        fetchData(rappelPaieEdit, 'Put', `${baseUrl}/api/grh/paie/rappel-paie/update/${rappelPaieEdit.id}`, 'updateRappelPaie');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null) {
            if (callType === 'createRappelPaie') {
                const errorMessage = (error as any)?.message || 'L\'enregistrement n\'a pas été effectué.';
                accept('warn', 'A votre attention', errorMessage);
            } else if (callType === 'updateRappelPaie') {
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (data !== null && error === null) {
            if (callType === 'createRappelPaie') {
                setRappelPaie(new RappelPaie());
                setSelectedPeriodePaie(null);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateRappelPaie') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setRappelPaieEdit(new RappelPaie());
                setSelectedPeriodePaie(null);
                setEditRappelPaieDialog(false);
                if (filterPeriodeId) {
                    loadRappelsByPeriode(filterPeriodeId);
                }
            }
        }
        setBtnLoading(false);
    };

    const clearFilterRappelPaie = () => {
        const currentYear = new Date().getFullYear();
        setSearchTerm('');
        setFilterPeriodeId('');
        setFilterYear(currentYear);
        setRappelPaies([]);
        setFilteredRappelPaies([]);
        loadPeriodePaiesByYear(currentYear);
    };

    const applySearchFilter = (searchValue: string) => {
        let filtered = [...rappelPaies];

        if (searchValue.trim()) {
            const lowerSearch = searchValue.toLowerCase().trim();
            filtered = filtered.filter((item: any) =>
                item.matriculeId.toLowerCase() === lowerSearch ||
                (item.nom && item.nom.toLowerCase() === lowerSearch) ||
                (item.prenom && item.prenom.toLowerCase() === lowerSearch)
            );
        }

        setFilteredRappelPaies(filtered);
    };

    const loadRappelPaieToEdit = (data: RappelPaie) => {
        if (data) {
            setEditRappelPaieDialog(true);
            const rappelPaieInstance = Object.assign(new RappelPaie(), data);
            setRappelPaieEdit(rappelPaieInstance);

            const periodePaie = periodePaies.find(p => p.periodeId === data.periodeId);
            if (periodePaie) setSelectedPeriodePaie(periodePaie);
        }
    };

    const deleteRappelPaie = (data: any) => {
        const periode = periodePaiesByYear.find(p => p.periodeId === data.periodeId);

        if (periode && periode.dateCloture) {
            accept('error', 'Suppression impossible', 'La période de paie est clôturée. Impossible de supprimer ce rappel.');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir supprimer ce rappel? Cette action est irréversible.')) {
            fetchDelete(null, 'Delete', `${baseUrl}/api/grh/paie/rappel-paie/delete/${data.id}`, 'deleteRappelPaie');
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        const periode = periodePaiesByYear.find(p => p.periodeId === data.periodeId);
        const isPeriodOpen = !periode?.dateCloture;

        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadRappelPaieToEdit(data)}
                    raised
                    severity='warning'
                    tooltip="Modifier"
                    size="small"
                />
                {isPeriodOpen && (
                    <Button
                        icon="pi pi-trash"
                        onClick={() => deleteRappelPaie(data)}
                        raised
                        severity='danger'
                        tooltip="Supprimer"
                        size="small"
                    />
                )}
            </div>
        );
    };

    const loadOpenPeriodePaies = () => {
        fetchPeriodePaies(null, 'Get', `${baseUrl}/api/grh/paie/periods/open`, 'loadOpenPeriodePaies');
    };

    const loadPeriodePaiesByYear = (year: number) => {
        fetchPeriodePaiesByYear(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${year}`, 'loadPeriodePaiesByYear');
    };

    const loadRappelsByPeriode = (periodeId: string) => {
        fetchRappelsByPeriode(null, 'Get', `${baseUrl}/api/grh/paie/rappel-paie/findall/periode/${periodeId}`, 'loadRappelsByPeriode');
    };

    const loadAllEmployeesForBulk = () => {
        fetchAllEmployees(null, 'Get', `${baseUrl}/api/grh/employees/findall/active`, 'loadAllEmployees');
    };

    // Bulk functionality helpers
    const resetBulkForm = () => {
        setBulkRappel({
            periodeId: '',
            rappPositifImp: 0,
            rappPositifNonImp: 0,
            rappNegatifImp: 0,
            rappNegatifNonImp: 0
        });
        setSelectedEmployees([]);
        setSelectedBulkPeriodePaie(null);
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
            setBulkRappel(prev => ({ ...prev, periodeId: value || '' }));
            setSelectedBulkPeriodePaie(periodePaie || null);
        }
    };

    const handleBulkNumberChange = (field: string, value: number | null) => {
        setBulkRappel(prev => ({ ...prev, [field]: value || 0 }));
    };

    const handleBulkSubmit = () => {
        if (selectedEmployees.length === 0) {
            accept('warn', 'Validation', 'Veuillez sélectionner au moins un employé.');
            return;
        }
        if (!bulkRappel.periodeId) {
            accept('warn', 'Validation', 'Veuillez sélectionner une période.');
            return;
        }

        setBulkBtnLoading(true);

        // Create array of RappelPaie objects
        const bulkPayload = selectedEmployees.map(emp => ({
            matriculeId: emp.matriculeId,
            periodeId: bulkRappel.periodeId,
            rappPositifImp: bulkRappel.rappPositifImp,
            rappPositifNonImp: bulkRappel.rappPositifNonImp,
            rappNegatifImp: bulkRappel.rappNegatifImp,
            rappNegatifNonImp: bulkRappel.rappNegatifNonImp
        }));

        fetchData(bulkPayload, 'Post', `${baseUrl}/api/grh/paie/rappel-paie/new/bulk`, 'bulkCreateRappelPaie');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllEmployeesForBulk();
        } else if (e.index === 2) {
            const currentYear = new Date().getFullYear();
            setFilterYear(currentYear);
            loadPeriodePaiesByYear(currentYear);
            setRappelPaies([]);
            setFilteredRappelPaies([]);
            setFilterPeriodeId('');
            setSearchTerm('');
        } else {
            setRappelPaie(new RappelPaie());
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

    const handlePeriodeSelectForConsultation = (periodeId: string) => {
        setFilterPeriodeId(periodeId);
        setSearchTerm('');
        if (periodeId) {
            loadRappelsByPeriode(periodeId);
        } else {
            setRappelPaies([]);
            setFilteredRappelPaies([]);
        }
    };

    const onDropdownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;

        if (fieldName === 'periodeId') {
            const periodePaie = periodePaies.find(p => p.periodeId === value);
            if (!editRappelPaieDialog) {
                setRappelPaie((prev) => {
                    const updated = Object.assign(new RappelPaie(), prev);
                    updated.periodeId = value || '';
                    return updated;
                });
                setSelectedPeriodePaie(periodePaie || null);
            } else {
                setRappelPaieEdit((prev) => {
                    const updated = Object.assign(new RappelPaie(), prev);
                    updated.periodeId = value || '';
                    return updated;
                });
                setSelectedPeriodePaie(periodePaie || null);
            }
        }
    };

    const getPeriodeLabelForYear = (periode: PeriodePaie) => {
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return monthNames[periode.mois - 1];
    };

    const getPeriodeLabel = (periode: PeriodePaie) => {
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return `${monthNames[periode.mois - 1]} ${periode.annee}`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF'
        }).format(amount);
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

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center flex-wrap gap-2">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterRappelPaie} />
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
                        onChange={(e) => handlePeriodeSelectForConsultation(e.value || '')}
                        placeholder="Sélectionner une période"
                        showClear
                        filter
                        className="w-12rem"
                        emptyMessage="Aucune période pour cette année"
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

    // Calculate totals from filtered data
    const calculateTotalPositif = () => {
        return filteredRappelPaies.reduce((sum, item: any) => sum + (item.rappPositifImp || 0) + (item.rappPositifNonImp || 0), 0);
    };

    const calculateTotalNegatif = () => {
        return filteredRappelPaies.reduce((sum, item: any) => sum + (item.rappNegatifImp || 0) + (item.rappNegatifNonImp || 0), 0);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Rappel Paie"
                visible={editRappelPaieDialog}
                style={{ width: '90vw' }}
                modal
                onHide={() => setEditRappelPaieDialog(false)}
            >
                <RappelPaieForm
                    rappelPaie={rappelPaieEdit}
                    periodePaies={periodePaies}
                    selectedPeriodePaie={selectedPeriodePaie}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDropDownSelect={onDropdownSelect}
                    handleMatriculeChange={handleMatriculeChangeEdit}
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
                    <RappelPaieForm
                        rappelPaie={rappelPaie}
                        periodePaies={periodePaies}
                        selectedPeriodePaie={selectedPeriodePaie}
                        handleNumberChange={handleNumberChange}
                        handleDropDownSelect={onDropdownSelect}
                        handleMatriculeBlur={handleMatriculeBlur}
                        handleMatriculeChange={handleMatriculeChange}
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
                                        setRappelPaie(new RappelPaie());
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

                        {/* Right side: Rappel configuration */}
                        <div className="col-12 lg:col-6">
                            <div className="card">
                                <h5>Configurer le rappel</h5>
                                <div className="formgrid grid">
                                    {/* Periode Selection */}
                                    <div className="field col-12">
                                        <label htmlFor="bulkPeriodeId">Période *</label>
                                        <Dropdown
                                            name="periodeId"
                                            value={bulkRappel.periodeId}
                                            options={periodePaies.map(p => ({
                                                label: getPeriodeLabel(p),
                                                value: p.periodeId
                                            }))}
                                            onChange={handleBulkDropdownSelect}
                                            placeholder="Sélectionner la période"
                                            className="w-full"
                                            filter
                                            showClear
                                        />
                                    </div>

                                    {/* Rappel Positif Imposable */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="bulkRappPositifImp">Rappel Positif Imp.</label>
                                        <InputNumber
                                            id="bulkRappPositifImp"
                                            value={bulkRappel.rappPositifImp}
                                            onValueChange={(e) => handleBulkNumberChange('rappPositifImp', e.value ?? null)}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-FR"
                                            min={0}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Rappel Positif Non Imposable */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="bulkRappPositifNonImp">Rappel Positif Non Imp.</label>
                                        <InputNumber
                                            id="bulkRappPositifNonImp"
                                            value={bulkRappel.rappPositifNonImp}
                                            onValueChange={(e) => handleBulkNumberChange('rappPositifNonImp', e.value ?? null)}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-FR"
                                            min={0}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Rappel Négatif Imposable */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="bulkRappNegatifImp">Rappel Négatif Imp.</label>
                                        <InputNumber
                                            id="bulkRappNegatifImp"
                                            value={bulkRappel.rappNegatifImp}
                                            onValueChange={(e) => handleBulkNumberChange('rappNegatifImp', e.value ?? null)}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-FR"
                                            min={0}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Rappel Négatif Non Imposable */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="bulkRappNegatifNonImp">Rappel Négatif Non Imp.</label>
                                        <InputNumber
                                            id="bulkRappNegatifNonImp"
                                            value={bulkRappel.rappNegatifNonImp}
                                            onValueChange={(e) => handleBulkNumberChange('rappNegatifNonImp', e.value ?? null)}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-FR"
                                            min={0}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Summary */}
                                    {selectedEmployees.length > 0 && (
                                        <div className="field col-12">
                                            <div className="p-message p-message-success">
                                                <div className="p-message-wrapper flex align-items-center gap-2">
                                                    <span className="p-message-icon pi pi-calculator"></span>
                                                    <div className="p-message-text">
                                                        <strong>Résumé:</strong> {selectedEmployees.length} employé(s) sélectionné(s)
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
                                        disabled={selectedEmployees.length === 0 || !bulkRappel.periodeId}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Consultation">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredRappelPaies}
                                    header={renderSearch}
                                    emptyMessage={"Aucun rappel de paie à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column field="nom" header="Nom" sortable />
                                    <Column field="prenom" header="Prénom" sortable />
                                    <Column
                                        field="rappPositifImp"
                                        header="Rapp+ Imp."
                                        body={(rowData) => formatCurrency(rowData.rappPositifImp || 0)}
                                        sortable
                                    />
                                    <Column
                                        field="rappPositifNonImp"
                                        header="Rapp+ Non Imp."
                                        body={(rowData) => formatCurrency(rowData.rappPositifNonImp || 0)}
                                        sortable
                                    />
                                    <Column
                                        field="rappNegatifImp"
                                        header="Rapp- Imp."
                                        body={(rowData) => formatCurrency(rowData.rappNegatifImp || 0)}
                                        sortable
                                    />
                                    <Column
                                        field="rappNegatifNonImp"
                                        header="Rapp- Non Imp."
                                        body={(rowData) => formatCurrency(rowData.rappNegatifNonImp || 0)}
                                        sortable
                                    />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                        {filteredRappelPaies.length > 0 && (
                            <div className='col-12'>
                                <div className='grid'>
                                    <div className='col-6'>
                                        <div className='card bg-green-500'>
                                            <div className='flex justify-content-between align-items-center'>
                                                <h3 className='m-0 text-white'>Total Rappel Positif</h3>
                                                <h2 className='m-0 text-white'>{formatCurrency(calculateTotalPositif())}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-6'>
                                        <div className='card bg-red-500'>
                                            <div className='flex justify-content-between align-items-center'>
                                                <h3 className='m-0 text-white'>Total Rappel Négatif</h3>
                                                <h2 className='m-0 text-white'>{formatCurrency(calculateTotalNegatif())}</h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
};

export default RappelPaieComponent;
