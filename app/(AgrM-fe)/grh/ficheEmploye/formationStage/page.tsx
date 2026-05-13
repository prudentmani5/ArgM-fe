'use client';

import { useEffect, useRef, useState } from "react";
import { FormationStage } from "./FormationStage";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import FormationStageForm from "./FormationStageForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from "primereact/dropdown";
import { DomaineFormation } from "../../settings/domaineformation/DomaineFormaton";
import { API_BASE_URL } from '@/utils/apiConfig';

interface TypeDiplome {
    typeDiplomeId: string;
    diplome: string;
}

const FormationStageComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    
    const [formationStage, setFormationStage] = useState<FormationStage>(new FormationStage());
    const [formationStageEdit, setFormationStageEdit] = useState<FormationStage>(new FormationStage());
    const [editFormationStageDialog, setEditFormationStageDialog] = useState(false);
    const [formationStages, setFormationStages] = useState<FormationStage[]>([]);
    const [filteredFormationStages, setFilteredFormationStages] = useState<FormationStage[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeeNameEdit, setEmployeeNameEdit] = useState<string>('');
    
    // Dropdown states
    const [domaines, setDomaines] = useState<DomaineFormation[]>([]);
    const [typeDiplomes, setTypeDiplomes] = useState<TypeDiplome[]>([]);
    const [selectedDomaine, setSelectedDomaine] = useState<DomaineFormation | null>(null);
    const [selectedTypeDiplome, setSelectedTypeDiplome] = useState<TypeDiplome | null>(null);
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: searchFormationData, loading: searchFormationLoading, error: searchFormationError, fetchData: fetchSearchFormation, callType: searchFormationCallType } = useConsumApi('');
    const { data: domaineData, loading: domaineLoading, error: domaineError, fetchData: fetchDomaines, callType: domaineCallType } = useConsumApi('');
    const { data: typeDiplomeData, loading: typeDiplomeLoading, error: typeDiplomeError, fetchData: fetchTypeDiplomes, callType: typeDiplomeCallType } = useConsumApi('');
    
    const toast = useRef<Toast>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllDomaines();
        loadAllTypeDiplomes();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadFormationStages') {
                setFormationStages(Array.isArray(data) ? data : [data]);
                setFilteredFormationStages(Array.isArray(data) ? data : [data]);
            }
        }
        
        if (searchData && searchCallType === 'searchByMatricule') {
            if (searchData) {
                const foundEmployee = searchData as any;
                setEmployeeName(`${foundEmployee.nom} ${foundEmployee.prenom}`);
                accept('info', 'Employé trouvé', 'Les données de l\'employé ont été chargées.');
            }
            setSearchLoading(false);
        }
        
        if (searchError && searchCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setEmployeeName('');
            setSearchLoading(false);
        }

        if (searchFormationData && searchFormationCallType === 'searchFormations') {
            const searchResults = Array.isArray(searchFormationData) ? searchFormationData : [searchFormationData];
            setFilteredFormationStages(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucune formation trouvée pour ce matricule.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} formation(s) trouvée(s).`);
            }
        }

        if (searchFormationError && searchFormationCallType === 'searchFormations') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des formations.');
            setFilteredFormationStages([]);
        }
        
        if (domaineData && domaineCallType === 'loadDomaines') {
            setDomaines(Array.isArray(domaineData) ? domaineData : [domaineData]);
        }
        
        if (typeDiplomeData && typeDiplomeCallType === 'loadTypeDiplomes') {
            setTypeDiplomes(Array.isArray(typeDiplomeData) ? typeDiplomeData : [typeDiplomeData]);
        }
        
        handleAfterApiCall(activeIndex);
    }, [data, searchData, searchError, searchFormationData, searchFormationError, domaineData, typeDiplomeData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editFormationStageDialog) {
            setFormationStage((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setFormationStageEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleNumberChange = (e: any) => {
        const fieldName = e.originalEvent.target.name;
        const value = e.value || 0;
        
        if (!editFormationStageDialog) {
            setFormationStage((prev) => ({ ...prev, [fieldName]: value }));
        } else {
            setFormationStageEdit((prev) => ({ ...prev, [fieldName]: value }));
        }
    };

    const handleCalendarChange = (e: any) => {
        const fieldName = e.target.name;
        const date = e.value as Date;
        const formattedDate = date ? formatDateToString(date) : '';
        
        if (!editFormationStageDialog) {
            setFormationStage((prev) => ({ ...prev, [fieldName]: formattedDate }));
        } else {
            setFormationStageEdit((prev) => ({ ...prev, [fieldName]: formattedDate }));
        }
    };

    const formatDateToString = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${day}/${month}/${year}`;
    };

    const handleDropDownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;
        
        if (fieldName === 'domaineId') {
            const domaine = domaines.find(d => d.domaineId === value);
            if (!editFormationStageDialog) {
                setFormationStage((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedDomaine(domaine || null);
            } else {
                setFormationStageEdit((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedDomaine(domaine || null);
            }
        } else if (fieldName === 'typeDiplomeId') {
            const typeDiplome = typeDiplomes.find(t => t.typeDiplomeId === value);
            if (!editFormationStageDialog) {
                setFormationStage((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedTypeDiplome(typeDiplome || null);
            } else {
                setFormationStageEdit((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedTypeDiplome(typeDiplome || null);
            }
        }
    };

    const handleRadioChange = (e: any) => {
        const fieldName = e.target.name;
        const value = e.target.value;
        
        if (!editFormationStageDialog) {
            setFormationStage((prev) => ({ 
                ...prev, 
                [fieldName]: value,
                // Clear typeDiplomeId if switching to Certificate
                typeDiplomeId: value === 'C' ? '' : prev.typeDiplomeId
            }));
            if (value === 'C') {
                setSelectedTypeDiplome(null);
            }
        } else {
            setFormationStageEdit((prev) => ({ 
                ...prev, 
                [fieldName]: value,
                // Clear typeDiplomeId if switching to Certificate
                typeDiplomeId: value === 'C' ? '' : prev.typeDiplomeId
            }));
            if (value === 'C') {
                setSelectedTypeDiplome(null);
            }
        }
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;
        
        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleSearchFormations = (searchValue: string) => {
        if (searchValue.trim() === '') {
            setFilteredFormationStages(formationStages);
            return;
        }
        
        console.log('Searching formations by matricule:', searchValue);
        fetchSearchFormation(null, 'Get', baseUrl + '/api/grh/formations/matricule/' + encodeURIComponent(searchValue.trim()), 'searchFormations');
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        const timeoutId = setTimeout(() => {
            handleSearchFormations(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', formationStage);
        fetchData(formationStage, 'Post', baseUrl + '/api/grh/formations/new', 'createFormationStage');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', formationStageEdit);
        fetchData(formationStageEdit, 'Put', baseUrl + '/api/grh/formations/update/' + formationStageEdit.formationId, 'updateFormationStage');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateFormationStage')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateFormationStage')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des formations.');
        else if (data !== null && error === null) {
            if (callType === 'createFormationStage') {
                setFormationStage(new FormationStage());
                setEmployeeName('');
                setSelectedDomaine(null);
                setSelectedTypeDiplome(null);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateFormationStage') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setFormationStageEdit(new FormationStage());
                setEmployeeNameEdit('');
                setSelectedDomaine(null);
                setSelectedTypeDiplome(null);
                setEditFormationStageDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterFormation = () => {
        setSearchTerm('');
        setFilteredFormationStages(formationStages);
    };

    const loadFormationStageToEdit = (data: FormationStage) => {
        if (data) {
            setEditFormationStageDialog(true);
            setFormationStageEdit(data);
            
            // Set selected dropdown values
            const domaine = domaines.find(d => d.domaineId === data.domaineId);
            if (domaine) setSelectedDomaine(domaine);
            
            const typeDiplome = typeDiplomes.find(t => t.typeDiplomeId === data.typeDiplomeId);
            if (typeDiplome) setSelectedTypeDiplome(typeDiplome);
            
            // Load employee name for edit mode
            if (data.matriculeId) {
                fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + data.matriculeId, 'searchByMatriculeEdit');
            }
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadFormationStageToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/formations/findall', 'loadFormationStages');
    };

    const loadAllDomaines = () => {
        fetchDomaines(null, 'Get', baseUrl + '/domaines/findall', 'loadDomaines');
    };

    const loadAllTypeDiplomes = () => {
        fetchTypeDiplomes(null, 'Get', baseUrl + '/typediplomes/findall', 'loadTypeDiplomes');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setFormationStage(new FormationStage());
            setEmployeeName('');
            setSelectedDomaine(null);
            setSelectedTypeDiplome(null);
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterFormation} />
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

    const getDomaineLabel = (domaineId: string) => {
        const domaine = domaines.find(d => d.domaineId === domaineId);
        return domaine ? domaine.libelle : domaineId;
    };

    const getTypeDiplomeLabel = (typeDiplomeId: string) => {
        const typeDiplome = typeDiplomes.find(t => t.typeDiplomeId === typeDiplomeId);
        return typeDiplome ? typeDiplome.diplome : typeDiplomeId;
    };

    const getDiplomeCertificatLabel = (diplomeCertificat: string) => {
        return diplomeCertificat === 'D' ? 'Diplôme' : 'Certificat';
    };

    const durationBodyTemplate = (rowData: FormationStage) => {
        const parts = [];
        
        if (rowData.nbrAnnees > 0) {
            parts.push(`${rowData.nbrAnnees}a`);
        }
        if (rowData.nbrMois > 0) {
            parts.push(`${rowData.nbrMois}m`);
        }
        if (rowData.nbrJours > 0) {
            parts.push(`${rowData.nbrJours}j`);
        }
        if (rowData.nbrHeures > 0) {
            parts.push(`${rowData.nbrHeures}h`);
        }
        
        return parts.length > 0 ? parts.join(' ') : '-';
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Formation/Stage"
                visible={editFormationStageDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditFormationStageDialog(false)}
            >
                <FormationStageForm
                    formationStage={formationStageEdit}
                    employeeName={employeeNameEdit}
                    domaines={domaines}
                    typeDiplomes={typeDiplomes}
                    selectedDomaine={selectedDomaine}
                    selectedTypeDiplome={selectedTypeDiplome}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleCalendarChange={handleCalendarChange}
                    handleDropDownSelect={handleDropDownSelect}
                    handleRadioChange={handleRadioChange}
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
                <TabPanel header="Nouvelle Formation/Stage">
                    <FormationStageForm
                        formationStage={formationStage}
                        employeeName={employeeName}
                        domaines={domaines}
                        typeDiplomes={typeDiplomes}
                        selectedDomaine={selectedDomaine}
                        selectedTypeDiplome={selectedTypeDiplome}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleCalendarChange={handleCalendarChange}
                        handleDropDownSelect={handleDropDownSelect}
                        handleRadioChange={handleRadioChange}
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
                                        setFormationStage(new FormationStage());
                                        setEmployeeName('');
                                        setSelectedDomaine(null);
                                        setSelectedTypeDiplome(null);
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
                <TabPanel header="Toutes les Formations/Stages">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredFormationStages}
                                    header={renderSearch}
                                    emptyMessage={"Pas de formations à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column 
                                        field="domaineId" 
                                        header="Domaine"
                                        body={(rowData) => getDomaineLabel(rowData.domaineId)}
                                        sortable 
                                    />
                                    <Column field="institut" header="Institut" sortable />
                                    <Column field="dateDebut" header="Date Début" sortable />
                                    <Column field="dateFin" header="Date Fin" sortable />
                                    <Column 
                                        header="Durée" 
                                        body={durationBodyTemplate}
                                    />
                                    <Column 
                                        field="diplomeCertificat" 
                                        header="Type"
                                        body={(rowData) => getDiplomeCertificatLabel(rowData.diplomeCertificat)}
                                        sortable 
                                    />
                                    <Column 
                                        field="typeDiplomeId" 
                                        header="Type Diplôme"
                                        body={(rowData) => rowData.typeDiplomeId ? getTypeDiplomeLabel(rowData.typeDiplomeId) : '-'}
                                    />
                                    <Column field="description" header="Description" />
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

export default FormationStageComponent;