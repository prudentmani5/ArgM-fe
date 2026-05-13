'use client';

import { useEffect, useRef, useState } from "react";
import { AyantDroit } from "./AyantDroit";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import AyantDroitForm from "./AyantDroitForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useCurrentUser } from "../../../../../hooks/fetchData/useCurrentUser";
import { API_BASE_URL } from '@/utils/apiConfig';
import { useAuthorities } from "../../../../../hooks/useAuthorities";

const AyantDroitComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const { hasAuthority, hasAnyAuthority } = useAuthorities();

    // Authority checks for tab visibility
    const canViewNouveauTab = hasAuthority('RH_MANAGER');
    const canViewConsultationTab = hasAnyAuthority(['RH_MANAGER', 'RH_OPERATEUR_SAISIE']);

    const [ayantDroit, setAyantDroit] = useState<AyantDroit>(new AyantDroit());
    const [ayantDroitEdit, setAyantDroitEdit] = useState<AyantDroit>(new AyantDroit());
    const [editAyantDroitDialog, setEditAyantDroitDialog] = useState(false);
    const [ayantDroits, setAyantDroits] = useState<AyantDroit[]>([]);
    const [filteredAyantDroits, setFilteredAyantDroits] = useState<AyantDroit[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeeNameEdit, setEmployeeNameEdit] = useState<string>('');
    const [employeeFirstName, setEmployeeFirstName] = useState<string>('');
    const [employeeLastName, setEmployeeLastName] = useState<string>('');
    const [employeeFirstNameEdit, setEmployeeFirstNameEdit] = useState<string>('');
    const [employeeLastNameEdit, setEmployeeLastNameEdit] = useState<string>('');

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: searchAyantDroitData, loading: searchAyantDroitLoading, error: searchAyantDroitError, fetchData: fetchSearchAyantDroit, callType: searchAyantDroitCallType } = useConsumApi('');

    const toast = useRef<Toast>(null);
    const hasLoadedAyantDroitsRef = useRef<boolean>(false);
    const lastMatriculeSearchedRef = useRef<string>('');
    const lastProcessedCallRef = useRef<{ data: any; callType: string } | null>(null);
    const lastSearchDataRef = useRef<any>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { user: appUser, loading: userLoading, error: userError } = useCurrentUser();

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        // Process main data hook (but skip if already processed)
        if (data && !(lastProcessedCallRef.current?.data === data && lastProcessedCallRef.current?.callType === callType)) {
            // Mark this response as processed
            lastProcessedCallRef.current = { data, callType };

            if (callType === 'loadAyantDroits') {
                const allData = Array.isArray(data) ? data : [data];
                setAyantDroits(allData);
                setFilteredAyantDroits(allData);
            } else if (callType === 'createAyantDroit') {
                // After creating, reload the list for the current employee
                const currentMatricule = ayantDroit.matriculeId;

                // Reset form but keep matricule (employeeName is already preserved in state)
                setAyantDroit({
                    ...new AyantDroit(),
                    matriculeId: currentMatricule
                });

                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
                setBtnLoading(false);

                // Reload the ayant droits list for this employee
                if (currentMatricule) {
                    fetchSearchAyantDroit(null, 'Get', baseUrl + '/api/grh/ayant-droit/matricule/' + encodeURIComponent(currentMatricule), 'loadAyantDroitsAfterSave');
                }
            } else if (callType === 'updateAyantDroit') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                const editedMatricule = ayantDroitEdit.matriculeId;
                setAyantDroitEdit(new AyantDroit());
                setEmployeeNameEdit('');
                setEmployeeFirstNameEdit('');
                setEmployeeLastNameEdit('');
                setEditAyantDroitDialog(false);
                setBtnLoading(false);
                // Reload ayant droits for the specific employee instead of all data
                if (editedMatricule) {
                    fetchSearchAyantDroit(null, 'Get', baseUrl + '/api/grh/ayant-droit/matricule/' + encodeURIComponent(editedMatricule), 'loadAyantDroitsAfterSave');
                }
            } else if (callType === 'deleteAyantDroit') {
                accept('info', 'OK', 'L\'ayant droit a été supprimé avec succès.');
                if (searchTerm) {
                    handleSearchAyantDroits(searchTerm);
                } else {
                    loadAllData();
                }
            }
        }

        if (error && (callType === 'createAyantDroit' || callType === 'updateAyantDroit')) {
            if (callType === 'createAyantDroit') {
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            } else {
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
            }
            setBtnLoading(false);
        }

        if (searchData && searchCallType === 'searchByMatricule') {
            if (searchData) {
                const foundEmployee = searchData as any;
                setEmployeeName(`${foundEmployee.nom} ${foundEmployee.prenom}`);
                setEmployeeFirstName(foundEmployee.prenom || '');
                setEmployeeLastName(foundEmployee.nom || '');

                // Only show toast and load ayant droits if this is a new search
                if (lastMatriculeSearchedRef.current !== ayantDroit.matriculeId) {
                    accept('info', 'Employé trouvé', 'Les données de l\'employé ont été chargées.');
                    lastMatriculeSearchedRef.current = ayantDroit.matriculeId;
                    hasLoadedAyantDroitsRef.current = false;

                    // Load existing ayant droits for this employee
                    fetchSearchAyantDroit(null, 'Get', baseUrl + '/api/grh/ayant-droit/matricule/' + encodeURIComponent(ayantDroit.matriculeId), 'loadAyantDroitsForEmployee');
                }
            }
            setSearchLoading(false);
        }

        if (searchData && searchCallType === 'searchByMatriculeEdit') {
            if (searchData) {
                const foundEmployee = searchData as any;
                setEmployeeNameEdit(`${foundEmployee.nom} ${foundEmployee.prenom}`);
                setEmployeeFirstNameEdit(foundEmployee.prenom || '');
                setEmployeeLastNameEdit(foundEmployee.nom || '');
            }
        }

        if (searchError && searchCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setEmployeeName('');
            setEmployeeFirstName('');
            setEmployeeLastName('');
            setFilteredAyantDroits([]);
            setSearchLoading(false);
        }

        if (searchAyantDroitData && searchAyantDroitCallType === 'searchAyantDroits') {
            if (lastSearchDataRef.current !== searchAyantDroitData) {
                lastSearchDataRef.current = searchAyantDroitData;
                const searchResults = Array.isArray(searchAyantDroitData) ? searchAyantDroitData : [searchAyantDroitData];
                setFilteredAyantDroits(searchResults);
            }
        }

        if (searchAyantDroitData && searchAyantDroitCallType === 'loadAyantDroitsForEmployee') {
            const results = Array.isArray(searchAyantDroitData) ? searchAyantDroitData : [searchAyantDroitData];
            setFilteredAyantDroits(results);
            // Only show toast if this is the first load for this employee
            if (!hasLoadedAyantDroitsRef.current && results.length > 0) {
                accept('info', 'Ayants Droit', `${results.length} ayant(s) droit trouvé(s) pour cet employé.`);
                hasLoadedAyantDroitsRef.current = true;
            }
        }

        if (searchAyantDroitData && searchAyantDroitCallType === 'loadAyantDroitsAfterSave') {
            const results = Array.isArray(searchAyantDroitData) ? searchAyantDroitData : [searchAyantDroitData];
            console.log('Updated ayant droits list after save:', results);
            setFilteredAyantDroits(results);
        }

        if (searchAyantDroitError && searchAyantDroitCallType === 'searchAyantDroits') {
            setFilteredAyantDroits([]);
        }
    }, [data, callType, error, searchData, searchCallType, searchError, searchAyantDroitData, searchAyantDroitCallType, searchAyantDroitError]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // If user only has Consultation tab access, load data on mount
    useEffect(() => {
        if (!canViewNouveauTab && canViewConsultationTab) {
            loadAllData();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editAyantDroitDialog) {
            setAyantDroit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setAyantDroitEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleCalendarChange = (e: any) => {
        const fieldName = e.target.name;
        const date = e.value as Date;
        const formattedDate = date ? formatDateToBackendString(date) : '';

        if (!editAyantDroitDialog) {
            setAyantDroit((prev) => ({ ...prev, [fieldName]: formattedDate }));
        } else {
            setAyantDroitEdit((prev) => ({ ...prev, [fieldName]: formattedDate }));
        }
    };

    const formatDateToBackendString = (date: Date): string => {
        // Use ISO 8601 format which Jackson handles automatically for LocalDateTime
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = '00';
        const minutes = '00';
        const seconds = '00';

        // Return ISO 8601 format: yyyy-MM-ddTHH:mm:ss
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const handleDropDownSelect = (e: DropdownChangeEvent) => {
        const fieldName = e.target.name;
        const value = e.target.value;

        if (!editAyantDroitDialog) {
            setAyantDroit((prev) => ({ ...prev, [fieldName]: value }));
        } else {
            setAyantDroitEdit((prev) => ({ ...prev, [fieldName]: value }));
        }
    };

    const handleCheckboxChange = (e: any) => {
        const checked = e.checked;

        if (!editAyantDroitDialog) {
            setAyantDroit((prev) => ({ ...prev, priseEnCharge: checked }));
        } else {
            setAyantDroitEdit((prev) => ({ ...prev, priseEnCharge: checked }));
        }
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleSearchAyantDroits = (searchValue: string) => {
        if (searchValue.trim() === '') {
            setFilteredAyantDroits(ayantDroits);
            return;
        }

        fetchSearchAyantDroit(null, 'Get', baseUrl + '/api/grh/ayant-droit/matricule/' + encodeURIComponent(searchValue.trim()), 'searchAyantDroits');
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Clear the previous timeout if it exists
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set a new timeout
        searchTimeoutRef.current = setTimeout(() => {
            handleSearchAyantDroits(value);
        }, 300);
    };

    const handleSubmit = () => {
        // Validation
        if (!ayantDroit.matriculeId || !ayantDroit.categorie || !ayantDroit.nom || !ayantDroit.dateNaissance) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        // Additional validation for Conjoint: Date de Mariage is mandatory
        if (ayantDroit.categorie === 'Conjoint' && !ayantDroit.dateMariage) {
            accept('warn', 'Validation', 'La Date de Mariage est obligatoire pour un Conjoint.');
            return;
        }

        setBtnLoading(true);

        // Handle the user name properly with null safety
        let userCreationName = 'Unknown';
        if (appUser?.lastname) {
            userCreationName = appUser.lastname; // Single name case
        }

        // Ensure userCreation is set before submitting
        const dataToSubmit = {
            ...ayantDroit,
            userCreation: userCreationName
        };

        console.log('Data sent to the backend:', dataToSubmit);
        fetchData(dataToSubmit, 'Post', baseUrl + '/api/grh/ayant-droit/new', 'createAyantDroit');
    };

    const handleSubmitEdit = () => {
        // Validation
        if (!ayantDroitEdit.matriculeId || !ayantDroitEdit.categorie || !ayantDroitEdit.nom || !ayantDroitEdit.dateNaissance) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        // Additional validation for Conjoint: Date de Mariage is mandatory
        if (ayantDroitEdit.categorie === 'Conjoint' && !ayantDroitEdit.dateMariage) {
            accept('warn', 'Validation', 'La Date de Mariage est obligatoire pour un Conjoint.');
            return;
        }

        setBtnLoading(true);

        // Handle the user name properly with null safety
        let userUpdateName = 'Unknown';
        if (appUser?.lastname) {
            userUpdateName = appUser.lastname; // Single name case
        }

        // Ensure userUpdate is set before submitting
        const dataToUpdate = {
            ...ayantDroitEdit,
            userUpdate: userUpdateName
        };

        console.log('Data sent to the backend:', dataToUpdate);
        fetchData(dataToUpdate, 'Put', baseUrl + '/api/grh/ayant-droit/update/' + ayantDroitEdit.rensAyantDroitId, 'updateAyantDroit');
    };

    const clearFilterAyantDroit = () => {
        setSearchTerm('');
        setFilteredAyantDroits(ayantDroits);
    };

    const loadAyantDroitToEdit = (data: AyantDroit) => {
        if (data) {
            setEditAyantDroitDialog(true);
            setAyantDroitEdit(data);

            // Load employee name for edit mode
            if (data.matriculeId) {
                fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + data.matriculeId, 'searchByMatriculeEdit');
            }
        }
    };

    const confirmDelete = (ayantDroitId: number) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer cet ayant droit?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => handleDelete(ayantDroitId),
        });
    };

    const handleDelete = (ayantDroitId: number) => {
        console.log('Deleting ayant droit with ID:', ayantDroitId);
        fetchData(null, 'Delete', baseUrl + '/api/grh/ayant-droit/delete/' + ayantDroitId, 'deleteAyantDroit');
    };

    const optionButtons = (data: AyantDroit, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadAyantDroitToEdit(data)}
                    raised
                    severity='warning'
                    tooltip="Modifier"
                />
                <Button
                    icon="pi pi-trash"
                    onClick={() => confirmDelete(data.rensAyantDroitId!)}
                    raised
                    severity='danger'
                    tooltip="Supprimer"
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/ayant-droit/findall', 'loadAyantDroits');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        // Determine the actual tab based on which tabs are visible
        // If only Consultation is visible, it's at index 0
        // If both are visible, Consultation is at index 1
        const isConsultationTab = canViewNouveauTab ? e.index === 1 : e.index === 0;

        if (isConsultationTab) {
            loadAllData();
        } else {
            setAyantDroit(new AyantDroit());
            setEmployeeName('');
            setEmployeeFirstName('');
            setEmployeeLastName('');
            setFilteredAyantDroits([]);
            // Reset refs when switching tabs
            hasLoadedAyantDroitsRef.current = false;
            lastMatriculeSearchedRef.current = '';
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterAyantDroit} />
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

    const categorieBodyTemplate = (rowData: AyantDroit) => {
        return (
            <span className={`badge ${rowData.categorie === 'Conjoint' ? 'bg-blue-500' : 'bg-green-500'} text-white px-2 py-1 rounded`}>
                {rowData.categorie}
            </span>
        );
    };

    const priseEnChargeBodyTemplate = (rowData: AyantDroit) => {
        return (
            <i className={`pi ${rowData.priseEnCharge ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'}`}
               style={{ fontSize: '1.5rem' }}
            />
        );
    };

    const loadAyantDroitToForm = (data: AyantDroit) => {
        setAyantDroit(data);
        setActiveIndex(0);

        // Load employee name
        if (data.matriculeId) {
            fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + data.matriculeId, 'searchByMatricule');
        }
    };

    const actionBodyTemplate = (rowData: AyantDroit) => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadAyantDroitToEdit(rowData)}
                    raised
                    severity='warning'
                    tooltip="Modifier"
                    size="small"
                />
                <Button
                    icon="pi pi-arrow-up"
                    onClick={() => loadAyantDroitToForm(rowData)}
                    raised
                    severity='info'
                    tooltip="Charger dans le formulaire"
                    size="small"
                />
                <Button
                    icon="pi pi-trash"
                    onClick={() => confirmDelete(rowData.rensAyantDroitId!)}
                    raised
                    severity='danger'
                    tooltip="Supprimer"
                    size="small"
                />
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Dialog
                header="Modifier Ayant Droit"
                visible={editAyantDroitDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditAyantDroitDialog(false)}
            >
                <AyantDroitForm
                    ayantDroit={ayantDroitEdit}
                    employeeName={employeeNameEdit}
                    employeeFirstName={employeeFirstNameEdit}
                    employeeLastName={employeeLastNameEdit}
                    handleChange={handleChange}
                    handleCalendarChange={handleCalendarChange}
                    handleDropDownSelect={handleDropDownSelect}
                    handleCheckboxChange={handleCheckboxChange}
                    isEditMode={true}
                />
                <div className="flex justify-content-end mt-3 gap-2">
                    <Button
                        icon="pi pi-times"
                        label="Annuler"
                        outlined
                        onClick={() => setEditAyantDroitDialog(false)}
                    />
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
                    <TabPanel header="Nouveau Ayant Droit">
                        <AyantDroitForm
                            ayantDroit={ayantDroit}
                            employeeName={employeeName}
                            employeeFirstName={employeeFirstName}
                            employeeLastName={employeeLastName}
                            handleChange={handleChange}
                            handleCalendarChange={handleCalendarChange}
                            handleDropDownSelect={handleDropDownSelect}
                            handleCheckboxChange={handleCheckboxChange}
                            handleMatriculeBlur={handleMatriculeBlur}
                            searchLoading={searchLoading}
                        />

                        {/* Display existing ayant droits for current employee */}
                        {filteredAyantDroits.length > 0 && ayantDroit.matriculeId && (
                            <div className="card mt-3">
                                <h5>Ayants Droit existants pour {employeeName}</h5>
                                <DataTable
                                    value={filteredAyantDroits}
                                    emptyMessage={"Pas d'ayants droit à afficher"}
                                    paginator
                                    rows={5}
                                    rowsPerPageOptions={[5, 10, 15]}
                                >
                                    <Column field="categorie" header="Catégorie" body={categorieBodyTemplate} sortable />
                                    <Column field="nom" header="Nom" sortable />
                                    <Column field="prenom" header="Prénom" sortable />
                                    <Column field="dateNaissance" header="Date de Naissance" sortable />
                                    <Column field="priseEnCharge" header="Prise en Charge" body={priseEnChargeBodyTemplate} sortable />
                                    <Column header="Actions" body={actionBodyTemplate} />
                                </DataTable>
                            </div>
                        )}

                        <div className="card p-fluid mt-3">
                            <div className="formgrid grid">
                                <div className="md:col-offset-3 md:field md:col-3">
                                    <Button
                                        icon="pi pi-refresh"
                                        outlined
                                        label="Réinitialiser"
                                        onClick={() => {
                                            setAyantDroit(new AyantDroit());
                                            setEmployeeName('');
                                            setEmployeeFirstName('');
                                            setEmployeeLastName('');
                                            setFilteredAyantDroits([]);
                                            // Reset refs when clearing form
                                            hasLoadedAyantDroitsRef.current = false;
                                            lastMatriculeSearchedRef.current = '';
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
                )}
                {canViewConsultationTab && (
                    <TabPanel header="Consultation des Ayants Droit">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={filteredAyantDroits}
                                        header={renderSearch}
                                        emptyMessage={"Pas d'ayants droit à afficher"}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[10, 20, 30]}
                                    >
                                        <Column field="matriculeId" header="Matricule" sortable />
                                        <Column field="categorie" header="Catégorie" body={categorieBodyTemplate} sortable />
                                        <Column field="nom" header="Nom" sortable />
                                        <Column field="prenom" header="Prénom" sortable />
                                        <Column field="dateNaissance" header="Date de Naissance" sortable />
                                        <Column field="dateMariage" header="Date de Mariage" />
                                        <Column field="priseEnCharge" header="Prise en Charge" body={priseEnChargeBodyTemplate} sortable />
                                        <Column field="refExtraitActeNaissance" header="Réf. Acte Naissance" />
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

export default AyantDroitComponent;
