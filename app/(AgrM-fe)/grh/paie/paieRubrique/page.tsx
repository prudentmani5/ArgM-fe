'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { PaieRubrique } from './PaieRubrique';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import PaieRubriqueForm from './PaieRubriqueForm';
import { API_BASE_URL } from '@/utils/apiConfig';

function PaieParametreComponent() {
    const baseUrl = `${API_BASE_URL}`;
    
    const [paieParametre, setPaieParametre] = useState<PaieRubrique>(new PaieRubrique());
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [loadBtnLoading, setLoadBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadCurrentParameters') {
                if (data) {
                    setPaieParametre(data);
                    accept('success', 'Paramètres chargés', 'Les paramètres actuels ont été chargés avec succès.');
                } else {
                    accept('info', 'Aucun paramètre', 'Aucun paramètre trouvé dans la base de données.');
                }
                setLoadBtnLoading(false);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaieParametre((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setPaieParametre((prev) => ({ ...prev, [field]: value || 0 }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', paieParametre);
        
        if (paieParametre.paramId && paieParametre.paramId > 0) {
            // Update existing parameters
            fetchData(paieParametre, 'Put', `${baseUrl}/api/grh/paie/rubriques/update/${paieParametre.paramId}`, 'updatePaieParametre');
        } else {
            // Create new parameters
            fetchData(paieParametre, 'Post', `${baseUrl}/api/grh/paie/rubriques/new`, 'createPaieParametre');
        }
    };

    const handleLoadCurrentParameters = () => {
        setLoadBtnLoading(true);
        fetchData(null, 'Get', `${baseUrl}/api/grh/paie/rubriques/current`, 'loadCurrentParameters');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType === 'createPaieParametre')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updatePaieParametre')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1 && callType === 'loadCurrentParameters')
            accept('warn', 'A votre attention', 'Impossible de charger les paramètres actuels.');
        else if (data !== null && error === null) {
            if (callType === 'createPaieParametre') {
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updatePaieParametre') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
            }
        }
        setBtnLoading(false);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index);
    };

    return (
        <>
            <Toast ref={toast} />
            
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Paramètres de Paie">
                    <PaieRubriqueForm 
                        paieParametre={paieParametre as PaieRubrique} 
                        handleChange={handleChange} 
                        handleNumberChange={handleNumberChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setPaieParametre(new PaieRubrique())} 
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button 
                                    icon="pi pi-check" 
                                    label={paieParametre.paramId && paieParametre.paramId > 0 ? "Modifier" : "Enregistrer"} 
                                    loading={btnLoading} 
                                    onClick={handleSubmit} 
                                />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Charger les paramètres">
                    <div className='grid'>
                        <div className='col-12'>
                            <Card title="Charger les Paramètres Actuels" className="mb-3">
                                <p className="m-0 mb-3">
                                    Cliquez sur le bouton ci-dessous pour charger les paramètres de paie actuellement 
                                    configurés dans le système. Ceux-ci seront chargés dans le premier onglet 
                                    pour modification.
                                </p>
                                <Button 
                                    icon="pi pi-download" 
                                    label="Charger les Paramètres Actuels" 
                                    loading={loadBtnLoading}
                                    onClick={handleLoadCurrentParameters}
                                    className="p-button-lg"
                                />
                            </Card>
                            
                            {paieParametre.paramId && paieParametre.paramId > 0 && (
                                <Card title="Paramètres Chargés" className="mb-3">
                                    <div className="grid">
                                        <div className="col-6">
                                            <p><strong>ID Paramètre:</strong> {paieParametre.paramId}</p>
                                            <p><strong>Nombre de jours prestés:</strong> {paieParametre.nbrJrsPreste}</p>
                                            <p><strong>Taux INSS Pension SC Personnel:</strong> {paieParametre.tauxInssPensionScPers}%</p>
                                            <p><strong>Taux INSS Pension SS Personnel:</strong> {paieParametre.tauxInssPensionSsPers}%</p>
                                        </div>
                                        <div className="col-6">
                                            <p><strong>Allocation Enfant:</strong> {paieParametre.enfantMontant}</p>
                                            <p><strong>Allocation Conjoint:</strong> {paieParametre.conjointMontant}</p>
                                            <p><strong>IPR Plafond:</strong> {paieParametre.iprPlafond}</p>
                                            <p><strong>Taux IPR Plafond:</strong> {paieParametre.tauxIprPlafond}%</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <Button 
                                            icon="pi pi-pencil" 
                                            label="Aller à l'onglet de modification" 
                                            onClick={() => setActiveIndex(0)}
                                            className="p-button-secondary"
                                        />
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default PaieParametreComponent;