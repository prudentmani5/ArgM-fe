'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { Message } from 'primereact/message';
import { useReactToPrint } from 'react-to-print';
import { API_BASE_URL } from '@/utils/apiConfig';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { ListingInssTrimestrielResponseDto } from './ListingInssTrimestriel';
import PrintableListingInssTrimestriel from './PrintableListingInssTrimestriel';
import Cookies from 'js-cookie';

interface TrimestreOption {
    value: number;
    label: string;
}

const ListingInssTrimestrielComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);
    const printableRef = useRef<HTMLDivElement>(null);
    const [printDialogVisible, setPrintDialogVisible] = useState(false);

    // State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedTrimestre, setSelectedTrimestre] = useState<number | null>(null);
    const [listingData, setListingData] = useState<ListingInssTrimestrielResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [exporting, setExporting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // API hook for loading trimester data
    const { data: trimestreData, error: trimestreError, fetchData: fetchTrimestreData, callType } = useConsumApi('');

    const trimestreOptions: TrimestreOption[] = [
        { value: 1, label: '1er Trimestre (Janvier - Mars)' },
        { value: 2, label: '2eme Trimestre (Avril - Juin)' },
        { value: 3, label: '3eme Trimestre (Juillet - Septembre)' },
        { value: 4, label: '4eme Trimestre (Octobre - Decembre)' }
    ];

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    // Handle API response
    useEffect(() => {
        if (callType === 'loadTrimestreData' && trimestreData) {
            const response = trimestreData as ListingInssTrimestrielResponseDto;

            // Check if the response indicates an error
            if (!response.isComplete && response.errorMessage) {
                setErrorMessage(response.errorMessage);
                setListingData(null);
            } else {
                setListingData(response);
                setErrorMessage(null);
                showToast('success', 'Succes', 'Listing INSS Trimestriel charge avec succes.');
            }
            setLoading(false);
        }

        if (callType === 'loadTrimestreData' && trimestreError) {
            showToast('error', 'Erreur', 'Impossible de charger les donnees du trimestre.');
            setErrorMessage('Une erreur s\'est produite lors du chargement des donnees.');
            setLoading(false);
        }
    }, [trimestreData, trimestreError, callType]);

    const handleLoadListing = () => {
        if (!selectedTrimestre) {
            showToast('warn', 'Validation', 'Veuillez selectionner un trimestre.');
            return;
        }

        setLoading(true);
        setErrorMessage(null);
        setListingData(null);

        // Single API call to backend endpoint
        fetchTrimestreData(
            null,
            'Get',
            `${baseUrl}/api/grh/paie/listing-inss/trimestriel/${selectedYear}/${selectedTrimestre}`,
            'loadTrimestreData'
        );
    };

    const handlePrint = useReactToPrint({
        contentRef: printableRef,
        documentTitle: `Listing_INSS_Trimestriel_${selectedYear}_T${selectedTrimestre || ''}`,
        pageStyle: `
            @page {
                size: A4 landscape;
                margin: 10mm;
                @bottom-center {
                    content: "Page " counter(page) " de " counter(pages);
                    font-size: 10px;
                }
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        `,
        onAfterPrint: () => {
            showToast('success', 'Succes', 'Impression terminee.');
            setPrintDialogVisible(false);
        }
    });

    const openPrintDialog = () => {
        if (!listingData) {
            showToast('warn', 'Attention', 'Veuillez d\'abord charger les donnees.');
            return;
        }
        setPrintDialogVisible(true);
    };

    const handleExportExcel = async () => {
        if (!listingData || !selectedTrimestre) {
            showToast('warn', 'Attention', 'Veuillez d\'abord charger les donnees.');
            return;
        }

        setExporting(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(
                `${baseUrl}/api/grh/paie/listing-inss/trimestriel/${selectedYear}/${selectedTrimestre}/excel`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Listing_INSS_Trimestriel_${selectedYear}_T${selectedTrimestre}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast('success', 'Succes', 'Export Excel termine.');
        } catch (error) {
            console.error('Export error:', error);
            showToast('error', 'Erreur', 'Impossible d\'exporter le fichier Excel.');
        } finally {
            setExporting(false);
        }
    };

    const formatNumber = (value: number | undefined | null): string => {
        if (value === null || value === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDecimal = (value: number | undefined | null): string => {
        if (value === null || value === undefined) return '0';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    const renderReport = () => {
        if (!listingData) return null;

        return (
            <div className="p-4" style={{ backgroundColor: 'white' }}>
                {/* Header */}
                <div className="flex align-items-center mb-4">
                    <div style={{ flex: '0 0 80px' }}>
                        <span className="font-bold text-xl">G.P.S.B</span>
                    </div>
                    <div className="flex-1 text-center">
                        <h2 className="text-primary m-0" style={{ fontSize: '14px' }}>
                            RELEVE DES REMUNERATIONS ALLOUEES POUR LE {listingData.trimestreLibelle} {listingData.annee}
                        </h2>
                        <h4 className="m-0 mt-1" style={{ fontSize: '12px' }}>
                            AUX TRAVAILLEURS ASSUJETTIS AUX BRANCHES PENSION/INVALIDITE ET RISQUES PROFESSIONNELS
                        </h4>
                    </div>
                </div>

                {/* Report Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                            <tr className="bg-blue-100">
                                <th className="border-1 border-300 px-2 py-1 text-center" style={{ width: '120px' }}>Immatriculation</th>
                                <th className="border-1 border-300 px-2 py-1 text-center" style={{ width: '250px' }}>Nom et Prenom</th>
                                <th className="border-1 border-300 px-2 py-1 text-center" style={{ width: '80px' }}>Nbre jours</th>
                                <th className="border-1 border-300 px-2 py-1 text-center" style={{ width: '150px' }}>Remun Pension (Plafond 450.000/mois)</th>
                                <th className="border-1 border-300 px-2 py-1 text-center" style={{ width: '150px' }}>Remun Risque (Plafond 80.000/mois)</th>
                                <th className="border-1 border-300 px-2 py-1 text-center" style={{ width: '120px' }}>Observations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listingData.employees.map((emp, index) => (
                                <tr key={index}>
                                    <td className="border-1 border-300 px-2 py-1 text-left">{emp.matriculeInss || ''}</td>
                                    <td className="border-1 border-300 px-2 py-1 text-left text-red-700">
                                        {`${emp.nom || ''} ${emp.prenom || ''}`.trim()}
                                    </td>
                                    <td className="border-1 border-300 px-2 py-1 text-center">{formatDecimal(emp.nbreJours)}</td>
                                    <td className="border-1 border-300 px-2 py-1 text-right text-primary">{formatNumber(emp.remunPension)}</td>
                                    <td className="border-1 border-300 px-2 py-1 text-right text-primary">{formatNumber(emp.remunRisque)}</td>
                                    <td className="border-1 border-300 px-2 py-1 text-left">{emp.observations || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-green-100 font-bold">
                                <td className="border-1 border-300 px-2 py-1 text-center" colSpan={2}>
                                    TOTAL
                                </td>
                                <td className="border-1 border-300 px-2 py-1 text-center"></td>
                                <td className="border-1 border-300 px-2 py-1 text-right">{formatNumber(listingData.grandTotalRemunPension)}</td>
                                <td className="border-1 border-300 px-2 py-1 text-right">{formatNumber(listingData.grandTotalRemunRisque)}</td>
                                <td className="border-1 border-300 px-2 py-1"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h5>Listing INSS Trimestriel - Declaration des Cotisations INSS par Trimestre</h5>

                {/* Filter Section */}
                <div className="formgrid grid mb-4">
                    <div className="field col-12 md:col-2">
                        <label htmlFor="selectedYear">Annee</label>
                        <InputNumber
                            id="selectedYear"
                            value={selectedYear}
                            onValueChange={(e) => setSelectedYear(e.value || new Date().getFullYear())}
                            useGrouping={false}
                            min={2020}
                            max={2100}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="trimestre">Trimestre</label>
                        <Dropdown
                            id="trimestre"
                            value={selectedTrimestre}
                            options={trimestreOptions}
                            onChange={(e) => setSelectedTrimestre(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selectionner un trimestre"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-2 flex align-items-end">
                        <Button
                            icon="pi pi-search"
                            label="Charger"
                            onClick={handleLoadListing}
                            loading={loading}
                            className="w-full"
                        />
                    </div>
                    {listingData && (
                        <>
                            <div className="field col-12 md:col-2 flex align-items-end">
                                <Button
                                    icon="pi pi-print"
                                    label="Imprimer"
                                    onClick={openPrintDialog}
                                    severity="success"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-2 flex align-items-end">
                                <Button
                                    icon="pi pi-file-excel"
                                    label="Export Excel"
                                    onClick={handleExportExcel}
                                    loading={exporting}
                                    severity="info"
                                    className="w-full"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4">
                        <Message severity="warn" text={errorMessage} className="w-full" />
                    </div>
                )}

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-content-center align-items-center p-5">
                        <ProgressSpinner />
                    </div>
                )}

                {/* Report Display */}
                {!loading && listingData && renderReport()}

                {/* No Data Message */}
                {!loading && listingData && listingData.employees.length === 0 && (
                    <div className="text-center p-5 text-500">
                        <i className="pi pi-info-circle text-4xl mb-3"></i>
                        <p>Aucune donnee trouvee pour ce trimestre.</p>
                    </div>
                )}
            </div>

            {/* Print Dialog */}
            <Dialog
                header={`Apercu d'impression - Listing INSS Trimestriel ${selectedYear} T${selectedTrimestre || ''}`}
                visible={printDialogVisible}
                style={{ width: '95vw', maxWidth: '1400px' }}
                modal
                maximizable
                onHide={() => setPrintDialogVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            onClick={() => setPrintDialogVisible(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Imprimer"
                            icon="pi pi-print"
                            onClick={() => handlePrint()}
                        />
                    </div>
                }
            >
                <div style={{ overflowX: 'auto' }}>
                    {listingData && (
                        <PrintableListingInssTrimestriel
                            ref={printableRef}
                            listingData={listingData}
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default ListingInssTrimestrielComponent;
