'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Message } from 'primereact/message';
import { Fieldset } from 'primereact/fieldset';

interface ComptabilisationFormProps {
  onGenerate: (values: {
    dateDebut: Date;
    dateFin: Date;
    numeroPieceEntree?: string;
    numeroPieceSortie?: string;
    codeJournal: string;
  }) => void;
  onTransfer: (values: {
    dateDebut: Date;
    dateFin: Date;
    numeroPiece: string;
    dossierId: string;
    codeJournal: string;
    brouillard: string;
    annee: string;
  }) => void;
  onCancel: () => void;
  loading: boolean;
  transferLoading: boolean;
  cancelLoading: boolean;
  result: any;
}

export default function ComptabilisationForm({
  onGenerate,
  onTransfer,
  onCancel,
  loading,
  transferLoading,
  cancelLoading,
  result
}: ComptabilisationFormProps) {
  const [dateDebut, setDateDebut] = useState<Date | null>(null);
  const [dateFin, setDateFin] = useState<Date | null>(null);
  const [numeroPieceEntree, setNumeroPieceEntree] = useState('1');
  const [numeroPieceSortie, setNumeroPieceSortie] = useState('1');
  const [codeJournal, setCodeJournal] = useState('OD');
  
  // États pour le transfert
const [showTransferDialog, setShowTransferDialog] = useState(false);
const [transferNumeroPiece, setTransferNumeroPiece] = useState('1');
const [dossierId, setDossierId] = useState('GPS');
const [transferCodeJournal, setTransferCodeJournal] = useState('OD');
const [brouillard, setBrouillard] = useState('');
const [annee, setAnnee] = useState(new Date().getFullYear().toString());

  const handleGenerate = () => {
    if (!dateDebut || !dateFin || !codeJournal) {
      alert('Veuillez remplir les champs obligatoires: dates et code journal');
      return;
    }

    onGenerate({
      dateDebut,
      dateFin,
      numeroPieceEntree: numeroPieceEntree || undefined,
      numeroPieceSortie: numeroPieceSortie || undefined,
      codeJournal
    });
  };

  const handleTransfer = () => {
    if (!dateDebut || !dateFin || !transferNumeroPiece || !dossierId || !transferCodeJournal || !brouillard || !annee) {
      alert('Veuillez remplir tous les champs du transfert');
      return;
    }

    onTransfer({
      dateDebut,
      dateFin,
      numeroPiece: transferNumeroPiece,
      dossierId,
      codeJournal: transferCodeJournal,
      brouillard,
      annee
    });
    setShowTransferDialog(false);
  };

  const handleCancel = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler la comptabilisation ?')) {
      onCancel();
    }
  };

  return (
    <div className="p-fluid">
      <div className="grid">
        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="dateDebut">Date Début *</label>
            <Calendar
              id="dateDebut"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.value as Date)}
              dateFormat="dd/mm/yy"
              showIcon
            />
          </div>
        </div>
        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="dateFin">Date Fin *</label>
            <Calendar
              id="dateFin"
              value={dateFin}
              onChange={(e) => setDateFin(e.value as Date)}
              dateFormat="dd/mm/yy"
              showIcon
            />
          </div>
        </div>

       {/*
        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="codeJournal">Code Journal *</label>
            <InputText
              id="codeJournal"
              value={codeJournal}
              onChange={(e) => setCodeJournal(e.target.value)}
              placeholder="OD"
            />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="numeroPieceEntree">N° Pièce Entrée</label>
            <InputText
              id="numeroPieceEntree"
              value={numeroPieceEntree}
              onChange={(e) => setNumeroPieceEntree(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="numeroPieceSortie">N° Pièce Sortie</label>
            <InputText
              id="numeroPieceSortie"
              value={numeroPieceSortie}
              onChange={(e) => setNumeroPieceSortie(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>
       */}
      </div>

      {result && (
        <div className="mt-3">
          <Fieldset legend="Résultat de la Génération">
            {result.messageEntree && (
              <Message 
                severity={result.entreesGenerees ? 'success' : 'error'} 
                text={result.messageEntree} 
                className="mb-2" 
              />
            )}
            {result.messageSortie && (
              <Message 
                severity={result.sortiesGenerees ? 'success' : 'error'} 
                text={result.messageSortie} 
                className="mb-2" 
              />
            )}
            {result.messageGlobal && !result.messageGlobal.startsWith('Erreur:') && (
              <Message severity="info" text={result.messageGlobal} />
            )}
          </Fieldset>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <Button
          label="Générer Comptabilisation"
          icon="pi pi-calculator"
          onClick={handleGenerate}
          loading={loading}
          className="p-button-primary"
        />
        <Button
          label="Transférer"
          icon="pi pi-send"
          onClick={() => setShowTransferDialog(true)}
          disabled={loading}
          className="p-button-success"
        />
        <Button
          label="Annuler"
          icon="pi pi-times"
          onClick={handleCancel}
          loading={cancelLoading}
          className="p-button-danger"
        />
      </div>

      {/* Dialog pour le transfert */}
    <Dialog
  header="Transfert Comptable"
  visible={showTransferDialog}
  style={{ width: 'min(90vw, 600px)' }}
  onHide={() => setShowTransferDialog(false)}
  className="transfer-dialog"
  draggable={false}
  resizable={false}
>
  <div className="transfer-content">
    <div className="grid form-grid">
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="transferNumeroPiece" className="block text-sm font-medium mb-2">
            N° Pièce <span className="text-red-500">*</span>
          </label>
          <InputText
            id="transferNumeroPiece"
            value={transferNumeroPiece}
            onChange={(e) => setTransferNumeroPiece(e.target.value)}
            placeholder="Saisir le numéro de pièce"
            className="w-full"
            //autoFocus
            readOnly
          />
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="dossierId" className="block text-sm font-medium mb-2">
            Dossier ID <span className="text-red-500">*</span>
          </label>
          <InputText
            id="dossierId"
            value={dossierId}
            onChange={(e) => setDossierId(e.target.value)}
            placeholder="Saisir l'identifiant du dossier"
            className="w-full"
            readOnly
          />
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="transferCodeJournal" className="block text-sm font-medium mb-2">
            Code Journal <span className="text-red-500">*</span>
          </label>
          <InputText
            id="transferCodeJournal"
            value={transferCodeJournal}
            onChange={(e) => setTransferCodeJournal(e.target.value)}
            placeholder="Ex: OD, AC, etc."
            className="w-full"
            readOnly
          />
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="brouillard" className="block text-sm font-medium mb-2">
            Brouillard <span className="text-red-500">*</span>
          </label>
          <InputText
            id="brouillard"
            value={brouillard}
            onChange={(e) => setBrouillard(e.target.value)}
            placeholder="Saisir le code brouillard"
            className="w-full"
            
          />
        </div>
      </div>
      
      <div className="col-12 md:col-6">
        <div className="field">
          <label htmlFor="annee" className="block text-sm font-medium mb-2">
            Année <span className="text-red-500">*</span>
          </label>
          <InputText
            id="annee"
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
            placeholder="Ex: 2024"
            className="w-full"
            keyfilter="num"
          />
        </div>
      </div>
    </div>

    {/* Section d'information */}
    <div className="info-section mt-4 p-3 border-round bg-blue-50 border-1 border-blue-200">
      <div className="flex align-items-start">
        <i className="pi pi-info-circle text-blue-500 mt-1 mr-2"></i>
        <div>
          <p className="text-sm text-blue-700 mb-1 font-medium">Informations importantes</p>
          <p className="text-xs text-blue-600 m-0">
            Tous les champs marqués d'un astérisque (<span className="text-red-500">*</span>) sont obligatoires.
            Vérifiez les données avant de procéder au transfert.
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <div className="flex justify-content-between align-items-center mt-4 pt-3 border-top-1 surface-border">
    <div className="text-sm text-color-secondary">
      {transferNumeroPiece || dossierId || transferCodeJournal || brouillard || annee ? 
        "Formulaire partiellement rempli" : "Tous les champs sont vides"}
    </div>
    
    <div className="flex gap-2">
      <Button
        label="Annuler"
        icon="pi pi-times"
        onClick={() => setShowTransferDialog(false)}
        className="p-button-outlined p-button-secondary"
        severity="secondary"
      />
      <Button
        label="Transférer"
        icon="pi pi-send"
        onClick={handleTransfer}
        loading={transferLoading}
        className="p-button-primary"
        disabled={!transferNumeroPiece || !dossierId || !transferCodeJournal || !brouillard || !annee}
      />
    </div>
  </div>

</Dialog>


    </div>
    
  );
}