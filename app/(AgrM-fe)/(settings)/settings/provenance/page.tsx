'use client';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState, useMemo } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Provenance } from './Provenance';
import ProvenanceForm from './ProvenanceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';


export default function ProvenanceComponent() {
    const baseUrl = `${API_BASE_URL}`;
    const [provenance, setProvenance] = useState<Provenance>(new Provenance());
    const [provenanceEdit, setProvenanceEdit] = useState<Provenance>(new Provenance());
    const [editProvenanceDialog, setEditProvenanceDialog] = useState(false);
    const [provenances, setProvenances] = useState<Provenance[]>([]);
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
            if (callType === 'loadProvenances') {
                setProvenances(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const loadAllData = () => {
        fetchData(null, 'GET', baseUrl + '/provenances/findall', 'loadProvenances');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProvenance(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProvenanceEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        if (!provenance.nom || !provenance.pays) {
            accept('error', 'Erreur', 'Tous les champs sont obligatoires');
            return;
        }

        setBtnLoading(true);
        fetchData(provenance, 'POST', baseUrl + '/provenances/new', 'createProvenance');
    };

    const handleSubmitEdit = () => {
        if (!provenanceEdit.nom || !provenanceEdit.pays) {
            accept('error', 'Erreur', 'Tous les champs sont obligatoires');
            return;
        }

        setBtnLoading(true);
        fetchData(provenanceEdit, 'PUT', baseUrl + '/provenances/update/' + provenanceEdit.provenanceId, 'updateProvenance');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateProvenance') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des provenances');
        }
        else if (data !== null && error === null) {
            if (callType === 'createProvenance') {
                setProvenance(new Provenance());
                accept('success', 'Succès', 'Provenance créée avec succès');
            } else if (callType === 'updateProvenance') {
                accept('success', 'Succès', 'Provenance modifiée avec succès');
                setProvenanceEdit(new Provenance());
                setEditProvenanceDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadProvenanceToEdit = (data: Provenance) => {
        if (data) {
            setEditProvenanceDialog(true);
            setProvenanceEdit(data);
        }
    };

    const optionButtons = (data: Provenance): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadProvenanceToEdit(data)}
                    rounded
                    severity='warning'
                />
            </div>
        );
    };

    const filteredData = useMemo(() => {
        if (!globalFilter) return provenances;
        return provenances.filter(item => 
            item.nom.toLowerCase().includes(globalFilter.toLowerCase()) ||
            item.pays.toLowerCase().includes(globalFilter.toLowerCase())
        );
    }, [provenances, globalFilter]);

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
                    placeholder="Rechercher par nom ou pays..."
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
                header="Modifier Provenance"
                visible={editProvenanceDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditProvenanceDialog(false)}
            >
                <ProvenanceForm
                    provenance={provenanceEdit}
                    handleChange={handleChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditProvenanceDialog(false)}
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
                    <ProvenanceForm
                        provenance={provenance}
                        handleChange={handleChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={() => setProvenance(new Provenance())}
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
                            emptyMessage="Aucune provenance trouvée"
                            globalFilter={globalFilter}
                        >
                            <Column field="nom" header="Nom" sortable />
                            <Column field="pays" header="Pays" sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}