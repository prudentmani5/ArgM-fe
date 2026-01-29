'use client';

import { useEffect, useRef, useState } from "react";
import { Conge } from "./Conge";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import CongeForm from "./CongeForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { TypeConge } from "../../settings/typeConge/TypeConge";
import { API_BASE_URL } from '@/utils/apiConfig';
import { formatLocalDateFR } from '@/utils/dateUtils';

const CongeComponent = () => {
    const baseUrl = `${API_BASE_URL}`;

    const [conge, setConge] = useState<Conge>(new Conge());
    const [congeEdit, setCongeEdit] = useState<Conge>(new Conge());
    const [editCongeDialog, setEditCongeDialog] = useState(false);
    const [conges, setConges] = useState<Conge[]>([]);
    const [filteredConges, setFilteredConges] = useState<Conge[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchExercice, setSearchExercice] = useState<number>(new Date().getFullYear());
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeeNameEdit, setEmployeeNameEdit] = useState<string>('');
    const [nbrJoursPrevu, setNbrJoursPrevu] = useState<number>(0);

    // Date state for Calendar components (stored as Date objects)
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateRetour, setDateRetour] = useState<Date | null>(null);
    const [dateDebutEdit, setDateDebutEdit] = useState<Date | null>(null);
    const [dateRetourEdit, setDateRetourEdit] = useState<Date | null>(null);
    
    // TypeConge dropdown state
    const [typeConges, setTypeConges] = useState<TypeConge[]>([]);
    const [selectedTypeConge, setSelectedTypeConge] = useState<TypeConge | null>(null);
    const [formKey, setFormKey] = useState<number>(0); // Key to force form re-render
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: searchCongeData, loading: searchCongeLoading, error: searchCongeError, fetchData: fetchSearchConge, callType: searchCongeCallType } = useConsumApi('');
    const { data: typeCongeData, loading: typeCongeLoading, error: typeCongeError, fetchData: fetchTypeConges, callType: typeCongeCallType } = useConsumApi('');
    const { data: availableDaysData, loading: availableDaysLoading, error: availableDaysError, fetchData: fetchAvailableDays, callType: availableDaysCallType } = useConsumApi('');
    
    const toast = useRef<Toast>(null);
    const processedSearchData = useRef<any>(null);
    const processedData = useRef<any>(null);
    const processedCalcInfo = useRef<any>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllTypeConges();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadConges') {
                setConges(Array.isArray(data) ? data : [data]);
                setFilteredConges(Array.isArray(data) ? data : [data]);
            }
        }
        
        if (searchData && searchCallType === 'searchByMatricule' && searchData !== processedSearchData.current) {
            processedSearchData.current = searchData;
            const foundEmployee = searchData as any;
            setEmployeeName(`${foundEmployee.nom} ${foundEmployee.prenom}`);

            // Load nbJoursConge from employee's administrativeDetails
            if (foundEmployee.administrativeDetails && foundEmployee.administrativeDetails.nbJoursConge) {
                setNbrJoursPrevu(foundEmployee.administrativeDetails.nbJoursConge);
            } else {
                setNbrJoursPrevu(20); // Default value
            }

            accept('info', 'Employé trouvé', 'Les données de l\'employé ont été chargées.');

            // Fetch calculation info for this employee and exercice
            fetchCalculationInfo(conge.matriculeId, conge.exercice);
            setSearchLoading(false);
        }
        
        if (searchError && searchCallType === 'searchByMatricule' && !processedSearchData.current) {
            processedSearchData.current = 'error';
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setEmployeeName('');
            setSearchLoading(false);
        }

        if (searchData && searchCallType === 'searchByMatriculeEdit' && searchData !== processedSearchData.current) {
            processedSearchData.current = searchData;
            const foundEmployee = searchData as any;
            setEmployeeNameEdit(`${foundEmployee.nom} ${foundEmployee.prenom}`);

            // Load nbJoursConge from employee's administrativeDetails for edit mode
            if (foundEmployee.administrativeDetails && foundEmployee.administrativeDetails.nbJoursConge) {
                setNbrJoursPrevu(foundEmployee.administrativeDetails.nbJoursConge);
            } else {
                setNbrJoursPrevu(20); // Default value
            }

            // Fetch calculation info for edit mode
            fetchCalculationInfo(congeEdit.matriculeId, congeEdit.exercice);
        }

        if (searchCongeData && searchCongeCallType === 'searchConges') {
            const searchResults = Array.isArray(searchCongeData) ? searchCongeData : [searchCongeData];
            setFilteredConges(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucun congé trouvé pour ce matricule et exercice.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} congé(s) trouvé(s).`);
            }
        }

        if (searchCongeError && searchCongeCallType === 'searchConges') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des congés.');
            setFilteredConges([]);
        }
        
        if (typeCongeData && typeCongeCallType === 'loadTypeConges') {
            setTypeConges(Array.isArray(typeCongeData) ? typeCongeData : [typeCongeData]);
        }

        if (availableDaysData && availableDaysCallType === 'fetchCalculationInfo' && availableDaysData !== processedCalcInfo.current) {
            processedCalcInfo.current = availableDaysData;
            const calcInfo = availableDaysData as { nbrJoursPrevu: number; nbrJoursDisponible: number; cumuleCongeCirconstance: number };
            // Update nbrJoursPrevu from the calculation info
            setNbrJoursPrevu(calcInfo.nbrJoursPrevu);
            if (!editCongeDialog) {
                setConge(prev => ({
                    ...prev,
                    nbrJoursDisponible: calcInfo.nbrJoursDisponible,
                    cumuleCongeCirconstance: calcInfo.cumuleCongeCirconstance
                }));
            } else {
                setCongeEdit(prev => ({
                    ...prev,
                    nbrJoursDisponible: calcInfo.nbrJoursDisponible,
                    cumuleCongeCirconstance: calcInfo.cumuleCongeCirconstance
                }));
            }
        }

        // Only process data changes once (for create/update conge)
        if (data && data !== processedData.current && (callType === 'createConge' || callType === 'updateConge')) {
            processedData.current = data;
            handleAfterApiCall(activeIndex);
        }

        // Handle errors for create/update
        if (error && (callType === 'createConge' || callType === 'updateConge') && processedData.current !== 'error') {
            processedData.current = 'error';
            if (callType === 'createConge') {
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            } else {
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
            }
            setBtnLoading(false);
        }
    }, [data, searchData, searchError, searchCongeData, searchCongeError, typeCongeData, availableDaysData, error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editCongeDialog) {
            setConge((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setCongeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleNumberChange = (e: any) => {
        const fieldName = e.originalEvent.target.name;
        const value = e.value || 0;
        
        if (!editCongeDialog) {
            setConge((prev) => ({ ...prev, [fieldName]: value }));
        } else {
            setCongeEdit((prev) => ({ ...prev, [fieldName]: value }));
        }
    };

    const handleCalendarChange = (e: any) => {
        const fieldName = e.target.name;
        const date = e.value as Date;

        if (!editCongeDialog) {
            if (fieldName === 'dateDebut') {
                setDateDebut(date);
            } else if (fieldName === 'dateRetour') {
                setDateRetour(date);
            }
        } else {
            if (fieldName === 'dateDebut') {
                setDateDebutEdit(date);
            } else if (fieldName === 'dateRetour') {
                setDateRetourEdit(date);
            }
        }
    };

    const handleDropDownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;
        
        if (fieldName === 'typeCongeId') {
            const typeConge = typeConges.find(t => t.typeCongeId === value);
            if (!editCongeDialog) {
                setConge((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedTypeConge(typeConge || null);
                
                // Fetch calculation info when type conge changes and we have matricule
                if (conge.matriculeId) {
                    fetchCalculationInfo(conge.matriculeId, conge.exercice);
                }
            } else {
                setCongeEdit((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedTypeConge(typeConge || null);
                
                // Fetch calculation info when type conge changes and we have matricule
                if (congeEdit.matriculeId) {
                    fetchCalculationInfo(congeEdit.matriculeId, congeEdit.exercice);
                }
            }
        }
    };

    const fetchCalculationInfo = (matriculeId: string, exercice: number) => {
        fetchAvailableDays(null, 'Get',
            `${baseUrl}/api/grh/conges/calculation-info/${matriculeId}/${exercice}`,
            'fetchCalculationInfo'
        );
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        processedSearchData.current = null; // Reset to allow processing new search
        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleExerciceChange = (exercice: number) => {
        // Recalculate available days when exercice changes
        if (conge.matriculeId) {
            fetchCalculationInfo(conge.matriculeId, exercice);
        }
    };

    const handleSearchConges = (matriculeValue: string, exerciceValue: number) => {
        if (matriculeValue.trim() === '') {
            // No matricule - load by exercice only
            loadCongesByExercice(exerciceValue);
            return;
        }

        // Matricule provided - search by matricule AND exercice
        console.log('Searching conges by matricule and exercice:', matriculeValue, exerciceValue);
        fetchSearchConge(null, 'Get',
            `${baseUrl}/api/grh/conges/matricule/${encodeURIComponent(matriculeValue.trim())}/exercice/${exerciceValue}`,
            'searchConges'
        );
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        const timeoutId = setTimeout(() => {
            handleSearchConges(value, searchExercice);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleSearchExerciceChange = (e: any) => {
        const value = e.value || new Date().getFullYear();
        setSearchExercice(value);

        // Always reload data when exercice changes (either by exercice only or matricule + exercice)
        handleSearchConges(searchTerm, value);
    };

    const loadCongesByExercice = (exercice: number) => {
        console.log('Loading conges by exercice:', exercice);
        fetchSearchConge(null, 'Get', `${baseUrl}/api/grh/conges/exercice/${exercice}`, 'searchConges');
    };

    const handleSubmit = () => {
        const dataToSend = {
            ...conge,
            dateDebut: dateDebut ? formatLocalDateFR(dateDebut) : '',
            dateRetour: dateRetour ? formatLocalDateFR(dateRetour) : ''
        };

        console.log('=== handleSubmit Debug ===');
        console.log('Raw dateDebut:', dateDebut);
        console.log('Raw dateRetour:', dateRetour);
        console.log('Data sent to the backend:', dataToSend);

        setBtnLoading(true);
        processedData.current = null; // Reset to allow processing new response
        fetchData(dataToSend, 'Post', baseUrl + '/api/grh/conges/new', 'createConge');
    };

    const handleSubmitEdit = () => {
        const dataToSend = {
            ...congeEdit,
            dateDebut: dateDebutEdit ? formatLocalDateFR(dateDebutEdit) : '',
            dateRetour: dateRetourEdit ? formatLocalDateFR(dateRetourEdit) : ''
        };

        console.log('=== handleSubmitEdit Debug ===');
        console.log('Raw dateDebutEdit:', dateDebutEdit);
        console.log('Raw dateRetourEdit:', dateRetourEdit);
        console.log('Data sent to the backend:', dataToSend);

        setBtnLoading(true);
        processedData.current = null; // Reset to allow processing new response
        fetchData(dataToSend, 'Put', baseUrl + '/api/grh/conges/update/' + congeEdit.congeId, 'updateConge');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateConge')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateConge')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des congés.');
        else if (data !== null && error === null) {
            if (callType === 'createConge') {
                setConge(new Conge());
                setEmployeeName('');
                setSelectedTypeConge(null);
                setNbrJoursPrevu(20);
                setDateDebut(null);
                setDateRetour(null);
                processedSearchData.current = null; // Reset to allow new searches
                processedCalcInfo.current = null; // Reset to allow new calculation info
                setFormKey(prev => prev + 1); // Force form re-render to clear all fields
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateConge') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setCongeEdit(new Conge());
                setEmployeeNameEdit('');
                setSelectedTypeConge(null);
                setDateDebutEdit(null);
                setDateRetourEdit(null);
                processedSearchData.current = null; // Reset to allow new searches
                processedCalcInfo.current = null; // Reset to allow new calculation info
                setEditCongeDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterConge = () => {
        const currentYear = new Date().getFullYear();
        setSearchTerm('');
        setSearchExercice(currentYear);
        // Reload conges for current year
        loadCongesByExercice(currentYear);
    };

    const loadCongeToEdit = (data: Conge) => {
        if (data) {
            setEditCongeDialog(true);
            setCongeEdit(data);

            // Parse date strings to Date objects for the Calendar components
            // Backend returns dates as ISO strings or LocalDateTime format
            if (data.dateDebut) {
                setDateDebutEdit(new Date(data.dateDebut));
            } else {
                setDateDebutEdit(null);
            }
            if (data.dateRetour) {
                setDateRetourEdit(new Date(data.dateRetour));
            } else {
                setDateRetourEdit(null);
            }

            // Set selected type conge
            const typeConge = typeConges.find(t => t.typeCongeId === data.typeCongeId);
            if (typeConge) setSelectedTypeConge(typeConge);

            // Load employee name for edit mode
            if (data.matriculeId) {
                processedSearchData.current = null; // Reset to allow processing new search
                fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + data.matriculeId, 'searchByMatriculeEdit');
            }
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCongeToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/conges/findall', 'loadConges');
    };

    const loadAllTypeConges = () => {
        fetchTypeConges(null, 'Get', baseUrl + '/api/typeconges/findall', 'loadTypeConges');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            // Load conges by current exercice when switching to "Tous les Congés" tab
            loadCongesByExercice(searchExercice);
        } else {
            setConge(new Conge());
            setEmployeeName('');
            setSelectedTypeConge(null);
            setNbrJoursPrevu(20);
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <div className="flex gap-2">
                    <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterConge} />
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
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText 
                        placeholder="Recherche par Matricule" 
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                    />
                </span>
            </div>
        );
    };

    const getTypeCongeLabel = (typeCongeId: string) => {
        const typeConge = typeConges.find(t => t.typeCongeId === typeCongeId);
        return typeConge ? typeConge.libelle : typeCongeId;
    };

    const dateBodyTemplate = (rowData: Conge, field: string) => {
        const date = rowData[field as keyof Conge] as Date;
        return date ? new Intl.DateTimeFormat('fr-FR').format(new Date(date)) : '-';
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Congé"
                visible={editCongeDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditCongeDialog(false)}
            >
                <CongeForm
                    conge={congeEdit}
                    employeeName={employeeNameEdit}
                    typeConges={typeConges}
                    selectedTypeConge={selectedTypeConge}
                    nbrJoursPrevu={nbrJoursPrevu}
                    dateDebut={dateDebutEdit}
                    dateRetour={dateRetourEdit}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleCalendarChange={handleCalendarChange}
                    handleDropDownSelect={handleDropDownSelect}
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
                <TabPanel header="Nouveau Congé">
                    <CongeForm
                        key={formKey}
                        conge={conge}
                        employeeName={employeeName}
                        typeConges={typeConges}
                        selectedTypeConge={selectedTypeConge}
                        nbrJoursPrevu={nbrJoursPrevu}
                        dateDebut={dateDebut}
                        dateRetour={dateRetour}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleCalendarChange={handleCalendarChange}
                        handleDropDownSelect={handleDropDownSelect}
                        handleMatriculeBlur={handleMatriculeBlur}
                        handleExerciceChange={handleExerciceChange}
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
                                        setConge(new Conge());
                                        setEmployeeName('');
                                        setSelectedTypeConge(null);
                                        setNbrJoursPrevu(20);
                                        setDateDebut(null);
                                        setDateRetour(null);
                                        processedSearchData.current = null;
                                        processedCalcInfo.current = null;
                                        setFormKey(prev => prev + 1);
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
                <TabPanel header="Tous les Congés">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredConges}
                                    header={renderSearch}
                                    emptyMessage={"Pas de congés à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                    sortField="dateDebut"
                                    sortOrder={-1}
                                >
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column field="nom" header="Nom" sortable />
                                    <Column field="prenom" header="Prénom" sortable />
                                    <Column field="exercice" header="Exercice" sortable />
                                    <Column 
                                        field="typeCongeId" 
                                        header="Type de Congé"
                                        body={(rowData) => getTypeCongeLabel(rowData.typeCongeId)}
                                        sortable 
                                    />
                                    <Column 
                                        field="dateDebut" 
                                        header="Date Début" 
                                        body={(rowData) => dateBodyTemplate(rowData, 'dateDebut')}
                                        sortable 
                                    />
                                    <Column 
                                        field="dateRetour" 
                                        header="Date Retour" 
                                        body={(rowData) => dateBodyTemplate(rowData, 'dateRetour')}
                                        sortable 
                                    />
                                    <Column field="nbrJoursSollicites" header="J. Sollicités" sortable />
                                    <Column field="nbrJoursAccordes" header="J. Accordés" sortable />
                                    <Column field="nbrJoursEffectifs" header="J. Effectifs" sortable />
                                    <Column field="nbrJoursDisponible" header="J. Disponibles" sortable />
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

export default CongeComponent;