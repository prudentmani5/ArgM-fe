'use client';

import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import { Importateur } from './RecetteCREDIT';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { API_BASE_URL } from '@/utils/apiConfig';

interface RecetteCREDITFormProps {
    onSearch: (values: { dateDebut: Date; dateFin: Date; importateur: string }) => void;
    onTransfer: (values: TransferParams) => void;
    loading: boolean;
    transferLoading: boolean;
}

interface TransferParams {
    annee: string;
    dossierId: string;
    dateDebut: Date;
    dateFin: Date;
    codeJournal: string;
    brouillard: string;
    numeroPiece: number;
    dateTransfert: Date;
}

const RecetteCREDITForm: React.FC<RecetteCREDITFormProps> = ({ 
    onSearch, 
    onTransfer,
    loading,
    transferLoading 
}) => {
    const [dateDebut, setDateDebut] = useState<Date>(new Date());
    const [dateFin, setDateFin] = useState<Date>(new Date());
    const [importateur, setImportateur] = useState<string>('');
    const [importateurs, setImportateurs] = useState<Importateur[]>([]);
    const [loadingImportateurs, setLoadingImportateurs] = useState(false);
    
    // Transfer params
    const [annee, setAnnee] = useState<string>(new Date().getFullYear().toString());
    const [dossierId, setDossierId] = useState<string>('');
    const [codeJournal, setCodeJournal] = useState<string>('');
    const [brouillard, setBrouillard] = useState<string>('');
    const [numeroPiece, setNumeroPiece] = useState<number>(0);
    const [dateTransfert, setDateTransfert] = useState<Date>(new Date());
    const [showTransferDialog, setShowTransferDialog] = useState(false);

    useEffect(() => {
        const fetchImportateurs = async () => {
            setLoadingImportateurs(true);
            try {
                const response = await fetch(`${API_BASE_URL}/importateurCredits/findall`);
                if (!response.ok) throw new Error('Erreur réseau');
                const data = await response.json();
                setImportateurs(data);
            } catch (error) {
                console.error("Erreur de chargement:", error);
            } finally {
                setLoadingImportateurs(false);
            }
        };
        fetchImportateurs();
    }, []);

    const handleSubmit = () => {
        if (!dateDebut || !dateFin || !importateur) return;
        onSearch({
            dateDebut,
            dateFin,
            importateur
        });
    };

    const handleTransferSubmit = () => {
        onTransfer({
            annee,
            dossierId,
            dateDebut,
            dateFin,
            codeJournal,
            brouillard,
            numeroPiece,
            dateTransfert
        });
        setShowTransferDialog(false);
    };

    return (
        <div className="card p-fluid">
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

              <div className="field col-12 md:col-3">
                    <label htmlFor="importateur">Importateur</label>
                    <Dropdown
                        id="importateur"
                        value={importateur}
                        options={importateurs.map(i => ({
                            label: i.nom,
                            value: i.importateurCreditId.toString()
                        }))}
                        onChange={(e: DropdownChangeEvent) => setImportateur(e.value)}
                        placeholder={loadingImportateurs ? "Chargement..." : "Sélectionnez un importateur"}
                        className="w-full"
                        disabled={loadingImportateurs}
                        filter
                    />
                </div>  
                

                <div className="field col-12 md:col-3 flex align-items-end gap-2">
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
                header="Paramètres de transfert" 
                visible={showTransferDialog} 
                style={{ width: '50vw' }}
                onHide={() => setShowTransferDialog(false)}
            >
                <div className="formgrid grid p-fluid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="annee">Année</label>
                        <InputText 
                            id="annee" 
                            value={annee} 
                            onChange={(e) => setAnnee(e.target.value)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="dossierId">Dossier ID</label>
                        <InputText 
                            id="dossierId" 
                            value={dossierId} 
                            onChange={(e) => setDossierId(e.target.value)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="codeJournal">Code Journal</label>
                        <InputText 
                            id="codeJournal" 
                            value={codeJournal} 
                            onChange={(e) => setCodeJournal(e.target.value)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="brouillard">Brouillard</label>
                        <InputText 
                            id="brouillard" 
                            value={brouillard} 
                            onChange={(e) => setBrouillard(e.target.value)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="numeroPiece">Numéro Pièce</label>
                        <InputNumber 
                            id="numeroPiece" 
                            value={numeroPiece} 
                            onValueChange={(e) => setNumeroPiece(e.value || 0)} 
                            className="w-full" 
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="dateTransfert">Date Transfert</label>
                        <Calendar
                            id="dateTransfert"
                            value={dateTransfert}
                            onChange={(e) => setDateTransfert(e.value as Date)}
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
        </div>
    );
};

export default RecetteCREDITForm;