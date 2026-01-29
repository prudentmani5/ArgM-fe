// PanTravauxPage.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { PanTravaux, PanTravauxDetails, PanEngin } from './PanTravaux';
import PanTravauxForm from './PanTravauxForm';
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

const BASE_URL = `${API_BASE_URL}/panTravaux`;
const BASE_URLD = `${API_BASE_URL}/panTravauxDetails`;

export default function PanTravauxPage() {
    const [travaux, setTravaux] = useState<PanTravaux>(new PanTravaux());
    const [details, setDetails] = useState<PanTravauxDetails[]>([]);
    const [travauxList, setTravauxList] = useState<PanTravaux[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Data for dropdowns
    const [engins, setEngins] = useState<PanEngin[]>([]);
    const [selectedTravaux, setSelectedTravaux] = useState<PanTravaux | null>(null);
    const [travauxDetails, setTravauxDetails] = useState<PanTravauxDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllTravaux();
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/PanEngins/findall`);
            setEngins(response.data);
        } catch (error) {
            console.error("Error loading engins:", error);
            accept('error', 'Erreur', 'Échec du chargement des engins');
        } finally {
            setLoading(false);
        }
    };

    const loadAllTravaux = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setTravauxList(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des travaux');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTravaux(prev => ({ ...prev, [name]: value }));
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTravaux(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setTravaux(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setTravaux(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setTravaux(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: any, field: string) => {
        setTravaux(prev => ({ ...prev, [field]: e.checked }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, new PanTravauxDetails()]);
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

    const checkTravauxId = async (travauxId: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${BASE_URL}/exists?travauxId=${travauxId}`);
            return response.data;
        } catch (error) {
            console.error("Error checking travauxId:", error);
            return false;
        }
    };

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            // 1. Enregistrer les travaux principaux
            const travauxResponse = await axios.post(`${BASE_URL}/new`, {
                ...travaux,
                travauxIncrement: null,
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpdate: "system"
            });

            if (!travauxResponse.data?.travauxId) {
                throw new Error("Failed to save main entry");
            }

            // 2. Préparer les détails
            const detailsToSave = details.map(detail => ({
                ...detail,
                travauxDetailsId: null,
                travauxId: travauxResponse.data.travauxId,
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpdate: "system"
            }));

            // 3. Enregistrer les détails
            if (detailsToSave.length > 0) {
                await axios.post(`${BASE_URLD}/new`, detailsToSave);
            }

            accept('success', 'Succès', 'Travaux créés avec succès');
            setTravaux(new PanTravaux());
            setDetails([]);
            loadAllTravaux();
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

    const filteredTravaux = travauxList.filter(travaux =>
        travaux.travauxId?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        travaux.description?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        travaux.client?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadTravauxDetails = async (travauxId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/travaux/${travauxId}`);
            setTravauxDetails(response.data);
            setDetailsDialogVisible(true);
        } catch (error) {
            console.error("Error loading entry details:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails');
        } finally {
            setLoading(false);
        }
    };

    // Calcul du montant TVA
    useEffect(() => {
        const montantTVA = (travaux.mo || 0) * ((travaux.tauxTVA || 0) / 100);
        handleNumberChange({ value: montantTVA } as InputNumberValueChangeEvent, 'montantTVA');
    }, [travaux.mo, travaux.tauxTVA]);

    return (
        <div className="card">
            <Toast ref={toast} />
            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="p-tabview"
            >
                <TabPanel header="Nouveau" className="p-tabview-panel">
                    <PanTravauxForm
                        travaux={travaux}
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
                        checkTravauxId={checkTravauxId}
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
                <TabPanel header="Liste des travaux" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par ID, description ou client"
                                className="w-full"
                            />
                        </span>
                    </div>
                     
                    <DataTable
                        value={filteredTravaux}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucun travaux trouvé"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                        selectionMode="single"
                        onSelectionChange={(e) => {
                            const selected = e.value as PanTravaux;
                            setSelectedTravaux(selected);
                            loadTravauxDetails(selected.travauxId);
                        }}
                        selection={selectedTravaux}
                        rowClassName={() => "cursor-pointer"}
                    >
                        <Column field="travauxId" header="ID Travaux" sortable />
                        <Column
                            field="date"
                            header="Date"
                            body={(rowData) => formatDate(rowData.date)}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column field="client" header="Client" sortable />
                        <Column field="description" header="Description" sortable />
                        <Column
                            field="mo"
                            header="Main d'œuvre"
                            body={(rowData) => rowData.mo?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column
                            field="montantTVA"
                            header="Montant TVA"
                            body={(rowData) => rowData.montantTVA?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
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
                header={`Détails des travaux ${selectedTravaux?.travauxId}`}
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
                        value={travauxDetails}
                        emptyMessage="Aucun détail trouvé"
                        className="p-datatable-sm"
                    >
                        <Column field="indexKilometrique" header="Index Kilométrique" />
                        <Column field="activite" header="Activité" />
                        <Column field="materiel" header="Matériel" />
                        <Column field="quantite" header="Quantité" />
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
                        <Column field="duree" header="Durée" />
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