'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Pays } from './Pays';
import PaysForm from './PaysForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function PaysComponent() {
    const [pays, setPays] = useState<Pays>(new Pays());
    const [paysEdit, setPaysEdit] = useState<Pays>(new Pays());
    const [editDialog, setEditDialog] = useState(false);
    const [paysList, setPaysList] = useState<Pays[]>([]);
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
            if (callType === 'loadPays') {
                setPaysList(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPays((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaysEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: any) => {
        setPays((prev) => ({ ...prev, principal: e.checked }));
    };
    const handleCheckboxChangeEdit = (e: any) => {
        setPaysEdit((prev) => ({ ...prev, principal: e.checked }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(pays, 'Post', buildApiUrl('/pays/new'), 'createPays');
        setPays(new Pays());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(paysEdit, 'Put', buildApiUrl(`/pays/update/${paysEdit.paysId}`), 'updatePays');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            accept('warn', 'Attention', 'Échec de l\'enregistrement ou de la mise à jour.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'Attention', 'Impossible de charger la liste.');
        else if (data !== null && error === null) {
            if (callType === 'createPays') {
                setPays(new Pays());
                accept('info', 'OK', 'Enregistrement réussi.');
            } else if (callType === 'updatePays') {
                accept('info', 'OK', 'Mise à jour réussie.');
                setPaysEdit(new Pays());
                setEditDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadToEdit = (data: Pays) => {
        setEditDialog(true);
        setPaysEdit(data);
    };

    const optionButtons = (data: any) => (
        <div className='flex flex-wrap gap-2'>
            <Button icon="pi pi-pencil" onClick={() => loadToEdit(data)} raised severity='warning' />
        </div>
    );

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/pays/findall'), 'loadPays');
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
        <Dialog header="Modifier Pays" visible={editDialog} style={{ width: '30vw' }} modal onHide={() => setEditDialog(false)}>
            <PaysForm pays={paysEdit} handleChange={handleChangeEdit} handleCheckboxChange={handleCheckboxChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>

        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <PaysForm pays={pays} handleChange={handleChange} handleCheckboxChange={handleCheckboxChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setPays(new Pays())} />
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
                            <DataTable value={paysList} header={renderSearch} emptyMessage={"Pas de pays à afficher"} paginator rows={10}>
                                <Column field="paysId" header="Code" />
                                <Column field="nomPays" header="Nom" />
                                <Column field="principal" header="Principal" body={(row: Pays) => row.principal ? 'Oui' : 'Non'} />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default PaysComponent;
