'use client';

import { useEffect, useRef, useState } from "react";
import { GrhRensCarriere } from "./GrhRensCarriere";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import GrhRensCarriereForm from "./GrhRensCarriereForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from "primereact/dropdown";
import { API_BASE_URL } from '@/utils/apiConfig';
import { useAuthorities } from "../../../../../hooks/useAuthorities";

const GrhRensCarriereComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const { hasAuthority, hasAnyAuthority } = useAuthorities();

    // Authority checks for tab visibility
    const canViewNouveauTab = hasAuthority('RH_MANAGER');
    const canViewConsultationTab = hasAnyAuthority(['RH_MANAGER', 'RH_OPERATEUR_SAISIE']);

    const [carriere, setCarriere] = useState<GrhRensCarriere>(new GrhRensCarriere());
    const [carriereEdit, setCarriereEdit] = useState<GrhRensCarriere>(new GrhRensCarriere());
    const [editCarriereDialog, setEditCarriereDialog] = useState(false);
    const [carrieres, setCarrieres] = useState<GrhRensCarriere[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [hasCareerInfo, setHasCareerInfo] = useState<boolean>(false);

    // Server-side pagination state
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 0 });
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployeeData, callType: employeeCallType } = useConsumApi('');
    
    // Individual hooks for dropdown data
    const { data: fonctionData, fetchData: fetchFonctions } = useConsumApi('');
    const { data: categorieData, fetchData: fetchCategories } = useConsumApi('');
    const { data: serviceData, fetchData: fetchServices } = useConsumApi('');
    const { data: collineData, fetchData: fetchCollines } = useConsumApi('');
    const { data: banqueData, fetchData: fetchBanques } = useConsumApi('');
    const { data: gradeData, fetchData: fetchGrades } = useConsumApi(''); // Added Grade hook
    const { data: departmentData, fetchData: fetchDepartments } = useConsumApi('');
    const { data: singleServiceData, fetchData: fetchSingleService, callType: singleServiceCallType } = useConsumApi('');

    const toast = useRef<Toast>(null);
    const processedEmployeeRef = useRef<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Track current matricule being searched to prevent race conditions
    const [currentSearchMatricule, setCurrentSearchMatricule] = useState<string>('');

    // State for dropdown options
    const [fonctions, setFonctions] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]); // Added grades state
    const [services, setServices] = useState<any[]>([]);
    const [allServices, setAllServices] = useState<any[]>([]); // Store all services
    const [collines, setCollines] = useState<any[]>([]);
    const [indices, setIndices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [banques, setBanques] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        // Load all dropdown options on component mount
        loadAllDropdownData();

        // If user only has Consultation tab access, load data on mount
        if (!canViewNouveauTab && canViewConsultationTab) {
            loadPaginatedData(0, 10, '');
        }
    }, []);

    useEffect(() => {
        // Handle main API responses
        if (data) {
            if (callType === 'loadCarrieres') {
                const pageData = data as any;
                if (pageData.content !== undefined) {
                    setCarrieres(pageData.content);
                    setTotalRecords(pageData.totalElements);
                } else {
                    setCarrieres(Array.isArray(data) ? data : [data]);
                    setTotalRecords(Array.isArray(data) ? data.length : 1);
                }
            }
        }

        // Handle dropdown data
        if (fonctionData) {
            setFonctions(Array.isArray(fonctionData) ? fonctionData : [fonctionData]);
        }
        if (categorieData) {
            setCategories(Array.isArray(categorieData) ? categorieData : [categorieData]);
        }
        if (serviceData) {
            const servicesArray = Array.isArray(serviceData) ? serviceData : [serviceData];
            setAllServices(servicesArray);
            setServices(servicesArray); // Initially show all services
        }
        if (collineData) {
            setCollines(Array.isArray(collineData) ? collineData : [collineData]);
        }
        if (banqueData) {
            setBanques(Array.isArray(banqueData) ? banqueData : [banqueData]);
        }
        if (gradeData) {
            setGrades(Array.isArray(gradeData) ? gradeData : [gradeData]);
        }
        if (departmentData) {
            setDepartments(Array.isArray(departmentData) ? departmentData : [departmentData]);
        }

        // Handle single service fetch for edit mode
        if (singleServiceData && singleServiceCallType === 'fetchServiceForEdit') {
            const service = singleServiceData as any;
            console.log('Fetched service for edit:', service);

            // Set the department based on the service's departmentId
            if (service.departmentId) {
                setSelectedDepartment(service.departmentId);

                // Update the carriereEdit with departmentId (carriere model field)
                setCarriereEdit(prev => ({
                    ...prev,
                    departmentId: service.departmentId
                }));

                // Filter services by this department (use the allServices array from state)
                if (allServices && allServices.length > 0) {
                    const filteredServices = allServices.filter(s =>
                        s.departmentId === service.departmentId
                    );
                    console.log('Filtered services for department:', filteredServices);
                    setServices(filteredServices);
                }
            }
        }
        
        // Handle employee data loading by matricule - ONLY load nom and prenom
        // Following EMPLOYEE_LOOKUP_PATTERN: validate response matches current search matricule
        if (employeeData && employeeCallType === 'searchByMatricule' &&
            processedEmployeeRef.current !== carriere.matriculeId) {
            const foundEmployee = employeeData as any;

            // Only apply data if this response matches the current search matricule (prevents race conditions)
            if (foundEmployee.matriculeId === currentSearchMatricule || foundEmployee.matriculeId === carriere.matriculeId) {
                // Only load employee name - form stays clean for new career entry
                setCarriere(prev => ({
                    ...prev,
                    nom: foundEmployee.nom || '',
                    prenom: foundEmployee.prenom || '',
                }));

                // Mark this employee as processed to prevent re-processing
                processedEmployeeRef.current = carriere.matriculeId;

                accept('info', 'Employé trouvé', 'Entrez les informations de carrière.');
            }
            setSearchLoading(false);
        }

        // Handle career existence check response
        if (data && callType === 'checkCareerExists') {
            // If we got data back, career exists for this employee
            setHasCareerInfo(true);
            accept('warn', 'Carrière existante',
                'Cet employé a déjà des informations de carrière. Utilisez l\'onglet Consultation pour modifier.');
        }

        if (employeeError && employeeCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setCarriere(prev => ({
                ...prev,
                nom: '',
                prenom: '',
            }));
            setSearchLoading(false);
        }

        // Handle case when career doesn't exist (404 or error from checkCareerExists)
        if (error && callType === 'checkCareerExists') {
            // No career exists - this is fine for Nouveau tab
            setHasCareerInfo(false);
        }
        
        handleAfterApiCall(activeIndex);
    }, [data, employeeData, employeeError, fonctionData, categorieData, serviceData, collineData, banqueData, gradeData, departmentData, singleServiceData, singleServiceCallType, allServices, currentSearchMatricule, carriere.matriculeId, callType, error]);

    const loadAllDropdownData = () => {
        // Using correct endpoints from your controllers
        fetchFonctions(null, 'Get', baseUrl + '/rhfonctions/findall', 'loadFonctions');
        fetchCategories(null, 'Get', baseUrl + '/categories/findall', 'loadCategories');
        fetchServices(null, 'Get', baseUrl + '/rhservices/findall', 'loadServices');
        fetchCollines(null, 'Get', baseUrl + '/collines/findall', 'loadCollines');
        fetchGrades(null, 'Get', baseUrl + '/grades/findall', 'loadGrades');
        fetchBanques(null, 'Get', baseUrl + '/banques/findall', 'loadBanques');
        fetchDepartments(null, 'Get', baseUrl + '/departments/findall', 'loadDepartments');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editCarriereDialog) {
            setCarriere((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setCarriereEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleNumberChange = (e: any, fieldName: string) => {
        const value = e.value !== null && e.value !== undefined ? e.value : 0;
        if (!editCarriereDialog) {
            setCarriere((prev) => ({ ...prev, [fieldName]: value }));
        } else {
            setCarriereEdit((prev) => ({ ...prev, [fieldName]: value }));
        }
    };

    const handleCheckboxChange = (e: any) => {
        const fieldName = e.target.name;
        const isChecked = e.checked;
        if (!editCarriereDialog) {
            setCarriere((prev) => ({ ...prev, [fieldName]: isChecked }));
        } else {
            setCarriereEdit((prev) => ({ ...prev, [fieldName]: isChecked }));
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

        // Fetch employee basic info (nom, prenom) following EMPLOYEE_LOOKUP_PATTERN
        fetchEmployeeData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule', false, 'json', abortControllerRef.current);
        // Also check if career exists
        fetchData(null, 'Get', baseUrl + '/api/grh/carriere/' + matriculeId, 'checkCareerExists', false, 'json', abortControllerRef.current);
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            // Reset to first page when searching
            setLazyParams(prev => ({ ...prev, first: 0, page: 0 }));
            loadPaginatedData(0, lazyParams.rows, value);
        }, 500);
    };

    const handleSubmit = () => {
        // Block submission if employee already has career data
        if (hasCareerInfo) {
            accept('warn', 'Action non autorisée',
                'Cet employé a déjà une carrière. Utilisez l\'onglet Consultation pour modifier.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', carriere);
        // Nouveau tab always creates new records
        fetchData(carriere, 'Post', baseUrl + '/api/grh/carriere/new', 'createCarriere');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', carriereEdit);
        fetchData(carriereEdit, 'Put', baseUrl + '/api/grh/carriere/update/' + carriereEdit.matriculeId, 'updateCarriere');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        // Skip error handling for checkCareerExists - 404 is expected when no career exists
        if (error !== null && chosenTab === 0 && callType !== 'checkCareerExists') {
            if (callType === 'createCarriere')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateCarriere')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1 && callType !== 'checkCareerExists')
            accept('warn', 'A votre attention', 'Impossible de charger la liste des carrières.');
        else if (data !== null && error === null) {
            if (callType === 'createCarriere') {
                setCarriere(new GrhRensCarriere());
                setHasCareerInfo(false);
                processedEmployeeRef.current = null;
                setCurrentSearchMatricule('');
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateCarriere') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                if (editCarriereDialog) {
                    setCarriereEdit(new GrhRensCarriere());
                    setEditCarriereDialog(false);
                } else {
                    setCarriere(new GrhRensCarriere());
                    setHasCareerInfo(false);
                    processedEmployeeRef.current = null;
                    setCurrentSearchMatricule('');
                }
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterCarriere = () => {
        setSearchTerm('');
        setLazyParams({ first: 0, rows: 10, page: 0 });
        loadPaginatedData(0, 10, '');
    };

    const loadCarriereToEdit = (data: GrhRensCarriere) => {
        if (data) {
            setCarriereEdit(data);
            setEditCarriereDialog(true);

            // Fetch the service to get its departmentId and filter services
            if (data.serviceId && data.serviceId.trim() !== '') {
                console.log('Fetching service with ID:', data.serviceId);
                fetchSingleService(null, 'Get', baseUrl + '/rhservices/' + data.serviceId, 'fetchServiceForEdit');
            }
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCarriereToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadPaginatedData = (page: number = 0, size: number = 10, matricule: string = '') => {
        let url = `${baseUrl}/api/grh/carriere/findall/paginated?page=${page}&size=${size}`;
        if (matricule.trim() !== '') {
            url += `&matricule=${encodeURIComponent(matricule.trim())}`;
        }
        fetchData(null, 'Get', url, 'loadCarrieres');
    };

    const loadAllData = () => {
        loadPaginatedData(lazyParams.page, lazyParams.rows, searchTerm);
    };

    const onPage = (event: any) => {
        const newParams = { first: event.first, rows: event.rows, page: event.first / event.rows };
        setLazyParams(newParams);
        loadPaginatedData(newParams.page, newParams.rows, searchTerm);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        // Determine the actual tab based on which tabs are visible
        // If only Consultation is visible, it's at index 0
        // If both are visible, Consultation is at index 1
        const isConsultationTab = canViewNouveauTab ? e.index === 1 : e.index === 0;

        if (isConsultationTab) {
            setSearchTerm('');
            setLazyParams({ first: 0, rows: 10, page: 0 });
            loadPaginatedData(0, 10, '');
        } else {
            setCarriere(new GrhRensCarriere());
            setHasCareerInfo(false);
            processedEmployeeRef.current = null;
            setCurrentSearchMatricule('');
        }
        setActiveIndex(e.index);
    };

    const onDropdownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;

        // Handle department selection - filter services
        if (fieldName === 'departmentId') {
            console.log('Department selected:', value);
            console.log('All services:', allServices);
            setSelectedDepartment(value);
            // Filter services based on selected department
            if (value) {
                // Service model uses departmentId
                const filteredServices = allServices.filter(s => {
                    console.log(`Service ${s.serviceId} has departmentId: ${s.departmentId}`);
                    return s.departmentId === value;
                });
                console.log('Filtered services:', filteredServices);
                setServices(filteredServices);
            } else {
                setServices(allServices); // Show all if no department selected
            }

            // Clear service selection when department changes
            if (!editCarriereDialog) {
                setCarriere((prev) => ({ ...prev, departmentId: value, serviceId: '' }));
            } else {
                setCarriereEdit((prev) => ({ ...prev, departmentId: value, serviceId: '' }));
            }
        } else {
            if (!editCarriereDialog) {
                setCarriere((prev) => ({ ...prev, [fieldName]: value }));
            } else {
                setCarriereEdit((prev) => ({ ...prev, [fieldName]: value }));
            }
        }
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterCarriere} />
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

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-BI', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Helper functions to get display labels using correct field mappings
    const getFonctionLabel = (fonctionId: string) => {
        const fonction = fonctions.find(f => f.fonctionid === fonctionId);
        return fonction ? fonction.libelle : fonctionId;
    };

    const getGradeLabel = (gradeId: string) => { // Added grade helper function
        const grade = grades.find(g => g.gradeId === gradeId);
        return grade ? grade.libelle : gradeId;
    };

    const getCategorieLabel = (categorieId: string) => {
        const categorie = categories.find(c => c.categorieId === categorieId);
        return categorie ? categorie.libelle : categorieId;
    };

    const getServiceLabel = (serviceId: string) => {
        const service = allServices.find(s => s.serviceId === serviceId);
        return service ? service.libelle : serviceId;
    };

    const getCollineLabel = (collineId: string) => {
        const colline = collines.find(c => c.collineId === collineId);
        return colline ? colline.nom : collineId;
    };

   return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Carrière"
                visible={editCarriereDialog}
                style={{ width: '90vw' }}
                modal
                onHide={() => {
                    setEditCarriereDialog(false);
                    // Reset services to show all when closing dialog
                    setServices(allServices);
                    setSelectedDepartment('');
                }}
            >
                <GrhRensCarriereForm
                    carriere={carriereEdit}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleCheckboxChange={handleCheckboxChange}
                    handleDropDownSelect={onDropdownSelect}
                    isEditMode={true}
                    fonctions={fonctions}
                    grades={grades}
                    departments={departments}
                    services={services}
                    collines={collines}
                    indices={indices}
                    categories={categories}
                    banques={banques}
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
                {canViewNouveauTab && (
                    <TabPanel header="Nouveau">
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            <GrhRensCarriereForm
                                carriere={carriere}
                                handleChange={handleChange}
                                handleNumberChange={handleNumberChange}
                                handleCheckboxChange={handleCheckboxChange}
                                handleDropDownSelect={onDropdownSelect}
                                handleMatriculeBlur={handleMatriculeBlur}
                                searchLoading={searchLoading}
                                fonctions={fonctions}
                                grades={grades}
                                departments={departments}
                                services={services}
                                collines={collines}
                                indices={indices}
                                categories={categories}
                                banques={banques}
                            />
                            <div className="card p-fluid">
                                <div className="formgrid grid">
                                    <div className="md:col-offset-3 md:field md:col-3">
                                        <Button
                                            type="button"
                                            icon="pi pi-refresh"
                                            outlined
                                            label="Réinitialiser"
                                            onClick={() => { setCarriere(new GrhRensCarriere()); setHasCareerInfo(false); processedEmployeeRef.current = null; setCurrentSearchMatricule(''); }}
                                        />
                                    </div>
                                    <div className="md:field md:col-3">
                                        <Button
                                            type="submit"
                                            icon="pi pi-check"
                                            label="Enregistrer"
                                            loading={btnLoading || searchLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </TabPanel>
                )}
                {canViewConsultationTab && (
                    <TabPanel header="Consultation">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={carrieres}
                                        header={renderSearch}
                                        emptyMessage={"Pas de carrières à afficher"}
                                        lazy
                                        paginator
                                        first={lazyParams.first}
                                        rows={lazyParams.rows}
                                        totalRecords={totalRecords}
                                        onPage={onPage}
                                        rowsPerPageOptions={[10, 20, 30]}
                                        loading={loading}
                                    >
                                        <Column field="matriculeId" header="Matricule" sortable />
                                        <Column field="nom" header="Nom" sortable />
                                        <Column field="prenom" header="Prénom" sortable />
                                        <Column
                                            field="fonctionId"
                                            header="Fonction"
                                            body={(rowData) => getFonctionLabel(rowData.fonctionId)}
                                            sortable
                                        />
                                        <Column
                                            field="gradeId"
                                            header="Grade"
                                            body={(rowData) => getGradeLabel(rowData.gradeId)}
                                            sortable
                                        />
                                        <Column
                                            field="serviceId"
                                            header="Service"
                                            body={(rowData) => getServiceLabel(rowData.serviceId)}
                                            sortable
                                        />
                                        <Column
                                            field="categorieId"
                                            header="Catégorie"
                                            body={(rowData) => getCategorieLabel(rowData.categorieId)}
                                            sortable
                                        />
                                        <Column
                                            field="collineId"
                                            header="Colline"
                                            body={(rowData) => getCollineLabel(rowData.collineId)}
                                            sortable
                                        />
                                        <Column field="anneeEmbauche" header="Année Embauche" sortable />
                                        <Column field="statut" header="Statut" sortable />
                                        <Column field="echelon" header="Échelon" sortable />
                                        <Column
                                            field="base"
                                            header="Base"
                                            body={(rowData) => formatAmount(rowData.base)}
                                            sortable
                                        />
                                        <Column
                                            field="payeONPR"
                                            header="Payé ONPR"
                                            body={(rowData) => rowData.payeONPR ? 'Oui' : 'Non'}
                                            sortable
                                        />
                                        <Column header="Options" body={optionButtons} />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}
            </TabView>
        </>
    );
};

export default GrhRensCarriereComponent;