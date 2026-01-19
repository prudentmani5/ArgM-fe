'use client';

import { useEffect, useRef, useState } from "react";
import { Sortie } from "./Sortie";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import SortieForm from "./SortieForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from "primereact/inputnumber";
import { API_BASE_URL } from '@/utils/apiConfig';
import { formatLocalDateFR } from '@/utils/dateUtils';

const SortieComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    
    const [sortie, setSortie] = useState<Sortie>(new Sortie());
    const [sortieEdit, setSortieEdit] = useState<Sortie>(new Sortie());
    const [editSortieDialog, setEditSortieDialog] = useState(false);
    const [sorties, setSorties] = useState<Sortie[]>([]);
    const [dateSortie, setDateSortie] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay()));
    const [filteredSorties, setFilteredSorties] = useState<Sortie[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchExercice, setSearchExercice] = useState<number>(new Date().getFullYear());
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeeNameEdit, setEmployeeNameEdit] = useState<string>('');
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: searchSortieData, loading: searchSortieLoading, error: searchSortieError, fetchData: fetchSearchSortie, callType: searchSortieCallType } = useConsumApi('');
    


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
        if (data) {
            if (callType === 'loadSorties') {
                setSorties(Array.isArray(data) ? data : [data]);
                setFilteredSorties(Array.isArray(data) ? data : [data]);
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

        if (searchSortieData && searchSortieCallType === 'searchSorties') {
            const searchResults = Array.isArray(searchSortieData) ? searchSortieData : [searchSortieData];
            setFilteredSorties(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucune sortie trouvée pour ce matricule et exercice.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} sortie(s) trouvée(s).`);
            }
        }

        if (searchSortieError && searchSortieCallType === 'searchSorties') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des sorties.');
            setFilteredSorties([]);
        }
        
        handleAfterApiCall(activeIndex);
    }, [data, searchData, searchError, searchSortieData, searchSortieError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editSortieDialog) {
            setSortie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setSortieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleNumberChange = (e: any) => {
        const fieldName = e.originalEvent.target.name;
        const value = e.value || 0;
        
        if (!editSortieDialog) {
            setSortie((prev) => ({ ...prev, [fieldName]: value }));
        } else {
            setSortieEdit((prev) => ({ ...prev, [fieldName]: value }));
        }
    };

    const handleCalendarChange = (e: any) => {
        const fieldName = e.target.name;
        const date = e.value as Date;
        setDateSortie(date);
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;
        
        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleExerciceChange = (exercice: number) => {
        // Additional logic if needed when exercice changes
        console.log('Exercice changed to:', exercice);
    };

    const handleSearchSorties = (matriculeValue: string, exerciceValue: number) => {
        if (matriculeValue.trim() === '') {
            // No matricule - load by exercice only
            loadSortiesByExercice(exerciceValue);
            return;
        }

        // Matricule provided - search by matricule AND exercice
        console.log('Searching sorties by matricule and exercice:', matriculeValue, exerciceValue);
        fetchSearchSortie(null, 'Get',
            `${baseUrl}/api/grh/sorties/matricule/${encodeURIComponent(matriculeValue.trim())}/exercice/${exerciceValue}`,
            'searchSorties'
        );
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        const timeoutId = setTimeout(() => {
            handleSearchSorties(value, searchExercice);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleSearchExerciceChange = (e: any) => {
        const value = e.value || new Date().getFullYear();
        setSearchExercice(value);

        // Always reload data when exercice changes (either by exercice only or matricule + exercice)
        handleSearchSorties(searchTerm, value);
    };

    const handleSubmit = () => {
        const dateSortieS = formatLocalDateFR(dateSortie);
        console.log('=== handleSubmit Debug ===');
        console.log('Raw dateSortie (Date object):', dateSortie);
        console.log('Formatted dateSortieS:', dateSortieS);

        const dataToSend = {
            ...sortie,
            dateSortie: dateSortieS
        };
        console.log('Data sent to the backend:', dataToSend);

        setBtnLoading(true);
        fetchData(dataToSend, 'Post', baseUrl + '/api/grh/sorties/new', 'createSortie');
    };

    const handleSubmitEdit = () => {
        const dateSortieS = formatLocalDate(dateSortie);
        console.log('=== handleSubmitEdit Debug ===');
        console.log('Raw dateSortie (Date object):', dateSortie);
        console.log('Formatted dateSortieS:', dateSortieS);

        const dataToSend = {
            ...sortieEdit,
            dateSortie: dateSortieS
        };
        console.log('Data sent to the backend:', dataToSend);

        setBtnLoading(true);
        fetchData(dataToSend, 'Put', baseUrl + '/api/grh/sorties/update/' + sortieEdit.sortieId, 'updateSortie');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateSortie')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateSortie')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des sorties.');
        else if (data !== null && error === null) {
            if (callType === 'createSortie') {
                setSortie(new Sortie());
                setEmployeeName('');
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateSortie') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setSortieEdit(new Sortie());
                setEmployeeNameEdit('');
                setEditSortieDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterSortie = () => {
        const currentYear = new Date().getFullYear();
        setSearchTerm('');
        setSearchExercice(currentYear);
        // Reload sorties for current year
        loadSortiesByExercice(currentYear);
    };

    const loadSortieToEdit = (data: Sortie) => {
        if (data) {
            setEditSortieDialog(true);
            setSortieEdit(data);
            
            // Load employee name for edit mode
            if (data.matriculeId) {
                fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + data.matriculeId, 'searchByMatriculeEdit');
            }
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadSortieToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/sorties/findall', 'loadSorties');
    };

    const loadSortiesByExercice = (exercice: number) => {
        console.log('Loading sorties by exercice:', exercice);
        fetchSearchSortie(null, 'Get', `${baseUrl}/api/grh/sorties/exercice/${exercice}`, 'searchSorties');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            // Load sorties by current exercice when switching to "Toutes les Sorties" tab
            loadSortiesByExercice(searchExercice);
        } else {
            setSortie(new Sortie());
            setEmployeeName('');
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <div className="flex gap-2">
                    <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterSortie} />
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

    const dateBodyTemplate = (rowData: Sortie) => {
        const date = rowData.dateSortie;
        return date ? new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date)) : '-';
    };

    const durationBodyTemplate = (rowData: Sortie) => {
        const parts = [];

        if (rowData.nbrJours > 0) {
            parts.push(`${rowData.nbrJours}j`);
        }

        if (rowData.nbrHeures > 0) {
            parts.push(`${rowData.nbrHeures}h`);
        }
        if (rowData.nbrMinute > 0) {
            parts.push(`${rowData.nbrMinute}min`);
        }

        return parts.length > 0 ? parts.join(' ') : '-';
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Sortie"
                visible={editSortieDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditSortieDialog(false)}
            >
                <SortieForm
                    sortie={sortieEdit}
                    employeeName={employeeNameEdit}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleCalendarChange={handleCalendarChange}
                    isEditMode={true}
                    dateSortie={dateSortie}
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
                <TabPanel header="Nouvelle Sortie">
                    <SortieForm
                        sortie={sortie}
                        employeeName={employeeName}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleCalendarChange={handleCalendarChange}
                        handleMatriculeBlur={handleMatriculeBlur}
                        handleExerciceChange={handleExerciceChange}
                        searchLoading={searchLoading}
                        dateSortie={dateSortie}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => {
                                        setSortie(new Sortie());
                                        setEmployeeName('');
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
                <TabPanel header="Toutes les Sorties">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredSorties}
                                    header={renderSearch}
                                    emptyMessage={"Pas de sorties à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column field="nom" header="Nom" sortable />
                                    <Column field="prenom" header="Prénom" sortable />
                                    <Column field="exercice" header="Exercice" sortable />
                                    <Column 
                                        field="dateSortie" 
                                        header="Date/Heure Sortie" 
                                        body={dateBodyTemplate}
                                        sortable 
                                    />
                                    <Column 
                                        header="Durée" 
                                        body={durationBodyTemplate}
                                    />
                                    <Column field="justification" header="Justification" />
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

export default SortieComponent;