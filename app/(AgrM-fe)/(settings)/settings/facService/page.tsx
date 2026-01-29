'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { FacService } from './FacService';
import FacServiceForm from './FacServiceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { API_BASE_URL } from '@/utils/apiConfig';

function FacServiceComponent() {
    const [facService, setFacService] = useState<FacService>(new FacService());
    const [facServiceEdit, setFacServiceEdit] = useState<FacService>(new FacService());
    const [editFacServiceDialog, setEditFacServiceDialog] = useState(false);
    const [facServices, setFacServices] = useState<FacService[]>([]);
    const [filteredFacServices, setFilteredFacServices] = useState<FacService[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>('');
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
            if (callType === 'loadFacServices') {
                setFacServices(Array.isArray(data) ? data : [data]);
                setFilteredFacServices(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    useEffect(() => {
        // Filter facServices based on globalFilter
        if (globalFilter === '') {
            setFilteredFacServices(facServices);
        } else {
            const filtered = facServices.filter((service) =>
                service.libelleService?.toLowerCase().includes(globalFilter.toLowerCase())
            );
            setFilteredFacServices(filtered);
        }
    }, [globalFilter, facServices]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacService((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacServiceEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (value: number | null, field: string) => {
        setFacService((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (value: number | null, field: string) => {
        setFacServiceEdit((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacService((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(`Checkbox change: ${e.target.name} = ${e.target.checked}`);
        setFacServiceEdit((prev) => {
            const updated = { ...prev, [e.target.name]: e.target.checked };
            console.log('Updated facServiceEdit:', updated);
            return updated;
        });
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(facService, 'POST', `${API_BASE_URL}/facservices/new`, 'createFacService');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(facServiceEdit, 'PUT', `${API_BASE_URL}/facservices/update/` + facServiceEdit.id, 'updateFacService');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateFacService') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateFacService') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des services.');
        } else if (data !== null && error === null) {
            if (callType === 'createFacService') {
                setFacService(new FacService());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateFacService') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setFacServiceEdit(new FacService());
                setEditFacServiceDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterFacService = () => {
        setGlobalFilter('');
        setFilteredFacServices(facServices);
    };

    const loadFacServiceToEdit = (data: FacService) => {
        if (data) {
            console.log('=== Loading FacService for Edit ===');
            console.log('Data received from table:', JSON.stringify(data, null, 2));
            console.log('tarif1:', data.tarif1, 'type:', typeof data.tarif1);
            console.log('tarif2:', data.tarif2, 'type:', typeof data.tarif2);
            console.log('tarif3:', data.tarif3, 'type:', typeof data.tarif3);
            console.log('enDollars:', data.enDollars, 'type:', typeof data.enDollars);
            setEditFacServiceDialog(true);
            setFacServiceEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadFacServiceToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/facservices/findall`, 'loadFacServices');
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setFacService((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setFacServiceEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetForm = () => {
        setFacService(new FacService());
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center mb-3">
                <Button 
                    type="button" 
                    icon="pi pi-filter-slash" 
                    label="Effacer filtres" 
                    outlined 
                    onClick={clearFilterFacService} 
                />
                <span className="p-input-icon-left" style={{ width: '40%' }}>
                    <i className="pi pi-search" />
                    <InputText 
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher par libellé service" 
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    const formatBooleanColumn = (rowData: any, field: string) => {
        return rowData[field] ? 'Oui' : 'Non';
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Service"
                visible={editFacServiceDialog}
                style={{ width: '60vw' }}
                modal
                onHide={() => setEditFacServiceDialog(false)}
            >
                <FacServiceForm
                    facService={facServiceEdit}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditFacServiceDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <FacServiceForm
                        facService={facService}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleDropdownChange={handleDropdownChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={resetForm} />
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
                                <DataTable value={filteredFacServices} header={renderSearch} emptyMessage={"Pas de service à afficher"} paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}>
                                    <Column field="libelleService" header="Libellé Service" />
                                    <Column field="compte" header="Compte" />
                                    <Column field="montant" header="Montant" />
                                    <Column field="type" header="Type" />
                                    <Column field="tonnage" header="Tonnage" body={(rowData) => formatBooleanColumn(rowData, 'tonnage')} />
                                    <Column field="actif" header="Actif" body={(rowData) => formatBooleanColumn(rowData, 'actif')} />
                                    <Column field="prixUnitaireParJour" header="Prix/Jour" body={(rowData) => formatBooleanColumn(rowData, 'prixUnitaireParJour')} />
                                    <Column field="tarif1" header="1er Tarif" body={(rowData) => formatBooleanColumn(rowData, 'tarif1')} />
                                    <Column field="tarif2" header="2ème Tarif" body={(rowData) => formatBooleanColumn(rowData, 'tarif2')} />
                                    <Column field="tarif3" header="3ème Tarif" body={(rowData) => formatBooleanColumn(rowData, 'tarif3')} />
                                    <Column field="enDollars" header="En Dollars" body={(rowData) => formatBooleanColumn(rowData, 'enDollars')} />
                                    <Column field="passPontBascule" header="Pont Bascule" body={(rowData) => formatBooleanColumn(rowData, 'passPontBascule')} />
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

export default FacServiceComponent;