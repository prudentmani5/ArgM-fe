'use client';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState, useMemo } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixVehicule } from './PrixVehicule';
import PrixVehiculeForm from './PrixVehiculeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { buildApiUrl } from '../../../../../../utils/apiConfig';

export default function PrixVehiculeComponent() {
    const baseUrl = buildApiUrl('');
    const [prixVehicule, setPrixVehicule] = useState<PrixVehicule>(new PrixVehicule());
    const [prixVehiculeEdit, setPrixVehiculeEdit] = useState<PrixVehicule>(new PrixVehicule());
    const [editPrixVehiculeDialog, setEditPrixVehiculeDialog] = useState(false);
    const [prixVehicules, setPrixVehicules] = useState<PrixVehicule[]>([]);
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
            if (callType === 'loadPrixVehicules') {
                setPrixVehicules(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const loadAllData = () => {
        fetchData(null, 'GET', baseUrl + '/prixvehicules/findall', 'loadPrixVehicules');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrixVehicule(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrixVehiculeEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleValueChange = (e: InputNumberValueChangeEvent) => {
        setPrixVehicule(prev => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleValueChangeEdit = (e: InputNumberValueChangeEvent) => {
        setPrixVehiculeEdit(prev => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleSubmit = () => {
        if (prixVehicule.poids1 <= 0 || prixVehicule.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }
        if (prixVehicule.poids1 >= prixVehicule.poids2) {
            accept('error', 'Erreur', 'Le poids max doit être supérieur au poids min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixVehicule, 'POST', baseUrl + '/prixvehicules/new', 'createPrixVehicule');
    };

    const handleSubmitEdit = () => {
        if (prixVehiculeEdit.poids1 <= 0 || prixVehiculeEdit.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }
        if (prixVehiculeEdit.poids1 >= prixVehiculeEdit.poids2) {
            accept('error', 'Erreur', 'Le poids max doit être supérieur au poids min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixVehiculeEdit, 'PUT', baseUrl + '/prixvehicules/update/' + prixVehiculeEdit.paramVehiculeId, 'updatePrixVehicule');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updatePrixVehicule') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des prix véhicule');
        }
        else if (data !== null && error === null) {
            if (callType === 'createPrixVehicule') {
                setPrixVehicule(new PrixVehicule());
                accept('success', 'Succès', 'Prix véhicule créé avec succès');
            } else if (callType === 'updatePrixVehicule') {
                accept('success', 'Succès', 'Prix véhicule modifié avec succès');
                setPrixVehiculeEdit(new PrixVehicule());
                setEditPrixVehiculeDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadPrixVehiculeToEdit = (data: PrixVehicule) => {
        if (data) {
            setEditPrixVehiculeDialog(true);
            setPrixVehiculeEdit(data);
        }
    };

    const optionButtons = (data: PrixVehicule): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadPrixVehiculeToEdit(data)}
                    rounded
                    severity='warning'
                />
            </div>
        );
    };

    const filteredData = useMemo(() => {
        if (!globalFilter) return prixVehicules;
        return prixVehicules.filter(item => 
            item.poids1.toString().includes(globalFilter) ||
            item.poids2.toString().includes(globalFilter) ||
            item.montant.toString().includes(globalFilter)
        );
    }, [prixVehicules, globalFilter]);

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
                    placeholder="Rechercher par poids ou montant..."
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'BIF' 
        }).format(value);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Prix Véhicule"
                visible={editPrixVehiculeDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditPrixVehiculeDialog(false)}
            >
                <PrixVehiculeForm
                    prixVehicule={prixVehiculeEdit}
                    handleChange={handleChangeEdit}
                    handleValueChange={handleValueChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditPrixVehiculeDialog(false)}
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
                    <PrixVehiculeForm
                        prixVehicule={prixVehicule}
                        handleChange={handleChange}
                        handleValueChange={handleValueChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={() => setPrixVehicule(new PrixVehicule())}
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
                            emptyMessage="Aucun prix véhicule trouvé"
                            globalFilter={globalFilter}
                        >
                            <Column field="poids1" header="Poids Min (kg)" body={(rowData) => `${rowData.poids1} kg`} sortable />
                            <Column field="poids2" header="Poids Max (kg)" body={(rowData) => `${rowData.poids2} kg`} sortable />
                            <Column field="montant" header="Montant" body={(rowData) => formatCurrency(rowData.montant)} sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}