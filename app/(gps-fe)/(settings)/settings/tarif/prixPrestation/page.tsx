'use client';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState, useMemo } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { TarifPrestation } from './TarifPrestation';
import TarifPrestationForm from './TarifPrestationForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { buildApiUrl } from '../../../../../../utils/apiConfig';

export default function TarifPrestationComponent() {
    const baseUrl = buildApiUrl('');
    const [tarifPrestation, setTarifPrestation] = useState<TarifPrestation>(new TarifPrestation());
    const [tarifPrestationEdit, setTarifPrestationEdit] = useState<TarifPrestation>(new TarifPrestation());
    const [editTarifPrestationDialog, setEditTarifPrestationDialog] = useState(false);
    const [tarifPrestations, setTarifPrestations] = useState<TarifPrestation[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadTarifPrestations') {
                setTarifPrestations(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const loadAllData = () => {
        fetchData(null, 'GET', baseUrl + '/tarifsPrestations/findall', 'loadTarifPrestations');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTarifPrestation(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTarifPrestationEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleValueChange = (e: InputNumberValueChangeEvent) => {
        setTarifPrestation(prev => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleValueChangeEdit = (e: InputNumberValueChangeEvent) => {
        setTarifPrestationEdit(prev => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleSubmit = () => {
        if (!tarifPrestation.libellePrestation) {
            accept('error', 'Erreur', 'Le libellé de la prestation est requis');
            return;
        }
        if (tarifPrestation.tarifSemaine <= 0 || tarifPrestation.tarifFerie <= 0) {
            accept('error', 'Erreur', 'Les tarifs doivent être positifs');
            return;
        }

        setBtnLoading(true);
        fetchData(tarifPrestation, 'POST', baseUrl + '/tarifsPrestations/new', 'createTarifPrestation');
    };

    const handleSubmitEdit = () => {
        if (!tarifPrestationEdit.libellePrestation) {
            accept('error', 'Erreur', 'Le libellé de la prestation est requis');
            return;
        }
        if (tarifPrestationEdit.tarifSemaine <= 0 || tarifPrestationEdit.tarifFerie <= 0) {
            accept('error', 'Erreur', 'Les tarifs doivent être positifs');
            return;
        }

        setBtnLoading(true);
        fetchData(tarifPrestationEdit, 'PUT', baseUrl + '/tarifsPrestations/update/' + tarifPrestationEdit.tarifId, 'updateTarifPrestation');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateTarifPrestation') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des tarifs de prestation');
        }
        else if (data !== null && error === null) {
            if (callType === 'createTarifPrestation') {
                setTarifPrestation(new TarifPrestation());
                accept('success', 'Succès', 'Tarif de prestation créé avec succès');
            } else if (callType === 'updateTarifPrestation') {
                accept('success', 'Succès', 'Tarif de prestation modifié avec succès');
                setTarifPrestationEdit(new TarifPrestation());
                setEditTarifPrestationDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadTarifPrestationToEdit = (data: TarifPrestation) => {
        if (data) {
            setEditTarifPrestationDialog(true);
            setTarifPrestationEdit(data);
        }
    };

    const optionButtons = (data: TarifPrestation): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadTarifPrestationToEdit(data)}
                    rounded
                    severity='warning'
                />
            </div>
        );
    };

    const filteredData = useMemo(() => {
        if (!globalFilter) return tarifPrestations;
        return tarifPrestations.filter(item => 
            item.libellePrestation.toLowerCase().includes(globalFilter.toLowerCase()) ||
            item.tarifSemaine.toString().includes(globalFilter) ||
            item.tarifFerie.toString().includes(globalFilter)
        );
    }, [tarifPrestations, globalFilter]);

    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={() => {
                    setGlobalFilter('');
                    loadAllData();
                }}
            />
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher par libellé ou tarif..."
                    className="w-full"
                />
            </span>
        </div>
    );

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Tarif Prestation"
                visible={editTarifPrestationDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditTarifPrestationDialog(false)}
            >
                <TarifPrestationForm
                    tarifPrestation={tarifPrestationEdit}
                    handleChange={handleChangeEdit}
                    handleValueChange={handleValueChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditTarifPrestationDialog(false)}
                        className="p-button-text"
                    />
                    <Button
                        label="Enregistrer"
                        icon="pi pi-check"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <TarifPrestationForm
                        tarifPrestation={tarifPrestation}
                        handleChange={handleChange}
                        handleValueChange={handleValueChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={() => setTarifPrestation(new TarifPrestation())}
                            severity="secondary"
                        />
                        <Button
                            label="Enregistrer"
                            icon="pi pi-save"
                            loading={btnLoading}
                            onClick={handleSubmit}
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste">
                    <div className="card">
                        <DataTable
                            value={filteredData}
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun tarif de prestation trouvé"
                            globalFilter={globalFilter}
                        >
                            <Column field="libellePrestation" header="Libellé Prestation" sortable />
                            <Column field="tarifSemaine" header="Tarif Semaine (Ar)" body={(rowData) => `${rowData.tarifSemaine} Ar`} sortable />
                            <Column field="tarifFerie" header="Tarif Férié (Ar)" body={(rowData) => `${rowData.tarifFerie} Ar`} sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}