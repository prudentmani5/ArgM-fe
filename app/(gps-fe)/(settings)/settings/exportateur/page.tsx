'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Exporter } from './Exporter';
import ExporterForm from './ExporterForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function ExporterComponent() {
    const [exporter, setExporter] = useState<Exporter>(new Exporter());
    const [exporterEdit, setExporterEdit] = useState<Exporter>(new Exporter());
    const [editExporterDialog, setEditExporterDialog] = useState(false);
    const [exporters, setExporters] = useState<Exporter[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadExporters') {
                setExporters(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExporter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExporterEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: any) => {
        setExporter((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleCheckboxChangeEdit = (e: any) => {
        setExporterEdit((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleSubmit = () => {
        if (!exporter.nom) {
            accept('error', 'Erreur', 'Le nom est obligatoire');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', exporter);
        fetchData(exporter, 'Post', buildApiUrl('/exportaters/new'), 'createExporter');
        setExporter(new Exporter());
    };

    const handleSubmitEdit = () => {
        if (!exporterEdit.nom) {
            accept('error', 'Erreur', 'Le nom est obligatoire');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', exporterEdit);
        fetchData(exporterEdit, 'Put', buildApiUrl(`/exportaters/update/${exporterEdit.exportateurId}`), 'updateExporter');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateExporter') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des exportateurs');
        }
        else if (data !== null && error === null) {
            if (callType === 'createExporter') {
                setExporter(new Exporter());
                accept('success', 'Succès', 'Exportateur créé avec succès');
            } else if(callType === 'updateExporter') {
                accept('success', 'Succès', 'Exportateur modifié avec succès');
                setExporterEdit(new Exporter());
                setEditExporterDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadExporterToEdit = (data: Exporter) => {
        if (data) {
            setEditExporterDialog(true);
            setExporterEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadExporterToEdit(data)} 
                    rounded 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/exportaters/findall'), 'loadExporters');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button 
                    type="button" 
                    icon="pi pi-filter-slash" 
                    label="Effacer" 
                    outlined 
                    onClick={() => {}} 
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Rechercher..." />
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                header="Modifier Exportateur" 
                visible={editExporterDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditExporterDialog(false)}
            >
                <ExporterForm 
                    exporter={exporterEdit} 
                    handleChange={handleChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditExporterDialog(false)} 
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
                    <ExporterForm 
                        exporter={exporter} 
                        handleChange={handleChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button 
                            label="Réinitialiser" 
                            icon="pi pi-refresh" 
                            onClick={() => setExporter(new Exporter())} 
                            severity="secondary" 
                        />
                        <Button 
                            label="Enregistrer" 
                            icon="pi pi-save" 
                            loading={loading} 
                            onClick={handleSubmit} 
                        />
                    </div>
                </TabPanel>
                
                <TabPanel header="Liste">
                    <div className="card">
                        <DataTable 
                            value={exporters} 
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun exportateur trouvé"
                        >
                            <Column field="nom" header="Nom" sortable />
                            <Column field="tel" header="Téléphone" />
                            <Column field="fax" header="Fax" />
                            <Column 
                                field="compte" 
                                header="Compte" 
                                body={(data) => data.compte ? 'Oui' : 'Non'} 
                            />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default ExporterComponent;