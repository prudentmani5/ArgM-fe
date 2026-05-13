'use client';

import { useEffect, useRef, useState } from "react";
import { Diplome } from "./Diplome";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import DiplomeForm from "./DiplomeForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from "primereact/dropdown";
import { Pays } from "../../settings/pays/Pays";
import { API_BASE_URL } from '@/utils/apiConfig';

interface TypeDiplome {
    typeDiplomeId: string;
    libelle: string;
}

const DiplomeComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    
    const [diplome, setDiplome] = useState<Diplome>(new Diplome());
    const [diplomeEdit, setDiplomeEdit] = useState<Diplome>(new Diplome());
    const [editDiplomeDialog, setEditDiplomeDialog] = useState(false);
    const [diplomes, setDiplomes] = useState<Diplome[]>([]);
    const [filteredDiplomes, setFilteredDiplomes] = useState<Diplome[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeeNameEdit, setEmployeeNameEdit] = useState<string>('');
    
    // Dropdown states
    const [typeDiplomes, setTypeDiplomes] = useState<TypeDiplome[]>([]);
    const [pays, setPays] = useState<Pays[]>([]);
    const [selectedTypeDiplome, setSelectedTypeDiplome] = useState<TypeDiplome | null>(null);
    const [selectedPays, setSelectedPays] = useState<Pays | null>(null);
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: searchDiplomeData, loading: searchDiplomeLoading, error: searchDiplomeError, fetchData: fetchSearchDiplome, callType: searchDiplomeCallType } = useConsumApi('');
    const { data: typeDiplomeData, loading: typeDiplomeLoading, error: typeDiplomeError, fetchData: fetchTypeDiplomes, callType: typeDiplomeCallType } = useConsumApi('');
    const { data: paysData, loading: paysLoading, error: paysError, fetchData: fetchPays, callType: paysCallType } = useConsumApi('');
    
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
        loadAllTypeDiplomes();
        loadAllPays();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadDiplomes') {
                setDiplomes(Array.isArray(data) ? data : [data]);
                setFilteredDiplomes(Array.isArray(data) ? data : [data]);
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

        if (searchDiplomeData && searchDiplomeCallType === 'searchDiplomes') {
            const searchResults = Array.isArray(searchDiplomeData) ? searchDiplomeData : [searchDiplomeData];
            setFilteredDiplomes(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucun diplôme trouvé pour ce matricule.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} diplôme(s) trouvé(s).`);
            }
        }

        if (searchDiplomeError && searchDiplomeCallType === 'searchDiplomes') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des diplômes.');
            setFilteredDiplomes([]);
        }
        
        if (typeDiplomeData && typeDiplomeCallType === 'loadTypeDiplomes') {
            setTypeDiplomes(Array.isArray(typeDiplomeData) ? typeDiplomeData : [typeDiplomeData]);
        }
        
        if (paysData && paysCallType === 'loadPays') {
            setPays(Array.isArray(paysData) ? paysData : [paysData]);
        }
        
        handleAfterApiCall(activeIndex);
    }, [data, searchData, searchError, searchDiplomeData, searchDiplomeError, typeDiplomeData, paysData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editDiplomeDialog) {
            setDiplome((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setDiplomeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleNumberChange = (e: any) => {
        const fieldName = e.originalEvent.target.name;
        const value = e.value || 0;
        
        if (!editDiplomeDialog) {
            setDiplome((prev) => ({ ...prev, [fieldName]: value }));
        } else {
            setDiplomeEdit((prev) => ({ ...prev, [fieldName]: value }));
        }
    };

    const handleCalendarChange = (e: any) => {
        const fieldName = e.target.name;
        const date = e.value as Date;
        const formattedDate = date ? formatDateToString(date) : '';
        
        if (!editDiplomeDialog) {
            setDiplome((prev) => ({ ...prev, [fieldName]: formattedDate }));
        } else {
            setDiplomeEdit((prev) => ({ ...prev, [fieldName]: formattedDate }));
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
        
        if (fieldName === 'typeDiplomeId') {
            const typeDiplome = typeDiplomes.find(t => t.typeDiplomeId === value);
            if (!editDiplomeDialog) {
                setDiplome((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedTypeDiplome(typeDiplome || null);
            } else {
                setDiplomeEdit((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedTypeDiplome(typeDiplome || null);
            }
        } else if (fieldName === 'paysId') {
            const country = pays.find(p => p.paysId === value);
            if (!editDiplomeDialog) {
                setDiplome((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedPays(country || null);
            } else {
                setDiplomeEdit((prev) => ({ ...prev, [fieldName]: value }));
                setSelectedPays(country || null);
            }
        }
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;
        
        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleSearchDiplomes = (searchValue: string) => {
        if (searchValue.trim() === '') {
            setFilteredDiplomes(diplomes);
            return;
        }
        
        console.log('Searching diplomes by matricule:', searchValue);
        fetchSearchDiplome(null, 'Get', baseUrl + '/api/grh/diplomes/matricule/' + encodeURIComponent(searchValue.trim()), 'searchDiplomes');
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        const timeoutId = setTimeout(() => {
            handleSearchDiplomes(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', diplome);
        fetchData(diplome, 'Post', baseUrl + '/api/grh/diplomes/new', 'createDiplome');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', diplomeEdit);
        fetchData(diplomeEdit, 'Put', baseUrl + '/api/grh/diplomes/update/' + diplomeEdit.diplomePersId, 'updateDiplome');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateDiplome')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateDiplome')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des diplômes.');
        else if (data !== null && error === null) {
            if (callType === 'createDiplome') {
                setDiplome(new Diplome());
                setEmployeeName('');
                setSelectedTypeDiplome(null);
                setSelectedPays(null);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateDiplome') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setDiplomeEdit(new Diplome());
                setEmployeeNameEdit('');
                setSelectedTypeDiplome(null);
                setSelectedPays(null);
                setEditDiplomeDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterDiplome = () => {
        setSearchTerm('');
        setFilteredDiplomes(diplomes);
    };

    const loadDiplomeToEdit = (data: Diplome) => {
        if (data) {
            setEditDiplomeDialog(true);
            setDiplomeEdit(data);
            
            // Set selected dropdown values
            const typeDiplome = typeDiplomes.find(t => t.typeDiplomeId === data.typeDiplomeId);
            if (typeDiplome) setSelectedTypeDiplome(typeDiplome);
            
            const country = pays.find(p => p.paysId === data.paysId);
            if (country) setSelectedPays(country);
            
            // Load employee name for edit mode
            if (data.matriculeId) {
                fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + data.matriculeId, 'searchByMatriculeEdit');
            }
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadDiplomeToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/diplomes/findall', 'loadDiplomes');
    };

    const loadAllTypeDiplomes = () => {
        // Assuming you have a TypeDiplome endpoint similar to TypeConge
        fetchTypeDiplomes(null, 'Get', baseUrl + '/typediplomes/findall', 'loadTypeDiplomes');
    };

    const loadAllPays = () => {
        fetchPays(null, 'Get', baseUrl + '/pays/findall', 'loadPays');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setDiplome(new Diplome());
            setEmployeeName('');
            setSelectedTypeDiplome(null);
            setSelectedPays(null);
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterDiplome} />
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

    const getTypeDiplomeLabel = (typeDiplomeId: string) => {
        const typeDiplome = typeDiplomes.find(t => t.typeDiplomeId === typeDiplomeId);
        return typeDiplome ? typeDiplome.libelle : typeDiplomeId;
    };

    const getPaysLabel = (paysId: string) => {
        const country = pays.find(p => p.paysId === paysId);
        return country ? country.nomPays : paysId;
    };

    const noteBodyTemplate = (rowData: Diplome) => {
        return `${rowData.note} / 20`;
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Diplôme"
                visible={editDiplomeDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditDiplomeDialog(false)}
            >
                <DiplomeForm
                    diplome={diplomeEdit}
                    employeeName={employeeNameEdit}
                    typeDiplomes={typeDiplomes}
                    pays={pays}
                    selectedTypeDiplome={selectedTypeDiplome}
                    selectedPays={selectedPays}
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
                <TabPanel header="Nouveau Diplôme">
                    <DiplomeForm
                        diplome={diplome}
                        employeeName={employeeName}
                        typeDiplomes={typeDiplomes}
                        pays={pays}
                        selectedTypeDiplome={selectedTypeDiplome}
                        selectedPays={selectedPays}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleCalendarChange={handleCalendarChange}
                        handleDropDownSelect={handleDropDownSelect}
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
                                        setDiplome(new Diplome());
                                        setEmployeeName('');
                                        setSelectedTypeDiplome(null);
                                        setSelectedPays(null);
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
                <TabPanel header="Tous les Diplômes">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredDiplomes}
                                    header={renderSearch}
                                    emptyMessage={"Pas de diplômes à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column 
                                        field="typeDiplomeId" 
                                        header="Type de Diplôme"
                                        body={(rowData) => getTypeDiplomeLabel(rowData.typeDiplomeId)}
                                        sortable 
                                    />
                                    <Column field="institut" header="Institut" sortable />
                                    <Column 
                                        field="paysId" 
                                        header="Pays"
                                        body={(rowData) => getPaysLabel(rowData.paysId)}
                                        sortable 
                                    />
                                    <Column field="dateObtention" header="Date d'Obtention" sortable />
                                    <Column 
                                        field="note" 
                                        header="Note"
                                        body={noteBodyTemplate}
                                        sortable 
                                    />
                                    <Column field="referenceEquivalence" header="Référence" />
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

export default DiplomeComponent;