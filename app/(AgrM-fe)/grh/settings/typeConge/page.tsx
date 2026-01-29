'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { TypeConge } from './TypeConge';
import TypeCongeForm from './TypeCongeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { CheckboxChangeEvent } from 'primereact/checkbox';


function TypeCongeComponent() {

    const [typeConge, setTypeConge] = useState<TypeConge>(new TypeConge());
    const [typeCongeEdit, setTypeCongeEdit] = useState<TypeConge>(new TypeConge());
    const [editTypeCongeDialog, setEditTypeCongeDialog] = useState(false);
    const [typeConges, setTypeConges] = useState<TypeConge[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
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
           
            if (callType === 'loadTypeConges') {
                setTypeConges(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTypeConge((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTypeCongeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setTypeConge((prev) => ({ ...prev, [e.target.name as string]: e.checked }));
    };
    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setTypeCongeEdit((prev) => ({ ...prev, [e.target.name as string]: e.checked }));
    };

    const handleSubmit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', typeConge);
        fetchData(typeConge, 'Post', buildApiUrl('/api/typeconges/new'), 'createTypeConge');
        setTypeConge(new TypeConge());


    }

    const handleSubmitEdit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', typeCongeEdit);
        fetchData(typeCongeEdit, 'Put', buildApiUrl(`/api/typeconges/update/${typeCongeEdit.typeCongeId}`), 'updateTypeConge');
    }

    const handleAfterApiCall = (chooseenTab: number) => {

        if (error !== null && chooseenTab === 0) {

            console.log(' ===> || I\'m here');
            if (callType !== 'updateTypeConge')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateTypeConge')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des types de congé.');
        else if (data !== null && error === null) {
            if (callType === 'createTypeConge') {
                setTypeConge(new TypeConge());
                accept('info', 'OK', 'L\'enregistrement a pas été éffectué avec succès.');
            } else if(callType === 'updateTypeConge') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setTypeCongeEdit(new TypeConge());
                setEditTypeCongeDialog(false);
                loadAllData();
            }
            
        }

        setBtnLoading(false);
    };

    const clearFilterTypeConge = () => {
        setGlobalFilter('');
    }

    const loadTypeCongeToEdit = (data: TypeConge) => {
        if (data) {
            setEditTypeCongeDialog(true);
            console.log(" id TypeConge " + data.typeCongeId);
            setTypeCongeEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadTypeCongeToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const booleanBodyTemplate = (rowData: TypeConge, field: keyof TypeConge): React.ReactNode => {
        return rowData[field] ? <i className="pi pi-check text-green-500" /> : <i className="pi pi-times text-red-500" />;
    }

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/api/typeconges/findall'), 'loadTypeConges');
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {

        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

     const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={clearFilterTypeConge}
            />
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher"
                    className="w-full"
                />
            </span>
        </div>
    );

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Type Congé" visible={editTypeCongeDialog} style={{ width: '30vw' }} modal onHide={() => setEditTypeCongeDialog(false)}>
            <TypeCongeForm typeConge={typeCongeEdit as TypeConge} handleChange={handleChangeEdit} handleCheckboxChange={handleCheckboxChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <TypeCongeForm typeConge={typeConge as TypeConge} handleChange={handleChange} handleCheckboxChange={handleCheckboxChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={() => setTypeConge(new TypeConge())} />
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
                            <DataTable value={typeConges} header={renderSearch} emptyMessage={"Pas de type de congé à afficher"} globalFilter={globalFilter}>
                                <Column field="typeCongeId" header="Code" sortable />
                                <Column field="libelle" header="Libellé" sortable />
                                <Column field="circostance" header="Circonstance" body={(rowData) => booleanBodyTemplate(rowData, 'circostance')} sortable />
                                <Column field="congeLimitE" header="Congé Limité" body={(rowData) => booleanBodyTemplate(rowData, 'congeLimitE')} sortable />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default TypeCongeComponent;