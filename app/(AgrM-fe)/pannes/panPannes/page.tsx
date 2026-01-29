// PanPannesPage.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import  {PanPannes, PanPannesDetails, PanEngin, EnginsPartieType, PieceRechange } from './panPannes.model';
import PanPannesForm from './PanPannesForm';
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

const BASE_URL = `${API_BASE_URL}/panPannes`;
const BASE_URLD = `${API_BASE_URL}/panPannesDetails`;

const createEmptyPanPannes = (): PanPannes => ({
    pannesId: '',
    enginId: '',
    enginPartieId: 0,
    dateDebut: null,
    observation: '',
    valide: false,
    dateFin: null,
    dateCreation: null,
    userCreation: '',
    dateUpdate: null,
    userUpDate: '',
    numeroOrdre: 0,
    heure: 0,
    anomalie: '',
    activite: '',
    materiel: ''
});

const createEmptyPanPannesDetails = (): PanPannesDetails => ({
    pannesId: '',
    produitPieceId: '',
    quantite: 0,
    prixUnitaire: 0,
    total: 0
});

export default function PanPannesPage() {
    //const [pannes, setPannes] = useState<PanPannes>(new PanPannes());
    const [pannes, setPannes] = useState<PanPannes>(createEmptyPanPannes());
    const [details, setDetails] = useState<PanPannesDetails[]>([]);
    const [pannesList, setPannesList] = useState<PanPannes[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Data for dropdowns
    const [engins, setEngins] = useState<PanEngin[]>([]);
    const [parties, setParties] = useState<EnginsPartieType[]>([]);
    const [pieces, setPieces] = useState<PieceRechange[]>([]);
    const [selectedPannes, setSelectedPannes] = useState<PanPannes | null>(null);
    const [pannesDetails, setPannesDetails] = useState<PanPannesDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllPannes();
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);
            const [enginsRes, partiesRes, piecesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/PanEngins/findall`),
                axios.get(`${API_BASE_URL}/enginsPartiesTypes/findall`),
                axios.get(`${API_BASE_URL}/piecesRechanges/findall`)
            ]);
            setEngins(enginsRes.data);
            setParties(partiesRes.data);
            setPieces(piecesRes.data);
        } catch (error) {
            console.error("Error loading dropdown data:", error);
            accept('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const loadAllPannes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setPannesList(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des pannes');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPannes(prev => ({ ...prev, [name]: value }));
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPannes(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setPannes(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setPannes(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setPannes(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: any, field: string) => {
        setPannes(prev => ({ ...prev, [field]: e.checked }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, createEmptyPanPannesDetails()]);
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

    const checkPannesId = async (pannesId: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${BASE_URL}/exists?pannesId=${pannesId}`);
            return response.data;
        } catch (error) {
            console.error("Error checking pannesId:", error);
            return false;
        }
    };

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            // 1. Enregistrer la panne principale
            const pannesResponse = await axios.post(`${BASE_URL}/new`, {
                ...pannes,
                pannesIncrement: null,
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpdate: "system"
            });

            if (!pannesResponse.data?.pannesId) {
                throw new Error("Failed to save main entry");
            }

            // 2. Préparer les détails
            const detailsToSave = details.map(detail => ({
                ...detail,
                pannesDetailsId: null,
                pannesId: pannesResponse.data.pannesId,
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpdate: "system"
            }));

            // 3. Enregistrer les détails
            if (detailsToSave.length > 0) {
                await axios.post(`${BASE_URLD}/new`, detailsToSave);
            }

            accept('success', 'Succès', 'Panne enregistrée avec succès');
           setPannes(createEmptyPanPannes());
            setDetails([]);
            loadAllPannes();
        } catch (error) {
            console.error("Erreur:", error);
            accept('error', 'Erreur', 'Échec de l\'enregistrement');
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredPannes = pannesList.filter(pannes =>
        pannes.pannesId?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        pannes.observation?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        pannes.anomalie?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadPannesDetails = async (pannesId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/pannes?devisId=${pannesId}`);
            setPannesDetails(response.data);
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
                <TabPanel header="Nouvelle panne" className="p-tabview-panel">
                    <PanPannesForm
                        pannes={pannes}
                        details={details}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        handleTextareaChange={handleTextareaChange}
                        handleCheckboxChange={handleCheckboxChange}
                        addDetail={addDetail}
                        removeDetail={removeDetail}
                        updateDetail={updateDetail}
                        loading={loading}
                        setDetails={setDetails}
                        engins={engins}
                        parties={parties}
                        pieces={pieces}
                        checkPannesId={checkPannesId}
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
                <TabPanel header="Liste des pannes" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par ID, observation ou anomalie"
                                className="w-full"
                            />
                        </span>
                    </div>
                     
                    <DataTable
                        value={filteredPannes}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucune panne trouvée"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                        selectionMode="single"
                        onSelectionChange={(e) => {
                            const selected = e.value as PanPannes;
                            setSelectedPannes(selected);
                            loadPannesDetails(selected.pannesId);
                        }}
                        selection={selectedPannes}
                        rowClassName={() => "cursor-pointer"}
                    >
                        <Column field="pannesId" header="ID Panne" sortable />
                        <Column
                            field="dateDebut"
                            header="Date Début"
                            body={(rowData) => formatDate(rowData.dateDebut)}
                            sortable
                            style={{ minWidth: '150px' }}
                        />
                        <Column
                            field="dateFin"
                            header="Date Fin"
                            body={(rowData) => formatDate(rowData.dateFin)}
                            sortable
                            style={{ minWidth: '150px' }}
                        />
                        <Column field="enginId" header="Engin" sortable />
                        <Column
                            field="valide"
                            header="Validé"
                            body={(rowData) => rowData.valide ? 'Oui' : 'Non'}
                            sortable
                        />
                        <Column field="anomalie" header="Anomalie" sortable />
                    </DataTable>
                </TabPanel>
            </TabView>
            <Dialog 
                header={`Détails de la panne ${selectedPannes?.pannesId}`}
                visible={detailsDialogVisible} 
                style={{ width: '75vw' }}
                onHide={() => setDetailsDialogVisible(false)}
            >
                {loading ? (
                    <div className="flex justify-content-center">
                        <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem' }}></i>
                    </div>
                ) : (
                    <>
                        <div className="grid">
                            <div className="col-6">
                                <h4>Informations principales</h4>
                                <p><strong>Engin:</strong> {selectedPannes?.enginId}</p>
                                <p><strong>Date Début:</strong> {formatDate(selectedPannes?.dateDebut)}</p>
                                <p><strong>Date Fin:</strong> {formatDate(selectedPannes?.dateFin)}</p>
                                <p><strong>Anomalie:</strong> {selectedPannes?.anomalie}</p>
                                <p><strong>Observation:</strong> {selectedPannes?.observation}</p>
                            </div>
                            <div className="col-6">
                                <h4>Autres informations</h4>
                                <p><strong>Activité:</strong> {selectedPannes?.activite}</p>
                                <p><strong>Matériel:</strong> {selectedPannes?.materiel}</p>
                                <p><strong>Numéro Ordre:</strong> {selectedPannes?.numeroOrdre}</p>
                                <p><strong>Heure:</strong> {selectedPannes?.heure}</p>
                                <p><strong>Statut:</strong> {selectedPannes?.valide ? 'Validé' : 'Non validé'}</p>
                            </div>
                        </div>

                        <h4 className="mt-4">Pièces de rechange utilisées</h4>
                        <DataTable
                            value={pannesDetails}
                            emptyMessage="Aucun détail trouvé"
                            className="p-datatable-sm"
                        >
                            <Column field="produitPieceId" header="Pièce" 
                                body={(rowData) => {
                                    const piece = pieces.find(p => p.pieceRechangeId === rowData.produitPieceId);
                                    return piece?.designationPieceRechange || rowData.produitPieceId;
                                }} 
                            />
                            <Column field="quantite" header="Quantité" />
                            <Column field="prixUnitaire" header="Prix Unitaire" 
                                body={(rowData) => rowData.prixUnitaire?.toLocaleString('fr-FR', { 
                                    style: 'currency', 
                                    currency: 'BIF',
                                    minimumFractionDigits: 0
                                })} 
                            />
                            <Column field="total" header="Total" 
                                body={(rowData) => rowData.total?.toLocaleString('fr-FR', { 
                                    style: 'currency', 
                                    currency: 'BIF',
                                    minimumFractionDigits: 0
                                })} 
                            />
                        </DataTable>
                    </>
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