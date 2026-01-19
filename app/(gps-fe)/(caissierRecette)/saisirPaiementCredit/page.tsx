'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { EntryPayement, Bank, CompteBanque, ImportateurCredit } from './entryPayement';
import EntryPayementForm from './EntryPayementForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { DropdownChangeEvent } from 'primereact/dropdown';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { elementClosest } from '@fullcalendar/core/internal';
import { buildApiUrl } from '../../../../utils/apiConfig';

function EntryPayementComponent() {
    const [entryPayement, setEntryPayement] = useState<EntryPayement>(new EntryPayement());
    const [entryPayementEdit, setEntryPayementEdit] = useState<EntryPayement>(new EntryPayement());
    const [editEntryPayementDialog, setEditEntryPayementDialog] = useState(false);
    const [entryPayements, setEntryPayements] = useState<EntryPayement[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [bankAccounts, setBankAccounts] = useState<CompteBanque[]>([]);
    const [creditImporters, setCreditImporters] = useState<ImportateurCredit[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    //const [lazyParams, setLazyParams] = useState({
      //  first: 0,
        //rows: 10,
       // page: 0,
       // sortField: '',
       //// sortOrder: null as number | null,
        //filters: {
           //// factureId: { value: '', matchMode: 'contains' }
       // }
    //});

    // Create separate API instances for each data type
    const { data: banksData, loading: banksLoading, error: banksError, fetchData: fetchBanks } = useConsumApi('');
    const { data: accountsData, loading: accountsLoading, error: accountsError, fetchData: fetchAccounts } = useConsumApi('');
    const { data: importersData, loading: importersLoading, error: importersError, fetchData: fetchImporters } = useConsumApi('');
    const { data: entryPayementsData, loading: entryPayementsLoading, error: entryPayementsError, fetchData: fetchEntryPayements } = useConsumApi('');
    const { data: invoiceData, loading: invoiceLoading, error: invoiceError, fetchData: fetchInvoice } = useConsumApi('');
   // Ajoutez cet état en haut du composant
const [printEnabled, setPrintEnabled] = useState(false);
const [lastSavedEntry, setLastSavedEntry] = useState<EntryPayement | null>(null);
   

const BASE_URL = buildApiUrl('/entryPayements');
    const BANKS_URL = buildApiUrl('/banks/findall');
    const ACCOUNTS_URL = buildApiUrl('/compteBanques/findall');
    const IMPORTERS_URL = buildApiUrl('/importateurCredits/findall');

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };
    const defaultBank = banks.find(b => b.libelleBanque.includes("CREDIT")) || banks[11];
    const defaultBankAccount = bankAccounts.find(acc => acc.numeroCompte.includes("CREDIT")) || bankAccounts[11];
  
    useEffect(() => {
    if (!entryPayement.annee) {
        setEntryPayement(prev => ({
            ...prev,
            annee: new Date().getFullYear().toString(),
            credit: true ,// Ajoutez cette ligne pour cocher par défaut
            banqueId: defaultBank?.banqueId || 11, 
            compteBanqueId: defaultBankAccount?.compteBanqueId || 11,
            reference:'CREDIT',
            modePaiement:'CREDIT'
            }));
    }
}, []);


    useEffect(() => {
        // Load initial data
        setLoading(true);
        Promise.all([
            fetchBanks(null, 'GET', BANKS_URL),
            fetchAccounts(null, 'GET', ACCOUNTS_URL),
            fetchImporters(null, 'GET', IMPORTERS_URL)
        ]).finally(() => setLoading(false));
    }, []);

   useEffect(() => {
    if (banksData) {
        setBanks(banksData);
    }
    if (accountsData) {
        setBankAccounts(accountsData);
    }
    if (importersData) {
        setCreditImporters(importersData);
    }
    if (entryPayementsData) {
        setEntryPayements(entryPayementsData);
        setTotalRecords(entryPayementsData.length);
    }
    if (invoiceData && (invoiceData.noArrive || invoiceData.rsp || invoiceData.montantRedev)) {
        setEntryPayement(prev => ({
            ...prev,
            factureId: invoiceData.noArrive,
            rsp: invoiceData.lettreTransp,
            montantPaye: invoiceData.montantPaye,
            clientId: invoiceData.importateurId,
            clientNom: invoiceData.nom,
        }));
        accept('success', 'Succès', 'Données de la facture récupérées');
    }
}, [banksData, accountsData, importersData, entryPayementsData, invoiceData]);

   

    //const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       // setEntryPayement((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   // };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEntryPayement(prev => ({ ...prev, [name]: value }));
};

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntryPayementEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setEntryPayement((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setEntryPayementEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setEntryPayement((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setEntryPayementEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setEntryPayement((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setEntryPayementEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setEntryPayement((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setEntryPayementEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBankChange = (e: DropdownChangeEvent) => {
        setEntryPayement((prev) => ({
            ...prev,
            banqueId: e.target.value,
            compteBanqueId: 0
        }));
    };

    const handleBankChangeEdit = (e: DropdownChangeEvent) => {
        setEntryPayementEdit((prev) => ({
            ...prev,
            banqueId: e.target.value,
            compteBanqueId: 0
        }));
    };

  // 1. Créez un hook personnalisé pour gérer les valeurs par défaut
const useFormDefaults = () => {
    const [defaults] = useState(() => ({
        annee: new Date().getFullYear().toString(),
        credit: true,
        banqueId: defaultBank?.banqueId,
        //banqueId: defaultBank?.banqueId || 11, 
        compteBanqueId: defaultBankAccount?.compteBanqueId || 11,
        
    }));

    const resetToDefaults = () => {
        return { ...new EntryPayement(), ...defaults };
    };

    return { defaults, resetToDefaults };
};

// 2. Dans votre composant
const { resetToDefaults } = useFormDefaults();

//const handleSubmit = async () => {
  //  setBtnLoading(true);
    //try {
      //  await fetchEntryPayements(entryPayement, 'POST', `${BASE_URL}/new`);
        
      //  accept('success', 'Succès', 'Opération réussie!');
       // setEntryPayement(resetToDefaults());
       // setPrintEnabled(true);
         // Rechargement après 2 secondes
       // setTimeout(() => {
         //   window.location.reload();
       // }, 1000);
        // Recharge les données sans recharger la page
      //  await loadAllData();

   // } catch (error) {
     //   accept('error', 'Erreur','');
   // } finally {
      //  setBtnLoading(false);
   // }
//};



 const handleSubmit = async () => {
    setBtnLoading(true);
    try {
        await fetchEntryPayements(entryPayement, 'POST', `${BASE_URL}/new`);
        // Si vous ne pouvez pas obtenir la réponse, utilisez les données que vous avez déjà
        setLastSavedEntry({...entryPayement, datePaiement: entryPayement.datePaiement || new Date()});
        setEntryPayement(new EntryPayement());
        accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
         // Rechargement après 2 secondes
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        setPrintEnabled(true);
    } catch {
        accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
        setPrintEnabled(false);
    } finally {
        setBtnLoading(false);
    }
};



// Ajoutez cette fonction pour gérer l'impression
const handlePrint = () => {
    if (!lastSavedEntry) return;
    
    // Vous pouvez implémenter ici la logique d'impression
    // Par exemple, ouvrir une nouvelle fenêtre avec un reçu formaté
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Reçu de paiement</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; }
                        .receipt { border: 1px solid #ddd; padding: 20px; max-width: 500px; margin: 0 auto; }
                        .receipt-info { margin-bottom: 15px; }
                        .label { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <h1>Reçu de paiement</h1>
                        <div class="receipt-info">
                            <span class="label">Numéro Facture:</span> ${lastSavedEntry.factureId || 'N/A'}<br>
                            <span class="label">Client:</span> ${lastSavedEntry.nomClient|| 'N/A'}<br>
                            <span class="label">Montant:</span> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(lastSavedEntry.montantPaye || 0)}<br>
                            <span class="label">Mode de paiement:</span> ${lastSavedEntry.modePaiement || 'N/A'}<br>
                            <span class="label">Date:</span> ${new Date(lastSavedEntry.datePaiement || new Date()).toLocaleString()}<br>
                            <span class="label">Référence:</span> ${lastSavedEntry.reference || 'N/A'}<br>
                            <span class="label">Caissier:</span> ${fullName || 'N/A'}<br>
                        </div>
                        <p>Merci pour votre confiance!</p>
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 200);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
};

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchEntryPayements(entryPayementEdit, 'PUT', `${BASE_URL}/update/${entryPayementEdit.paiementId}`)
            .then(() => {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setEntryPayementEdit(new EntryPayement());
                setEditEntryPayementDialog(false);
                loadAllData();
            })
            .catch(() => {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            })
            .finally(() => setBtnLoading(false));
    };

    const clearFilterEntryPayement = () => {
        setEntryPayement(new EntryPayement());
         setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

   const loadEntryPayementToEdit = (data: EntryPayement) => {
    if (data) {
        // Assurez-vous que tous les champs nécessaires sont bien mappés
        const entryToEdit = {
            ...data,
            datePaiement: data.datePaiement ? new Date(data.datePaiement) : null,
            // Ajoutez d'autres conversions de type si nécessaire
        };
        setEntryPayementEdit(entryToEdit);
        setEditEntryPayementDialog(true);
    }
};

    const optionButtons = (data: any): React.ReactNode => {
    return (
        <div className='flex flex-wrap gap-2'>
            {/*<Button icon="pi pi-pencil" onClick={() => loadEntryPayementToEdit(data)} raised severity='warning' />*/}
            <Button 
                icon="pi pi-print" 
                onClick={() => {
                    setLastSavedEntry(data);
                    handlePrint();
                }} 
                raised 
                severity='info' 
                tooltip="Imprimer le reçu"
            />
        </div>
    );
};

    const loadAllData = () => {
        setLoading(true);
        fetchEntryPayements(null, 'GET', `${BASE_URL}/findallCredits`)
            .finally(() => setLoading(false));
    };

   /* const fetchInvoiceData = (factureId: string) => {
        const encodedFactureId = encodeURIComponent(factureId);
        fetchInvoice(null, 'GET', `${BASE_URL}/findbyid?numFacture=${encodedFactureId}`);
    };
   */

    const fetchInvoiceData = (factureId: string) => {
    if (!entryPayement.type) {
        accept('warn', 'Attention', 'Veuillez sélectionner un type avant de rechercher');
        return;
    }

    const encodedFactureId = encodeURIComponent(factureId);
    let apiUrl = '';
    switch(entryPayement.type) {
        case 'RSP':
            apiUrl = `${BASE_URL}/findbyRSP?numFacture=${encodedFactureId}`;
            break;
        case 'Service':
            apiUrl = `${BASE_URL}/findbyService?numFacture=${encodedFactureId}`;
            break;
        case 'Accostage':
            apiUrl = `${BASE_URL}/findbyid?numFacture=${encodedFactureId}`;
            break;
        case 'Romarquage':
            apiUrl = `${BASE_URL}/findbyRemorquage?numFacture=${encodedFactureId}`;
            break;
        case 'AutresBUCECO':
            apiUrl = `${BASE_URL}/findbyBUCECO?numFacture=${encodedFactureId}`;
            break;
        default:
            accept('warn', 'Attention', 'Type non pris en charge');
            return;
    }

    fetchInvoice(null, 'GET', apiUrl)
        .then(() => {
            // Vérifier si les données retournées sont vides ou incomplètes
            if (!invoiceData || (!invoiceData.noArrive && !invoiceData.rsp && !invoiceData.montantRedev)) {
                accept('error', 'Erreur', 'Aucune donnée trouvée pour cette recherche, veuillez');
                // Réinitialiser les champs si nécessaire
                setEntryPayement(prev => ({
                    ...prev,
                    factureId: '',
                    rsp: '',
                    montantPaye: 0,
                    clientId: 0,
                    clientNom: '',
                }));
            }
        })
        .catch(error => {
            accept('error', 'Erreur', 'Une erreur est survenue lors de la recherche');
            console.error('Error fetching invoice data:', error);
        });
};




    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

   // const onFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
       // const newParams = {
         //§§   ...lazyParams,
//filters: {
               // ...lazyParams.filters,
               // factureId: { value: e.target.value, matchMode: 'contains' }
            //}
       //// };
        //setLazyParams(newParams);
        //loadAllData();
   // };
 const [caissierId, setCaissierId] = useState<number | null>(null);
const [fullName, setFullName] = useState<string>('');

function getCookieValue(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

useEffect(() => {
    const getAppUserFromCookies = () => {
        try {
            const appUserStr = getCookieValue('AppUser'); // Utilisez votre fonction existante
            if (!appUserStr) {
                console.warn("Le cookie AppUser n'existe pas");
                return;
            }

            const appUser = JSON.parse(appUserStr);
            if (!appUser.id || !appUser.fullName) {
                console.error("Le cookie AppUser ne contient pas les champs requis");
                return;
            }

            setCaissierId(Number(appUser.id));
            setFullName(appUser.fullName);
            
            // Mettez aussi à jour entryPayement
            setEntryPayement(prev => ({
                ...prev,
                caissierId: Number(appUser.id),
                fullName: appUser.fullName
            }));
        } catch (err) {
            console.error("Erreur lors de la récupération des données utilisateur:", err);
        }
    };

    getAppUserFromCookies();
}, []);

    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={() => setGlobalFilter('')}
            />
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher par facture, rsp, borderaux ou type..."
                    className="w-full"
                />
            </span>
        </div>
    );
   const filteredData = Array.isArray(entryPayements) 
    ? entryPayements.filter(item => {
        if (!item) return false; // Filtre les éléments null/undefined
        
        return JSON.stringify({
            factureId: item.factureId || '',
            rsp: item.rsp || '',
            reference: item.reference || '',
            type: item.type || ''
        }).toLowerCase().includes(globalFilter.toLowerCase());
      })
    : [];
    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleString() : '';
    };

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

   
    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Paiement"
                visible={editEntryPayementDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditEntryPayementDialog(false)}
            >
                <EntryPayementForm
                    entryPayement={entryPayementEdit}
                    banks={banks}
                    bankAccounts={bankAccounts}
                    creditImporters={creditImporters}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleBankChange={handleBankChangeEdit}
                    fetchInvoiceData={fetchInvoiceData}
                    loading={loading}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditEntryPayementDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <EntryPayementForm
                        entryPayement={entryPayement}
                        banks={banks}
                        bankAccounts={bankAccounts}
                        creditImporters={creditImporters}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleDropdownChange={handleDropdownChange}
                        handleBankChange={handleBankChange}
                        fetchInvoiceData={fetchInvoiceData}
                        loading={loading}
                    />
                   <div className="card p-fluid">
    <div className="formgrid grid">
        <div className="md:col-offset-3 md:field md:col-3">
            <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterEntryPayement} />
        </div>
        <div className="md:field md:col-3">
            <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
        </div>
        <div className="md:field md:col-3">
           {/* <Button 
                icon="pi pi-print" 
                label="Imprimer" 
                disabled={!printEnabled} 
                onClick={handlePrint}
                severity="info"
            />
            */}
        </div>
    </div>
</div>
                </TabPanel>
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    //value={entryPayements}
                                    //header={renderSearch}
                                    //emptyMessage={"Pas de paiements à afficher"}
                                   // lazy
                                   // paginator
                                   // rows={lazyParams.rows}
                                    //totalRecords={totalRecords}
                                    //first={lazyParams.first}
                                    //onPage={(e) => {
                                      //</div>  const newParams = {
                                        //    ...lazyParams,
                                          //  first: e.first,
                                           // rows: e.rows,
                                           // page: e.page ?? 0,
                                       // };
                                       // setLazyParams(newParams);
                                       // loadAllData();
                                   // }}
                                    //rowsPerPageOptions={[5, 10, 25, 50]}
                                    loading={loading}

                            value={filteredData}
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucune autre facture trouvée"
                            filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                >
                                    <Column field="factureId" header="Numéro Facture" sortable />
                                    <Column field="type" header="Type" sortable />
                                     <Column field="nomClient" header="Client" sortable />         
                                    <Column field="modePaiement" header="Mode Paiement" sortable />
                                    <Column field="datePaiement" header="Date Paiement" body={(rowData) => formatDate(rowData.datePaiement)} sortable />
                                    <Column field="montantPaye" header="Montant Payé" body={(rowData) => formatCurrency(rowData.montantPaye)} sortable />
                                    <Column field="reference" header="Référence" sortable />
                                    <Column field="rsp" header="RSP" sortable />
                                    <Column field="credit" header="Crédit" body={(rowData) => rowData.credit ? 'Oui' : 'Non'} sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default EntryPayementComponent;