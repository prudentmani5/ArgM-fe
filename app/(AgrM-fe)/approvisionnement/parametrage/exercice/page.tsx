// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { StkExercice } from './StkExercice';
import { StkMagasin } from './StkMagasin';
import StkExerciceForm from './StkExerciceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { API_BASE_URL } from '@/utils/apiConfig';

// Définir le type pour les erreurs de l'API
interface ApiError {
  message?: string;
  status?: number;
  statusText?: string;
  data?: any;
}

function StkExerciceComponent() {
    const [stkExercice, setStkExercice] = useState<StkExercice>(new StkExercice());
    const [stkExerciceEdit, setStkExerciceEdit] = useState<StkExercice>(new StkExercice());
    const [stkMagasins, setStkMagasins] = useState<StkMagasin[]>([]);
    const [editStkExerciceDialog, setEditStkExerciceDialog] = useState(false);
    const [stkExercices, setStkExercices] = useState<StkExercice[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [magasinLoading, setMagasinLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

   

    useEffect(() => {
        if (data) {
            if (callType === 'loadStkExercices') {
                setStkExercices(Array.isArray(data) ? data : [data]);
            } else if (callType === 'loadStkMagasins') {
                setStkMagasins(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall();
        }
    }, [data, error]);

    useEffect(() => {
        loadMagasins();
    }, []);

    const loadMagasins = () => {
        setMagasinLoading(true);
        fetchData(null, 'Get', `${API_BASE_URL}/magasins/findall`, `loadStkMagasins`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStkExercice((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStkExerciceEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: string) => {
        setStkExercice((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChangeEdit = (name: string, value: string) => {
        setStkExerciceEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleMagasinChange = (magasinId: string) => {
        setStkExercice((prev) => ({ ...prev, magasinId }));
    };

    const handleMagasinChangeEdit = (magasinId: string) => {
        setStkExerciceEdit((prev) => ({ ...prev, magasinId }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        
        // Validation des champs obligatoires
        if (!stkExercice.exerciceId || !stkExercice.libelle || !stkExercice.dateDebut || !stkExercice.dateFin) {
            accept('warn', 'Champs obligatoires', 'Veuillez remplir tous les champs obligatoires (marqués d\'un *).');
            setBtnLoading(false);
            return;
        }

        // Vérifier si on peut créer un nouvel exercice
        if (stkExercice.magasinId) {
            fetchData(null, 'Get', `${API_BASE_URL}/stkExercices/peut-creer/${stkExercice.magasinId}`, 'checkPeutCreer');
        } else {
            createExercice();
        }
    };

    const createExercice = () => {
        console.log('Data sent to the backend:', stkExercice);
        fetchData(stkExercice, 'Post', `${API_BASE_URL}/stkExercices/new`, `createStkExercice`);
        setStkExercice(new StkExercice());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        
        // Validation des champs obligatoires
        if (!stkExerciceEdit.exerciceId || !stkExerciceEdit.libelle || !stkExerciceEdit.dateDebut || !stkExerciceEdit.dateFin) {
            accept('warn', 'Champs obligatoires', 'Veuillez remplir tous les champs obligatoires (marqués d\'un *).');
            setBtnLoading(false);
            return;
        }

        console.log('Data sent to the backend:', stkExerciceEdit);
        fetchData(stkExerciceEdit, 'Put', `${API_BASE_URL}/stkExercices/update/` + stkExerciceEdit.exerciceId, `updateStkExercice`);
    };

    const extractErrorMessage = (error: any): string => {
        if (!error) return 'Une erreur inconnue est survenue';
        
        console.log('Error object:', error);
        
        // Si c'est une string, la retourner directement
        if (typeof error === 'string') {
            return error;
        }
        
        // Si c'est un objet avec une propriété message
        if (error.message) {
            return error.message;
        }
        
        // Si c'est un objet avec une propriété data (réponse HTTP)
        if (error.data) {
            if (typeof error.data === 'string') {
                return error.data;
            }
            if (error.data.error) {
                return error.data.error;
            }
            if (error.data.message) {
                return error.data.message;
            }
        }
        
        // Si c'est un objet avec une propriété error (réponse API structurée)
        if (error.error) {
            if (typeof error.error === 'string') {
                return error.error;
            }
        }
        
        // Si c'est un objet Response (fetch API)
        if (error.status && error.statusText) {
            return `Erreur ${error.status}: ${error.statusText}`;
        }
        
        // En dernier recours, convertir en string
        try {
            return JSON.stringify(error);
        } catch {
            return 'Erreur inconnue';
        }
    };

    const handleAfterApiCall = () => {
        if (error !== null) {
            const errorMessage = extractErrorMessage(error);
            
            console.log('Error details:', { error, callType, errorMessage });

            if (callType === 'checkPeutCreer') {
                accept('warn', 'Vérification impossible', errorMessage);
            } else if (callType === 'createStkExercice') {
                accept('error', 'Erreur de création', errorMessage);
            } else if (callType === 'updateStkExercice') {
                accept('error', 'Erreur de modification', errorMessage);
            } else if (callType === 'cloturerExercice') {
                accept('error', 'Erreur de clôture', errorMessage);
            } else if (callType === 'activerExercice') {
                accept('error', 'Erreur d\'activation', errorMessage);
            } else if (callType === 'loadStkExercices') {
                accept('warn', 'Chargement impossible', errorMessage);
            } else if (callType === 'loadStkMagasins') {
                accept('warn', 'Chargement des magasins impossible', errorMessage);
            }
            setBtnLoading(false);
        } else if (data !== null) {
            if (callType === 'checkPeutCreer') {
                // Gérer différents formats de réponse
                const peutCreer = data.peutCreer !== undefined ? data.peutCreer : data;
                if (peutCreer === true || peutCreer === 'true') {
                    createExercice();
                } else {
                    accept('warn', 'Création impossible', 'Impossible de créer un nouvel exercice. Il existe déjà un exercice actif pour ce magasin. Veuillez d\'abord clôturer l\'exercice actif.');
                    setBtnLoading(false);
                }
            } else if (callType === 'createStkExercice') {
                setStkExercice(new StkExercice());
                accept('success', 'Succès', 'L\'exercice a été créé avec succès.');
                setBtnLoading(false);
                loadAllData();
                setActiveIndex(1);
            } else if (callType === 'updateStkExercice') {
                accept('success', 'Succès', 'L\'exercice a été modifié avec succès.');
                setStkExerciceEdit(new StkExercice());
                setEditStkExerciceDialog(false);
                loadAllData();
                setBtnLoading(false);
            } else if (callType === 'cloturerExercice') {
                accept('success', 'Succès', 'L\'exercice a été clôturé avec succès.');
                loadAllData();
            } else if (callType === 'activerExercice') {
                accept('success', 'Succès', 'L\'exercice a été activé avec succès.');
                loadAllData();
            } else if (callType === 'loadStkMagasins') {
                setMagasinLoading(false);
            }
        }
    };

    const clearFilterStkExercice = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadStkExerciceToEdit = (data: StkExercice) => {
        if (data) {
            setEditStkExerciceDialog(true);
            setStkExerciceEdit({...data});
        }
    };

    const cloturerExercice = (data: StkExercice) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir clôturer l'exercice "${data.libelle}" ? Cette action est irréversible.`,
            header: 'Confirmation de clôture',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => {
                // Récupérer l'utilisateur connecté (à adapter selon votre système d'authentification)
                const userCloture = 'admin'; // À remplacer par l'utilisateur connecté
                const requestBody = { userCloture };
                fetchData(requestBody, 'Post', `${API_BASE_URL}/stkExercices/cloturer/${data.exerciceId}`, 'cloturerExercice');
            },
            reject: () => {
                // Action annulée
            }
        });
    };

    const activerExercice = (data: StkExercice) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir activer l'exercice "${data.libelle}" ?`,
            header: 'Confirmation d\'activation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-success',
            accept: () => {
                // Récupérer l'utilisateur connecté (à adapter selon votre système d'authentification)
                const userOuverture = 'admin'; // À remplacer par l'utilisateur connecté
                const requestBody = { userOuverture };
                fetchData(requestBody, 'Post', `${API_BASE_URL}/stkExercices/activer/${data.exerciceId}`, 'activerExercice');
            },
            reject: () => {
                // Action annulée
            }
        });
    };

    const optionButtons = (data: StkExercice): React.ReactNode => {
        const estActif = data.dateCloture === null;
        
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadStkExerciceToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                />
                {estActif ? (
                    <Button 
                        icon="pi pi-lock" 
                        onClick={() => cloturerExercice(data)} 
                        raised 
                        severity='danger' 
                        tooltip="Clôturer l'exercice"
                        tooltipOptions={{ position: 'top' }}
                        size="small"
                    />
                ) : (
                    <Button 
                        icon="pi pi-lock-open" 
                        onClick={() => activerExercice(data)} 
                        raised 
                        severity='success' 
                        tooltip="Activer l'exercice"
                        tooltipOptions={{ position: 'top' }}
                        size="small"
                    />
                )}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/stkExercices/findall`, `loadStkExercices`);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Actualiser" 
                    outlined 
                    onClick={loadAllData}
                    loading={loading}
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Rechercher..." />
                </span>
            </div>
        );
    };

    const statusTemplate = (rowData: StkExercice) => {
        return rowData.dateCloture ? 
            <Tag value="Clôturé" severity="danger" /> : 
            <Tag value="Actif" severity="success" />;
    };

    const getMagasinNom = (magasinId: string | null) => {
        if (!magasinId) return 'Non spécifié';
        const magasin = stkMagasins.find(m => m.magasinId === magasinId);
        return magasin ? magasin.nom : magasinId;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        } catch {
            return dateString;
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Dialog 
                header="Modifier l'Exercice" 
                visible={editStkExerciceDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => {
                    setEditStkExerciceDialog(false);
                    setStkExerciceEdit(new StkExercice());
                }}
            >
                <StkExerciceForm 
                    stkExercice={stkExerciceEdit} 
                    magasins={stkMagasins}
                    handleChange={handleChangeEdit} 
                    handleDateChange={handleDateChangeEdit}
                    handleMagasinChange={handleMagasinChangeEdit}
                />
                <div className="mt-3 flex justify-content-end gap-2">
                    <Button 
                        icon="pi pi-times" 
                        label="Annuler" 
                        severity="secondary"
                        onClick={() => {
                            setEditStkExerciceDialog(false);
                            setStkExerciceEdit(new StkExercice());
                        }}
                    />
                    <Button 
                        icon="pi pi-check" 
                        label="Modifier" 
                        loading={btnLoading} 
                        onClick={handleSubmitEdit} 
                    />
                </div>
            </Dialog>
            
            <div className="card">
                <TabView 
                    onTabChange={tableChangeHandle} 
                    activeIndex={activeIndex}
                >
                    <TabPanel header="Nouvel Exercice" leftIcon="pi pi-plus">
                        <div className="mb-3">
                            <p className="text-color-secondary">
                                Créer un nouvel exercice. Les champs marqués d'un * sont obligatoires.
                                <br />
                                <small className="text-sm">
                                    <strong>Note :</strong> Vous ne pouvez créer un nouvel exercice que si aucun exercice n'est actif pour le magasin sélectionné.
                                </small>
                            </p>
                        </div>
                        <StkExerciceForm 
                            stkExercice={stkExercice} 
                            magasins={stkMagasins}
                            handleChange={handleChange} 
                            handleDateChange={handleDateChange}
                            handleMagasinChange={handleMagasinChange}
                        />
                        <div className="flex justify-content-center gap-3 mt-4">
                            <Button 
                                icon="pi pi-refresh" 
                                outlined 
                                label="Réinitialiser" 
                                onClick={() => setStkExercice(new StkExercice())} 
                                severity="secondary"
                            />
                            <Button 
                                icon="pi pi-save" 
                                label="Enregistrer" 
                                loading={btnLoading} 
                                onClick={handleSubmit} 
                            />
                        </div>
                    </TabPanel>
                    
                    <TabPanel header="Liste des Exercices" leftIcon="pi pi-list">
                        <div className="card">
                            <DataTable 
                                value={stkExercices} 
                                header={renderSearch} 
                                emptyMessage={"Aucun exercice trouvé"}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading}
                                scrollable
                                scrollHeight="flex"
                                className="p-datatable-sm"
                            >
                                <Column field="exerciceId" header="ID" sortable style={{ minWidth: '120px' }} />
                                <Column field="libelle" header="Libellé" sortable style={{ minWidth: '200px' }} />
                                <Column field="annee" header="Année" sortable style={{ minWidth: '100px' }} />
                                <Column 
                                    field="magasinId" 
                                    header="Magasin" 
                                    body={(rowData: StkExercice) => getMagasinNom(rowData.magasinId)}
                                    sortable
                                    style={{ minWidth: '150px' }}
                                />
                                <Column 
                                    field="dateDebut" 
                                    header="Date Début" 
                                    body={(rowData: StkExercice) => formatDate(rowData.dateDebut)}
                                    sortable
                                    style={{ minWidth: '120px' }}
                                />
                                <Column 
                                    field="dateFin" 
                                    header="Date Fin" 
                                    body={(rowData: StkExercice) => formatDate(rowData.dateFin)}
                                    sortable
                                    style={{ minWidth: '120px' }}
                                />
                                <Column 
                                    field="dateOuverture" 
                                    header="Ouverture" 
                                    body={(rowData: StkExercice) => formatDate(rowData.dateOuverture)}
                                    sortable
                                    style={{ minWidth: '120px' }}
                                />
                                <Column 
                                    field="dateCloture" 
                                    header="Clôture" 
                                    body={(rowData: StkExercice) => formatDate(rowData.dateCloture)}
                                    sortable
                                    style={{ minWidth: '120px' }}
                                />
                                <Column 
                                    header="Statut" 
                                    body={statusTemplate} 
                                    sortable 
                                    style={{ minWidth: '100px' }}
                                    sortField="dateCloture"
                                />
                                <Column 
                                    header="Actions" 
                                    body={optionButtons} 
                                    style={{ minWidth: '150px' }}
                                    exportable={false}
                                />
                            </DataTable>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </>
    );
}

export default StkExerciceComponent;