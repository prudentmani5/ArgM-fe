'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { EntryPayement } from './entryPayement';
import EntryPayementForm from './EntryPayementForm';
//import { EntryPayementForm } from './EntryPayementForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Bank } from './bank';
import { CompteBanque } from './compteBanque';
import { ImportateurCredit } from './importateurCredit';
import { Caissier } from './caissier';
import { Importer } from './importer';
import { buildApiUrl } from '../../../../utils/apiConfig';


export default function EntryPayementComponent() {
    const [entryPayement, setEntryPayement] = useState<EntryPayement>(new EntryPayement());
    const [entryPayementEdit, setEntryPayementEdit] = useState<EntryPayement>(new EntryPayement());
    const [editEntryPayementDialog, setEditEntryPayementDialog] = useState(false);
    const [entryPayements, setEntryPayements] = useState<EntryPayement[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [compteBanques, setCompteBanques] = useState<CompteBanque[]>([]);

    const [importateurCredits, setImportateurCredits] = useState<ImportateurCredit[]>([]);
    const [caissiers, setCaissiers] = useState<Caissier[]>([]);
    const [importers, setImporters] = useState<Importer[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadEntryPayements':
                    setEntryPayements(Array.isArray(data) ? data : [data]);
                    break;
                case 'loadBanks':
                    setBanks(Array.isArray(data) ? data : [data]);
                    break;
                case 'loadCompteBanques':
                    setCompteBanques(Array.isArray(data) ? data : [data]);
                    break;
                case 'loadImportateurCredits':
                    setImportateurCredits(Array.isArray(data) ? data : [data]);
                    break;
                case 'loadCaissiers':
                    setCaissiers(Array.isArray(data) ? data : [data]);
                    break;
                default:
                    break;
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const paymentModes = [
        { label: 'Espèces', value: 'CASH' },
        { label: 'Chèque', value: 'CHEQUE' },

    ];

    const loadAllData = () => {
        fetchData(null, 'GET', buildApiUrl('/entryPayements/findall'), 'loadEntryPayements');
        fetchData(null, 'GET', buildApiUrl('/banks/findall'), 'loadBanks');
        fetchData(null, 'GET', buildApiUrl('/compteBanques/findall'), 'loadCompteBanques');
        fetchData(null, 'GET', buildApiUrl('/importateurCredits/findall'), 'loadImportateurCredits');
        fetchData(null, 'GET', buildApiUrl('/caissiers/findall'), 'loadCaissiers');
        fetchData(null, 'Get', buildApiUrl('/exportaters/findall'), 'loadExporters');
        fetchData(null, 'GET', buildApiUrl('/importers/findall'), 'loadImporters');

    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntryPayement(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntryPayementEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setEntryPayement(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChangeEdit = (name: string, value: Date | null) => {
        setEntryPayementEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setEntryPayement(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setEntryPayementEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setEntryPayement(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChangeEdit = (name: string, value: any) => {
        setEntryPayementEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: any) => {
        setEntryPayement(prev => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: any) => {
        setEntryPayementEdit(prev => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleSubmit = () => {
        if (!entryPayement.paiementId) {
            accept('error', 'Erreur', 'L\'ID de paiement est obligatoire');
            return;
        }

        setBtnLoading(true);
        try {
            fetchData(entryPayement, 'POST', buildApiUrl('/entryPayements/new'), 'createEntryPayement');
            if (error) {
                //throw new Error(error);
            }
            setEntryPayement(new EntryPayement());
            accept('success', 'Succès', 'Paiement créé avec succès');
        } catch (err) {
            accept('error', 'Erreur', 'Échec de la création');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = () => {
        if (!entryPayementEdit.paiementId) {
            accept('error', 'Erreur', 'L\'ID de paiement est obligatoire');
            return;
        }

        setBtnLoading(true);
        fetchData(entryPayementEdit, 'PUT', buildApiUrl(`/entryPayements/update/${entryPayementEdit.paiementId}`), 'updateEntryPayement');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateEntryPayement') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des paiements');
        }
        else if (data !== null && error === null) {
            if (callType === 'createEntryPayement') {
                setEntryPayement(new EntryPayement());
                accept('success', 'Succès', 'Paiement créé avec succès');
            } else if (callType === 'updateEntryPayement') {
                accept('success', 'Succès', 'Paiement modifié avec succès');
                setEntryPayementEdit(new EntryPayement());
                setEditEntryPayementDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadEntryPayementToEdit = (data: EntryPayement) => {
        if (data) {
            setEditEntryPayementDialog(true);
            setEntryPayementEdit(data);
        }
    };

    const handleSearchInvoice = async (rsp: string, sortieId: string) => {
        if (!sortieId || !rsp) {
            accept('error', 'Erreur', 'Veuillez entrer un numéro de facture ou un RSP');
            return;
        }

        sortieId = encodeURIComponent(sortieId);
        rsp = encodeURIComponent(rsp);
        setBtnLoading(true);
        try {
            let url = buildApiUrl(`/invoices/findBySortieIdAndRsp?sortieId=${sortieId}&rsp=${rsp}`);

            await fetchData(
                null,
                'GET',
                url,
                'loadInvoiceData'
            );

            //let url1 = `${baseUrl}/invoices/findBySortieIdAndRsp?sortieId=${sortieId}&rsp=${rsp}`;

           // await fetchData(
                //null,
                //'GET',
              //  url1,
             //   'loadInvoiceData'
           // );

            if (data) {
                const invoice = data;
                setEntryPayement(prev => ({
                    ...prev,
                    rsp: invoice.rsp || '',
                    factureId: invoice.sortieId || '',
                    montantPaye: invoice.montantPaye || null,
                    // Ajoutez d'autres champs si nécessaire
                }));
                accept('success', 'Succès', 'Facture trouvée');
            }
            else {
                accept('error', 'Erreur', 'Facture non trouvée')
            }
        } catch {
            accept('error', 'Erreur', 'Facture non trouvée');
        } finally {
            setBtnLoading(false);
        }
    };
    const optionButtons = (data: EntryPayement): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadEntryPayementToEdit(data)}
                    rounded
                    severity='warning'
                />
            </div>
        );
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const formatCurrency = (value: number) => {
        return value?.toLocaleString('fr-MG', {
            style: 'currency',
            currency: 'BIF'
        });
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
                    compteBanques={compteBanques}
                    importateurCredits={importateurCredits}
                    caissiers={caissiers}
                    importers={importers}
                    handleChange={handleChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleSearchInvoice={handleSearchInvoice}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditEntryPayementDialog(false)}
                        className="p-button-text"
                    />
                    <Button
                        label="Enregistrer"
                        icon="pi pi-save"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau des paiements credits">

                    <EntryPayementForm
                        entryPayement={entryPayement}
                        banks={banks}
                        compteBanques={compteBanques}
                        importateurCredits={importateurCredits}
                        caissiers={caissiers}
                        importers={importers}
                        handleChange={handleChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        handleDropdownChange={handleDropdownChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleSearchInvoice={handleSearchInvoice}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Enregistrer"
                            icon="pi pi-save"
                            loading={btnLoading}
                            onClick={handleSubmit}
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des paiements credits">
                    <div className="card">
                        <DataTable
                            value={entryPayements}
                            paginator
                            rows={10}
                            emptyMessage="Aucun paiement trouvé"
                        >
                            <Column field="paiementId" header="ID Paiement"
                                sortable />
                            <Column field="factureId" header="Facture ID" sortable />
                            <Column field="type" header="Type" sortable />
                            <Column field="modePaiement" header="Mode Paiement"
                                sortable


                            />
                            <Column
                                field="montantPaye"
                                header="Montant Payé"
                                body={(rowData) => formatCurrency(rowData.montantPaye?.valueOf() || 0)}
                                sortable
                            />
                            <Column
                                field="datePaiement"
                                header="Date Paiement"
                                body={(rowData) =>
                                    rowData.datePaiement ? new Date(rowData.datePaiement).toLocaleDateString('fr-FR') : ''
                                } sortable
                            />
                            <Column field="reference" header="Référence" sortable />
                            <Column field="rsp" header="RSP" sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}
