'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Caissier } from './Caissier';
import CaissierForm from './CaissierForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function CaissierComponent() {
    const [caissier, setCaissier] = useState<Caissier>(new Caissier());
    const [caissierEdit, setCaissierEdit] = useState<Caissier>(new Caissier());
    const [editCaissierDialog, setEditCaissierDialog] = useState(false);
    const [caissiers, setCaissiers] = useState<Caissier[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
     const [globalFilter, setGlobalFilter] = useState<string>('');

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
            if (callType === 'loadCaissiers') {
                setCaissiers(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCaissier((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCaissierEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        // Pour une création, assurez-vous que caissierId est null
        const caissierToSend = { ...caissier, caissierId: null };
        fetchData(caissierToSend, 'POST', buildApiUrl('/caissiers/new'), 'createCaissier');
        setCaissier(new Caissier());
    }

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(caissierEdit, 'PUT', buildApiUrl(`/caissiers/update/${caissierEdit.caissierId}`), 'updateCaissier');
    }

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateCaissier')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateCaissier')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des caissiers.');
        else if (data !== null && error === null) {
            if (callType === 'createCaissier') {
                setCaissier(new Caissier());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateCaissier') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setCaissierEdit(new Caissier());
                setEditCaissierDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterCaissier = () => {
        // Implement filter clearing logic here
    }

    const loadCaissierToEdit = (data: Caissier) => {
        if (data) {
            setEditCaissierDialog(true);
            setCaissierEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCaissierToEdit(data)} raised severity='warning' />
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/caissiers/findall'), 'loadCaissiers');
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

      const filteredData = Array.isArray(caissier) 
    ? caissiers.filter(item => {
        if (!item) return false; // Filtre les éléments null/undefined
        
        return JSON.stringify({
            factureId: item.nomPrenom || ''
        }).toLowerCase().includes(globalFilter.toLowerCase());
      })
    : [];

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterCaissier} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher Nom"
                    className="w-full"
                />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Caissier" visible={editCaissierDialog} style={{ width: '30vw' }} modal onHide={() => setEditCaissierDialog(false)}>
            <CaissierForm caissier={caissierEdit as Caissier} handleChange={handleChangeEdit} />
            <div className="flex justify-content-end gap-2 mt-3">
                <Button label="Annuler" icon="pi pi-times" onClick={() => setEditCaissierDialog(false)} className="p-button-text" />
                <Button label="Modifier" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
            </div>
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <CaissierForm caissier={caissier as Caissier} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={() => setCaissier(new Caissier())} />
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
                            <DataTable value={caissiers} header={renderSearch}
                               emptyMessage={"Pas de caissiers à afficher"}
                              // value={filteredData}
                               filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                               >
                                <Column field="nomPrenom" header="Nom & Prénom" />
                                <Column field="fonction" header="Fonction" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default CaissierComponent;