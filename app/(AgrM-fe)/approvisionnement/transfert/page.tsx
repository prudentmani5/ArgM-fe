'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { useRef, useState, useEffect } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { PDFViewer } from '@react-pdf/renderer';
import ComptabilisationForm from './ComptabilisationForm';
import ComptabilisationPdf from './ComptabilisationPdf';
import { API_BASE_URL } from '../../../../utils/apiConfig';

interface AchatTransfert {
  numeroPiece?: string;
  compteCategorie: string;
  libelleCategorie?: string;
  reference?: string;
  dateEcriture?: string;
  debit?: number;
  credit?: number;
  montant?: number;
  type?: string;
}

interface ComptabilisationResult {
  entreesGenerees: boolean;
  sortiesGenerees: boolean;
  messageEntree: string;
  messageSortie: string;
  messageGlobal: string;
}

export default function ComptabilisationTransfertPage() {
  const [brouillardData, setBrouillardData] = useState<AchatTransfert[]>([]);
  const [entreesData, setEntreesData] = useState<AchatTransfert[]>([]);
  const [sortiesData, setSortiesData] = useState<AchatTransfert[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [showTransferDialog, setShowTransferDialog] = useState(false); // Ajoutez cette ligne
  const [searchParams, setSearchParams] = useState<{
    dateDebut: Date;
    dateFin: Date;
    numeroPieceEntree?: string;
    numeroPieceSortie?: string;
    codeJournal: string;
  } | null>(null);
  const [comptabilisationResult, setComptabilisationResult] = useState<ComptabilisationResult | null>(null);
  const toast = useRef<Toast>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const fetchBrouillardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/comptabilisationTransfert/brouillard`);
      if (!response.ok) throw new Error('Erreur lors du chargement du brouillard');
      const data = await response.json();
      setBrouillardData(data);
      
      // Filtrer les données par type
      setEntreesData(data.filter((item: AchatTransfert) => item.type === 'ENTREE'));
      setSortiesData(data.filter((item: AchatTransfert) => item.type === 'SORTIE'));
    } catch (error) {
      console.error("Erreur de chargement:", error);
      showToast('error', 'Erreur', 'Échec du chargement des données du brouillard');
    } finally {
      setLoading(false);
    }
  };

  const genererComptabilisation = async (values: {
    dateDebut: Date;
    dateFin: Date;
    numeroPieceEntree?: string;
    numeroPieceSortie?: string;
    codeJournal: string;
  }) => {
    if (!values.dateDebut || !values.dateFin || !values.codeJournal) {
      showToast('error', 'Erreur', 'Les dates et le code journal sont requis');
      return;
    }

    setLoading(true);
    try {
      const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
      const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');

      let url = `${API_BASE_URL}/comptabilisationTransfert/generer?dateDebut=${debut}&dateFin=${fin}&codeJournal=${values.codeJournal}`;

      if (values.numeroPieceEntree) {
        url += `&numeroPieceEntree=${values.numeroPieceEntree}`;
      }
      if (values.numeroPieceSortie) {
        url += `&numeroPieceSortie=${values.numeroPieceSortie}`;
      }

      const response = await fetch(url, { method: 'POST' });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de la génération');
      }

      const result: ComptabilisationResult = await response.json();
      setComptabilisationResult(result);
      
      if (result.messageGlobal && result.messageGlobal.startsWith('Erreur:')) {
        showToast('error', 'Erreur', result.messageGlobal);
      } else {
        await fetchBrouillardData();
        setSearchParams(values);
        showToast('success', 'Succès', 'Comptabilisation générée avec succès');
      }
    } catch (error) {
      console.error("Erreur:", error);
      showToast('error', 'Erreur', error instanceof Error ? error.message : 'Échec de la génération');
    } finally {
      setLoading(false);
    }
  };


 const transfererComptabilisation = async (values: {
  dateDebut: Date;
  dateFin: Date;
  numeroPiece: string;
  dossierId: string;
  codeJournal: string;
  brouillard: string;
  annee: string;
}) => {
  setTransferLoading(true);
  try {
    console.log('Début du transfert avec les données:', values);
    
    const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
    const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');

    const params = new URLSearchParams({
      dateDebut: debut,
      dateFin: fin,
      numeroPiece: values.numeroPiece,
      dossierId: values.dossierId,
      codeJournal: values.codeJournal,
      brouillard: values.brouillard,
      annee: values.annee
    });

    const url = `${API_BASE_URL}/comptabilisationTransfert/transferer?${params.toString()}`;
    console.log('URL appelée:', url);

    const response = await fetch(url, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Réponse reçue, status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur serveur:', errorText);
      throw new Error(errorText || 'Erreur lors du transfert');
    }

    const result = await response.text();
    console.log('Résultat:', result);
    
    showToast('success', 'Succès', result || 'Transfert effectué avec succès');
    await fetchBrouillardData();
    
    // Fermer le dialogue après succès
    setShowTransferDialog(false); // Cette ligne fermera le dialogue
    
  } catch (error) {
    console.error("Erreur complète:", error);
    showToast('error', 'Erreur', error instanceof Error ? error.message : 'Échec du transfert');
  } finally {
    setTransferLoading(false);
  }
};

  const annulerComptabilisation = async () => {
    setCancelLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/comptabilisationTransfert/annuler`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de l\'annulation');
      }

      const result = await response.text();
      showToast('success', 'Succès', result || 'Opération annulée avec succès');
      await fetchBrouillardData();
      setComptabilisationResult(null);
    } catch (error) {
      console.error("Erreur:", error);
      showToast('error', 'Erreur', error instanceof Error ? error.message : 'Échec de l\'annulation');
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    fetchBrouillardData();
  }, []);

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '0 FBu';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'BIF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const totalDebit = brouillardData.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalCredit = brouillardData.reduce((sum, item) => sum + (item.credit || 0), 0);
  const totalEntreesDebit = entreesData.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalEntreesCredit = entreesData.reduce((sum, item) => sum + (item.credit || 0), 0);
  const totalSortiesDebit = sortiesData.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalSortiesCredit = sortiesData.reduce((sum, item) => sum + (item.credit || 0), 0);

  const handlePrintPreview = () => {
    setShowPdfPreview(true);
  };

  return (
    <>
      <Toast ref={toast} />

      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '10px',
            backgroundColor: 'white'
          }}>
            <Button
              icon="pi pi-times"
              onClick={() => setShowPdfPreview(false)}
              className="p-button-text"
            />
            <Button
              icon="pi pi-print"
              onClick={() => window.print()}
              label="Imprimer"
              className="ml-2"
            />
          </div>
          <PDFViewer style={{
            width: '100%',
            height: '100%'
          }}>
            <ComptabilisationPdf
              data={brouillardData}
              dateDebut={searchParams?.dateDebut || new Date()}
              dateFin={searchParams?.dateFin || new Date()}
              totalDebit={totalDebit}
              totalCredit={totalCredit}
            />
          </PDFViewer>
        </div>
      )}

      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Génération">
          <Card title="Comptabilisation des Transferts">
            <ComptabilisationForm
              onGenerate={genererComptabilisation}
              onTransfer={transfererComptabilisation}
              onCancel={annulerComptabilisation}
              loading={loading}
              transferLoading={transferLoading}
              cancelLoading={cancelLoading}
              result={comptabilisationResult}
            />
          </Card>
        </TabPanel>

        <TabPanel header="Brouillard Comptable">
          {searchParams && (
            <div className="mb-3 p-3 surface-100 border-round">
              <div className="font-bold text-lg">
                Période: {formatDate(searchParams.dateDebut.toString())} au {formatDate(searchParams.dateFin.toString())}
              </div>
              {searchParams.numeroPieceEntree && (
                <div>Pièce entrée: {searchParams.numeroPieceEntree}</div>
              )}
              {searchParams.numeroPieceSortie && (
                <div>Pièce sortie: {searchParams.numeroPieceSortie}</div>
              )}
              <div>Journal: {searchParams.codeJournal}</div>
            </div>
          )}
          
          <div className="flex justify-content-between align-items-center mb-3">
            <span className="p-input-icon-left" style={{ width: '40%' }}>
              <i className="pi pi-search" />
              <InputText
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Rechercher..."
                className="w-full"
              />
            </span>
            <div>
              <Button
                icon="pi pi-print"
                onClick={handlePrintPreview}
                disabled={loading || brouillardData.length === 0}
                tooltip="Visualiser avant impression"
                tooltipOptions={{ position: 'left' }}
                className="mr-2"
              />
              <Button
                icon="pi pi-refresh"
                onClick={fetchBrouillardData}
                disabled={loading}
                tooltip="Rafraîchir"
                tooltipOptions={{ position: 'left' }}
              />
            </div>
          </div>

          <DataTable
            value={brouillardData}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            loading={loading}
            globalFilter={globalFilter}
            emptyMessage="Aucune écriture trouvée dans le brouillard"
            footer={
              <div className="flex justify-content-between font-bold">
                <div>Total Débit: {formatCurrency(totalDebit)}</div>
                <div>Total Crédit: {formatCurrency(totalCredit)}</div>
                <div>Solde: {formatCurrency(totalDebit - totalCredit)}</div>
              </div>
            }
          >
            <Column field="numeroPiece" header="N° Pièce" sortable />
            <Column field="compteCategorie" header="Compte" sortable />
            <Column field="libelleCategorie" header="Libellé" sortable />
            <Column field="reference" header="Référence" sortable />
            <Column 
              field="dateEcriture" 
              header="Date Écriture" 
              body={(row) => formatDate(row.dateEcriture)}
              sortable 
            />
            <Column 
              field="debit" 
              header="Débit" 
              body={(row) => formatCurrency(row.debit)}
              sortable 
            />
            <Column 
              field="credit" 
              header="Crédit" 
              body={(row) => formatCurrency(row.credit)}
              sortable 
            />
            <Column field="type" header="Type" sortable />
          </DataTable>
        </TabPanel>

        <TabPanel header="Écritures d'Entrée">
          <DataTable
            value={entreesData}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            loading={loading}
            globalFilter={globalFilter}
            emptyMessage="Aucune écriture d'entrée trouvée"
            footer={
              <div className="flex justify-content-between font-bold">
                <div>Total Débit: {formatCurrency(totalEntreesDebit)}</div>
                <div>Total Crédit: {formatCurrency(totalEntreesCredit)}</div>
                <div>Solde: {formatCurrency(totalEntreesDebit - totalEntreesCredit)}</div>
              </div>
            }
          >
            <Column field="numeroPiece" header="N° Pièce" />
            <Column field="compteCategorie" header="Compte" />
            <Column field="libelleCategorie" header="Libellé" />
            <Column field="reference" header="Référence" />
            <Column 
              field="debit" 
              header="Débit" 
              body={(row) => formatCurrency(row.debit)}
            />
            <Column 
              field="credit" 
              header="Crédit" 
              body={(row) => formatCurrency(row.credit)}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header="Écritures de Sortie">
          <DataTable
            value={sortiesData}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            loading={loading}
            globalFilter={globalFilter}
            emptyMessage="Aucune écriture de sortie trouvée"
            footer={
              <div className="flex justify-content-between font-bold">
                <div>Total Débit: {formatCurrency(totalSortiesDebit)}</div>
                <div>Total Crédit: {formatCurrency(totalSortiesCredit)}</div>
                <div>Solde: {formatCurrency(totalSortiesDebit - totalSortiesCredit)}</div>
              </div>
            }
          >
            <Column field="numeroPiece" header="N° Pièce" />
            <Column field="compteCategorie" header="Compte" />
            <Column field="libelleCategorie" header="Libellé" />
            <Column field="reference" header="Référence" />
            <Column 
              field="debit" 
              header="Débit" 
              body={(row) => formatCurrency(row.debit)}
            />
            <Column 
              field="credit" 
              header="Crédit" 
              body={(row) => formatCurrency(row.credit)}
            />
          </DataTable>
        </TabPanel>
      </TabView>
    </>
  );
}
