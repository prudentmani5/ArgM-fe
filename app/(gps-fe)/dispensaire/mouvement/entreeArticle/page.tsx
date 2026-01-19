'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { StkEntree, StkEntreeDetails } from './StkEntree';
import StkEntreeForm from './StkEntreeForm';
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

const BASE_URL = `${API_BASE_URL}/stkEntrees`;
const BASE_URLD = `${API_BASE_URL}/stkEntreeDetails`;

export default function StkEntreePage() {
    const [entree, setEntree] = useState<StkEntree>(new StkEntree());
    const [details, setDetails] = useState<StkEntreeDetails[]>([]);
    const [entrees, setEntrees] = useState<StkEntree[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Data for dropdowns
    const [fournisseurs, setFournisseurs] = useState<any[]>([]);
    const [typeMvts, setTypeMvts] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [exercices, setExercices] = useState<any[]>([]);
    const [magasins, setMagasins] = useState<any[]>([]);
    const [responsables, setResponsables] = useState<any[]>([]);
    const [selectedEntree, setSelectedEntree] = useState<StkEntree | null>(null);
    const [entreeDetails, setEntreeDetails] = useState<StkEntreeDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };


    useEffect(() => {
        console.log('Données chargées:', {
            fournisseurs,
            typeMvts,
            articles,
            exercices,
            magasins,
            responsables
        });
    }, [fournisseurs, typeMvts, articles, exercices, magasins, responsables]);
    useEffect(() => {
        loadAllEntrees();
        loadDropdownData();
    }, []);

    // Modifiez la fonction loadDropdownData comme suit :
    const loadDropdownData = async () => {
        try {
            setLoading(true);

            const endpoints = [
                { url: `${API_BASE_URL}/articles/findall`, setter: setArticles },
                { url: `${API_BASE_URL}/typeMvts/findall`, setter: setTypeMvts },
                { url: `${API_BASE_URL}/stkExercices/findall`, setter: setExercices },
                { url: `${API_BASE_URL}/stkMagasinResponsables/findall`, setter: setResponsables },
                { url: `${API_BASE_URL}/magasins/findall`, setter: setMagasins },
                { url: `${API_BASE_URL}/fournisseurs/findall`, setter: setFournisseurs }
            ];

            // Utilisation de Promise.allSettled pour que les erreurs sur un endpoint n'affectent pas les autres
            const results = await Promise.allSettled(
                endpoints.map(endpoint => axios.get(endpoint.url))
            );

            // Traitement des résultats
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    endpoints[index].setter(result.value.data);
                    console.log(`Données chargées pour ${endpoints[index].url}:`, result.value.data);
                } else {
                    console.error(`Erreur de chargement pour ${endpoints[index].url}:`, result.reason);
                    accept('error', 'Erreur', `Échec du chargement des données pour ${endpoints[index].url.split('/')[3]}`);
                }
            });

        } catch (error) {
            console.error("Erreur globale lors du chargement des données:", error);
            accept('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };
    const loadAllEntrees = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setEntrees(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des entrées');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntree(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setEntree(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setEntree(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setEntree(prev => ({ ...prev, [name]: value }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, {
            ...new StkEntreeDetails(),
            entreeDetailId: undefined // S'assure qu'aucun ID n'est défaut
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

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            // Save main entry
            const entreeResponse = await axios.post(`${BASE_URL}/new`, {
                ...entree,
                entreeId: null, // Ensure new entity
                dateEntree: entree.dateEntree?.toISOString(),
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpdate: "system"
            });

            if (!entreeResponse.data?.entreeId) {
                throw new Error("Failed to save main entry");
            }

            // Save details
            if (details.length > 0) {
                for (const detail of details) {
                    await axios.post(`${BASE_URLD}/new`, {
                        ...detail,
                        entreeDetailsId: null, // Ensure new entity
                        entreeId: entreeResponse.data.entreeId,
                        numeroPiece: entreeResponse.data.numeroPiece,
                        articleStockId: entreeResponse.data.numeroPiece,
                        uniteId: entreeResponse.data.numeroPiece,
                        datePeremption: detail.datePeremption?.toISOString(),
                        dateFabrication: detail.dateFabrication?.toISOString(),
                        dateCreation: now,
                        dateUpdate: now,
                        userCreation: "system",
                        userUpdate: "system"
                    });
                }
            }

            accept('success', 'Succès', 'Entrée créée avec succès');
            setEntree(new StkEntree());
            setDetails([]);
            loadAllEntrees();
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

    const filteredEntrees = entrees.filter(entree =>
        entree.numeroPiece?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        entree.reference?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadEntreeDetails = async (entreeId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/findbyentree?entreeId=${entreeId}`);
            setEntreeDetails(response.data);
            setDetailsDialogVisible(true);
        } catch (error) {
            console.error("Error loading entry details:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails');
        } finally {
            setLoading(false);
        }
    };
    
   

    return (
        <div className="card">
            <Toast ref={toast} />
            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="p-tabview"
            >
               
         

                <TabPanel header="Nouvelle entrée" className="p-tabview-panel">
                    <StkEntreeForm
                        entree={entree}
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
                        fournisseurs={fournisseurs}
                        typeMvts={typeMvts}
                        articles={articles}
                        exercices={exercices}
                        magasins={magasins}
                        responsables={responsables}
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
                <TabPanel header="Liste des entrées" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>

                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par pièce ou référence"
                                className="w-full"
                            />
                        </span>
                    </div>
                     
                    <DataTable
                        value={filteredEntrees}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucune entrée trouvée"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                        selectionMode="single"
                        onSelectionChange={(e) => {
                            const selected = e.value as StkEntree;
                            setSelectedEntree(selected);
                            loadEntreeDetails(selected.entreeId);
                        }}
                        selection={selectedEntree}
                        rowClassName={() => "cursor-pointer"}
                    >
                        <Column field="numeroPiece" header="Numéro Pièce" sortable  />
                        <Column field="magasinId" header="Magasin" sortable  />
                        

        
                          <Column
                            field="dateEntree"
                            header="Date Entrée"
                            body={(rowData) => formatDate(rowData.dateEntree)}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column
                            field="montant"
                            header="Montant"
                            body={(rowData) => rowData.montant?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                       <Column field="exerciceId" header="Exercice" sortable  />
                       <Column field="reference" header="reference" sortable  />
                        <Column field="fournisseurId" header="Fournisseur" sortable />
                      
                    </DataTable>
                  
                </TabPanel>
            </TabView>
            <Dialog 
            header={`Détails de l'entrée ${selectedEntree?.numeroPiece}`}
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
                    value={entreeDetails}
                    emptyMessage="Aucun détail trouvé"
                    className="p-datatable-sm"
                >
                    <Column field="numeroPiece" header="Numero Piece" sortable  />
                    <Column field="qteE" header="Quantité" />
                   {/* <Column field="pau" header="Prix d'achat unitaire" 
                        body={(rowData) => rowData.pau?.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'BIF',
                            minimumFractionDigits: 0
                        })} 
                    />
                   */}
                    <Column field="PrixE" header="Prix Unitaire" 
                        body={(rowData) => rowData.prixE?.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'BIF',
                            minimumFractionDigits: 0
                        })} 
                    />
                    <Column 
                        field="datePeremption" 
                        header="Date péremption" 
                        body={(rowData) => formatDate(rowData.datePeremption)}
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