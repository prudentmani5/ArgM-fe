'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { PanEntretiens, PanEntretiensDetails, PanEngin, EnginsPartieType, PieceRechange, EntretiensType, createPanEntretiens } from './panEntretiens.model';
import PanEntretiensForm from './PanEntretiensForm';
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

const BASE_URL = `${API_BASE_URL}/panEntretiens`;
const BASE_URLD = `${API_BASE_URL}/panEntretiensDetails`;

const createEmptyPanEntretiensDetails = (): PanEntretiensDetails => ({
    entretiensId: '',
    produitPieceId: '',
    quantite: 0,
    prixUnitaire: 0,
    total: 0
});

export default function PanEntretiensPage() {
    const [entretiens, setEntretiens] = useState<PanEntretiens>(createPanEntretiens());
    const [details, setDetails] = useState<PanEntretiensDetails[]>([]);
    const [entretiensList, setEntretiensList] = useState<PanEntretiens[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Data for dropdowns
    const [engins, setEngins] = useState<PanEngin[]>([]);
    const [parties, setParties] = useState<EnginsPartieType[]>([]);
    const [pieces, setPieces] = useState<PieceRechange[]>([]);
    const [entretiensTypes, setEntretiensTypes] = useState<EntretiensType[]>([]);
    const [selectedEntretiens, setSelectedEntretiens] = useState<PanEntretiens | null>(null);
    const [entretiensDetails, setEntretiensDetails] = useState<PanEntretiensDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllEntretiens();
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);
            const [enginsRes, partiesRes, piecesRes, typesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/PanEngins/findall`),
                axios.get(`${API_BASE_URL}/enginsPartiesTypes/findall`),
                axios.get(`${API_BASE_URL}/piecesRechanges/findall`),
                axios.get(`${API_BASE_URL}/entretiensTypes/findall`)
            ]);
            setEngins(enginsRes.data);
            setParties(partiesRes.data);
            setPieces(piecesRes.data);
            setEntretiensTypes(typesRes.data);
        } catch (error) {
            console.error("Error loading dropdown data:", error);
            accept('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const loadAllEntretiens = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setEntretiensList(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des entretiens');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntretiens(prev => ({ ...prev, [name]: value }));
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEntretiens(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setEntretiens(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setEntretiens(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setEntretiens(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: any, field: string) => {
        setEntretiens(prev => ({ ...prev, [field]: e.checked }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, createEmptyPanEntretiensDetails()]);
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

    const checkEntretiensId = async (entretiensId: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${BASE_URL}/exists?entretiensId=${entretiensId}`);
            return response.data;
        } catch (error) {
            console.error("Error checking entretiensId:", error);
            return false;
        }
    };

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            // 1. Save main entry
            const entretiensResponse = await axios.post(`${BASE_URL}/new`, {
                ...entretiens,
                entretientIncrement: null,
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpDate: "system"
            });

            if (!entretiensResponse.data?.entretiensId) {
                throw new Error("Failed to save main entry");
            }

            // 2. Prepare details
            const detailsToSave = details.map(detail => ({
                ...detail,
                entretienDetailsId: null,
                entretiensId: entretiensResponse.data.entretiensId,
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpdate: "system"
            }));

            // 3. Save details
            if (detailsToSave.length > 0) {
                await axios.post(`${BASE_URLD}/new`, detailsToSave);
            }

            accept('success', 'Succès', 'Entretien enregistré avec succès');
            setEntretiens(createPanEntretiens());
            setDetails([]);
            loadAllEntretiens();
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

    const filteredEntretiens = entretiensList.filter(entretiens =>
        entretiens.entretiensId?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        entretiens.observation?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        entretiens.typeOperation?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadEntretiensDetails = async (entretiensId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/entretiens?entretiensId=${entretiensId}`);
            setEntretiensDetails(response.data);
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
                <TabPanel header="Nouvel entretien" className="p-tabview-panel">
                    <PanEntretiensForm
                        entretiens={entretiens}
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
                        entretiensTypes={entretiensTypes}
                        checkEntretiensId={checkEntretiensId}
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
                <TabPanel header="Liste des entretiens" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par ID, observation ou type d'opération"
                                className="w-full"
                            />
                        </span>
                    </div>
                     
                    <DataTable
                        value={filteredEntretiens}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucun entretien trouvé"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                        selectionMode="single"
                        onSelectionChange={(e) => {
                            const selected = e.value as PanEntretiens;
                            setSelectedEntretiens(selected);
                            loadEntretiensDetails(selected.entretiensId);
                        }}
                        selection={selectedEntretiens}
                        rowClassName={() => "cursor-pointer"}
                    >
                        <Column field="entretiensId" header="ID Entretien" sortable />
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
                        <Column
                            field="dateProchainEntretien"
                            header="Prochain Entretien"
                            body={(rowData) => formatDate(rowData.dateProchainEntretien)}
                            sortable
                            style={{ minWidth: '150px' }}
                        />
                        <Column field="enginId" header="Engin" sortable />
                        <Column field="typeOperation" header="Type d'Opération" sortable />
                        <Column
                            field="valide"
                            header="Validé"
                            body={(rowData) => rowData.valide ? 'Oui' : 'Non'}
                            sortable
                        />
                    </DataTable>
                </TabPanel>
            </TabView>
            <Dialog 
                header={`Détails de l'entretien ${selectedEntretiens?.entretiensId}`}
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
                                <p><strong>Engin:</strong> {selectedEntretiens?.enginId}</p>
                                <p><strong>Date Début:</strong> {formatDate(selectedEntretiens?.dateDebut)}</p>
                                <p><strong>Date Fin:</strong> {formatDate(selectedEntretiens?.dateFin)}</p>
                                <p><strong>Type d'Opération:</strong> {selectedEntretiens?.typeOperation}</p>
                                <p><strong>Observation:</strong> {selectedEntretiens?.observation}</p>
                            </div>
                            <div className="col-6">
                                <h4>Autres informations</h4>
                                <p><strong>Index Kilométrique:</strong> {selectedEntretiens?.indexKilometrique}</p>
                                <p><strong>Prochain Entretien:</strong> {selectedEntretiens?.prochainEntretien}</p>
                                <p><strong>Date Prochain Entretien:</strong> {formatDate(selectedEntretiens?.dateProchainEntretien)}</p>
                                <p><strong>Numéro Ordre:</strong> {selectedEntretiens?.numeroOrdre}</p>
                                <p><strong>Heure:</strong> {selectedEntretiens?.heure}</p>
                                <p><strong>Statut:</strong> {selectedEntretiens?.valide ? 'Validé' : 'Non validé'}</p>
                            </div>
                        </div>

                        <h4 className="mt-4">Pièces de rechange utilisées</h4>
                        <DataTable
                            value={entretiensDetails}
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