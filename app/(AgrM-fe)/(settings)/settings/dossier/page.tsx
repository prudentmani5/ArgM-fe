'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { DossierPort } from './DossierPort';
import DossierPortForm from './DossierPortForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function DossierPortComponent() {
    const [dossierPort, setDossierPort] = useState<DossierPort>(new DossierPort());
    const [dossierPortEdit, setDossierPortEdit] = useState<DossierPort>(new DossierPort());
    const [editDossierPortDialog, setEditDossierPortDialog] = useState(false);
    const [dossierPorts, setDossierPorts] = useState<DossierPort[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
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
            if (callType === 'loadDossierPorts') {
                setDossierPorts(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDossierPort((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDossierPortEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setDossierPort((prev) => ({ ...prev, [name]: value || 0 }));
    };

    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setDossierPortEdit((prev) => ({ ...prev, [name]: value || 0 }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setDossierPort((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChangeEdit = (name: string, value: Date | null) => {
        setDossierPortEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', dossierPort);
        fetchData(dossierPort, 'Post', buildApiUrl('/dossiers/new'), 'createDossierPort');
        setDossierPort(new DossierPort());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', dossierPortEdit);
        fetchData(dossierPortEdit, 'Put', buildApiUrl(`/dossiers/update/${dossierPortEdit.dossierId}`), 'updateDossierPort');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateDossierPort')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateDossierPort')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des dossiers.');
        else if (data !== null && error === null) {
            if (callType === 'createDossierPort') {
                setDossierPort(new DossierPort());
                accept('info', 'OK', 'L\'enregistrement a pas été éffectué avec succès.');
            } else if(callType === 'updateDossierPort') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setDossierPortEdit(new DossierPort());
                setEditDossierPortDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterDossierPort = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadDossierPortToEdit = (data: DossierPort) => {
        if (data) {
            setEditDossierPortDialog(true);
            console.log("ID Dossier: " + data.dossierId);
            setDossierPortEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadDossierPortToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/dossiers/findall'), 'loadDossierPorts');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterDossierPort} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Dossier Port" visible={editDossierPortDialog} style={{ width: '50vw' }} modal onHide={() => setEditDossierPortDialog(false)}>
            <DossierPortForm 
                dossierPort={dossierPortEdit} 
                handleChange={handleChangeEdit}
                handleNumberChange={handleNumberChangeEdit}
                handleDateChange={handleDateChangeEdit}
            />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <DossierPortForm 
                    dossierPort={dossierPort} 
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleDateChange={handleDateChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setDossierPort(new DossierPort())} />
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
                            <DataTable value={dossierPorts} header={renderSearch} emptyMessage={"Pas de dossiers à afficher"}>
                                <Column field="dossierId" header="ID Dossier" />
                                <Column field="nomDossier" header="Nom Dossier" />
                                <Column field="adresse" header="Adresse" />
                                <Column field="tel" header="Téléphone" />
                                <Column field="longueurCpte" header="longueur Compte" />
                                <Column field="dernierDateAmmo" header="Date derniere Ammo" />
                                <Column field="axe1" header="axe1" />
                                <Column field="axe2" header="axe2" />
                                 

                                <Column field="tauxTVA" header="Taux TVA" />
                                <Column field="compteTVA" header="Compte TVA" />
                                <Column field="nif" header="NIF" />
                                <Column field="registreCommerce" header="Registre Commerce" />
                                <Column field="commune" header="Commune" />
                                <Column field="colline" header="Colline" />
                                <Column field="avenue" header="Avenue" />

                                <Column field="numeroAdresse" header="Numero" />
                                <Column field="assujetiTVA" header="Assujetti TVA" 
                                  body={(rowData) => rowData.assujetiTVA ? 'Oui' : 'Non'}  />
                                <Column field="assujetiTC" header="Assujetti TC" 
                                body={(rowData) => rowData.assujetiTC ? 'Oui' : 'Non'} />
                                <Column field="assujetiPF" header="assujetti PF" 
                                body={(rowData) => rowData.assujetiPF ? 'Oui' : 'Non'}
                                />
                                <Column field="centreFiscale" header="Centre fiscal" />
                                <Column field="secteurActivite" header="Secteur d'Activite" />
                                <Column field="formeJuridique" header="Forme Juridique" />
                                <Column field="Province" header="Province" />
                                <Column header="Options" body={optionButtons} />

                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default DossierPortComponent;