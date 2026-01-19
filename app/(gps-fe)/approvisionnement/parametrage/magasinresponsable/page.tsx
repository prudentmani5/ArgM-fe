// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { StkMagasinResponsable } from './StkMagasinResponsable';
import StkMagasinResponsableForm from './StkMagasinResponsableForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from 'primereact/dropdown';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Magasin } from "../../parametrage/magasin/Magasin";
import { StkResponsable } from "../../parametrage/responsable/StkResponsable";
import { API_BASE_URL } from '@/utils/apiConfig';

function StkMagasinResponsableComponent() {
    const [stkMagasinResponsable, setStkMagasinResponsable] = useState<StkMagasinResponsable>(new StkMagasinResponsable());
    const [stkMagasinResponsableEdit, setStkMagasinResponsableEdit] = useState<StkMagasinResponsable>(new StkMagasinResponsable());
    const [editDialog, setEditDialog] = useState(false);
    const [magasinResponsables, setMagasinResponsables] = useState<StkMagasinResponsable[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [magasins, setMagasins] = useState<Magasin[]>([]);
    const [responsables, setResponsables] = useState<StkResponsable[]>([]);
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: magasinsData, loading: magasinsLoading, error: magasinsError, fetchData: fetchMagasinsData } = useConsumApi('');
    const { data: responsablesData, loading: responsablesLoading, error: responsablesError, fetchData: fetchResponsablesData } = useConsumApi('');

    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const BASE_URL = `${API_BASE_URL}/stkMagasinResponsables`;
    const URL_MAGASINS = `${API_BASE_URL}/magasins/findall`;
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
        loadMagasins();
        loadResponsables();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadMagasinResponsables') {
                setMagasinResponsables(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
        if (magasinsData) {
            setMagasins(Array.isArray(magasinsData) ? magasinsData : [magasinsData]);
        }
        if (responsablesData) {
            setResponsables(Array.isArray(responsablesData) ? responsablesData : [responsablesData]);
        }
    }, [data, magasinsData, responsablesData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkMagasinResponsable((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkMagasinResponsableEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setStkMagasinResponsable((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setStkMagasinResponsableEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: any) => {
        setStkMagasinResponsable((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: any) => {
        setStkMagasinResponsableEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(stkMagasinResponsable, 'POST', `${BASE_URL}/new`, 'createStkMagasinResponsable');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(stkMagasinResponsableEdit, 'PUT', `${BASE_URL}/update/${stkMagasinResponsableEdit.magRespId}`, 'updateStkMagasinResponsable');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateStkMagasinResponsable') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateStkMagasinResponsable') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des responsables de magasin.');
        } else if (data !== null && error === null) {
            if (callType === 'createStkMagasinResponsable') {
                setStkMagasinResponsable(new StkMagasinResponsable());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateStkMagasinResponsable') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setStkMagasinResponsableEdit(new StkMagasinResponsable());
                setEditDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilter = () => {
        setStkMagasinResponsable(new StkMagasinResponsable());
    };

    const loadToEdit = (data: StkMagasinResponsable) => {
        if (data) {
            setEditDialog(true);
            setStkMagasinResponsableEdit(data);
        }
    };

    const loadMagasins = () => {
        fetchMagasinsData(null, 'GET', `${URL_MAGASINS}`, 'loadMagasins');
    };

    const loadResponsables = () => {
        fetchResponsablesData(null, 'GET', `${URL_RESPONSABLES}`, 'loadResponsables');
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadMagasinResponsables');
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
                <Button icon="pi pi-pencil" onClick={() => loadToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Responsable de Magasin"
                visible={editDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditDialog(false)}>
                <StkMagasinResponsableForm
                    stkMagasinResponsable={stkMagasinResponsableEdit}
                    magasins={magasins}
                    responsables={responsables}
                    loadingStatus={magasinsLoading || responsablesLoading}
                    handleChange={handleChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <StkMagasinResponsableForm
                        stkMagasinResponsable={stkMagasinResponsable}
                        magasins={magasins}
                        responsables={responsables}
                        loadingStatus={magasinsLoading || responsablesLoading}
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
                                    value={magasinResponsables}
                                    emptyMessage={"Pas de responsables de magasin à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field="magRespId" header="ID" sortable />
                                    <Column field="magasinId" header="Magasin ID" sortable />
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

export default StkMagasinResponsableComponent;