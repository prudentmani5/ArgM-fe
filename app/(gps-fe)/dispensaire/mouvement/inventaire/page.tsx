// page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { StkInventaireDetails } from './StkInventaire';
import StkInventaire from './StkInventaire';
import StkInventaireForm from './StkInventaireForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/utils/apiConfig';

const BASE_URL = `${API_BASE_URL}/stkinventaire`;
const BASE_URLD = `${API_BASE_URL}/inventaireDetails`;

export default function StkInventairePage() {
    const [inventaire, setInventaire] = useState<StkInventaire>(new StkInventaire());
    //const [consommation, setConsommation] = useState<StkConsommation>(new StkConsommation());
    const [details, setDetails] = useState<StkInventaireDetails[]>([]);
    const [inventaires, setInventaires] = useState<StkInventaire[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Data for dropdowns
    const [magasins, setMagasins] = useState<any[]>([]);
    const [exercices, setExercices] = useState<any[]>([]);
    const [responsables, setResponsables] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [unites, setUnites] = useState<any[]>([]);
    const [selectedInventaire, setSelectedInventaire] = useState<StkInventaire | null>(null);
    const [inventaireDetails, setInventaireDetails] = useState<StkInventaireDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllInventaires();
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);

            const endpoints = [
                { url: `${API_BASE_URL}/magasins/findall`, setter: setMagasins },
                { url: `${API_BASE_URL}/stkExercices/findall`, setter: setExercices },
                { url: `${API_BASE_URL}/stkMagasinResponsables/findall`, setter: setResponsables },
                { url: `${API_BASE_URL}/articles/findall`, setter: setArticles },
                { url: `${API_BASE_URL}/unites/findall`, setter: setUnites }
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

    const loadAllInventaires = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setInventaires(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des inventaires');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInventaire(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setInventaire(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setInventaire(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setInventaire(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent, field: string) => {
        setInventaire(prev => ({ ...prev, [field]: e.checked }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, {
            ...new StkInventaireDetails(),
            inventaireDetailsId: 0
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

            // Recalculer le prix total si quantitePhysique ou prixUnitaire change
            if (field === 'quantitePhysique' || field === 'prixUnitaire') {
                const quantite = field === 'quantitePhysique' ? value : newDetails[index].quantitePhysique;
                const prix = field === 'prixUnitaire' ? value : newDetails[index].prixUnitaire;
                newDetails[index].prixTotal = quantite * prix;
            }

            return newDetails;
        });
    };

    const checkInventaireId = async (inventaireId: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${BASE_URL}/exists?inventaireId=${inventaireId}`);
            return response.data;
        } catch (error) {
            console.error("Error checking inventaireId:", error);
            return false;
        }
    };

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            // 1. Enregistrer l'inventaire principal
            const formattedData = {
                ...inventaire,
                dateInventaire: inventaire.dateInventaire
                    ? format(inventaire.dateInventaire, 'yyyy-MM-dd')
                    : null
            };
            const inventaireResponse = await axios.post(`${BASE_URL}/new`, formattedData);

            if (!inventaireResponse.data?.inventaireId) {
                throw new Error("Failed to save main entry");
            }

            // 2. Préparer les détails
            const detailsToSave = details.map(({ ...detail }) => ({
                ...detail,
                inventaireDetailsId: null,
                inventaireId: inventaireResponse.data.inventaireId
            }));

            // 3. Enregistrer les détails
            if (detailsToSave.length > 0) {
                await axios.post(`${BASE_URLD}/new`, detailsToSave);
            }

            accept('success', 'Succès', 'Inventaire créé avec succès');
            setInventaire(new StkInventaire());
            setDetails([]);
            loadAllInventaires();
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

    const filteredInventaires = inventaires.filter(inventaire =>
        inventaire.inventaireId?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        inventaire.numeroPiece?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        inventaire.libelle?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadInventaireDetails = async (inventaireId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/findbyinventaire?inventaireId=${inventaireId}`);
            setInventaireDetails(response.data);
            setDetailsDialogVisible(true);
        } catch (error) {
            console.error("Error loading entry details:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails');
        } finally {
            setLoading(false);
        }
    };

    // Fonctions pour mapper les IDs aux libellés
    const getMagasinName = (magasinId: string) => {
        const magasin = magasins.find(mag => mag.magasinId === magasinId);
        return magasin ? magasin.nom : magasinId;
    };

    const getExerciceLibelle = (exerciceId: string) => {
        const exercice = exercices.find(ex => ex.exerciceId === exerciceId);
        return exercice ? exercice.libelle : exerciceId;
    };

    const getResponsableId = (magrespId: string) => {
        const responsable = responsables.find(resp => resp.magRespId === magrespId);
        return responsable ? responsable.responsableId : magrespId;
    };

    const getArticleLibelle = (articleId: string) => {
        const article = articles.find(a => a.articleId === articleId);
        return article ? article.libelle : articleId;
    };

    const getUniteLibelle = (uniteId: string) => {
        const unite = unites.find(u => u.uniteId === uniteId);
        return unite ? unite.libelle : uniteId;
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="p-tabview"
            >
                <TabPanel header="Nouvel inventaire" className="p-tabview-panel">
                    <StkInventaireForm
                        inventaire={inventaire}
                        details={details}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        handleCheckboxChange={handleCheckboxChange}
                        addDetail={addDetail}
                        removeDetail={removeDetail}
                        updateDetail={updateDetail}
                        loading={loading}
                        setDetails={setDetails}
                        magasins={magasins}
                        exercices={exercices}
                        responsables={responsables}
                        articles={articles}
                        unites={unites}
                        checkInventaireId={checkInventaireId}
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
                <TabPanel header="Liste des inventaires" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par ID, numéro de pièce ou libellé"
                                className="w-full"
                            />
                        </span>
                    </div>

                    <DataTable
                        value={filteredInventaires}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucun inventaire trouvé"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                        selectionMode="single"
                        onSelectionChange={(e) => {
                            const selected = e.value as StkInventaire;
                            setSelectedInventaire(selected);
                            loadInventaireDetails(selected.inventaireId);
                        }}
                        selection={selectedInventaire}
                        rowClassName={() => "cursor-pointer"}
                    >
                        {/*<Column field="inventaireId" header="ID Inventaire" sortable />* */}
                        <Column field="numeroPiece" header="Numéro Pièce" sortable />
                        <Column
                            field="magasinId"
                            header="Magasin"
                            body={(rowData) => getMagasinName(rowData.magasinId)}
                            sortable
                        />
                        <Column
                            field="exerciceId"
                            header="Exercice"
                            body={(rowData) => getExerciceLibelle(rowData.exerciceId)}
                            sortable
                        />
                        <Column
                            field="dateInventaire"
                            header="Date Inventaire"
                            body={(rowData) => formatDate(rowData.dateInventaire)}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column
                            field="magrespId"
                            header="Responsable"
                            body={(rowData) => getResponsableId(rowData.magrespId)}
                            sortable
                        />
                        <Column field="libelle" header="Libellé" sortable />
                        <Column field="montant" header="Montant" 
                            body={(rowData) => rowData.montant?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                            sortable
                        />
                        <Column field="isValid" header="Valide" 
                            body={(rowData) => rowData.isValid ? 'Oui' : 'Non'}
                            sortable
                        />
                    </DataTable>
                </TabPanel>
            </TabView>
            <Dialog
                header={`Détails de l'inventaire: ${selectedInventaire?.numeroPiece}`}
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
                        value={inventaireDetails}
                        emptyMessage="Aucun détail trouvé"
                        className="p-datatable-sm"
                    >
                        <Column
                            field="articleId"
                            header="Article"
                            body={(rowData) => getArticleLibelle(rowData.articleId)}
                        />
                        <Column field="quantitePhysique" header="Quantité Physique" />
                        <Column field="quantiteTheorique" header="Quantité Théorique" />
                        <Column field="prixUnitaire" header="Prix Unitaire"
                            body={(rowData) => rowData.prixUnitaire?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                        />
                        <Column
                            field="uniteId"
                            header="Unité"
                            body={(rowData) => getUniteLibelle(rowData.uniteId)}
                        />
                        <Column field="catalogue" header="Catalogue" />
                        <Column
                            field="datePeremption"
                            header="Date Péremption"
                            body={(rowData) => formatDate(rowData.datePeremption)}
                        />
                        <Column field="lot" header="Lot" />
                        <Column field="prixTotal" header="Prix Total"
                            body={(rowData) => rowData.prixTotal?.toLocaleString('fr-FR', {
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