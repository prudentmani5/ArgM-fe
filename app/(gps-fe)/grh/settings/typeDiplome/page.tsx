'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { TypeDiplome } from './TypeDiplome';
import TypeDiplomeForm from './TypeDiplomeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function TypeDiplomeComponent() {
    const [typeDiplome, setTypeDiplome] = useState<TypeDiplome>(new TypeDiplome());
    const [typeDiplomeEdit, setTypeDiplomeEdit] = useState<TypeDiplome>(new TypeDiplome());
    const [editDialog, setEditDialog] = useState(false);
    const [typeDiplomes, setTypeDiplomes] = useState<TypeDiplome[]>([]);
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
            if (callType === 'loadTypeDiplomes') {
                setTypeDiplomes(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTypeDiplome((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTypeDiplomeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(typeDiplome, 'Post', buildApiUrl('/typediplomes/new'), 'createTypeDiplome');
        setTypeDiplome(new TypeDiplome());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(typeDiplomeEdit, 'Put', buildApiUrl(`/typediplomes/update/${typeDiplomeEdit.typeDiplomeId}`), 'updateTypeDiplome');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateTypeDiplome')
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été éffectué.');
            else
                accept('warn', 'Attention', 'La mise à jour a échoué.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'Attention', 'Impossible de charger la liste.');
        else if (data !== null && error === null) {
            if (callType === 'createTypeDiplome') {
                setTypeDiplome(new TypeDiplome());
                accept('info', 'OK', 'Enregistrement réussi.');
            } else if (callType === 'updateTypeDiplome') {
                accept('info', 'OK', 'Mise à jour réussie.');
                setTypeDiplomeEdit(new TypeDiplome());
                setEditDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadToEdit = (data: TypeDiplome) => {
        setEditDialog(true);
        setTypeDiplomeEdit(data);
    };

    const optionButtons = (data: any) => (
        <div className='flex flex-wrap gap-2'>
            <Button icon="pi pi-pencil" onClick={() => loadToEdit(data)} raised severity='warning' />
        </div>
    );

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/typediplomes/findall'), 'loadTypeDiplomes');
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
        <Dialog header="Modifier Diplôme" visible={editDialog} style={{ width: '30vw' }} modal onHide={() => setEditDialog(false)}>
            <TypeDiplomeForm typeDiplome={typeDiplomeEdit} handleChange={handleChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>

        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <TypeDiplomeForm typeDiplome={typeDiplome} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setTypeDiplome(new TypeDiplome())} />
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
                            <DataTable value={typeDiplomes} header={renderSearch} emptyMessage={"Pas de diplômes à afficher"} paginator rows={10}>
                                <Column field="typeDiplomeId" header="Code" />
                                <Column field="diplome" header="Diplôme" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default TypeDiplomeComponent;
