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
    const [filteredCarrieres, setFilteredCarrieres] = useState<GrhRensCarriere[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [hasCareerInfo, setHasCareerInfo] = useState<boolean>(false);
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
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
            loadAllData();
        }
    }, []);

    useEffect(() => {
        // Handle main API responses
        if (data) {
            if (callType === 'loadCarrieres') {
                setCarrieres(Array.isArray(data) ? data : [data]);
                setFilteredCarrieres(Array.isArray(data) ? data : [data]);
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
        
        if (searchData && searchCallType === 'searchCarrieres') {
            const searchResults = Array.isArray(searchData) ? searchData : [searchData];
            setFilteredCarrieres(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucune carrière trouvée avec ce matricule.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} carrière(s) trouvée(s).`);
            }
        }

        if (searchError && searchCallType === 'searchCarrieres') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des carrières.');
            setFilteredCarrieres([]);
        }

        // Handle employee data loading by matricule
        if (employeeData && employeeCallType === 'searchByMatricule') {
            const foundEmployee = employeeData as any;
            console.log(" La grade est " + foundEmployee.gradeId);

            // If employee has career info with departmentId, filter services
            if (foundEmployee.departmentId) {
                setSelectedDepartment(foundEmployee.departmentId);
                const filteredServices = allServices.filter(s => s.departmentId === foundEmployee.departmentId);
                setServices(filteredServices);
            }

            setCarriere(prev => ({
                ...prev,
                nom: foundEmployee.nom || '',
                prenom: foundEmployee.prenom || '',
                // Set existing career data if available
                departmentId: foundEmployee.departmentId || prev.departmentId,
                fonctionId: foundEmployee.fonctionId || prev.fonctionId,
                gradeId: foundEmployee.gradeId || prev.gradeId,
                serviceId: foundEmployee.serviceId || prev.serviceId,
                categorieId: foundEmployee.categorieId || prev.categorieId,
                collineId: foundEmployee.collineId || prev.collineId,
                // Other career fields if available in employee data
                anneeEmbauche: foundEmployee.anneeEmbauche || prev.anneeEmbauche,
                statut: foundEmployee.statut || prev.statut,
                echelon: foundEmployee.echelon || prev.echelon,
                base: foundEmployee.base || prev.base,
                nbrJoursConge: foundEmployee.nbrJoursConge || prev.nbrJoursConge,
                reference: foundEmployee.reference || prev.reference,
                dateObtentionGrade: foundEmployee.dateObtentionGrade || prev.dateObtentionGrade,
                dateObtentionEchelon: foundEmployee.dateObtentionEchelon || prev.dateObtentionEchelon,
                specialite: foundEmployee.specialite || prev.specialite,
                niveauFormation: foundEmployee.niveauFormation || prev.niveauFormation,
                indiceId: foundEmployee.indiceId || prev.indiceId,
                tauxPensionComplPers: foundEmployee.tauxPensionComplPers || prev.tauxPensionComplPers,
                tauxPensionComplPatr: foundEmployee.tauxPensionComplPatr || prev.tauxPensionComplPatr,
                codeBanque: foundEmployee.codeBanque || prev.codeBanque,
                compte: foundEmployee.compte || prev.compte,
                soinsDeSante: foundEmployee.soinsDeSante || prev.soinsDeSante,
                payeONPR: foundEmployee.payeONPR !== undefined ? foundEmployee.payeONPR : prev.payeONPR,
                tauxIprVacatairePers: foundEmployee.tauxIprVacatairePers || prev.tauxIprVacatairePers,
                tauxIprVacatairePatr: foundEmployee.tauxIprVacatairePatr || prev.tauxIprVacatairePatr,
                calculerDeplacement: foundEmployee.calculerDeplacement !== undefined ? foundEmployee.calculerDeplacement : prev.calculerDeplacement,
                pourcJubile: foundEmployee.pourcJubile || prev.pourcJubile,
            }));

            setHasCareerInfo(foundEmployee.hasCareerInfo === true);
            const message = foundEmployee.hasCareerInfo
                ? 'Les informations de l\'employé et de carrière ont été chargées.'
                : 'Les informations de l\'employé ont été chargées.';
            accept('info', 'Employé trouvé', message);
            setSearchLoading(false);
        }
        
        if (employeeError && employeeCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setSearchLoading(false);
        }
        
        handleAfterApiCall(activeIndex);
    }, [data, searchData, searchError, employeeData, employeeError, fonctionData, categorieData, serviceData, collineData, banqueData, gradeData, departmentData, singleServiceData, singleServiceCallType, allServices]);

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
        
        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        // This endpoint returns employee info with career details if exists
        fetchEmployeeData(null, 'Get', baseUrl + '/api/grh/carriere/employee/' + matriculeId, 'searchByMatricule');
    };

    const handleSearchCarrieres = (searchValue: string) => {
        if (searchValue.trim() === '') {
            setFilteredCarrieres(carrieres);
            return;
        }
        
        // Simple client-side filtering since we don't have search endpoint
        const filtered = carrieres.filter(c => 
            c.matriculeId.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredCarrieres(filtered);
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        const timeoutId = setTimeout(() => {
            handleSearchCarrieres(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', carriere);
        if (hasCareerInfo) {
            fetchData(carriere, 'Put', baseUrl + '/api/grh/carriere/update/' + carriere.matriculeId, 'updateCarriere');
        } else {
            fetchData(carriere, 'Post', baseUrl + '/api/grh/carriere/new', 'createCarriere');
        }
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', carriereEdit);
        fetchData(carriereEdit, 'Put', baseUrl + '/api/grh/carriere/update/' + carriereEdit.matriculeId, 'updateCarriere');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateCarriere')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateCarriere')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des carrières.');
        else if (data !== null && error === null) {
            if (callType === 'createCarriere') {
                setCarriere(new GrhRensCarriere());
                setHasCareerInfo(false);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateCarriere') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                if (editCarriereDialog) {
                    setCarriereEdit(new GrhRensCarriere());
                    setEditCarriereDialog(false);
                } else {
                    setCarriere(new GrhRensCarriere());
                    setHasCareerInfo(false);
                }
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterCarriere = () => {
        setSearchTerm('');
        setFilteredCarrieres(carrieres);
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

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/carriere/findall', 'loadCarrieres');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        // Determine the actual tab based on which tabs are visible
        // If only Consultation is visible, it's at index 0
        // If both are visible, Consultation is at index 1
        const isConsultationTab = canViewNouveauTab ? e.index === 1 : e.index === 0;

        if (isConsultationTab) {
            loadAllData();
        } else {
            setCarriere(new GrhRensCarriere());
            setHasCareerInfo(false);
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
        const service = services.find(s => s.serviceId === serviceId);
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
                                            onClick={() => { setCarriere(new GrhRensCarriere()); setHasCareerInfo(false); }}
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
                                        value={filteredCarrieres}
                                        header={renderSearch}
                                        emptyMessage={"Pas de carrières à afficher"}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[10, 20, 30]}
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