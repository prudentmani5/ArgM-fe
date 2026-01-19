// PanRequisitionsPage.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import  PanRequisitions from './PanRequisitions';
import {PanRequisitionsDetails, PanEngin, PieceRechange } from './PanRequisitions';
import PanRequisitionsForm from './PanRequisitionsForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { PersonnelTechnique } from './PersonnelTechnique';
//import { PanRequisitions, initialPanRequisitions } from './PanRequisitions';

const BASE_URL = 'http://192.168.120.58:8080/requisitions';
const BASE_URLD = 'http://192.168.120.58:8080/requisitionsDetails';

export default function PanRequisitionsPage() {
    const [requisition, setRequisition] = useState<PanRequisitions>(new PanRequisitions());
    //const [requisition, setRequisition] = useState<PanRequisitions>(initialPanRequisitions);
    //const [details, setDetails] = useState<PanRequisitionsDetails[]>([]);
    const [details, setDetails] = useState<PanRequisitionsDetails[]>([]);
    const [requisitionList, setRequisitionList] = useState<PanRequisitions[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Data for dropdowns
    const [engins, setEngins] = useState<PanEngin[]>([]);
    const [pieces, setPieces] = useState<PieceRechange[]>([]);
    const [selectedRequisition, setSelectedRequisition] = useState<PanRequisitions | null>(null);
    const [requisitionDetails, setRequisitionDetails] = useState<PanRequisitionsDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };
    const [personnelTechniques, setPersonnelTechniques] = useState<PersonnelTechnique[]>([]);


    useEffect(() => {
        loadAllRequisitions();
        loadDropdownData();
    }, []);


    useEffect(() => {
        // Chargez les techniciens au montage
        const loadPersonnelTechniques = async () => {
            try {
                const response = await axios.get('http://192.168.120.58:8080/personnelTechnique/findall');
                setPersonnelTechniques(response.data);
            } catch (error) {
                console.error("Erreur chargement techniciens:", error);
            }
        }
        
        loadPersonnelTechniques();
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);
            const [enginsResponse, piecesResponse] = await Promise.all([
                axios.get('http://192.168.120.58:8080/PanEngins/findall'),
                axios.get('http://192.168.120.58:8080/piecesRechanges/findall')
            ]);
            setEngins(enginsResponse.data);
            setPieces(piecesResponse.data);
        } catch (error) {
            console.error("Error loading dropdown data:", error);
            accept('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const loadAllRequisitions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/findall`);
            setRequisitionList(response.data);
        } catch (error) {
            console.error("Error loading requisitions:", error);
            accept('error', 'Erreur', 'Échec du chargement des réquisitions');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRequisition(prev => ({ ...prev, [name]: value }));
    };

  const handleNumberChange = (e: InputNumberValueChangeEvent | number, field: string) => {
    const value = typeof e === 'number' ? e : e.value;
    setRequisition(prev => ({ ...prev, [field]: value }));
};

  // Modifiez votre useEffect comme ceci :
useEffect(() => {
    if (requisition.indexFin !== undefined && requisition.indexDepart !== undefined) {
        const diff = requisition.indexFin - requisition.indexDepart;
        
        setRequisition(prev => ({
            ...prev,
            diffIndex: diff,
            consH: requisition.ratio ? diff / requisition.ratio : 0,
            ratio: requisition.tonage && diff > 0 ? requisition.tonage / diff : 0
        }));
    }
}, [requisition.indexFin, requisition.indexDepart, requisition.ratio, requisition.tonage]);

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setRequisition(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setRequisition(prev => ({ ...prev, [name]: value }));
    };

    const personnelOptions = personnelTechniques.map(tech => ({
    ...tech,
    fullName: `${tech.nom} ${tech.prenom}`
}));

    const addDetail = () => {
        setDetails(prev => [...prev, {
            ...new PanRequisitionsDetails(),
            requisitionDetailsId: undefined,
            requisitionsId: requisition.requisitionsId || 0
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

    //const checkRequisitionId = async (requisitionId: string): Promise<boolean> => {
       // try {
         //   const response = await axios.get(`${BASE_URL}/exists?requisitionId=${requisitionId}`);
          //  return response.data;
       // } catch (error) {
          //  console.error("Error checking requisitionId:", error);
           // return false;
      //  }
   // };


  
    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();
            // Calcul des valeurs avant envoi
        const diffIndex = requisition.indexFin && requisition.indexDepart 
            ? requisition.indexFin - requisition.indexDepart 
            : 0;
        
        const consH = diffIndex > 0 && requisition.ratio 
            ? diffIndex / requisition.ratio 
            : 0;
        
        const ratio = requisition.tonage && diffIndex > 0
            ? requisition.tonage / diffIndex
            : 0;

        // 1. Enregistrer la réquisition principale
        const requisitionResponse = await axios.post(`${BASE_URL}/new`, {
            ...requisition,
            diffIndex,
            consH,
            ratio,
            dateCreation: now,
            dateUpdate: now,
            userCreation: "system",
            userUpdate: "system"
        });

            
            if (!requisitionResponse.data?.requisitionsId) {
                throw new Error("Failed to save main requisition");
            }

            // 2. Préparer les détails
            const detailsToSave = details.map(({ ...detail }) => ({
                ...detail,
                requisitionDetailsId: null,
                requisitionsId: requisitionResponse.data.requisitionsId,
                dateCreation: now,
                dateUpdate: now,
                userCreation: "system",
                userUpdate: "system"
            }));

            // 3. Enregistrer les détails
            if (detailsToSave.length > 0) {
                await axios.post(`${BASE_URLD}/new`, detailsToSave);
            }

            accept('success', 'Succès', 'Réquisition créée avec succès');
            setRequisition(new PanRequisitions());
            setDetails([]);
            loadAllRequisitions();
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

    const filteredRequisitions = requisitionList.filter(req =>
        req.requisitionsId?.toString().toLowerCase().includes(globalFilter.toLowerCase()) ||
        req.enginId?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        req.catalogue?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadRequisitionDetails = async (requisitionsId: number) => {
        try {
            setLoading(true);
            //const response = await axios.get(`${BASE_URLD}/findbyDetails?requisitionsId=${requisitionsId}`);
            const response = await axios.get(`${BASE_URLD}/init/${requisitionsId}`);
          
            setRequisitionDetails(response.data);
            setDetailsDialogVisible(true);
        } catch (error) {
            console.error("Error loading requisition details:", error);
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
                <TabPanel header="Nouvelle réquisition" className="p-tabview-panel">
                    <PanRequisitionsForm
                        requisition={requisition}
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
                        engins={engins}
                        pieces={pieces}
                        //checkRequisitionId={checkRequisitionId}
                        personnelTechniques={personnelTechniques}
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
                <TabPanel header="Liste des réquisitions" className="p-tabview-panel">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-right w-full md:w-6" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par ID, engin ou catalogue"
                                className="w-full"
                            />
                        </span>
                    </div>
                     
                    <DataTable
                        value={filteredRequisitions}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucune réquisition trouvée"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                        selectionMode="single"
                        onSelectionChange={(e) => {
                            const selected = e.value as PanRequisitions;
                            setSelectedRequisition(selected);
                            if (selected?.requisitionsId) {
                                loadRequisitionDetails(selected.requisitionsId);
                            }
                        }}
                        selection={selectedRequisition}
                        rowClassName={() => "cursor-pointer"}
                    >
                        <Column field="requisitionsId" header="ID Réquisition" sortable />
                        <Column
                            field="date"
                            header="Date"
                            body={(rowData) => formatDate(rowData.date)}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column field="enginId" header="Engin" sortable />
                        <Column field="catalogue" header="Catalogue" sortable />
                        <Column field="indexDepart" header="Index Départ" sortable />
                        <Column field="indexFin" header="Index Fin" sortable />
                        <Column field="diffIndex" header="Différence Index" sortable />
                        <Column field="matricule" header="Technicien" sortable />
                        <Column field="typeRequisition" header="Type" sortable />
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
                header={`Détails de la réquisition ${selectedRequisition?.requisitionsId}`}
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
                        value={requisitionDetails}
                        emptyMessage="Aucun détail trouvé"
                        className="p-datatable-sm"
                    >
                        <Column field="produitPieceId" header="Pièce de rechange" />
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
                        <Column field="nouvelleQuantite" header="Nouvelle Quantité" />
                        <Column 
                            field="initialisation" 
                            header="Initialisation" 
                            body={(rowData) => rowData.initialisation ? 'Oui' : 'Non'} 
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