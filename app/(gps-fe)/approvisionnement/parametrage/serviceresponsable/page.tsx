// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { StkServiceResponsable } from './StkServiceResponsable';
import StkServiceResponsableForm from './StkServiceResponsableForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from 'primereact/dropdown';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Stkservice } from "../../parametrage/service/Stkservice";
import { StkResponsable } from "../../parametrage/responsable/StkResponsable";
import { API_BASE_URL } from '@/utils/apiConfig';



function StkServiceResponsableComponent() {
    const [stkServiceResponsable, setStkServiceResponsable] = useState<StkServiceResponsable>(new StkServiceResponsable());
    const [stkServiceResponsableEdit, setStkServiceResponsableEdit] = useState<StkServiceResponsable>(new StkServiceResponsable());
    const [editStkServiceResponsableDialog, setEditStkServiceResponsableDialog] = useState(false);
    const [stkServiceResponsables, setStkServiceResponsables] = useState<StkServiceResponsable[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [services, setServices] = useState<Stkservice[]>([]);
    const [responsables, setResponsables] = useState<StkResponsable[]>([]);
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: servicesData, loading: servicesLoading, error: servicesError, fetchData: fetchServicesData } = useConsumApi('');
    const { data: responsablesData, loading: responsablesLoading, error: responsablesError, fetchData: fetchResponsablesData } = useConsumApi('');

    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const BASE_URL = `${API_BASE_URL}/stkServiceResponsables`;
    const URL_SERVICES = `${API_BASE_URL}/services/findall`;
    const URL_RESPONSABLES = `${API_BASE_URL}/responsables/findall`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadServices();
        loadResponsables();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadStkServiceResponsables') {
                setStkServiceResponsables(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
        if (servicesData) {
            setServices(Array.isArray(servicesData) ? servicesData : [servicesData]);
        }
        if (responsablesData) {
            setResponsables(Array.isArray(responsablesData) ? responsablesData : [responsablesData]);
        }
    }, [data, servicesData, responsablesData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkServiceResponsable((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkServiceResponsableEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setStkServiceResponsable((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setStkServiceResponsableEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: any) => {
        setStkServiceResponsable((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: any) => {
        setStkServiceResponsableEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(stkServiceResponsable, 'POST', `${BASE_URL}/new`, 'createStkServiceResponsable');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(stkServiceResponsableEdit, 'PUT', `${BASE_URL}/update/${stkServiceResponsableEdit.servRespId}`, 'updateStkServiceResponsable');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateStkServiceResponsable') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateStkServiceResponsable') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des services responsables.');
        } else if (data !== null && error === null) {
            if (callType === 'createStkServiceResponsable') {
                setStkServiceResponsable(new StkServiceResponsable());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateStkServiceResponsable') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setStkServiceResponsableEdit(new StkServiceResponsable());
                setEditStkServiceResponsableDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilter = () => {
        setStkServiceResponsable(new StkServiceResponsable());
    };

    const loadStkServiceResponsableToEdit = (data: StkServiceResponsable) => {
        if (data) {
            setEditStkServiceResponsableDialog(true);
            setStkServiceResponsableEdit(data);
        }
    };

    const loadServices = () => {
        fetchServicesData(null, 'GET', `${URL_SERVICES}`, 'loadServices');
    };

    const loadResponsables = () => {
        fetchResponsablesData(null, 'GET', `${URL_RESPONSABLES}`, 'loadResponsables');
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadStkServiceResponsables');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadStkServiceResponsableToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Service Responsable"
                visible={editStkServiceResponsableDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditStkServiceResponsableDialog(false)}>
                <StkServiceResponsableForm
                    stkServiceResponsable={stkServiceResponsableEdit}
                    services={services}
                    responsables={responsables}
                    loadingStatus={servicesLoading || responsablesLoading}
                    handleChange={handleChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditStkServiceResponsableDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <StkServiceResponsableForm
                        stkServiceResponsable={stkServiceResponsable}
                        services={services}
                        responsables={responsables}
                        loadingStatus={servicesLoading || responsablesLoading}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilter} />
                            </div>
                            <div className="md:field md:col-3">
                                <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={stkServiceResponsables}
                                    emptyMessage={"Pas de services responsables à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field="servRespId" header="ID Service Responsable" sortable />
                                    <Column field="serviceId" header="Service ID" sortable />
                                    <Column field="responsableId" header="Responsable ID" sortable />
                                    <Column field="actif" header="Actif" body={(rowData) => rowData.actif ? 'Oui' : 'Non'} sortable />
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

export default StkServiceResponsableComponent;