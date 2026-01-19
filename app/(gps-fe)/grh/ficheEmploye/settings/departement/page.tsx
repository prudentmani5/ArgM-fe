'use client';

import { useEffect, useRef, useState } from "react";
import { Department } from "./Department";
import useConsumApi from "../../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import DepartmentForm from "./DepartmentForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const DepartmentComponent = () => {
    // const baseUrl = "http://10.100.27.47:8080";
    const baseUrl = `${API_BASE_URL}`;
    
    const [department, setDepartment] = useState<Department>(new Department());
    const [departmentEdit, setDepartmentEdit] = useState<Department>(new Department());
    const [editDepartmentDialog, setEditDepartmentDialog] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadDepartments') {
                setDepartments(Array.isArray(data) ? data : [data]);
            }
        }
        handleAfterApiCall(activeIndex);
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Convert to uppercase for DepartementId
        const processedValue = name === 'DepartementId' ? value.toUpperCase() : value;
        
        setDepartment((prev) => ({ ...prev, [name]: processedValue }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDepartmentEdit((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = (dept: Department): boolean => {
        const validation = dept.validateAll();
        
        if (!validation.isValid) {
            validation.errors.forEach(error => {
                accept('warn', 'Erreur de validation', error);
            });
            return false;
        }
        
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm(department)) {
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', department);
        fetchData(department, 'Post', baseUrl + '/departments/new', 'createDepartment');
    };

    const handleSubmitEdit = () => {
        if (!validateForm(departmentEdit)) {
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', departmentEdit);
        fetchData(departmentEdit, 'Put', baseUrl + '/departments/update/' + departmentEdit.DepartementId, 'updateDepartment');
    };

    const handleDelete = (departmentToDelete: Department) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le département "${departmentToDelete.getDisplayName()}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setBtnLoading(true);
                fetchData(null, 'Delete', baseUrl + '/departments/delete/' + departmentToDelete.DepartementId, 'deleteDepartment');
            }
        });
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType === 'createDepartment')
                accept('warn', 'À votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateDepartment')
                accept('warn', 'À votre attention', 'La mise à jour n\'a pas été effectuée.');
            else if (callType === 'deleteDepartment')
                accept('warn', 'À votre attention', 'La suppression n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'À votre attention', 'Impossible de charger la liste des départements.');
        else if (data !== null && error === null) {
            if (callType === 'createDepartment') {
                setDepartment(new Department());
                accept('success', 'Succès', 'Le département a été enregistré avec succès.');
            } else if (callType === 'updateDepartment') {
                accept('success', 'Succès', 'Le département a été modifié avec succès.');
                setDepartmentEdit(new Department());
                setEditDepartmentDialog(false);
                loadAllData();
            } else if (callType === 'deleteDepartment') {
                accept('success', 'Succès', 'Le département a été supprimé avec succès.');
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilter = () => {
        setGlobalFilter('');
    };

    const loadDepartmentToEdit = (data: Department) => {
        if (data) {
            setEditDepartmentDialog(true);
            setDepartmentEdit({ ...data });
        }
    };

    const optionButtons = (data: Department): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadDepartmentToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                />
                <Button 
                    icon="pi pi-trash" 
                    onClick={() => handleDelete(data)}
                    raised 
                    severity='danger' 
                    tooltip="Supprimer"
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/departments/findall', 'loadDepartments');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setDepartment(new Department());
        }
        setActiveIndex(e.index);
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFilter(e.target.value);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Réinitialiser" 
                    outlined 
                    onClick={clearFilter} 
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText 
                        value={globalFilter} 
                        onChange={onGlobalFilterChange} 
                        placeholder="Rechercher..." 
                    />
                </span>
            </div>
        );
    };

    const departmentIdBodyTemplate = (rowData: Department) => {
        return <span className="font-bold text-primary">{rowData.DepartementId}</span>;
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            
            <Dialog
                header="Modifier Département"
                visible={editDepartmentDialog}
                style={{ width: '30vw' }}
                modal
                onHide={() => setEditDepartmentDialog(false)}
            >
                <DepartmentForm
                    department={departmentEdit}
                    handleChange={handleChangeEdit}
                    isEditing={true}
                />
                <div className="flex justify-content-end mt-3 gap-2">
                    <Button
                        icon="pi pi-times"
                        label="Annuler"
                        outlined
                        onClick={() => setEditDepartmentDialog(false)}
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
                <TabPanel header="Nouveau Département">
                    <DepartmentForm
                        department={department}
                        handleChange={handleChange}
                        isEditing={false}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => setDepartment(new Department())}
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
                
                <TabPanel header="Liste des Départements">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={departments}
                                    header={renderSearch}
                                    emptyMessage={"Aucun département à afficher"}
                                    globalFilter={globalFilter}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 20, 50]}
                                    loading={loading}
                                    stripedRows
                                >
                                    <Column 
                                        field="DepartementId" 
                                        header="ID Département" 
                                        sortable 
                                        body={departmentIdBodyTemplate}
                                        style={{ width: '200px' }}
                                    />
                                    <Column 
                                        field="Libelle" 
                                        header="Libellé" 
                                        sortable 
                                        style={{ minWidth: '300px' }}
                                    />
                                    <Column 
                                        header="Actions" 
                                        body={optionButtons} 
                                        style={{ width: '150px' }}
                                        exportable={false}
                                    />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default DepartmentComponent;