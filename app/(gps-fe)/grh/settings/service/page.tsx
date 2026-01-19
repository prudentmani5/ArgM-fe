'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Service } from './Service';
import ServiceForm from './ServiceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Department } from '../department/Department';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { buildApiUrl } from '../../../../../utils/apiConfig';


function ServiceComponent() {

    const [service, setService] = useState<Service>(new Service());
    const [serviceEdit, setServiceEdit] = useState<Service>(new Service());
    const [editServiceDialog, setEditServiceDialog] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: departmentData, loading: departmentsLoading, error: departmentError, fetchData: fetchDepartments, callType: departmentCallType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };


    useEffect(() => {
        loadAllDepartments();
    }, []);

    useEffect(() => {
        if (data) {
           
            if (callType === 'loadServices') {
                setServices(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
        
        if (departmentData) {
            if (departmentCallType === 'loadDepartments') {
                setDepartments(Array.isArray(departmentData) ? departmentData : [departmentData]);
            }
        }
    }, [data, departmentData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setService((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setServiceEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', service);
        fetchData(service, 'Post', buildApiUrl('/services/new'), 'createService');
        setService(new Service());


    }

    const handleSubmitEdit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', serviceEdit);
        fetchData(serviceEdit, 'Put', buildApiUrl(`/api/services/update/${serviceEdit.serviceId}`), 'updateService');
    }

    const handleAfterApiCall = (chooseenTab: number) => {

        if (error !== null && chooseenTab === 0) {

            console.log(' ===> || I\'m here');
            if (callType !== 'updateService')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateService')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des services.');
        else if (data !== null && error === null) {
            if (callType === 'createService') {
                setService(new Service());
                accept('info', 'OK', 'L\'enregistrement a pas été éffectué avec succès.');
            } else if(callType === 'updateService') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setServiceEdit(new Service());
                setEditServiceDialog(false);
                loadAllData();
            }
            
        }

        setBtnLoading(false);
    };

    const clearFilterService = () => {
        setGlobalFilter('');
    }

    const loadServiceToEdit = (data: Service) => {
        if (data) {
            setEditServiceDialog(true);
            console.log(" id Service " + data.serviceId);
            setServiceEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadServiceToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/services/findall'), 'loadServices');
    }

    const loadAllDepartments = () => {
        fetchDepartments(null, 'Get', buildApiUrl('/departments/findall'), 'loadDepartments');
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {

        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };
    
    const onDropdownSelect = (e: DropdownChangeEvent) => {
        if (!editServiceDialog) {
            setService((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setServiceEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

     const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={clearFilterService}
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
    
    const getDepartmentName = (departmentId: string) => {
        const department = departments.find(d => d.departmentId === departmentId);
        return department ? department.libelle : departmentId;
    };

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Service" visible={editServiceDialog} style={{ width: '40vw' }} modal onHide={() => setEditServiceDialog(false)}>
            <ServiceForm 
                service={serviceEdit as Service} 
                departments={departments} 
                handleChange={handleChangeEdit} 
                handleDropDownSelect={onDropdownSelect}
            />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <ServiceForm 
                    service={service as Service} 
                    departments={departments} 
                    handleChange={handleChange} 
                    handleDropDownSelect={onDropdownSelect}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={() => setService(new Service())} />
                        </div>
                        <div className="md:field md:col-3">
                            <Button icon="pi pi-check" label="Enregistrer" loading={loading} onClick={handleSubmit} />
                        </div>
                    </div>
                </div>
            </TabPanel>
            <TabPanel header="Tous">
                <div className='grid'>
                    <div className='col-12'>
                        <div className='card'>
                            <DataTable value={services} header={renderSearch} emptyMessage={"Pas de service à afficher"} globalFilter={globalFilter}>
                                <Column field="serviceId" header="Code" sortable />
                                <Column field="departmentId" header="Département" body={(rowData) => getDepartmentName(rowData.departmentId)} sortable />
                                <Column field="libelle" header="Libellé" sortable />
                                <Column field="responsable" header="Responsable" sortable />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default ServiceComponent;