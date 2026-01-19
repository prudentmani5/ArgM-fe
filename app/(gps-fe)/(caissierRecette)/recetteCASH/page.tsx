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
import Cookies from 'js-cookie';
import RecetteCREDITForm from './RecetteCREDITForm';
import RecetteCREDITPdf from './RecetteCREDITPdf';
import { buildApiUrl } from '../../../../utils/apiConfig';

interface RecetteCREDIT {
    recetteId: number;
    numCompte: string;
    libelle: string;
    montantTT: number;
    montantExo: number;
    dateSaisie: Date;
}

interface RecetteCREDITGrouped {
    libelle: string;
    totalTT: number;
    totalExo: number;
    items: RecetteCREDIT[];
}

interface CptExercice {
    exerciceId: string;
    codeExercice: string;
    description: string;
    dateDebut: string;
    dateFin: string;
}

export default function RecetteCREDITPage() {
    const [recettes, setRecettes] = useState<RecetteCREDIT[]>([]);
    const [recettesTVA, setRecettesTVA] = useState<RecetteCREDIT[]>([]);
    const [loading, setLoading] = useState(false);
    const [transferLoading, setTransferLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [currentExercice, setCurrentExercice] = useState<CptExercice | null>(null);
    const [searchParams, setSearchParams] = useState<{
        dateDebut: Date;
        dateFin: Date;
        // importateur: string;
    } | null>(null);
    const toast = useRef<Toast>(null);
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Utility function to format dates
    const formatDateExercice = (value: string) => {
        if (!value) return '';
        const date = new Date(value);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    };

    // Load current exercice from cookies on mount
    useEffect(() => {
        const savedExercice = Cookies.get('currentExercice');
        if (savedExercice) {
            try {
                const exercice = JSON.parse(savedExercice);
                setCurrentExercice(exercice);
            } catch (e) {
                console.error('Error parsing currentExercice:', e);
            }
        }
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recettesResponse, tvaResponse] = await Promise.all([
                fetch(buildApiUrl('/recetteCashs/findall')),
                fetch(buildApiUrl('/recetteCashs/tva'))
            ]);

            if (!recettesResponse.ok) throw new Error('Erreur lors du chargement des recettes');
            if (!tvaResponse.ok) throw new Error('Erreur lors du chargement des recettes TVA');

            const recettesData = await recettesResponse.json();
            const tvaData = await tvaResponse.json();

            setRecettes(recettesData);
            setRecettesTVA(tvaData);
        } catch (error) {
            console.error("Erreur de chargement:", error);
            showToast('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const genererRecettes = async (values: { dateDebut: Date; dateFin: Date }) => {
        if (!values.dateDebut || !values.dateFin) {
            showToast('error', 'Erreur', 'Les dates sont requises');
            return;
        }
        setLoading(true);
        try {
            const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
            const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');

            const response = await fetch(
                buildApiUrl(`/recetteCashs/generer?dateDebut=${debut}&dateFin=${fin}`),
                { method: 'POST' }
            );

            if (!response.ok) throw new Error('Erreur lors de la génération');

            await fetchData();
            setSearchParams(values);
            showToast('success', 'Succès', 'Recettes générées avec succès');
            setVisibleDialog(false);
        } catch (error) {
            console.error("Erreur:", error);
            showToast('error', 'Erreur', 'Échec de la génération des recettes');
        } finally {
            setLoading(false);
        }
    };

    const transfererRecettes = async (values: {
        dateDebut: Date;
        dateFin: Date;
        codeJournal: string;
        brouillard: string;
        numeroPiece: string;
        dateTransfert: Date;
    }) => {
        // Check if exercice is selected
        if (!currentExercice) {
            showToast('error', 'Erreur', 'Veuillez sélectionner un exercice avant de transférer');
            return;
        }

        setTransferLoading(true);
        try {
            const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
            const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');
            const dateTransfert = format(values.dateTransfert, 'yyyy-MM-dd');

            const response = await fetch(
                buildApiUrl(`/recetteCashs/transferer?exerciceId=${currentExercice.exerciceId}` +
                `&dateDebut=${debut}&dateFin=${fin}` +
                `&codeJournal=${values.codeJournal}&brouillard=${values.brouillard}` +
                `&numeroPiece=${values.numeroPiece}&dateTransfert=${dateTransfert}`),
                { method: 'POST' }
            );

            if (!response.ok) throw new Error('Erreur lors du transfert');

            showToast('success', 'Succès', 'Recettes transférées avec succès');
        } catch (error) {
            console.error("Erreur:", error);
            showToast('error', 'Erreur', 'Échec du transfert des recettes');
        } finally {
            setTransferLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    //const formatDate = (date: Date) => {
     //   return date.toLocaleDateString('fr-FR');
    //};

    const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Date non définie';
    return date.toLocaleDateString('fr-FR');
};

    const groupedData = recettes.reduce((acc: RecetteCREDITGrouped[], item: RecetteCREDIT) => {
        const existingGroup = acc.find(group => group.libelle === item.libelle);
        if (existingGroup) {
            existingGroup.items.push(item);
            existingGroup.totalTT += item.montantTT;
            existingGroup.totalExo += item.montantExo || 0;
        } else {
            acc.push({
                libelle: item.libelle,
                totalTT: item.montantTT,
                totalExo: item.montantExo || 0,
                items: [item]
            });
        }
        return acc;
    }, []);

    console.log('=== General Totals Calculation ===');
    console.log('All recettes count:', recettes.length);
    console.log('Grouped data:', groupedData);

    const totalGeneralTT = groupedData.reduce((sum, group) => sum + group.totalTT, 0);
    const totalGeneralExo = groupedData.reduce((sum, group) => sum + group.totalExo, 0);

    console.log('Total General TT (includes TVA):', totalGeneralTT);
    console.log('Total General Exo:', totalGeneralExo);
    console.log('=== End General Totals ===\n');

    // Après les totaux généraux existants
    console.log('=== TVA Calculation Debug ===');
    console.log('recettesTVA count:', recettesTVA.length);
    console.log('recettesTVA data:', recettesTVA);

    const totalTVA_TT = recettesTVA.reduce((sum, item) => {
        console.log(`TVA TT - Item: ${item.libelle}, Account: ${item.numCompte}, montantTT: ${item.montantTT}, running sum: ${sum + item.montantTT}`);
        return sum + item.montantTT;
    }, 0);

    const totalTVA_Exo = recettesTVA.reduce((sum, item) => {
        const exoAmount = item.montantExo || 0;
        console.log(`TVA Exo - Item: ${item.libelle}, Account: ${item.numCompte}, montantExo: ${exoAmount}, running sum: ${sum + exoAmount}`);
        return sum + exoAmount;
    }, 0);

    console.log('Total TVA TT:', totalTVA_TT);
    console.log('Total TVA Exo:', totalTVA_Exo);
    console.log('=== End TVA Calculation ===\n');

    console.log('=== HTVA Calculation (Subtraction) ===');
    console.log('Step 1: totalGeneralTT =', totalGeneralTT);
    console.log('Step 2: totalTVA_TT =', totalTVA_TT);
    console.log('Step 3: Calculating: totalHTVA_TT = totalGeneralTT - totalTVA_TT');
    console.log('Step 4:', totalGeneralTT, '-', totalTVA_TT, '=', (totalGeneralTT - totalTVA_TT));

    const totalHTVA_TT = totalGeneralTT - totalTVA_TT;

    console.log('Result: totalHTVA_TT =', totalHTVA_TT);
    console.log('=== End HTVA Calculation ===\n');

    console.log('=== Final Verification ===');
    console.log('Total General TT:', totalGeneralTT, '(ALL items including TVA)');
    console.log('Total TVA TT:', totalTVA_TT, '(TVA portion only)');
    console.log('Total HTVA TT:', totalHTVA_TT, '(General - TVA) = Amount before tax');
    console.log('Verification: HTVA + TVA =', totalHTVA_TT + totalTVA_TT, 'should equal', totalGeneralTT);
    console.log('Match:', (totalHTVA_TT + totalTVA_TT) === totalGeneralTT ? 'YES ✓' : 'NO ✗');
    console.log('=== End Verification ===');

    const handlePrintPreview = () => {
        setShowPdfPreview(true);
    };


   const annulerTransfert = async (values: {
    annee: string;
    dateDebut: Date;
    dateFin: Date;
}) => {
    setCancelLoading(true);
    try {
        const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
        const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');

        const response = await fetch(
            buildApiUrl(`/recetteCashs/annulerTransfert?annee=${values.annee}&dateDebut=${debut}&dateFin=${fin}`),
            { method: 'POST' }
        );

        if (!response.ok) throw new Error('Erreur lors de l\'annulation du transfert');

        showToast('success', 'Succès', 'Transfert annulé avec succès');
        await fetchData(); // Rafraîchir les données
    } catch (error) {
        console.error("Erreur:", error);
        showToast('error', 'Erreur', 'Échec de l\'annulation du transfert');
    } finally {
        setCancelLoading(false);
    }
};





    return (
        <>
            <Toast ref={toast} />

            {/* Display current exercice */}
            <div className="card mb-3" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #2196F3' }}>
                <div className="flex align-items-center justify-content-between p-3">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-calendar text-2xl text-primary"></i>
                        <div>
                            <div className="font-bold text-lg">
                                {currentExercice ? (
                                    <>
                                        Exercice en cours: <span className="text-primary">{currentExercice.codeExercice}</span>
                                    </>
                                ) : (
                                    <span className="text-orange-500">Aucun exercice sélectionné</span>
                                )}
                            </div>
                            {currentExercice && (
                                <div className="text-sm text-600">
                                    {currentExercice.description} - Du {formatDateExercice(currentExercice.dateDebut)} au {formatDateExercice(currentExercice.dateFin)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex align-items-center gap-2">
                        {!currentExercice && (
                            <div className="flex align-items-center gap-2 text-orange-500 mr-3">
                                <i className="pi pi-exclamation-triangle"></i>
                                <span className="text-sm">Veuillez sélectionner un exercice depuis le menu utilisateur</span>
                            </div>
                        )}
                        <Button
                            icon="pi pi-refresh"
                            label="Actualiser"
                            size="small"
                            outlined
                            onClick={() => {
                                const savedExercice = Cookies.get('currentExercice');
                                if (savedExercice) {
                                    try {
                                        const exercice = JSON.parse(savedExercice);
                                        setCurrentExercice(exercice);
                                        showToast('success', 'Succès', 'Exercice actualisé');
                                    } catch (e) {
                                        console.error('Error parsing currentExercice:', e);
                                        showToast('error', 'Erreur', 'Impossible de charger l\'exercice');
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

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
                        <RecetteCREDITPdf
                            data={recettes}
                            isGrouped={false}
                            dateDebut={searchParams?.dateDebut || new Date()}
                            dateFin={searchParams?.dateFin || new Date()}
                            totalTT={totalGeneralTT}
                            totalExo={totalGeneralExo}
                            totalHTVA_TT={totalHTVA_TT}
                            totalTVA_TT={totalTVA_TT}
                        />
                    </PDFViewer>
                </div>
            )}

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Génération">
                    <Card title="Génération des recettes CASH">
                        <RecetteCREDITForm
                            onSearch={genererRecettes}
                            onTransfer={transfererRecettes}
                            loading={loading}
                            transferLoading={transferLoading}
                            onCancelTransfer={annulerTransfert} // Nouvelle prop
                            cancelLoading={cancelLoading} // Nouvelle prop
                        />
                    </Card>
                </TabPanel>

                <TabPanel header="Liste des recettes">
                  
                    {searchParams && (
                        <div className="mb-3 p-3 surface-100 border-round">
                            <div className="font-bold text-lg">
                                Période: {formatDate(searchParams.dateDebut)} au {formatDate(searchParams.dateFin)}
                            </div>
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
                                disabled={loading || recettes.length === 0}
                                tooltip="Visualiser avant impression"
                                tooltipOptions={{ position: 'left' }}
                                className="mr-2"
                            />
                            <Button
                                icon="pi pi-refresh"
                                onClick={fetchData}
                                disabled={loading}
                                tooltip="Rafraîchir"
                                tooltipOptions={{ position: 'left' }}
                            />

                        </div>

                    </div>


                    <DataTable
                        value={recettes}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        emptyMessage="Aucune donnée trouvée"
                        footer={
                            <div className="flex justify-content-between font-bold">
                                <div>Total TVA:{formatCurrency(totalTVA_TT)}</div>
                                
                                   
                                    <div>HTVA: {formatCurrency( totalHTVA_TT)}</div>
                                    <div>TT: {formatCurrency(totalGeneralTT)}</div>
                                    <div>Exo: {formatCurrency(totalGeneralExo)}</div>
                                
                            </div>
                        }
                        

                    >
                        <Column field="numCompte" header="Num Compte" sortable />
                        <Column field="libelle" header="Libellé" sortable />
                        <Column field="montantTT" header="Montant TT" body={(row) => formatCurrency(row.montantTT)} sortable />
                        <Column field="montantExo" header="Montant Exo" body={(row) => formatCurrency(row.montantExo || 0)} sortable />
                    </DataTable>
                </TabPanel>

                <TabPanel header="Sommation TVA">

                    <DataTable
                        value={recettesTVA}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        emptyMessage="Aucune donnée trouvée"
                        
                    >
                        <Column
                            field="montantTT"
                            header="Montant TT"
                            body={(row) => formatCurrency(row.montantTT)}
                            footer={() => formatCurrency(totalTVA_TT)}
                            sortable
                        />
                        <Column
                            field="montantExo"
                            header="Montant Exo"
                            body={(row) => formatCurrency(row.montantExo || 0)}
                            footer={() => formatCurrency(totalTVA_Exo)}
                            sortable
                        />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog
                header="Résultat des recettes CREDIT"
                visible={visibleDialog}
                style={{ width: '80vw' }}
                onHide={() => setVisibleDialog(false)}
                maximizable
            >
                <div className="card">
                    {searchParams && (
                        <div className="mb-3 p-3 surface-100 border-round">
                            <div className="font-bold text-lg">
                                Période: {formatDate(searchParams.dateDebut)} au {formatDate(searchParams.dateFin)}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-content-between align-items-center mb-3">
                        <span className="p-input-icon-left" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par libellé..."
                                className="w-full"
                            />
                        </span>
                    </div>


                    <DataTable
                        value={recettes}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        emptyMessage="Aucune donnée trouvée"
                        footer={ // Ajout du footer avec les totaux
                            <div className="flex justify-content-between font-bold">
                                <div>Total Général:</div>
                                <div className="flex gap-4">
                                    <div>TT: {formatCurrency(totalGeneralTT)}</div>
                                    <div>Exo: {formatCurrency(totalGeneralExo)}</div>
                                </div>
                            </div>
                        }
                    >
                        <Column field="numCompte" header="Num Compte" sortable />
                        <Column field="libelle" header="Libellé" sortable />
                        <Column
                            field="montantTT"
                            header="Montant TT"
                            body={(row) => formatCurrency(row.montantTT)}
                            footer={() => formatCurrency(totalGeneralTT)}
                            sortable
                        />
                        <Column
                            field="montantExo"
                            header="Montant Exo"
                            body={(row) => formatCurrency(row.montantExo || 0)}
                            footer={() => formatCurrency(totalGeneralExo)}
                            sortable
                        />
                    </DataTable>

                    <div className="mt-3 font-bold">
                        <div>Total Général TT: {formatCurrency(totalGeneralTT)}</div>
                        <div>Total Général Exo: {formatCurrency(totalGeneralExo)}</div>
                        <div>Total HTVA: {formatCurrency(totalHTVA_TT)}</div>
                        <div>Total TVA: {formatCurrency(totalTVA_TT)}</div>
                    </div>
                </div>
            </Dialog>
        </>
    );
}