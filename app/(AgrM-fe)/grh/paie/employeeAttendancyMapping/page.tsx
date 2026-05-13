'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { useCurrentUser } from '../../../../../hooks/fetchData/useCurrentUser';
import { EmployeeAttendancyMapping } from './EmployeeAttendancyMapping';
import EmployeeAttendancyMappingForm from './EmployeeAttendancyMappingForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { API_BASE_URL } from '@/utils/apiConfig';

function EmployeeAttendancyMappingComponent() {
    const baseUrl = `${API_BASE_URL}`;

    const [mapping, setMapping] = useState<EmployeeAttendancyMapping>(new EmployeeAttendancyMapping());
    const [mappingEdit, setMappingEdit] = useState<EmployeeAttendancyMapping>(new EmployeeAttendancyMapping());
    const [editMappingDialog, setEditMappingDialog] = useState(false);
    const [mappings, setMappings] = useState<EmployeeAttendancyMapping[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployeeData, callType: employeeCallType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
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
        if (data) {
            if (callType === 'loadMappings') {
                setMappings(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }

        // Handle employee data loading by matricule
        if (employeeData && employeeCallType === 'searchByMatricule') {
            const foundEmployee = employeeData as any;
            setMapping(prev => ({
                ...prev,
                firstName: foundEmployee.prenom || '',
                lastName: foundEmployee.nom || ''
            }));
            accept('info', 'Employé trouvé', 'Les informations de l\'employé ont été chargées.');
            setSearchLoading(false);
        }

        if (employeeError && employeeCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setSearchLoading(false);
        }
    }, [data, employeeData, employeeError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'matriculeId') {
            setMapping((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setMapping((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMappingEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setMapping((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setMappingEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (field: string, checked: boolean) => {
        setMapping((prev) => ({ ...prev, [field]: checked }));
    };

    const handleCheckboxChangeEdit = (field: string, checked: boolean) => {
        setMappingEdit((prev) => ({ ...prev, [field]: checked }));
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        // Fetch employee identification data from GRH - this endpoint returns employee info
        fetchEmployeeData(null, 'Get', `${baseUrl}/api/grh/carriere/employee/${matriculeId}`, 'searchByMatricule');
    };

    const handleSubmit = () => {
        // Validation
        if (!mapping.matriculeId || !mapping.firstName || !mapping.lastName || !mapping.userId) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        // Get user's first name from appUser
        let userFirstName = 'Unknown';
        if (appUser?.fullName) {
            const nameParts = appUser.fullName.split(" ");
            userFirstName = nameParts[0] || appUser.fullName; // Get first name
        }

        // Set createdBy with user's first name
        const dataToSubmit = {
            ...mapping,
            createdBy: userFirstName
        };

        setBtnLoading(true);
        console.log('Data sent to the backend:', dataToSubmit);
        fetchData(dataToSubmit, 'Post', `${baseUrl}/api/grh/paie/employee-attendancy-mapping/new`, 'createMapping');
    };

    const handleSubmitEdit = () => {
        // Validation
        if (!mappingEdit.firstName || !mappingEdit.lastName || !mappingEdit.userId) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        // Get user's first name from appUser
        let userFirstName = 'Unknown';
        if (appUser?.fullName) {
            const nameParts = appUser.fullName.split(" ");
            userFirstName = nameParts[0] || appUser.fullName; // Get first name
        }

        // Set updatedBy with user's first name
        const dataToUpdate = {
            ...mappingEdit,
            updatedBy: userFirstName
        };

        setBtnLoading(true);
        console.log('Data sent to the backend:', dataToUpdate);
        fetchData(dataToUpdate, 'Put', `${baseUrl}/api/grh/paie/employee-attendancy-mapping/update/${mappingEdit.matriculeId}`, 'updateMapping');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType === 'createMapping')
                accept('error', 'Erreur', error.toString() || 'L\'enregistrement n\'a pas été effectué. Vérifiez que l\'employé ou le User ID ne sont pas déjà attribués.');
            else if (callType === 'updateMapping')
                accept('error', 'Erreur', error.toString() || 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des mappings.');
        else if (data !== null && error === null) {
            if (callType === 'createMapping') {
                setMapping(new EmployeeAttendancyMapping());
                accept('success', 'Succès', 'Le mapping a été créé avec succès.');
            } else if (callType === 'updateMapping') {
                accept('success', 'Succès', 'Le mapping a été modifié avec succès.');
                setMappingEdit(new EmployeeAttendancyMapping());
                setEditMappingDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilter = () => {
        setGlobalFilter('');
    };

    const loadMappingToEdit = (data: EmployeeAttendancyMapping) => {
        if (data) {
            setEditMappingDialog(true);
            console.log("Editing mapping: " + data.matriculeId);
            setMappingEdit(data);
        }
    };

    const optionButtons = (data: EmployeeAttendancyMapping, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadMappingToEdit(data)}
                    raised
                    severity='warning'
                    tooltip="Modifier"
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${baseUrl}/api/grh/paie/employee-attendancy-mapping/findall`, 'loadMappings');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={clearFilter}
            />
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher"
                    className="w-full"
                />
            </span>
        </div>
    );

    const activeBodyTemplate = (rowData: EmployeeAttendancyMapping) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const dateBodyTemplate = (rowData: EmployeeAttendancyMapping, field: 'createdDate' | 'updatedDate') => {
        return formatDate(rowData[field]);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Mapping Employé-Pointage"
                visible={editMappingDialog}
                style={{ width: '60vw' }}
                modal
                onHide={() => setEditMappingDialog(false)}
            >
                <EmployeeAttendancyMappingForm
                    mapping={mappingEdit}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
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
                    <EmployeeAttendancyMappingForm
                        mapping={mapping}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleCheckboxChange={handleCheckboxChange}
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
                                    onClick={() => setMapping(new EmployeeAttendancyMapping())}
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button
                                    icon="pi pi-check"
                                    label="Enregistrer"
                                    loading={btnLoading}
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
                                    value={mappings}
                                    header={renderSearch}
                                    emptyMessage={"Aucun mapping à afficher"}
                                    globalFilter={globalFilter}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column field="firstName" header="Prénom" sortable />
                                    <Column field="lastName" header="Nom" sortable />
                                    <Column field="userId" header="User ID" sortable />
                                    <Column
                                        field="isActive"
                                        header="Statut"
                                        body={activeBodyTemplate}
                                        sortable
                                    />
                                    <Column field="createdBy" header="Créé par" sortable />
                                    <Column
                                        field="createdDate"
                                        header="Date création"
                                        body={(rowData) => dateBodyTemplate(rowData, 'createdDate')}
                                        sortable
                                    />
                                    <Column field="updatedBy" header="Modifié par" sortable />
                                    <Column
                                        field="updatedDate"
                                        header="Date modification"
                                        body={(rowData) => dateBodyTemplate(rowData, 'updatedDate')}
                                        sortable
                                    />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default EmployeeAttendancyMappingComponent;
