'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { CompteBanque } from './CompteBanque';
import { Bank } from './Bank';
import { Devise } from './Devise';
import CompteBanqueForm from './CompteBanqueForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function CompteBanqueComponent() {
    const [compteBanque, setCompteBanque] = useState<CompteBanque>(new CompteBanque());
    const [compteBanqueEdit, setCompteBanqueEdit] = useState<CompteBanque>(new CompteBanque());
    const [editCompteBanqueDialog, setEditCompteBanqueDialog] = useState(false);
    const [compteBanques, setCompteBanques] = useState<CompteBanque[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [devises, setDevises] = useState<Devise[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    
    // Utilisation de plusieurs instances de useConsumApi pour chaque type de données
    const { data: banksData, loading: banksLoading, error: banksError, fetchData: fetchBanks } = useConsumApi('');
    const { data: devisesData, loading: devisesLoading, error: devisesError, fetchData: fetchDevises } = useConsumApi('');
    const { data: comptesData, loading: comptesLoading, error: comptesError, fetchData: fetchComptes } = useConsumApi('');
    
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const BASE_URL = `${API_BASE_URL}/compteBanques`;
    const BANKS_URL = `${API_BASE_URL}/banks/findall`;
    const DEVISES_URL = `${API_BASE_URL}/deviseCaisses/findall`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        }); 
    };

    useEffect(() => {
        // Chargement initial des données
        fetchBanks(null, 'GET', BANKS_URL);
        fetchDevises(null, 'GET', DEVISES_URL);
    }, []);

    useEffect(() => {
        if (banksData) {
            setBanks(banksData);
        }
        if (devisesData) {
            setDevises(devisesData);
        }
        if (comptesData) {
            setCompteBanques(Array.isArray(comptesData) ? comptesData : [comptesData]);
        }
    }, [banksData, devisesData, comptesData]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setCompteBanque(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: any) => {
        const { name, value } = e.target;
        setCompteBanqueEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!compteBanque.numeroCompte || !compteBanque.banqueId || !compteBanque.deviseId) {
            accept('warn', 'Attention', 'Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        setBtnLoading(true);
        const compteToSend = { ...compteBanque, compteBanqueId: null };
        fetchComptes(compteToSend, 'POST', `${BASE_URL}/new`, 'createCompteBanque')
            .then(() => {
                setCompteBanque(new CompteBanque());
                accept('info', 'Succès', 'Compte bancaire créé avec succès');
            })
            .catch(() => {
                accept('error', 'Erreur', 'Échec de la création du compte bancaire');
            })
            .finally(() => setBtnLoading(false));
    };

    const handleSubmitEdit = () => {
        if (!compteBanqueEdit.compteBanqueId) {
            accept('error', 'Erreur', 'ID du compte bancaire manquant');
            return;
        }
        
        setBtnLoading(true);
        fetchComptes(
            compteBanqueEdit, 
            'PUT', 
            `${BASE_URL}/update/${compteBanqueEdit.compteBanqueId}`, 
            'updateCompteBanque'
        )
        .then(() => {
            accept('info', 'Succès', 'Compte bancaire mis à jour avec succès');
            setCompteBanqueEdit(new CompteBanque());
            setEditCompteBanqueDialog(false);
            loadAllData();
        })
        .catch(() => {
            accept('error', 'Erreur', 'Échec de la mise à jour du compte bancaire');
        })
        .finally(() => setBtnLoading(false));
    };

    const loadCompteBanqueToEdit = (data: CompteBanque) => {
        if (data) {
            setEditCompteBanqueDialog(true);
            setCompteBanqueEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadCompteBanqueToEdit(data)} 
                    raised 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchComptes(null, 'GET', `${BASE_URL}/findall`, 'loadCompteBanques');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const getBanqueLibelle = (banqueId: number) => {
        const banque = banks.find(b => b.banqueId === banqueId);
        return banque ? banque.libelleBanque : 'Inconnu';
    };

    const getDeviseLibelle = (deviseId: number) => {
        const devise = devises.find(d => d.deviseId === deviseId);
        return devise ? devise.libelle : 'Inconnu';
    };

    const filteredData = compteBanques.filter(item => {
        if (!item) return false;
        return JSON.stringify({
            numeroCompte: item.numeroCompte || '',
            banque: getBanqueLibelle(item.banqueId),
            devise: getDeviseLibelle(item.deviseId)
        }).toLowerCase().includes(globalFilter.toLowerCase());
    });

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Réinitialiser" 
                    outlined 
                    onClick={() => setGlobalFilter('')} 
                />
                <span className="p-input-icon-left">
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
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                header="Modifier Compte Bancaire" 
                visible={editCompteBanqueDialog} 
                style={{ width: '30vw' }} 
                modal 
                onHide={() => setEditCompteBanqueDialog(false)}
            >
                <CompteBanqueForm 
                    compteBanque={compteBanqueEdit} 
                    handleChange={handleChangeEdit}
                    banks={banks}
                    devises={devises}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditCompteBanqueDialog(false)} 
                        className="p-button-text" 
                    />
                    <Button 
                        label="Modifier" 
                        icon="pi pi-check" 
                        loading={btnLoading} 
                        onClick={handleSubmitEdit} 
                    />
                </div>
            </Dialog>
            
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <CompteBanqueForm 
                        compteBanque={compteBanque} 
                        handleChange={handleChange}
                        banks={banks}
                        devises={devises}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setCompteBanque(new CompteBanque())} 
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button 
                                    icon="pi pi-check" 
                                    label="Enregistrer" 
                                    loading={btnLoading} 
                                    onClick={handleSubmit} 
                                />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={filteredData} 
                                    header={renderSearch}
                                    emptyMessage={"Pas de comptes bancaires à afficher"}
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                    loading={comptesLoading}
                                >
                                    <Column field="numeroCompte" header="Numéro de compte" />
                                    <Column 
                                        header="Banque" 
                                        body={(data) => getBanqueLibelle(data.banqueId)} 
                                    />
                                    <Column 
                                        header="Devise" 
                                        body={(data) => getDeviseLibelle(data.deviseId)} 
                                    />
                                    <Column header="Actions" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default CompteBanqueComponent;