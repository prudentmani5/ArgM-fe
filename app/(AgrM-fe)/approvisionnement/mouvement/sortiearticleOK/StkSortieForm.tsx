'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { StkSortie, StkSortieDetails, Service, TypeMvt, StkArticle, StkExercice, StkMagasin, StkMagasinResponsable, StkDestination } from "./StkSortie";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";
import { API_BASE_URL } from "@/utils/apiConfig";
import { ConfirmDialog } from 'primereact/confirmdialog';

interface StkSortieFormProps {
    sortie: StkSortie;
    details: StkSortieDetails[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<StkSortieDetails[]>>;
    services: Service[];
    typeMvts: TypeMvt[];
    articles: StkArticle[];
    exercices: StkExercice[];
    magasins: StkMagasin[];
    responsables: StkMagasinResponsable[];
    destinations: StkDestination[];
    onSearchSortie?: (numeroPiece: string) => void;
    existingSortieId?: string | null;
}

const StkSortieForm: React.FC<StkSortieFormProps> = ({
    sortie,
    details,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    addDetail,
    removeDetail,
    updateDetail,
    loading = false,
    setDetails,
    services,
    typeMvts,
    articles,
    exercices,
    magasins,
    responsables,
    destinations,
    onSearchSortie,
    existingSortieId
}) => {
    const toast = useRef<Toast>(null);
    const [numeroPieceTouched, setNumeroPieceTouched] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
    const [selectedRowDetail, setSelectedRowDetail] = useState<StkSortieDetails | null>(null);

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString() : '';
    };

    const calculateArticleTotal = (qteS: number, pUMP: number) => {
        const quantity = qteS || 0;
        const pump = pUMP || 0;
        const total = quantity * pump;
        return total;
    };

    const updateArticleTotal = (rowIndex: number) => {
        const detail = details[rowIndex];
        const prixTotal = calculateArticleTotal(detail.qteS, detail.pUMP);
        updateDetail(rowIndex, 'prixTotal', prixTotal);
        setForceUpdate(prev => prev + 1);
    };

    const handleArticleSelection = async (rowIndex: number, articleId: string) => {
        const selectedArticle = articles.find(a => a.articleId === articleId);
        
        if (selectedArticle) {
            const articleStockId = await getArticleStockId(articleId, sortie.magasinId);
            
            updateDetail(rowIndex, 'articleId', articleId);
            updateDetail(rowIndex, 'articleStockId', articleStockId);
            updateDetail(rowIndex, 'pUMP', selectedArticle.pump || 0);
            updateDetail(rowIndex, 'prixVente', selectedArticle.prixVente || 0);
            updateDetail(rowIndex, 'prixS', selectedArticle.prixVente || 0);
            updateDetail(rowIndex, 'pau', selectedArticle.pump || 0);
            updateDetail(rowIndex, 'uniteId', selectedArticle.uniteId || '');
            updateDetail(rowIndex, 'qteS', 0);
            updateArticleTotal(rowIndex);
        }
    };

    const getArticleStockId = async (articleId: string, magasinId: string): Promise<string> => {
        if (!articleId || !magasinId) {
            return articleId;
        }
        
        try {
            const response = await axios.get(`${API_BASE_URL}/articleStocks/findByArticleAndMagasin`, {
                params: {
                    articleId,
                    magasinId
                }
            });
            return response.data?.articleStockId || articleId;
        } catch (error) {
            console.error("Erreur récupération articleStockId:", error);
            return articleId;
        }
    };

    const handleQuantityChange = (rowIndex: number, qteS: number) => {
        updateDetail(rowIndex, 'qteS', qteS);
        updateArticleTotal(rowIndex);
        
        const articleId = details[rowIndex]?.articleId;
        if (articleId) {
            validateQuantity(rowIndex, qteS, articleId);
        }
    };

    const validateQuantity = (rowIndex: number, qteS: number, articleId: string) => {
        const selectedArticle = articles.find(a => a.articleId === articleId);
        if (!selectedArticle) return;

        let qteError = '';

        if (qteS === undefined || qteS === null || isNaN(qteS)) {
            qteError = 'La quantité est requise';
        } else if (qteS < 0) {
            qteError = 'La quantité ne peut pas être négative';
        } else if (qteS === 0) {
            qteError = 'La quantité ne peut pas être zéro';
        } else {
            const articleStock = selectedArticle.qteStock || 0;
            if (qteS > articleStock) {
                qteError = `Stock insuffisant. Disponible: ${articleStock}`;
            }
        }

        setDetails(prev => prev.map((detail, index) => {
            if (index !== rowIndex) return detail;
            return { ...detail, qteError };
        }));
    };

    const StockCell = ({ articleId }: { articleId: string }) => {
        const selectedArticle = articles.find(a => a.articleId === articleId);
        const stock = selectedArticle?.qteStock || 0;
        const seuil = selectedArticle?.seuil || 0;

        let textColor = '';
        if (stock <= 0) {
            textColor = 'text-red-500';
        } else if (stock <= seuil) {
            textColor = 'text-yellow-500';
        } else {
            textColor = 'text-green-500';
        }

        if (!articleId) {
            return (
                <InputNumber
                    value={0}
                    mode="decimal"
                    minFractionDigits={2}
                    maxFractionDigits={4}
                    className="w-full readonly-input"
                    disabled
                />
            );
        }

        return (
            <InputNumber
                value={stock}
                mode="decimal"
                minFractionDigits={2}
                maxFractionDigits={4}
                className={`w-full readonly-input ${textColor}`}
                disabled
            />
        );
    };

    const handleNumeroPieceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setNumeroPieceTouched(true);
        const numeroPiece = e.target.value.trim();
        if (numeroPiece && onSearchSortie) {
            onSearchSortie(numeroPiece);
        }
    };

    const calculateTotalAmount = () => {
        return details.reduce((total, detail) => {
            const prixTotal = detail.prixTotal || 0;
            return total + prixTotal;
        }, 0);
    };

    // Gestion de la suppression avec confirmation
    const handleRemoveDetail = (rowIndex: number) => {
        const detail = details[rowIndex];
        setSelectedRowIndex(rowIndex);
        setSelectedRowDetail(detail);
        
        // Si en mode modification, on utilise ConfirmDialog
        if (existingSortieId) {
            // La suppression sera gérée par ConfirmDialog
            return;
        }
        
        // Sinon, suppression directe
        removeDetail(rowIndex);
        
        // Afficher un message de confirmation
        toast.current?.show({
            severity: 'success',
            summary: 'Supprimé',
            detail: 'Ligne supprimée avec succès',
            life: 3000
        });
    };

    const confirmDelete = async () => {
        if (selectedRowIndex !== null && selectedRowDetail) {
            try {
                // Si la ligne existe déjà en base de données (a un identifiant)
                if (selectedRowDetail.sortieDetailsId ) {
                    const detailId = selectedRowDetail.sortieDetailsId;
                    
                    // Appel API pour supprimer de la base de données
                    await axios.delete(`${API_BASE_URL}/stkSortieDetails/delete/${detailId}`);
                    
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Supprimé',
                        detail: 'Ligne supprimée de la base de données',
                        life: 3000
                    });
                }
                
                // Supprimer de l'interface utilisateur
                removeDetail(selectedRowIndex);
                
                toast.current?.show({
                    severity: 'success',
                    summary: 'Supprimé',
                    detail: 'Ligne supprimée avec succès',
                    life: 3000
                });
                
            } catch (error) {
                console.error("Erreur lors de la suppression de la ligne:", error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la suppression de la ligne',
                    life: 3000
                });
            } finally {
                setSelectedRowIndex(null);
                setSelectedRowDetail(null);
            }
        }
    };

    const cancelDelete = () => {
        setSelectedRowIndex(null);
        setSelectedRowDetail(null);
    };

    useEffect(() => {
        const totalAmount = calculateTotalAmount();
        if (sortie.montant !== totalAmount) {
            handleNumberChange({ value: totalAmount } as InputNumberValueChangeEvent, 'montant');
        }
    }, [details, forceUpdate]);

    const handleCalendarChange = (value: any, field: string) => {
        if (value instanceof Date) {
            handleDateChange(value, field);
        } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
            handleDateChange(value[0], field);
        } else if (value === null) {
            handleDateChange(null, field);
        } else {
            handleDateChange(null, field);
        }
    };

    // Fonction pour vérifier si une ligne existe en base de données
    const isExistingDetail = (detail: StkSortieDetails) => {
        return !!(detail.sortieDetailsId );
    };

    return (
        <div>
            <Toast ref={toast} />
            <ConfirmDialog 
                visible={selectedRowIndex !== null && existingSortieId !== null && existingSortieId !== undefined}
                onHide={cancelDelete}
                message={
                    selectedRowDetail && isExistingDetail(selectedRowDetail) 
                    ? "Cette ligne existe dans la base de données. Êtes-vous sûr de vouloir la supprimer définitivement ?"
                    : "Êtes-vous sûr de vouloir supprimer cette ligne ?"
                }
                header="Confirmation de suppression"
                icon="pi pi-exclamation-triangle"
                accept={confirmDelete}
                reject={cancelDelete}
                acceptLabel="Oui, supprimer"
                rejectLabel="Non, annuler"
                acceptClassName="p-button-danger"
            />
            
            <div className="p-fluid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="numeroPiece">Numéro Pièce *</label>
                    <InputText
                        id="numeroPiece"
                        name="numeroPiece"
                        value={sortie.numeroPiece}
                        onChange={handleChange}
                        onBlur={handleNumeroPieceBlur}
                        placeholder="Saisir le numéro de pièce"
                        className={numeroPieceTouched && !sortie.numeroPiece ? 'p-invalid' : ''}
                    />
                    {numeroPieceTouched && !sortie.numeroPiece && (
                        <small className="p-error">Le numéro de pièce est requis</small>
                    )}
                    {existingSortieId && (
                        <small className="p-text-secondary">
                            <i className="pi pi-info-circle"></i> Sortie existante - Mode modification
                        </small>
                    )}
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateSortie">Date Sortie *</label>
                    <Calendar
                        id="dateSortie"
                        name="dateSortie"
                        value={sortie.dateSortie}
                        onChange={(e) => handleCalendarChange(e.value, 'dateSortie')}
                        dateFormat="dd/mm/yy"
                        showIcon
                        placeholder="Sélectionner la date"
                        className="w-full"
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="magasinId">Magasin *</label>
                    <Dropdown
                        id="magasinId"
                        name="magasinId"
                        value={sortie.magasinId}
                        options={magasins}
                        onChange={handleDropdownChange}
                        optionLabel="nom"
                        optionValue="magasinId"
                        placeholder="Sélectionner un magasin"
                        className="w-full"
                        filter
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="exerciceId">Exercice *</label>
                    <Dropdown
                        id="exerciceId"
                        name="exerciceId"
                        value={sortie.exerciceId}
                        options={exercices}
                        onChange={handleDropdownChange}
                        optionLabel="annee"
                        optionValue="annee"
                        placeholder="Sélectionner un exercice"
                        className="w-full"
                        filter
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="typeMvtId">Type Mouvement *</label>
                    <Dropdown
                        id="typeMvtId"
                        name="typeMvtId"
                        value={sortie.typeMvtId}
                        options={typeMvts}
                        onChange={handleDropdownChange}
                        optionLabel="libelle"
                        optionValue="typeMvtId"
                        placeholder="Sélectionner un type"
                        className="w-full"
                        filter
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="destinationId">Destinataire *</label>
                    <Dropdown
                        id="destinationId"
                        name="destinationId"
                        value={sortie.destinationId}
                        options={destinations}
                        onChange={handleDropdownChange}
                        optionLabel="pLibelle"
                        optionValue="pDestinationId"
                        placeholder="Sélectionner un destinataire"
                        className="w-full"
                        filter
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="serviceId">Service *</label>
                    <Dropdown
                        id="serviceId"
                        name="serviceId"
                        value={sortie.serviceId}
                        options={services}
                        onChange={handleDropdownChange}
                        optionLabel="libelle"
                        optionValue="serviceId"
                        placeholder="Sélectionner un service"
                        className="w-full"
                        filter
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="magRespId">Responsable Magasin *</label>
                    <Dropdown
                        id="magRespId"
                        name="magRespId"
                        value={sortie.magRespId}
                        options={responsables}
                        onChange={handleDropdownChange}
                        optionLabel="magasinId"
                        optionValue="magRespId"
                        placeholder="Sélectionner un responsable"
                        className="w-full"
                        filter
                        required
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="montant">Montant Total</label>
                    <InputNumber
                        id="montant"
                        name="montant"
                        value={calculateTotalAmount()}
                        onValueChange={(e) => handleNumberChange(e, 'montant')}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        readOnly
                        className="readonly-input"
                        placeholder="Calculé automatiquement"
                    />
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h3>Détails de la sortie</h3>
                    <Button
                        label="Ajouter une ligne"
                        icon="pi pi-plus"
                        onClick={addDetail}
                        className="p-button-success"
                        disabled={loading}
                    />
                </div>

                <DataTable
                    value={details}
                    emptyMessage="Aucun détail ajouté"
                    className="p-datatable-sm"
                    scrollable
                    scrollHeight="400px"
                >
                    <Column
                        header="Article"
                        body={(rowData, { rowIndex }) => (
                            <Dropdown
                                value={rowData.articleId}
                                options={articles}
                                onChange={(e: DropdownChangeEvent) => {
                                    handleArticleSelection(rowIndex, e.value);
                                }}
                                optionLabel="libelle"
                                optionValue="articleId"
                                placeholder="Sélectionner un article"
                                className="w-full"
                                filter
                                showClear
                            />
                        )}
                        style={{ minWidth: '200px' }}
                    />

                    <Column
                        field="qteStock" 
                        header="Qté en stock" 
                        body={(rowData) => {
                            const article = articles.find(a => a.articleId === rowData.articleId);
                            
                            return (
                                <InputNumber
                                    value={article?.qteStock || 0}
                                    readOnly
                                    className="readonly-input"
                                    min={0}
                                    maxFractionDigits={2}
                                />
                            );
                        }}
                    />

                    <Column
                        header="Unité"
                        body={(rowData) => {
                            const selectedArticle = articles.find(a => a.articleId === rowData.articleId);
                            return (
                                <InputText
                                    value={selectedArticle?.uniteId || ''}
                                    readOnly
                                    className="readonly-input"
                                />
                            );
                        }}
                        style={{ minWidth: '100px' }}
                    />

                    <Column
                        header="Quantité à sortir"
                        body={(rowData, { rowIndex }) => (
                            <div>
                                <InputNumber
                                    value={rowData.qteS}
                                    onValueChange={(e) => {
                                        const value = e.value !== null && e.value !== undefined ? Number(e.value) : 0;
                                        handleQuantityChange(rowIndex, value);
                                    }}
                                    mode="decimal"
                                    minFractionDigits={2}
                                    maxFractionDigits={4}
                                    className={`w-full ${rowData.qteError ? 'p-invalid' : ''}`}
                                    placeholder="0.00"
                                    min={0}
                                    useGrouping={false}
                                />
                                {rowData.qteError && (
                                    <small className="p-error">{rowData.qteError}</small>
                                )}
                            </div>
                        )}
                        style={{ minWidth: '140px' }}
                    />

                    <Column
                        header="PUMP"
                        body={(rowData) => (
                            <InputNumber
                                value={rowData.pUMP || 0}
                                mode="currency"
                                currency="BIF"
                                locale="fr-FR"
                                readOnly
                                className="readonly-input"
                            />
                        )}
                        style={{ minWidth: '120px' }}
                    />

                    <Column
                        header="Montant total"
                        body={(rowData) => (
                            <InputNumber
                                value={rowData.prixTotal || 0}
                                mode="currency"
                                currency="BIF"
                                locale="fr-FR"
                                readOnly
                                className="readonly-input"
                            />
                        )}
                        style={{ minWidth: '140px' }}
                    />

                    <Column
                        header="Actions"
                        body={(rowData, { rowIndex }) => (
                            <div className="flex gap-1">
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-rounded p-button-danger p-button-text"
                                    onClick={() => handleRemoveDetail(rowIndex)}
                                    tooltip="Supprimer la ligne"
                                    disabled={loading}
                                />
                                {isExistingDetail(rowData) && (
                                    <span 
                                        className="pi pi-database text-xs text-blue-500 mt-2" 
                                        title="Cette ligne existe dans la base de données"
                                    />
                                )}
                            </div>
                        )}
                        style={{ width: '100px' }}
                    />
                </DataTable>
            </div>

            <style jsx>{`
                .readonly-input input {
                    background-color: #f8f9fa !important;
                    color: #6c757d !important;
                    cursor: not-allowed !important;
                }
                .text-red-500 { color: #ef4444 !important; }
                .text-yellow-500 { color: #f59e0b !important; }
                .text-green-500 { color: #10b981 !important; }
                .text-blue-500 { color: #3b82f6 !important; }
            `}</style>
        </div>
    );
};

export default StkSortieForm;