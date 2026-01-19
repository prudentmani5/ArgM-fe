'use client';

import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { buildApiUrl } from '../../../../utils/apiConfig';

interface RecetteCREDITFormProps {
    onSearch: (values: { dateDebut: Date; dateFin: Date }) => void;
    onTransfer: (values: TransferParams) => void;
    onCancelTransfer?: (values: CancelTransferParams) => void;
    loading: boolean;
    transferLoading: boolean;
    cancelLoading?: boolean;
}

interface TransferParams {
    dateDebut: Date;
    dateFin: Date;
    codeJournal: string;
    brouillard: string;
    numeroPiece: string;
    dateTransfert: Date;
    annee: string; // Added annee to TransferParams
}

interface CancelTransferParams {
    annee: string;
    dateDebut: Date;
    dateFin: Date;
}

const RecetteCREDITForm: React.FC<RecetteCREDITFormProps> = ({
    onSearch,
    onTransfer,
    onCancelTransfer,
    loading,
    transferLoading,
    cancelLoading = false
}) => {
    const [dateDebut, setDateDebut] = useState<Date>(new Date());
    const [dateFin, setDateFin] = useState<Date>(new Date());

    // Transfer params avec valeurs par défaut
    const [codeJournal, setCodeJournal] = useState<string>('FIGPS');
    const [brouillard, setBrouillard] = useState<string>('');
    const [numeroPiece, setNumeroPiece] = useState<string>('');
    const [dateTransfert, setDateTransfert] = useState<Date>(new Date());
    const [annee, setAnnee] = useState<string>(new Date().getFullYear().toString()); // New state for annee
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Update annee when dateTransfert changes
    useEffect(() => {
        if (dateTransfert) {
            setAnnee(dateTransfert.getFullYear().toString());
        }
    }, [dateTransfert]);

    const handleSubmit = () => {
        if (!dateDebut || !dateFin) return;
        onSearch({
            dateDebut,
            dateFin
        });
    };

    const handleTransferSubmit = () => {
        console.log("🚀 Transfert avec paramètres:", {
            brouillard,
            numeroPiece,
            annee
        });
        onTransfer({
            dateDebut,
            dateFin,
            codeJournal,
            brouillard,
            numeroPiece,
            dateTransfert,
            annee // Added annee to the transfer params
        });
        setShowTransferDialog(false);
    };

    const handleCancelTransfer = () => {
        // Vérifier si la fonction existe avant d'ouvrir la confirmation
        if (typeof onCancelTransfer !== 'function') {
            console.error('onCancelTransfer is not available');
            return;
        }
        setShowCancelConfirm(true);
    };

    const confirmCancelTransfer = () => {
        if (typeof onCancelTransfer === 'function') {
            onCancelTransfer({
                annee: annee, // Use the annee state instead of current year
                dateDebut,
                dateFin
            });
        } else {
            console.error('onCancelTransfer is not a function');
        }
        setShowCancelConfirm(false);
    };

    const hasCancelTransfer = typeof onCancelTransfer === 'function';

    // Function to fetch numeroPiece based on brouillard and annee
    const fetchNumeroPiece = async (brouillardValue: string, anneeValue: string) => {
        if (!brouillardValue || !anneeValue) return;
        
        try {
            const dossierId = 'GPS';
            const brouillardId = brouillardValue + anneeValue + dossierId;
            
            const response = await fetch(
                buildApiUrl(`/recetteCashs/numPiece?brouillardId=${brouillardId}&annee=${anneeValue}&dossierId=${dossierId}`)
            );
            
            if (response.ok) {
                const maxPiece = await response.json();
                setNumeroPiece(((maxPiece || 0) + 1).toString());
            } else {
                setNumeroPiece('1');
            }
        } catch (error) {
            console.error('Erreur récupération numPiece:', error);
            setNumeroPiece('1');
        }
    };

    // Update numeroPiece when annee changes (if brouillard already has value)
    useEffect(() => {
        if (brouillard && annee) {
            fetchNumeroPiece(brouillard, annee);
        }
    }, [annee]);

    return (
        <div className="card p-fluid">
            {/* Dialog de confirmation pour l'annulation */}
            <ConfirmDialog
                visible={showCancelConfirm}
                onHide={() => setShowCancelConfirm(false)}
                message="Êtes-vous sûr de vouloir annuler le transfert ? Cette action est irréversible."
                header="Confirmation d'annulation"
                icon="pi pi-exclamation-triangle"
                accept={confirmCancelTransfer}
                reject={() => setShowCancelConfirm(false)}
                acceptLabel="Oui, annuler"
                rejectLabel="Non"
            />

            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="dateDebut">Date début</label>
                    <Calendar
                        id="dateDebut"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        maxDate={dateFin}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateFin">Date fin</label>
                    <Calendar
                        id="dateFin"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        minDate={dateDebut}
                    />
                </div>

                <div className="field col-12 md:col-6 flex align-items-end gap-2">
                    <Button
                        label="Générer"
                        icon="pi pi-calculator"
                        onClick={handleSubmit}
                        loading={loading}
                        className="w-full"
                    />
                    <Button
                        label="Transférer"
                        icon="pi pi-send"
                        onClick={() => setShowTransferDialog(true)}
                        disabled={loading}
                        className="w-full p-button-success"
                    />
                </div>
            </div>

            {/* Dialog pour le transfert */}
            <Dialog
    header={
        <div className="flex align-items-center gap-2">
            <i className="pi pi-send text-primary" />
            <span className="text-xl font-semibold">Paramètres de transfert</span>
        </div>
    }
    visible={showTransferDialog}
    style={{ width: '550px', maxWidth: '90vw' }}
    onHide={() => setShowTransferDialog(false)}
    className="transfer-dialog"
    draggable={false}
    resizable={false}
>
    <div className="p-fluid">
        <div className="grid">
            {/* First row: Code Journal and Année */}
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="codeJournal" className="block mb-2">
                        <i className="pi pi-book mr-2 text-color-secondary" />
                        Code Journal
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon bg-gray-100">
                            <i className="pi pi-lock" />
                        </span>
                        <InputText
                            id="codeJournal"
                            value={codeJournal}
                            className="w-full bg-gray-50"
                            readOnly
                            aria-label="Code journal en lecture seule"
                        />
                    </div>
                    <small className="text-color-secondary text-xs mt-1 block">Valeur fixe pour ce type de transfert</small>
                </div>
            </div>
            
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="annee" className="block mb-2 required">
                        <i className="pi pi-calendar mr-2 text-color-secondary" />
                        Année
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon bg-blue-50">
                            <i className="pi pi-hashtag" />
                        </span>
                        <InputText
                            id="annee"
                            value={annee}
                            onChange={(e) => {
                                const newAnnee = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setAnnee(newAnnee);
                                if (brouillard && newAnnee) {
                                    fetchNumeroPiece(brouillard, newAnnee);
                                }
                            }}
                            className="w-full"
                            placeholder="AAAA"
                            maxLength={4}
                            keyfilter="int"
                            aria-label="Année du transfert"
                        />
                        <span className="p-inputgroup-addon bg-blue-50">
                            <i className="pi pi-info-circle cursor-help"
                               title="Saisir l'année du transfert. Modifiable manuellement." />
                        </span>
                    </div>
                    <small className="text-color-secondary text-xs mt-1 block">Format: AAAA (ex: 2024)</small>
                </div>
            </div>
            
            {/* Second row: Brouillard */}
            <div className="col-12">
                <div className="field">
                    <label htmlFor="brouillard" className="block mb-2 required">
                        <i className="pi pi-file-edit mr-2 text-color-secondary" />
                        Brouillard
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon bg-blue-50">
                            <i className="pi pi-key" />
                        </span>
                        <InputText
                            id="brouillard"
                            value={brouillard}
                            onChange={async (e) => {
                                const newValue = e.target.value.toUpperCase();
                                setBrouillard(newValue);
                                if (newValue && annee) {
                                    await fetchNumeroPiece(newValue, annee);
                                } else {
                                    setNumeroPiece('');
                                }
                            }}
                            className="w-full"
                            placeholder="Saisir la référence du brouillard"
                            maxLength={20}
                            aria-label="Référence du brouillard"
                            autoFocus
                        />
                    </div>
                    <small className="text-color-secondary text-xs mt-1 block">
                        {brouillard && annee && (
                            <span className="flex align-items-center gap-1">
                                <i className="pi pi-check-circle text-green-500" />
                                Identifiant généré: {brouillard}{annee}GPS
                            </span>
                        )}
                    </small>
                </div>
            </div>
            
            {/* Third row: Numéro Pièce et Date Transfert */}
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="numeroPiece" className="block mb-2 required">
                        <i className="pi pi-sort-numeric-up mr-2 text-color-secondary" />
                        Numéro Pièce
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon bg-green-50">
                            <i className="pi pi-calculator" />
                        </span>
                        <InputText
                            id="numeroPiece"
                            value={numeroPiece}
                            className="w-full bg-green-50"
                            placeholder="Saisir le brouillard d'abord"
                            disabled
                            aria-label="Numéro de pièce généré automatiquement"
                        />
                        {numeroPiece && (
                            <span className="p-inputgroup-addon bg-green-50">
                                <i className="pi pi-check text-green-600" />
                            </span>
                        )}
                    </div>
                    <small className="text-color-secondary text-xs mt-1 block">
                        Généré automatiquement à partir du brouillard et de l'année
                    </small>
                </div>
            </div>
            
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="dateTransfert" className="block mb-2">
                        <i className="pi pi-clock mr-2 text-color-secondary" />
                        Date Transfert
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon bg-blue-50">
                            <i className="pi pi-calendar" />
                        </span>
                        <Calendar
                            id="dateTransfert"
                            value={dateTransfert}
                            onChange={(e) => {
                                const newDate = e.value as Date;
                                setDateTransfert(newDate);
                                const newAnnee = newDate.getFullYear().toString();
                                setAnnee(newAnnee);
                                if (brouillard) {
                                    fetchNumeroPiece(brouillard, newAnnee);
                                }
                            }}
                            dateFormat="dd/mm/yy"
                            className="w-full"
                            showIcon={false}
                            showButtonBar
                            aria-label="Date du transfert"
                        />
                    </div>
                    <small className="text-color-secondary text-xs mt-1 block">
                        La date correspondante aux données à tranfert du mois
                    </small>
                </div>
            </div>
        </div>
        
      
        
        {/* Action Buttons */}
        <div className="flex justify-content-between mt-5 pt-3 border-top-1 surface-border">
            <div className="flex align-items-center text-color-secondary">
                <i className="pi pi-asterisk text-xs mr-1" />
                <span className="text-sm">Champs obligatoires</span>
            </div>
            <div className="flex gap-2">
                <Button
                    label="Annuler"
                    icon="pi pi-times"
                    onClick={() => setShowTransferDialog(false)}
                    className="p-button-text p-button-plain"
                    severity="secondary"
                    aria-label="Annuler le transfert"
                />
                <Button
                    label={transferLoading ? "Transfert en cours..." : "Confirmer le transfert"}
                    icon={transferLoading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                    onClick={handleTransferSubmit}
                    loading={transferLoading}
                    className="p-button-raised p-button-success"
                    disabled={!brouillard || !numeroPiece || !annee || transferLoading}
                    aria-label="Confirmer et procéder au transfert"
                />
            </div>
        </div>
    </div>
    
    <style jsx>{`
        .required::after {
            content: ' *';
            color: #f44336;
        }
        
        .transfer-dialog .p-dialog-header {
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 1rem;
        }
        
        .transfer-dialog .p-dialog-content {
            padding-top: 1rem;
        }
        
        .bg-blue-50 {
            background-color: #eff6ff;
        }
        
        .bg-green-50 {
            background-color: #f0fdf4;
        }
        
        .bg-gray-50 {
            background-color: #f9fafb;
        }
        
        .bg-gray-100 {
            background-color: #f3f4f6;
        }
    `}</style>
</Dialog>
        </div>
    );
};

export default RecetteCREDITForm;