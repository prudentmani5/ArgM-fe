'use client';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState, useMemo } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixSurtaxe } from './PrixSurtaxe';
import PrixSurtaxeForm from './PrixSurtaxeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { buildApiUrl } from '../../../../../../utils/apiConfig';

export default function PrixSurtaxeComponent() {
    const baseUrl = buildApiUrl('');
    const [prixSurtaxe, setPrixSurtaxe] = useState<PrixSurtaxe>(new PrixSurtaxe());
    const [prixSurtaxeEdit, setPrixSurtaxeEdit] = useState<PrixSurtaxe>(new PrixSurtaxe());
    const [editPrixSurtaxeDialog, setEditPrixSurtaxeDialog] = useState(false);
    const [prixSurtaxes, setPrixSurtaxes] = useState<PrixSurtaxe[]>([]);
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
            if (callType === 'loadPrixSurtaxes') {
                setPrixSurtaxes(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const loadAllData = () => {
        fetchData(null, 'GET', baseUrl + '/prixsurtaxes/findall', 'loadPrixSurtaxes');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrixSurtaxe(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrixSurtaxeEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleValueChange = (e: InputNumberValueChangeEvent) => {
        setPrixSurtaxe(prev => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleValueChangeEdit = (e: InputNumberValueChangeEvent) => {
        setPrixSurtaxeEdit(prev => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleSubmit = () => {
        if (prixSurtaxe.poids1 <= 0 || prixSurtaxe.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }
        if (prixSurtaxe.poids1 >= prixSurtaxe.poids2) {
            accept('error', 'Erreur', 'Le poids max doit être supérieur au poids min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixSurtaxe, 'POST', baseUrl + '/prixsurtaxes/new', 'createPrixSurtaxe');
    };

    const handleSubmitEdit = () => {
        if (prixSurtaxeEdit.poids1 <= 0 || prixSurtaxeEdit.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }
        if (prixSurtaxeEdit.poids1 >= prixSurtaxeEdit.poids2) {
            accept('error', 'Erreur', 'Le poids max doit être supérieur au poids min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixSurtaxeEdit, 'PUT', baseUrl + '/prixsurtaxes/update/' + prixSurtaxeEdit.paramSurtaxeId, 'updatePrixSurtaxe');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updatePrixSurtaxe') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des prix de surtaxe');
        }
        else if (data !== null && error === null) {
            if (callType === 'createPrixSurtaxe') {
                setPrixSurtaxe(new PrixSurtaxe());
                accept('success', 'Succès', 'Prix de surtaxe créé avec succès');
            } else if (callType === 'updatePrixSurtaxe') {
                accept('success', 'Succès', 'Prix de surtaxe modifié avec succès');
                setPrixSurtaxeEdit(new PrixSurtaxe());
                setEditPrixSurtaxeDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadPrixSurtaxeToEdit = (data: PrixSurtaxe) => {
        if (data) {
            setEditPrixSurtaxeDialog(true);
            setPrixSurtaxeEdit(data);
        }
    };

    const optionButtons = (data: PrixSurtaxe): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadPrixSurtaxeToEdit(data)}
                    rounded
                    severity='warning'
                />
            </div>
        );
    };

    const filteredData = useMemo(() => {
        if (!globalFilter) return prixSurtaxes;
        return prixSurtaxes.filter(item => 
            item.poids1.toString().includes(globalFilter) ||
            item.poids2.toString().includes(globalFilter) ||
            item.taux.toString().includes(globalFilter)
        );
    }, [prixSurtaxes, globalFilter]);

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
                    placeholder="Rechercher par poids ou taux..."
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
                header="Modifier Prix Surtaxe"
                visible={editPrixSurtaxeDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditPrixSurtaxeDialog(false)}
            >
                <PrixSurtaxeForm
                    prixSurtaxe={prixSurtaxeEdit}
                    handleChange={handleChangeEdit}
                    handleValueChange={handleValueChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditPrixSurtaxeDialog(false)}
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
                    <PrixSurtaxeForm
                        prixSurtaxe={prixSurtaxe}
                        handleChange={handleChange}
                        handleValueChange={handleValueChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={() => setPrixSurtaxe(new PrixSurtaxe())}
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
                            emptyMessage="Aucune surtaxe trouvée"
                            globalFilter={globalFilter}
                        >
                            <Column field="poids1" header="Poids Min (kg)" body={(rowData) => `${rowData.poids1} kg`} sortable />
                            <Column field="poids2" header="Poids Max (kg)" body={(rowData) => `${rowData.poids2} kg`} sortable />
                            <Column field="taux" header="Taux (%)" body={(rowData) => `${rowData.taux} %`} sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}