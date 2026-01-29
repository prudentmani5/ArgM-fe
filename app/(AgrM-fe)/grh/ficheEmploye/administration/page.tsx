'use client';

import { useEffect, useRef, useState } from "react";
import { EmployeeDetail } from "./employeeDetails";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import EmployeeDetailsForm from "./EmployeeDetailsForm";
import { InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from "primereact/dropdown";
import { CheckboxChangeEvent } from "primereact/checkbox";
import { API_BASE_URL } from '@/utils/apiConfig';
import { useAuthorities } from "../../../../../hooks/useAuthorities";

const EmployeeDetailsComponent = () => {
    // const baseUrl = "http://10.100.27.47:8080";
    const baseUrl = `${API_BASE_URL}`;
    const { hasAuthority, hasAnyAuthority } = useAuthorities();

    // Authority checks for tab visibility
    const canViewNouveauTab = hasAuthority('RH_MANAGER');
    const canViewConsultationTab = hasAnyAuthority(['RH_MANAGER', 'RH_OPERATEUR_SAISIE']);

    const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetail>(new EmployeeDetail());
    const [employeeDetailEdit, setEmployeeDetailEdit] = useState<EmployeeDetail>(new EmployeeDetail());
    const [editEmployeeDetailDialog, setEditEmployeeDetailDialog] = useState(false);
    const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetail[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [employeeNom, setEmployeeNom] = useState<string>('');
    const [employeePrenom, setEmployeePrenom] = useState<string>('');
    const [searchLoading, setSearchLoading] = useState<boolean>(false);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const maritalStatusOptions = [
        { label: "Célibataire", value: "C" },
        { label: "Marié(e)", value: "M" },
        { label: "Divorcé(e)", value: "D" },
        { label: "Veuf/Veuve", value: "V" },
    ];

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    useEffect(() => {
        // If user only has Consultation tab access, load data on mount
        if (!canViewNouveauTab && canViewConsultationTab) {
            loadAllData();
        }
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadEmployeeDetails') {
                setEmployeeDetails(Array.isArray(data) ? data : [data]);
            }
        }

        if (searchData && searchCallType === 'searchByMatricule') {
            // Populate nom and prenom from found employee data
            if (searchData) {
                setEmployeeNom(searchData.nom || '');
                setEmployeePrenom(searchData.prenom || '');
                accept('info', 'Employé trouvé', `${searchData.prenom} ${searchData.nom}`);
            }
            setSearchLoading(false);
        }

        if (searchError && searchCallType === 'searchByMatricule') {
            accept('warn', 'Employé non trouvé', 'Aucun employé trouvé avec ce matricule.');
            setEmployeeNom('');
            setEmployeePrenom('');
            setSearchLoading(false);
        }

        handleAfterApiCall(activeIndex);
    }, [data, searchData, searchError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmployeeDetail((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmployeeDetailEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onInputNumberChangeHandler = (e: InputNumberValueChangeEvent) => {
        setEmployeeDetail((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    const onInputNumberChangeHandlerEdit = (e: InputNumberValueChangeEvent) => {
        setEmployeeDetailEdit((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setEmployeeDetail((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setEmployeeDetailEdit((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleSubmit = () => {
        // Validate form before submission - check one field at a time
        if (!employeeDetail.matriculeId || employeeDetail.matriculeId.trim() === '') {
            accept('warn', 'Attention', 'Le matricule est obligatoire');
            return;
        }
        if (!employeeDetail.etatCivil || employeeDetail.etatCivil.trim() === '') {
            accept('warn', 'Attention', 'L\'état civil est obligatoire');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', employeeDetail);
        fetchData(employeeDetail, 'Post', baseUrl + '/api/employee-details/new', 'createEmployeeDetail');
    };

    const handleSubmitEdit = () => {
        // Validate form before submission - check one field at a time
        if (!employeeDetailEdit.matriculeId || employeeDetailEdit.matriculeId.trim() === '') {
            accept('warn', 'Attention', 'Le matricule est obligatoire');
            return;
        }
        if (!employeeDetailEdit.etatCivil || employeeDetailEdit.etatCivil.trim() === '') {
            accept('warn', 'Attention', 'L\'état civil est obligatoire');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', employeeDetailEdit);
        fetchData(employeeDetailEdit, 'Put', baseUrl + '/api/employee-details/update/' + employeeDetailEdit.matriculeId, 'updateEmployeeDetail');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateEmployeeDetail')
                accept('warn', 'À votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateEmployeeDetail')
                accept('warn', 'À votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'À votre attention', 'Impossible de charger la liste des détails employés.');
        else if (data !== null && error === null) {
            if (callType === 'createEmployeeDetail') {
                setEmployeeDetail(new EmployeeDetail());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateEmployeeDetail') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setEmployeeDetailEdit(new EmployeeDetail());
                setEditEmployeeDetailDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterEmployeeDetail = () => {
        // Implement filter clearing logic if needed
    };

    const loadEmployeeDetailToEdit = (data: EmployeeDetail) => {
        if (data) {
            setEditEmployeeDetailDialog(true);
            setEmployeeDetailEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadEmployeeDetailToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/employee-details/findall', 'loadEmployeeDetails');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        // Determine the actual tab based on which tabs are visible
        // If only Consultation is visible, it's at index 0
        // If both are visible, Consultation is at index 1
        const isConsultationTab = canViewNouveauTab ? e.index === 1 : e.index === 0;

        if (isConsultationTab) {
            loadAllData();
        } else {
            setEmployeeDetail(new EmployeeDetail());
            setEmployeeNom('');
            setEmployeePrenom('');
        }
        setActiveIndex(e.index);
    };

    const onDropdownSelect = (e: DropdownChangeEvent) => {
        if (!editEmployeeDetailDialog)
            setEmployeeDetail((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        else
            setEmployeeDetailEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterEmployeeDetail} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    const getMaritalStatusLabel = (value: string) => {
        const option = maritalStatusOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    // const formatPhoneNumbers = (rowData: EmployeeDetail) => {
    //     const phones = rowData.getPhoneNumbers();
    //     return phones.length > 0 ? phones.join(', ') : '-';
    // };

    // const formatVacationDays = (rowData: EmployeeDetail) => {
    //     const total = rowData.getTotalVacationDays();
    //     return total > 0 ? `${total} jours` : '-';
    // };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Détails Employé"
                visible={editEmployeeDetailDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditEmployeeDetailDialog(false)}
            >
                <EmployeeDetailsForm
                    employeeDetail={employeeDetailEdit}
                    handleChange={handleChangeEdit}
                    handleValueChange={onInputNumberChangeHandlerEdit}
                    handleDropDownSelect={onDropdownSelect}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    employeeNom={employeeNom}
                    employeePrenom={employeePrenom}
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
                {canViewNouveauTab && (
                    <TabPanel header="Nouveau">
                        <EmployeeDetailsForm
                            employeeDetail={employeeDetail}
                            handleChange={handleChange}
                            handleValueChange={onInputNumberChangeHandler}
                            handleDropDownSelect={onDropdownSelect}
                            handleCheckboxChange={handleCheckboxChange}
                            handleMatriculeBlur={handleMatriculeBlur}
                            employeeNom={employeeNom}
                            employeePrenom={employeePrenom}
                            isEditMode={false}
                        />
                        <div className="card p-fluid">
                            <div className="formgrid grid">
                                <div className="md:col-offset-3 md:field md:col-3">
                                    <Button
                                        icon="pi pi-refresh"
                                        outlined
                                        label="Réinitialiser"
                                        onClick={() => {
                                            setEmployeeDetail(new EmployeeDetail());
                                            setEmployeeNom('');
                                            setEmployeePrenom('');
                                        }}
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
                )}
                {canViewConsultationTab && (
                    <TabPanel header="Consultation">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={employeeDetails}
                                        header={renderSearch}
                                        emptyMessage={"Pas de détails employés à afficher"}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[10, 20, 30]}
                                    >
                                        <Column field="matriculeId" header="Matricule" sortable />
                                        <Column field="nom" header="Nom" sortable />
                                        <Column field="prenom" header="Prénom" sortable />
                                        <Column
                                            field="etatCivil"
                                            header="État Civil"
                                            body={(rowData) => getMaritalStatusLabel(rowData.etatCivil)}
                                            sortable
                                        />
                                        <Column field="Nbre_Enfant" header="Enfants" sortable />
                                        <Column
                                            field="ConjointSalarie"
                                            header="Conjoint Salarié"
                                            body={(rowData) => rowData.conjointSalarie ? 'Oui' : 'Non'}
                                            sortable
                                        />
                                        <Column field="email" header="Email" />
                                        {/* <Column
                                            header="Téléphones"
                                            body={formatPhoneNumbers}
                                        />
                                        <Column
                                            header="Congés"
                                            body={formatVacationDays}
                                        /> */}
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
}

export default EmployeeDetailsComponent;