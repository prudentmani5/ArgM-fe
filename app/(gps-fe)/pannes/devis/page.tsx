'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { PanDevis, PanDevisDetails, StkArticle } from './PanDevis';
import PanDevisForm from './PanDevisForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const BASE_URL = `${API_BASE_URL}/devis`;
const BASE_URLD = `${API_BASE_URL}/devisDetails`;

export default function PanDevisPage() {
    const [devis, setDevis] = useState<PanDevis>(new PanDevis());
    const [details, setDetails] = useState<PanDevisDetails[]>([]);
    const [devisList, setDevisList] = useState<PanDevis[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Data for dropdowns
    const [articles, setArticles] = useState<StkArticle[]>([]);
    const [selectedDevis, setSelectedDevis] = useState<PanDevis | null>(null);
    const [devisDetails, setDevisDetails] = useState<PanDevisDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllDevis();
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/articles/findall`);
            setArticles(response.data);
        } catch (error) {
            console.error("Error loading articles:", error);
            accept('error', 'Erreur', 'Échec du chargement des articles');
        } finally {
            setLoading(false);
        }
    };

    const loadAllDevis = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setDevisList(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des devis');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDevis(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setDevis(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setDevis(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setDevis(prev => ({ ...prev, [name]: value }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, {
            ...new PanDevisDetails(),
            devisDetailsId: undefined,
            ordre: prev.length + 1
        }]);
    };

    const removeDetail = (index: number) => {
        setDetails(prev => prev.filter((_, i) => i !== index));
    };

    const updateDetail = (index: number, field: string, value: any) => {
        setDetails(prev => {
            const newDetails = [...prev];
            newDetails[index] = {
                ...newDetails[index],
                [field]: value
            };
            return newDetails;
        });
    };

    const checkDevisId = async (devisId: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${BASE_URL}/exists?devisId=${devisId}`);
            return response.data;
        } catch (error) {
            console.error("Error checking devisId:", error);
            return false;
        }
    };

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            // 1. Enregistrer le devis principal
            const devisResponse = await axios.post(`${BASE_URL}/new`, {
                ...devis,
                devisIncrement: null,
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpdate: "system"
            });

            if (!devisResponse.data?.devisId) {
                throw new Error("Failed to save main entry");
            }

            // 2. Préparer les détails
            const detailsToSave = details.map(({ ...detail }) => ({
                ...detail,
                devisDetailsId: null,
                devisId: devisResponse.data.devisId,
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpdate: "system"
            }));

            // 3. Enregistrer les détails
            if (detailsToSave.length > 0) {
                await axios.post(`${BASE_URLD}/new`, detailsToSave);
            }

            accept('success', 'Succès', 'Devis créé avec succès');
            setDevis(new PanDevis());
            setDetails([]);
            loadAllDevis();
        } catch (error) {
            console.error("Erreur:", error);
            accept('error', 'Erreur', 'Échec de la création');
        } finally {
            setBtnLoading(false);
        }
    };

    const formatDate = (date: Date | string | null | undefined): string => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const filteredDevis = devisList.filter(devis =>
        devis.devisId?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        devis.description?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadDevisDetails = async (devisId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/findbyDetails?devisId=${devisId}`);
            setDevisDetails(response.data);
            setDetailsDialogVisible(true);
        } catch (error) {
            console.error("Error loading entry details:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails');
        } finally {
            setLoading(false);
        }
    };



    // Calcul du montant total (somme des prix totaux des articles + frais de transport)
    const calculateMontantTotal = () => {
        //const totalArticles = details.reduce((sum, detail) => sum + (detail.pt || 0), 0);
        const totalArticles = details.reduce((sum, detail) => sum + (0 || 0), 0);
        return totalArticles + (devis.devisFraisTransport || 0);
    };

    // Calcul du montant net (montant total + TVA)
    const calculateMontantNet = () => {
        const montantTotal = calculateMontantTotal();
        const tauxTVA = devis.tauxTVA || 0;
        return montantTotal * (1 + tauxTVA / 100);
    };

    // Mettre à jour les calculs lorsque les détails ou les frais changent
    useEffect(() => {
        const newMontantTotal = calculateMontantTotal();
        const newMontantNet = calculateMontantNet();
        
        // Mettre à jour les valeurs dans l'objet devis
        handleNumberChange({ value: newMontantTotal } as InputNumberValueChangeEvent, 'montantTotal');
        handleNumberChange({ value: newMontantNet } as InputNumberValueChangeEvent, 'montantNet');
        
        // Calculer et mettre à jour le montant TVA
        const montantTVA = newMontantTotal * ((devis.tauxTVA || 0) / 100);
        handleNumberChange({ value: montantTVA } as InputNumberValueChangeEvent, 'montantTTVA');
    }, [details, devis.devisFraisTransport, devis.tauxTVA]);

    return (
        <div className="card">
            <Toast ref={toast} />
            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="p-tabview"
            >
                <TabPanel header="Nouveau devis" className="p-tabview-panel">
                    <PanDevisForm
                        devis={devis}
                        details={details}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        addDetail={addDetail}
                        removeDetail={removeDetail}
                        updateDetail={updateDetail}
                        loading={loading}
                        setDetails={setDetails}
                        articles={articles}
                        checkDevisId={checkDevisId}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Enregistrer"
                            icon="pi pi-check"
                            loading={btnLoading}
                            onClick={handleSubmit}
                            className="p-button-success"
                        />
                    </div>
                </TabPanel>
                <TabPanel header="Liste des devis" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par ID ou description"
                                className="w-full"
                            />
                        </span>
                    </div>
                     
                    <DataTable
                        value={filteredDevis}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucun devis trouvé"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                        selectionMode="single"
                        onSelectionChange={(e) => {
                            const selected = e.value as PanDevis;
                            setSelectedDevis(selected);
                            loadDevisDetails(selected.devisId);
                        }}
                        selection={selectedDevis}
                        rowClassName={() => "cursor-pointer"}
                    >
                        <Column field="devisId" header="ID Devis" sortable />
                        <Column
                            field="date"
                            header="Date"
                            body={(rowData) => formatDate(rowData.date)}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column field="description" header="Description" sortable />
                        <Column
                            field="DevisFraisTransport"
                            header="Frais Transport et Main d'oeuvre"
                            body={(rowData) => rowData.devisFraisTransport?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                            sortable
                            style={{ minWidth: '120px' }}
                        />

                        <Column
                            field="tauxTVA"
                            header="Taux TVA (%)"
                           
                            sortable
                            style={{ minWidth: '120px' }}
                        />


                         

                        <Column
                            field="montantTTVA"
                            header="Montant TVA"
                            body={(rowData) => rowData.montantTTVA?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>
            <Dialog 
                header={`Détails du devis ${selectedDevis?.devisId}`}
                visible={detailsDialogVisible} 
                style={{ width: '75vw' }}
                onHide={() => setDetailsDialogVisible(false)}
            >
                {loading ? (
                    <div className="flex justify-content-center">
                        <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem' }}></i>
                    </div>
                ) : (
                    <DataTable
                        value={devisDetails}
                        emptyMessage="Aucun détail trouvé"
                        className="p-datatable-sm"
                    >
                        <Column field="ordre" header="Ordre" />
                        <Column field="articleId" header="Article" />
                        <Column field="position" header="Position" />
                        <Column field="figure" header="Figure" />
                        <Column field="numPiece" header="Numéro Pièce" />
                        <Column field="qte" header="Quantité" />
                        <Column field="pu" header="Prix Unitaire" 
                            body={(rowData) => rowData.pu?.toLocaleString('fr-FR', { 
                                style: 'currency', 
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })} 
                        />
                        <Column field="pt" header="Prix Total" 
                            body={(rowData) => rowData.pt?.toLocaleString('fr-FR', { 
                                style: 'currency', 
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })} 
                        />
                    </DataTable>
                )}
            </Dialog>
            <style jsx>{`
                .cursor-pointer {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}