// page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { StkSortie, StkSortieDetails } from './StkSortie';
import StkSortieForm from './StkSortieForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';

const BASE_URL = 'http://localhost:8080/stkSorties';
const BASE_URLD = 'http://localhost:8080/stkSortieDetails';

export default function StkSortiePage() {
    const [sortie, setSortie] = useState<StkSortie>(new StkSortie());
    const [details, setDetails] = useState<StkSortieDetails[]>([]);
    const [sorties, setSorties] = useState<StkSortie[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Data for dropdowns
    const [typeMvts, setTypeMvts] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [exercices, setExercices] = useState<any[]>([]);
    const [magasins, setMagasins] = useState<any[]>([]);
    const [magResponsables, setMagResponsables] = useState<any[]>([]);
    const [servResponsables, setServResponsables] = useState<any[]>([]);
    const [unites, setUnites] = useState<any[]>([]);
    const [selectedSortie, setSelectedSortie] = useState<StkSortie | null>(null);
    const [sortieDetails, setSortieDetails] = useState<StkSortieDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllSorties();
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);

            const endpoints = [
                { url: 'http://localhost:8080/articles/findall', setter: setArticles },
                { url: 'http://localhost:8080/typeMvts/findall', setter: setTypeMvts },
                { url: 'http://localhost:8080/stkExercices/findall', setter: setExercices },
                { url: 'http://localhost:8080/stkMagasinResponsables/findall', setter: setMagResponsables },
                { url: 'http://localhost:8080/stkServiceResponsables/findall', setter: setServResponsables },
                { url: 'http://localhost:8080/magasins/findall', setter: setMagasins },
                { url: 'http://localhost:8080/unites/findall', setter: setUnites }
            ];

            const results = await Promise.allSettled(
                endpoints.map(endpoint => axios.get(endpoint.url))
            );

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    endpoints[index].setter(result.value.data);
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

    const loadAllSorties = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setSorties(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des sorties');
        } finally {
            setLoading(false);
        }
    };


    const loadEntreeData = async (numeroPiece: string) => {
    try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/stkSortieDetails/findbyEntrees?sortieId=${numeroPiece}`);
        
        if (response.data) {
            // Convertir les données d'entrée en format sortie
            const entreeData = response.data;
            setSortie(prev => ({
                ...prev,
                numeroPiece: entreeData.numeroPiece || '',
                magasinId: entreeData.magasinId || '',
                exerciceId: entreeData.exerciceId || '',
                typeMvtId: entreeData.typeMvtId || '',
                dateSortie: entreeData.dateEntree ? new Date(entreeData.dateEntree) : null,
                magRespId: entreeData.magRespId || '',
                reference: entreeData.reference || '',
                montant: entreeData.montant || 0,
                userCreation: entreeData.userCreation || 'system',
                dateCreation: entreeData.dateCreation ? new Date(entreeData.dateCreation) : null
            }));

            // Si vous avez aussi besoin de charger les détails
            if (entreeData.details) {
                setDetails(entreeData.details.map((detail: any) => ({
                    ...detail,
                    datePeremption: detail.datePeremption ? new Date(detail.datePeremption) : null
                })));
            }
        }
    } catch (error) {
        console.error("Erreur lors du chargement des données d'entrée:", error);
        accept('error', 'Erreur', 'Échec du chargement des données de l\'entrée');
    } finally {
        setLoading(false);
    }
};


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSortie(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setSortie(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setSortie(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setSortie(prev => ({ ...prev, [name]: value }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, {
            ...new StkSortieDetails(),
            sortieDetailsId: undefined
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

    const checkNumeroPiece = async (numeroPiece: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${BASE_URLD}/findbySortie?sortieId=${numeroPiece}`);
            return response.data;
        } catch (error) {
            console.error("Error checking numeroPiece:", error);
            return false;
        }
    };

 const handleSubmit = async () => {
    try {
        setBtnLoading(true);
        const now = new Date().toISOString();

        // 1. Enregistrer la sortie principale
        const sortieResponse = await axios.post(`${BASE_URL}/new`, {
            ...sortie,
            sortieId: null,
            dateCreation: now,
            dateUpdate: now,
            userCreation: "system",
            userUpdate: "system"
        });

        if (!sortieResponse.data?.sortieId) {
            throw new Error("Failed to save main entry");
        }

        // 2. Préparer les détails en supprimant les propriétés d'erreur
        const detailsToSave = details.map(({  ...detail }) => ({
            ...detail,
            sortieDetailsId: null,
            sortieId: sortieResponse.data.sortieId,
            numeroPiece: sortieResponse.data.numeroPiece,
            datePeremption: detail.datePeremption?.toISOString(),
            dateCreation: now,
            dateUpdate: now,
            userCreation: "system",
            userUpdate: "system"
        }));

        // 3. Enregistrer les détails
        if (detailsToSave.length > 0) {
            await axios.post(`${BASE_URLD}/new`, detailsToSave);
        }

        accept('success', 'Succès', 'Sortie créée avec succès');
        setSortie(new StkSortie());
        setDetails([]);
        loadAllSorties();
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

    const filteredSorties = sorties.filter(sortie =>
        sortie.numeroPiece?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        sortie.reference?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadSortieDetails = async (sortieId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/findbysortie?sortieId=${sortieId}`);
            setSortieDetails(response.data);
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
                <TabPanel header="Nouvelle sortie" className="p-tabview-panel">
                    <StkSortieForm
                        sortie={sortie}
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
                        typeMvts={typeMvts}
                        articles={articles}
                        exercices={exercices}
                        magasins={magasins}
                        magResponsables={magResponsables}
                        servResponsables={servResponsables}
                        unites={unites}
                        checkNumeroPiece={checkNumeroPiece}
                        loadEntreeData={loadEntreeData}
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
                <TabPanel header="Liste des sorties" className="p-tabview-panel">
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
                        value={filteredSorties}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucune sortie trouvée"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                        selectionMode="single"
                        onSelectionChange={(e) => {
                            const selected = e.value as StkSortie;
                            setSelectedSortie(selected);
                            loadSortieDetails(selected.sortieId);
                        }}
                        selection={selectedSortie}
                        rowClassName={() => "cursor-pointer"}
                    >
                        <Column field="numeroPiece" header="Numéro Pièce" sortable />
                        <Column field="magasinId" header="Magasin" sortable />
                        <Column
                            field="dateSortie"
                            header="Date Sortie"
                            body={(rowData) => formatDate(rowData.dateSortie)}
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
                        <Column field="exerciceId" header="Exercice" sortable />
                        <Column field="servRespIdDemandeur" header="Demandeur" sortable />
                        <Column field="reference" header="Référence" sortable />
                    </DataTable>
                </TabPanel>
            </TabView>
            <Dialog 
                header={`Détails de la sortie ${selectedSortie?.numeroPiece}`}
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
                        value={sortieDetails}
                        emptyMessage="Aucun détail trouvé"
                        className="p-datatable-sm"
                    >
                        <Column field="qteS" header="Quantité" />
                        <Column field="prixS" header="Prix de sortie" 
                            body={(rowData) => rowData.prixS?.toLocaleString('fr-FR', { 
                                style: 'currency', 
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })} 
                        />
                        <Column field="pUMP" header="PUMP" 
                            body={(rowData) => rowData.pUMP?.toLocaleString('fr-FR', { 
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