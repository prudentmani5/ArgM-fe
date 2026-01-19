'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import DomaineFormationForm from './DomaineFormationForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DomaineFormation } from './DomaineFormaton';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function DomaineFormationComponent() {
    const [domaine, setDomaine] = useState<DomaineFormation>(new DomaineFormation());
    const [domaineEdit, setDomaineEdit] = useState<DomaineFormation>(new DomaineFormation());
    const [editDialog, setEditDialog] = useState(false);
    const [domaines, setDomaines] = useState<DomaineFormation[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({ severity: sever, summary: summa, detail: det, life: 3000 });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadDomaines') {
                setDomaines(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDomaine((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDomaineEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(domaine, 'Post', buildApiUrl('/domaines/new'), 'createDomaine');
        setDomaine(new DomaineFormation());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(domaineEdit, 'Put', buildApiUrl(`/domaines/update/${domaineEdit.domaineId}`), 'updateDomaine');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            accept('warn', 'Attention', 'Échec de l\'enregistrement ou de la mise à jour.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'Attention', 'Impossible de charger la liste.');
        else if (data !== null && error === null) {
            if (callType === 'createDomaine') {
                setDomaine(new DomaineFormation());
                accept('info', 'OK', 'Enregistrement réussi.');
            } else if (callType === 'updateDomaine') {
                accept('info', 'OK', 'Mise à jour réussie.');
                setDomaineEdit(new DomaineFormation());
                setEditDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadToEdit = (data: DomaineFormation) => {
        setEditDialog(true);
        setDomaineEdit(data);
    };

    const optionButtons = (data: any) => (
        <div className='flex flex-wrap gap-2'>
            <Button icon="pi pi-pencil" onClick={() => loadToEdit(data)} raised severity='warning' />
        </div>
    );

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/domaines/findall'), 'loadDomaines');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button icon="pi pi-filter-slash" label="Effacer filtres" outlined onClick={() => setGlobalFilter('')} />
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher" className="w-full" />
            </span>
        </div>
    );

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Domaine" visible={editDialog} style={{ width: '30vw' }} modal onHide={() => setEditDialog(false)}>
            <DomaineFormationForm domaine={domaineEdit} handleChange={handleChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>

        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <DomaineFormationForm domaine={domaine} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setDomaine(new DomaineFormation())} />
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
                            <DataTable value={domaines} header={renderSearch} emptyMessage={"Pas de domaines à afficher"} paginator rows={10}>
                                <Column field="domaineId" header="Code" />
                                <Column field="libelle" header="Libellé" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default DomaineFormationComponent;
