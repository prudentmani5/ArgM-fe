// components/ComptabilisationForm.tsx
'use client';

import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { ComptabilisationApproRequest, TransferParams } from './Comptabilisation';

interface ComptabilisationFormProps {
    onGenererEntree: (values: ComptabilisationApproRequest) => void;
    onGenererSortie: (values: ComptabilisationApproRequest) => void;
    onTransfer: (values: TransferParams) => void;
    loading: boolean;
    transferLoading: boolean;
}

const ComptabilisationForm: React.FC<ComptabilisationFormProps> = ({ 
    onGenererEntree, 
    onGenererSortie,
    onTransfer,
    loading,
    transferLoading 
}) => {
    const [formData, setFormData] = useState<ComptabilisationApproRequest>({
        magasin: '',
        dateDebut: new Date(),
        dateFin: new Date(),
        numeroPiece: '',
        codeJournal: ''
    });
    
    const [transferData, setTransferData] = useState<TransferParams>({
        annee: new Date().getFullYear().toString(),
        dossierId: '',
        dateDebut: new Date(),
        dateFin: new Date(),
        codeJournal: '',
        brouillard: '',
        numeroPiece: 0,
        dateTransfert: new Date()
    });
    
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [operationType, setOperationType] = useState<'entree' | 'sortie' | ''>('');

    const handleInputChange = (field: keyof ComptabilisationApproRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTransferInputChange = (field: keyof TransferParams, value: any) => {
        setTransferData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (type: 'entree' | 'sortie') => {
        if (!formData.dateDebut || !formData.dateFin || !formData.numeroPiece || !formData.codeJournal) {
            return;
        }
        
        setOperationType(type);
        if (type === 'entree') {
            onGenererEntree(formData);
        } else {
            onGenererSortie(formData);
        }
    };

    const handleTransferSubmit = () => {
        onTransfer(transferData);
        setShowTransferDialog(false);
    };

    const magasins = [
        { label: 'Approvisionnement', value: 'MAG001' },
        { label: 'Dispensaire', value: 'DISP001' },
        { label: 'Pharmacie', value: 'PHARM001' }
    ];

    const journauxComptables = [
        { label: 'Journal Achats', value: 'ACH' },
        { label: 'Journal Ventes', value: 'VEN' },
        { label: 'Journal Trésorerie', value: 'TRES' },
        { label: 'Journal OD', value: 'OD' }
    ];

    return (
        <Card title="Comptabilisation Stock" className="p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="magasin">Magasin</label>
                    <Dropdown
                        id="magasin"
                        value={formData.magasin}
                        options={magasins}
                        onChange={(e: DropdownChangeEvent) => handleInputChange('magasin', e.value)}
                        placeholder="Sélectionnez un magasin"
                        className="w-full"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateDebut">Date début</label>
                    <Calendar
                        id="dateDebut"
                        value={formData.dateDebut}
                        onChange={(e) => handleInputChange('dateDebut', e.value as Date)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        maxDate={formData.dateFin}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateFin">Date fin</label>
                    <Calendar
                        id="dateFin"
                        value={formData.dateFin}
                        onChange={(e) => handleInputChange('dateFin', e.value as Date)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        minDate={formData.dateDebut}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="numeroPiece">Numéro Pièce</label>
                    <InputText
                        id="numeroPiece"
                        value={formData.numeroPiece}
                        onChange={(e) => handleInputChange('numeroPiece', e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="codeJournal">Code Journal</label>
                    <Dropdown
                        id="codeJournal"
                        value={formData.codeJournal}
                        options={journauxComptables}
                        onChange={(e: DropdownChangeEvent) => handleInputChange('codeJournal', e.value)}
                        placeholder="Sélectionnez un journal"
                        className="w-full"
                    />
                </div>

                <div className="field col-12 md:col-6 flex align-items-end gap-2">
                    <Button
                        label="Générer Entrée"
                        icon="pi pi-plus-circle"
                        onClick={() => handleSubmit('entree')}
                        loading={loading && operationType === 'entree'}
                        className="w-full p-button-success"
                    />
                    <Button
                        label="Générer Sortie"
                        icon="pi pi-minus-circle"
                        onClick={() => handleSubmit('sortie')}
                        loading={loading && operationType === 'sortie'}
                        className="w-full p-button-danger"
                    />
                    <Button
                        label="Transférer"
                        icon="pi pi-send"
                        onClick={() => setShowTransferDialog(true)}
                        disabled={loading}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Dialog pour le transfert */}
            <Dialog 
                header="Paramètres de transfert comptable" 
                visible={showTransferDialog} 
                style={{ width: '50vw' }}
                onHide={() => setShowTransferDialog(false)}
            >
                <div className="formgrid grid p-fluid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="annee">Année</label>
                        <InputText 
                            id="annee" 
                            value={transferData.annee} 
                            onChange={(e) => handleTransferInputChange('annee', e.target.value)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="dossierId">Dossier ID</label>
                        <InputText 
                            id="dossierId" 
                            value={transferData.dossierId} 
                            onChange={(e) => handleTransferInputChange('dossierId', e.target.value)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="codeJournalTransfert">Code Journal</label>
                        <InputText 
                            id="codeJournalTransfert" 
                            value={transferData.codeJournal} 
                            onChange={(e) => handleTransferInputChange('codeJournal', e.target.value)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="brouillard">Brouillard</label>
                        <InputText 
                            id="brouillard" 
                            value={transferData.brouillard} 
                            onChange={(e) => handleTransferInputChange('brouillard', e.target.value)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="numeroPieceTransfert">Numéro Pièce</label>
                        <InputNumber 
                            id="numeroPieceTransfert" 
                            value={transferData.numeroPiece} 
                            onValueChange={(e) => handleTransferInputChange('numeroPiece', e.value || 0)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="dateTransfert">Date Transfert</label>
                        <Calendar
                            id="dateTransfert"
                            value={transferData.dateTransfert}
                            onChange={(e) => handleTransferInputChange('dateTransfert', e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setShowTransferDialog(false)} 
                        className="p-button-text" 
                    />
                    <Button 
                        label="Transférer" 
                        icon="pi pi-check" 
                        onClick={handleTransferSubmit}
                        loading={transferLoading}
                        className="p-button-success" 
                    />
                </div>
            </Dialog>
        </Card>
    );
};

export default ComptabilisationForm;