'use client';

import { useEffect, useRef, useState } from "react";
import { Cotation } from "./Cotation";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import CotationForm from "./CotationForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Notation } from "../../settings/notation/Notation";
import { GrhRensIdentification } from "../grhRensIdentification/GrhRensIdentification";
import { API_BASE_URL } from '@/utils/apiConfig';

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

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: notationData, loading: notationsLoading, error: notationError, fetchData: fetchNotations, callType: notationCallType } = useConsumApi('');
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployee, callType: employeeCallType } = useConsumApi('');
    const { data: carriereData, loading: carriereLoading, error: carriereError, fetchData: fetchCarriere, callType: carriereCallType } = useConsumApi('');
    const { data: searchCotationData, fetchData: fetchSearchCotation, callType: searchCotationCallType } = useConsumApi('');
    
    const toast = useRef<Toast>(null);

    // State for dropdown options
    const [notations, setNotations] = useState<Notation[]>([]);
    const [selectedNotation, setSelectedNotation] = useState<Notation | null>(null);

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
        if (data) {
            if (callType === 'loadCotations') {
                setCotations(Array.isArray(data) ? data : [data]);
                setFilteredCotations(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
        
        if (notationData && notationCallType === 'loadNotations') {
            setNotations(Array.isArray(notationData) ? notationData : [notationData]);
        }

        if (employeeData && employeeCallType === 'searchByMatricule') {
            const foundEmployee = employeeData as GrhRensIdentification;
            setCotation(prev => ({
                ...prev,
                employeeName: foundEmployee.nom,
                employeeFirstName: foundEmployee.prenom,
                statut: foundEmployee.situationId
            }));
            
            accept('info', 'Employé trouvé', 'Les données de l\'employé ont été chargées.');
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
            setCotation(prev => ({
                ...prev,
                baseAncienne: carriere.base || 0
            }));
        }

        // Handle search cotation data response
        if (searchCotationData && searchCotationCallType === 'searchCotations') {
            const results = Array.isArray(searchCotationData) ? searchCotationData : [searchCotationData];
            setCotations(results);
            setFilteredCotations(results);
        }
    }, [data, notationData, employeeData, employeeError, carriereData, searchCotationData]);

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
                setSelectedNotation(notation);
                if (!editCotationDialog) {
                    setCotation((prev) => ({
                        ...prev,
                        [name]: notation.notations,
                        nbrPoints1: notation.limite1,
                        nbrPoints2: notation.limite2
                    }));
                } else {
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

        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchEmployee(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
        // Also fetch career data to get baseAncienne
        fetchCarriere(null, 'Get', baseUrl + '/api/grh/carriere/' + matriculeId, 'searchCarriere');
    };

    const loadCotationsByExercice = (exercice: number) => {
        fetchSearchCotation(null, 'Get', `${baseUrl}/api/grh/cotations/exercice/${exercice}`, 'searchCotations');
    };

    const loadCotationsByMatriculeAndExercice = (matricule: string, exercice: number) => {
        fetchSearchCotation(null, 'Get',
            `${baseUrl}/api/grh/cotations/matricule/${encodeURIComponent(matricule.trim())}/exercice/${exercice}`,
            'searchCotations'
        );
    };

    const handleSearchCotations = (matriculeValue: string, exerciceValue: number) => {
        if (matriculeValue.trim() === '') {
            loadCotationsByExercice(exerciceValue);
        } else {
            loadCotationsByMatriculeAndExercice(matriculeValue, exerciceValue);
        }
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        handleSearchCotations(value, searchExercice);
    };

    const handleSearchExerciceChange = (e: any) => {
        const value = e.value || new Date().getFullYear();
        setSearchExercice(value);
        handleSearchCotations(searchTerm, value);
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', cotation);
        fetchData(cotation, 'Post', baseUrl + '/api/grh/cotations/new', 'createCotation');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', cotationEdit);
        fetchData(cotationEdit, 'Put', baseUrl + '/api/grh/cotations/update/' + cotationEdit.cotationId, 'updateCotation');
    };

    const handleAfterApiCall = (chosenTab: number) => {
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
                setSelectedNotation(null);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateCotation') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setCotationEdit(new Cotation());
                setSelectedNotation(null);
                setEditCotationDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterCotation = () => {
        const currentYear = new Date().getFullYear();
        setSearchTerm('');
        setSearchExercice(currentYear);
        loadCotationsByExercice(currentYear);
    };

    const loadCotationToEdit = (data: Cotation) => {
        if (data) {
            setEditCotationDialog(true);
            setCotationEdit(data);
            
            // Find and set the selected notation based on the cote value
            const notation = notations.find(n => n.notations === data.cote);
            if (notation) {
                setSelectedNotation(notation);
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

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/cotations/findall', 'loadCotations');
    };

    const loadAllNotations = () => {
        fetchNotations(null, 'Get', baseUrl + '/notations/findall', 'loadNotations');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadCotationsByExercice(searchExercice);
        } else {
            setCotation(new Cotation());
            setSelectedNotation(null);
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
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    placeholder="Rechercher par Matricule"
                />
            </span>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Cotation"
                visible={editCotationDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditCotationDialog(false)}
            >
                <CotationForm
                    cotation={cotationEdit}
                    notations={notations}
                    selectedNotation={selectedNotation}
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

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <CotationForm
                        cotation={cotation}
                        notations={notations}
                        selectedNotation={selectedNotation}
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
                                        setCotation(new Cotation());
                                        setSelectedNotation(null);
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
                                    value={filteredCotations}
                                    header={renderSearch}
                                    emptyMessage={"Pas de cotations à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
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
            </TabView>
        </>
    );
};

export default CotationComponent;