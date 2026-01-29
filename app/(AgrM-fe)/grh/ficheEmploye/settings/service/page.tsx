'use client';

import { useEffect, useRef, useState } from "react";
import { Service } from "./service";
import useConsumApi from "../../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import ServiceForm from "./ServiceForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const ServiceComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const [service, setService] = useState<Service>(Service.createEmpty());
    const [serviceEdit, setServiceEdit] = useState<Service>(Service.createEmpty());
    const [editServiceDialog, setEditServiceDialog] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
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
        if (data) {
            if (callType === 'loadServices') {
                setServices(Array.isArray(data) ? data : [data]);
            }
        }
        handleAfterApiCall(activeIndex);
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setService((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setServiceEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        if (!service.ServiceId || !service.DepartementId || !service.Libelle) {
            accept('warn', 'Attention', 'Les champs Service ID, Département ID et Libellé sont obligatoires');
            return;
        }
        
        setBtnLoading(true);
        fetchData(service, 'Post', baseUrl + '/services/new', 'createService');
    };

    const handleSubmitEdit = () => {
        if (!serviceEdit.ServiceId || !serviceEdit.DepartementId || !serviceEdit.Libelle) {
            accept('warn', 'Attention', 'Les champs Service ID, Département ID et Libellé sont obligatoires');
            return;
        }
        
        setBtnLoading(true);
        fetchData(serviceEdit, 'Put', baseUrl + '/services/update/' + serviceEdit.ServiceId, 'updateService');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateService')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateService')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des services.');
        else if (data !== null && error === null) {
            if (callType === 'createService') {
                setService(Service.createEmpty());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateService') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setServiceEdit(Service.createEmpty());
                setEditServiceDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterService = () => {
        // Implement filter clearing logic if needed
    };

    const loadServiceToEdit = (data: Service) => {
        if (data) {
            setEditServiceDialog(true);
            setServiceEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadServiceToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/services/findall', 'loadServices');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setService(Service.createEmpty());
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterService} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Service"
                visible={editServiceDialog}
                style={{ width: '40vw' }}
                modal
                onHide={() => setEditServiceDialog(false)}
            >
                <ServiceForm
                    service={serviceEdit}
                    handleChange={handleChangeEdit}
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
                    <ServiceForm
                        service={service}
                        handleChange={handleChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => setService(Service.createEmpty())}
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
                                    value={services}
                                    header={renderSearch}
                                    emptyMessage={"Pas de services à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="ServiceId" header="Service ID" sortable />
                                    <Column field="DepartementId" header="Département ID" sortable />
                                    <Column field="Libelle" header="Libellé" sortable />
                                    <Column field="Responsable" header="Responsable" sortable />
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

export default ServiceComponent;