'use client';

import { useEffect, useRef, useState } from "react";
import { Absence } from "./Absence";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import AbsenceForm from "./AbsenceForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const AbsenceComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    
    const [absence, setAbsence] = useState<Absence>(new Absence());
    const [absenceEdit, setAbsenceEdit] = useState<Absence>(new Absence());
    const [editAbsenceDialog, setEditAbsenceDialog] = useState(false);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [filteredAbsences, setFilteredAbsences] = useState<Absence[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeeNameEdit, setEmployeeNameEdit] = useState<string>('');
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: searchAbsenceData, loading: searchAbsenceLoading, error: searchAbsenceError, fetchData: fetchSearchAbsence, callType: searchAbsenceCallType } = useConsumApi('');
    
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
            if (callType === 'loadAbsences') {
                setAbsences(Array.isArray(data) ? data : [data]);
                setFilteredAbsences(Array.isArray(data) ? data : [data]);
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

        if (searchAbsenceData && searchAbsenceCallType === 'searchAbsences') {
            const searchResults = Array.isArray(searchAbsenceData) ? searchAbsenceData : [searchAbsenceData];
            setFilteredAbsences(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucune absence trouvée pour ce matricule.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} absence(s) trouvée(s).`);
            }
        }

        if (searchAbsenceError && searchAbsenceCallType === 'searchAbsences') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des absences.');
            setFilteredAbsences([]);
        }
        
        handleAfterApiCall(activeIndex);
    }, [data, searchData, searchError, searchAbsenceData, searchAbsenceError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editAbsenceDialog) {
            setAbsence((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setAbsenceEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleNumberChange = (e: any) => {
        const fieldName = e.originalEvent.target.name;
        const value = e.value || 0;

        if (!editAbsenceDialog) {
            const updatedAbsence = { ...absence, [fieldName]: value };

            // Calculate Date Fin when Nombre de Jours changes
            if (fieldName === 'nbrJours' && updatedAbsence.dateDebut) {
                updatedAbsence.dateFin = calculateDateFin(updatedAbsence.dateDebut, value);
            }

            setAbsence(updatedAbsence);
        } else {
            const updatedAbsence = { ...absenceEdit, [fieldName]: value };

            // Calculate Date Fin when Nombre de Jours changes
            if (fieldName === 'nbrJours' && updatedAbsence.dateDebut) {
                updatedAbsence.dateFin = calculateDateFin(updatedAbsence.dateDebut, value);
            }

            setAbsenceEdit(updatedAbsence);
        }
    };

    const handleCheckboxChange = (e: any) => {
        const fieldName = e.target.name;
        const checked = e.checked;
        
        if (!editAbsenceDialog) {
            setAbsence((prev) => ({ ...prev, [fieldName]: checked }));
        } else {
            setAbsenceEdit((prev) => ({ ...prev, [fieldName]: checked }));
        }
    };

    const handleCalendarChange = (e: any) => {
        const fieldName = e.target.name;
        const date = e.value as Date;
        const formattedDate = date ? formatDateToString(date) : '';

        if (!editAbsenceDialog) {
            const updatedAbsence = { ...absence, [fieldName]: formattedDate };

            // Calculate Date Fin when Date Début changes and we have Nombre de Jours
            if (fieldName === 'dateDebut' && updatedAbsence.nbrJours > 0) {
                updatedAbsence.dateFin = calculateDateFin(formattedDate, updatedAbsence.nbrJours);
            }

            setAbsence(updatedAbsence);
        } else {
            const updatedAbsence = { ...absenceEdit, [fieldName]: formattedDate };

            // Calculate Date Fin when Date Début changes and we have Nombre de Jours
            if (fieldName === 'dateDebut' && updatedAbsence.nbrJours > 0) {
                updatedAbsence.dateFin = calculateDateFin(formattedDate, updatedAbsence.nbrJours);
            }

            setAbsenceEdit(updatedAbsence);
        }
    };

    const formatDateToString = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${day}/${month}/${year}`;
    };

    const calculateDateFin = (dateDebut: string, nbrJours: number): string => {
        if (!dateDebut || nbrJours <= 0) return '';

        // Parse dateDebut from dd/mm/yyyy format
        const parts = dateDebut.split('/');
        if (parts.length !== 3) return '';

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
        const year = parseInt(parts[2], 10);

        // Create date object
        const startDate = new Date(year, month, day);

        // Add nbrJours - 1 (because if absence starts on day 1 for 1 day, it ends on day 1)
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + nbrJours - 1);

        // Format back to dd/mm/yyyy
        return formatDateToString(endDate);
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;
        
        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleSearchAbsences = (searchValue: string) => {
        if (searchValue.trim() === '') {
            setFilteredAbsences(absences);
            return;
        }
        
        console.log('Searching absences by matricule:', searchValue);
        fetchSearchAbsence(null, 'Get', baseUrl + '/api/grh/absences/matricule/' + encodeURIComponent(searchValue.trim()), 'searchAbsences');
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        const timeoutId = setTimeout(() => {
            handleSearchAbsences(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', absence);
        fetchData(absence, 'Post', baseUrl + '/api/grh/absences/new', 'createAbsence');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', absenceEdit);
        fetchData(absenceEdit, 'Put', baseUrl + '/api/grh/absences/update/' + absenceEdit.absenceId, 'updateAbsence');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateAbsence')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateAbsence')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des absences.');
        else if (data !== null && error === null) {
            if (callType === 'createAbsence') {
                setAbsence(new Absence());
                setEmployeeName('');
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateAbsence') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setAbsenceEdit(new Absence());
                setEmployeeNameEdit('');
                setEditAbsenceDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterAbsence = () => {
        setSearchTerm('');
        setFilteredAbsences(absences);
    };

    const loadAbsenceToEdit = (data: Absence) => {
        if (data) {
            setEditAbsenceDialog(true);
            setAbsenceEdit(data);
            
            // Load employee name for edit mode
            if (data.matriculeId) {
                fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + data.matriculeId, 'searchByMatriculeEdit');
            }
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadAbsenceToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/absences/findall', 'loadAbsences');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setAbsence(new Absence());
            setEmployeeName('');
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterAbsence} />
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

    const getJustifiedLabel = (estJustifie: boolean) => {
        return estJustifie ? 'Oui' : 'Non';
    };

    const dateBodyTemplate = (rowData: Absence, field: string) => {
        const date = rowData[field as keyof Absence] as string;
        return date || '-';
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Absence"
                visible={editAbsenceDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditAbsenceDialog(false)}
            >
                <AbsenceForm
                    absence={absenceEdit}
                    employeeName={employeeNameEdit}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleCheckboxChange={handleCheckboxChange}
                    handleCalendarChange={handleCalendarChange}
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
                <TabPanel header="Nouvelle Absence">
                    <AbsenceForm
                        absence={absence}
                        employeeName={employeeName}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleCalendarChange={handleCalendarChange}
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
                                        setAbsence(new Absence());
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
                <TabPanel header="Toutes les Absences">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredAbsences}
                                    header={renderSearch}
                                    emptyMessage={"Pas d'absences à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column
                                        field="dateDebut"
                                        header="Date Début"
                                        body={(rowData) => dateBodyTemplate(rowData, 'dateDebut')}
                                        sortable
                                    />
                                    <Column
                                        field="dateFin"
                                        header="Date Fin"
                                        body={(rowData) => dateBodyTemplate(rowData, 'dateFin')}
                                        sortable
                                    />
                                    <Column field="nbrJours" header="Jours" sortable />
                                    <Column
                                        field="estJustifie"
                                        header="Justifiée"
                                        body={(rowData) => getJustifiedLabel(rowData.estJustifie)}
                                        sortable
                                    />
                                    <Column field="reference" header="Référence" sortable />
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

export default AbsenceComponent;