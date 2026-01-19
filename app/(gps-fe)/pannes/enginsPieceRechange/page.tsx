'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { EnginsPieceRechange } from './EnginsPieceRechange';
import { PanEngin } from './PanEngin';
import { PieceRechange } from './PieceRechange';
import EnginsPieceRechangeForm from './EnginsPieceRechangeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function EnginsPieceRechangeComponent() {
    const [enginsPieceRechange, setEnginsPieceRechange] = useState<EnginsPieceRechange>(new EnginsPieceRechange());
    const [enginsPieceRechangeEdit, setEnginsPieceRechangeEdit] = useState<EnginsPieceRechange>(new EnginsPieceRechange());
    const [editEnginsPieceRechangeDialog, setEditEnginsPieceRechangeDialog] = useState(false);
    const [enginsPieceRechanges, setEnginsPieceRechanges] = useState<EnginsPieceRechange[]>([]);
    const [engins, setEngins] = useState<PanEngin[]>([]);
    const [piecesRechange, setPiecesRechange] = useState<PieceRechange[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    
    const { data: enginsData, loading: enginsLoading, error: enginsError, fetchData: fetchEngins } = useConsumApi('');
    const { data: piecesRechangeData, loading: piecesRechangeLoading, error: piecesRechangeError, fetchData: fetchPiecesRechange } = useConsumApi('');
    const { data: enginsPieceRechangesData, loading: enginsPieceRechangesLoading, error: enginsPieceRechangesError, fetchData: fetchEnginsPieceRechanges } = useConsumApi('');
    
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const BASE_URL = `${API_BASE_URL}/enginsPieceRechange`;
    const ENGINS_URL = `${API_BASE_URL}/PanEngins/findall`;
    const PIECES_RECHANGE_URL = `${API_BASE_URL}/piecesRechanges/findall`;

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
        fetchEngins(null, 'GET', ENGINS_URL);
        fetchPiecesRechange(null, 'GET', PIECES_RECHANGE_URL);
    }, []);

    useEffect(() => {
        if (enginsData) {
            setEngins(enginsData);
        }
        if (piecesRechangeData) {
            setPiecesRechange(piecesRechangeData);
        }
        if (enginsPieceRechangesData) {
            setEnginsPieceRechanges(Array.isArray(enginsPieceRechangesData) ? enginsPieceRechangesData : [enginsPieceRechangesData]);
        }
    }, [enginsData, piecesRechangeData, enginsPieceRechangesData]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setEnginsPieceRechange(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: any) => {
        const { name, value } = e.target;
        setEnginsPieceRechangeEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!enginsPieceRechange.enginId || !enginsPieceRechange.pieceRechangeId) {
            accept('warn', 'Attention', 'Veuillez sélectionner un engin et une pièce de rechange');
            return;
        }
        
        setBtnLoading(true);
        const enginPieceToSend = { ...enginsPieceRechange, enginPieceRechangeId: null };
        fetchEnginsPieceRechanges(enginPieceToSend, 'POST', `${BASE_URL}/new`, 'createEnginsPieceRechange')
            .then(() => {
                setEnginsPieceRechange(new EnginsPieceRechange());
                accept('info', 'Succès', 'Association engin/pièce créée avec succès');
            })
            .catch(() => {
                accept('error', 'Erreur', 'Échec de la création de l\'association');
            })
            .finally(() => setBtnLoading(false));
    };

    const handleSubmitEdit = () => {
        if (!enginsPieceRechangeEdit.enginPieceRechangeId) {
            accept('error', 'Erreur', 'ID de l\'association manquant');
            return;
        }
        
        setBtnLoading(true);
        fetchEnginsPieceRechanges(
            enginsPieceRechangeEdit, 
            'PUT', 
            `${BASE_URL}/update/${enginsPieceRechangeEdit.enginPieceRechangeId}`, 
            'updateEnginsPieceRechange'
        )
        .then(() => {
            accept('info', 'Succès', 'Association mise à jour avec succès');
            setEnginsPieceRechangeEdit(new EnginsPieceRechange());
            setEditEnginsPieceRechangeDialog(false);
            loadAllData();
        })
        .catch(() => {
            accept('error', 'Erreur', 'Échec de la mise à jour de l\'association');
        })
        .finally(() => setBtnLoading(false));
    };

    const loadEnginsPieceRechangeToEdit = (data: EnginsPieceRechange) => {
        if (data) {
            setEditEnginsPieceRechangeDialog(true);
            setEnginsPieceRechangeEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadEnginsPieceRechangeToEdit(data)} 
                    raised 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchEnginsPieceRechanges(null, 'GET', `${BASE_URL}/findall`, 'loadEnginsPieceRechanges');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const getEnginDesignation = (enginId: string) => {
        const engin = engins.find(e => e.enginId === enginId);
        return engin ? `${engin.enginDesignation} (${engin.marque} ${engin.modele})` : 'Inconnu';
    };

    const getPieceRechangeDesignation = (pieceRechangeId: string) => {
        const piece = piecesRechange.find(p => p.pieceRechangeId === pieceRechangeId);
        return piece ? `${piece.designationPieceRechange} (${piece.numeroCatalogue})` : 'Inconnu';
    };

    const filteredData = enginsPieceRechanges.filter(item => {
        if (!item) return false;
        return JSON.stringify({
            engin: getEnginDesignation(item.enginId),
            pieceRechange: getPieceRechangeDesignation(item.pieceRechangeId)
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
                header="Modifier  Engin/Pièce" 
                visible={editEnginsPieceRechangeDialog} 
                style={{ width: '30vw' }} 
                modal 
                onHide={() => setEditEnginsPieceRechangeDialog(false)}
            >
                <EnginsPieceRechangeForm 
                    enginsPieceRechange={enginsPieceRechangeEdit} 
                    handleChange={handleChangeEdit}
                    engins={engins}
                    piecesRechange={piecesRechange}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditEnginsPieceRechangeDialog(false)} 
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
                <TabPanel header="Nouvelle">
                    <EnginsPieceRechangeForm 
                        enginsPieceRechange={enginsPieceRechange} 
                        handleChange={handleChange}
                        engins={engins}
                        piecesRechange={piecesRechange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setEnginsPieceRechange(new EnginsPieceRechange())} 
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
                
                <TabPanel header="Liste">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={filteredData} 
                                    header={renderSearch}
                                    emptyMessage={"Pas d'associations à afficher"}
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                    loading={enginsPieceRechangesLoading}
                                >
                                    <Column 
                                        header="Engin" 
                                        body={(data) => getEnginDesignation(data.enginId)} 
                                    />
                                    <Column 
                                        header="Pièce de rechange" 
                                        body={(data) => getPieceRechangeDesignation(data.pieceRechangeId)} 
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

export default EnginsPieceRechangeComponent;