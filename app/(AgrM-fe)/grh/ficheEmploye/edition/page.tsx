'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useReactToPrint } from 'react-to-print';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { InspectionTravailEmployee } from './InspectionTravailReport';
import PrintableInspectionTravail from './PrintableInspectionTravail';
import { ServiceGroup, EmployeParService } from './EmployeParServiceReport';
import PrintableEmployeParService from './PrintableEmployeParService';

function EditionComponent() {
    const [activeIndex, setActiveIndex] = useState(0);
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);
    const componentRef = useRef<HTMLDivElement>(null);
    const serviceComponentRef = useRef<HTMLDivElement>(null);

    // State for inspection report
    const [inspectionEmployees, setInspectionEmployees] = useState<InspectionTravailEmployee[]>([]);
    const [fonctions, setFonctions] = useState<any[]>([]);
    const [carrieres, setCarrieres] = useState<any[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [printDialogVisible, setPrintDialogVisible] = useState(false);

    // Refs to prevent duplicate processing
    const inspectionProcessingRef = useRef(false);
    const inspectionEmployeesRef = useRef<any[]>([]);

    // State for employee par service report
    const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [serviceDataLoaded, setServiceDataLoaded] = useState(false);
    const [servicePrintDialogVisible, setServicePrintDialogVisible] = useState(false);

    // API hooks for inspection report
    const { data: employeeData, loading: employeeLoading, error: employeeError, fetchData: fetchEmployees, callType: employeeCallType } = useConsumApi('');
    const { data: carriereData, loading: carriereLoading, error: carriereError, fetchData: fetchCarrieres, callType: carriereCallType } = useConsumApi('');
    const { data: fonctionData, loading: fonctionLoading, error: fonctionError, fetchData: fetchFonctions, callType: fonctionCallType } = useConsumApi('');

    // API hooks for employee par service report
    const { data: serviceEmployeeData, loading: serviceEmployeeLoading, error: serviceEmployeeError, fetchData: fetchServiceEmployees, callType: serviceEmployeeCallType } = useConsumApi('');
    const { data: serviceCarriereData, loading: serviceCarriereLoading, error: serviceCarriereError, fetchData: fetchServiceCarrieres, callType: serviceCarriereCallType } = useConsumApi('');
    const { data: serviceData, loading: serviceLoading, error: serviceError, fetchData: fetchServices, callType: serviceCallType } = useConsumApi('');

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    // Load fonctions and services on mount
    useEffect(() => {
        fetchFonctions(null, 'Get', baseUrl + '/rhfonctions/findall', 'loadFonctions');
        fetchServices(null, 'Get', baseUrl + '/rhservices/findall', 'loadServices');
    }, []);

    // Handle fonctions data
    useEffect(() => {
        if (fonctionData && fonctionCallType === 'loadFonctions') {
            setFonctions(Array.isArray(fonctionData) ? fonctionData : [fonctionData]);
        }
    }, [fonctionData, fonctionCallType]);

    // Handle services data
    useEffect(() => {
        if (serviceData && serviceCallType === 'loadServices') {
            setServices(Array.isArray(serviceData) ? serviceData : [serviceData]);
        }
    }, [serviceData, serviceCallType]);

    // Handle employees data for inspection report
    useEffect(() => {
        if (employeeData && employeeCallType === 'loadActiveEmployees' && inspectionProcessingRef.current) {
            const employees = Array.isArray(employeeData) ? employeeData : [employeeData];
            // Store employees in ref for later use
            inspectionEmployeesRef.current = employees;
            // After employees are loaded, fetch carrieres
            fetchCarrieres(null, 'Get', baseUrl + '/api/grh/carriere/findall', 'loadCarrieres');
        }
    }, [employeeData, employeeCallType]);

    // Handle carrieres data and merge with employees for inspection report
    useEffect(() => {
        if (carriereData && carriereCallType === 'loadCarrieres' && inspectionProcessingRef.current) {
            const carrieresArray = Array.isArray(carriereData) ? carriereData : [carriereData];
            setCarrieres(carrieresArray);

            // Get employees from ref
            const employees = inspectionEmployeesRef.current;
            if (employees.length > 0) {
                mergeEmployeesWithCarrieres(employees, carrieresArray);
                // Clear ref after processing
                inspectionEmployeesRef.current = [];
                inspectionProcessingRef.current = false;
            }
        }
    }, [carriereData, carriereCallType]);

    // Handle employees data for service report (active only)
    useEffect(() => {
        if (serviceEmployeeData && serviceEmployeeCallType === 'loadActiveEmployeesForService') {
            const employees = Array.isArray(serviceEmployeeData) ? serviceEmployeeData : [serviceEmployeeData];
            // After employees are loaded, fetch carrieres
            fetchServiceCarrieres(null, 'Get', baseUrl + '/api/grh/carriere/findall', 'loadCarrieresForService');
            // Store employees temporarily
            sessionStorage.setItem('tempServiceEmployees', JSON.stringify(employees));
        }
    }, [serviceEmployeeData, serviceEmployeeCallType]);

    // Handle carrieres data and merge with employees for service report
    useEffect(() => {
        if (serviceCarriereData && serviceCarriereCallType === 'loadCarrieresForService') {
            const carrieresArray = Array.isArray(serviceCarriereData) ? serviceCarriereData : [serviceCarriereData];

            // Get employees from session storage
            const storedEmployees = sessionStorage.getItem('tempServiceEmployees');
            if (storedEmployees) {
                const employees = JSON.parse(storedEmployees);
                groupEmployeesByService(employees, carrieresArray);
                sessionStorage.removeItem('tempServiceEmployees');
            }
        }
    }, [serviceCarriereData, serviceCarriereCallType]);

    // Handle errors
    useEffect(() => {
        if (employeeError) {
            accept('error', 'Erreur', 'Impossible de charger les employes.');
            inspectionProcessingRef.current = false;
        }
        if (carriereError) {
            accept('error', 'Erreur', 'Impossible de charger les carrieres.');
            inspectionProcessingRef.current = false;
        }
        if (serviceEmployeeError) {
            accept('error', 'Erreur', 'Impossible de charger les employes.');
        }
        if (serviceCarriereError) {
            accept('error', 'Erreur', 'Impossible de charger les carrieres.');
        }
    }, [employeeError, carriereError, serviceEmployeeError, serviceCarriereError]);

    const mergeEmployeesWithCarrieres = (employees: any[], carrieresData: any[]) => {
        const mergedData: InspectionTravailEmployee[] = employees.map(emp => {
            // Find carriere for this employee
            const carriere = carrieresData.find(c => c.matriculeId === emp.matriculeId);

            // Find fonction label
            let fonctionLibelle = '';
            if (carriere?.fonctionId && fonctions.length > 0) {
                const fonction = fonctions.find(f => f.fonctionid === carriere.fonctionId);
                fonctionLibelle = fonction?.libelle || carriere.fonctionId;
            }

            // Only show cessation info for non-active employees (situationId !== '01')
            const isActive = emp.situationId === '01';

            return {
                matriculeId: emp.matriculeId,
                nom: emp.nom || '',
                prenom: emp.prenom || '',
                dateEngagement: carriere?.anneeEmbauche || null,
                natureTravail: carriere?.fonctionId || '',
                natureTravailLibelle: fonctionLibelle,
                dateCessation: !isActive && emp.dateSituation ? new Date(emp.dateSituation) : null,
                causeCessation: !isActive ? (emp.causeSituation || '') : ''
            };
        });

        // Sort by matricule (numeric comparison for proper ordering)
        mergedData.sort((a, b) => {
            const numA = parseInt(a.matriculeId, 10);
            const numB = parseInt(b.matriculeId, 10);
            // If both are valid numbers, compare numerically
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            // Otherwise fall back to string comparison
            return a.matriculeId.localeCompare(b.matriculeId);
        });

        setInspectionEmployees(mergedData);
        setDataLoaded(true);
        accept('success', 'Succes', `${mergedData.length} employe(s) actif(s) charge(s).`);
    };

    const groupEmployeesByService = (employees: any[], carrieresData: any[]) => {
        // Create a map to group employees by service
        const serviceMap = new Map<string, EmployeParService[]>();

        employees.forEach(emp => {
            // Find carriere for this employee
            const carriere = carrieresData.find(c => c.matriculeId === emp.matriculeId);
            const serviceId = carriere?.serviceId || 'NO_SERVICE';

            // Get service label
            let serviceLibelle = 'Service non defini';
            if (serviceId !== 'NO_SERVICE' && services.length > 0) {
                const service = services.find(s => s.serviceId === serviceId);
                serviceLibelle = service?.libelle || serviceId;
            }

            const employeeData: EmployeParService = {
                matriculeId: emp.matriculeId,
                nom: emp.nom || '',
                prenom: emp.prenom || '',
                serviceId: serviceId,
                serviceLibelle: serviceLibelle
            };

            if (!serviceMap.has(serviceId)) {
                serviceMap.set(serviceId, []);
            }
            serviceMap.get(serviceId)!.push(employeeData);
        });

        // Convert map to array of ServiceGroups
        const groups: ServiceGroup[] = [];
        serviceMap.forEach((employees, serviceId) => {
            // Sort employees within each service by matricule
            employees.sort((a, b) => {
                const numA = parseInt(a.matriculeId, 10);
                const numB = parseInt(b.matriculeId, 10);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }
                return a.matriculeId.localeCompare(b.matriculeId);
            });

            groups.push({
                serviceId: serviceId,
                serviceLibelle: employees[0]?.serviceLibelle || 'Service non defini',
                employees: employees
            });
        });

        // Sort groups by service label alphabetically
        groups.sort((a, b) => a.serviceLibelle.localeCompare(b.serviceLibelle));

        setServiceGroups(groups);
        setServiceDataLoaded(true);

        const totalEmployees = groups.reduce((sum, group) => sum + group.employees.length, 0);
        accept('success', 'Succes', `${totalEmployees} employe(s) actif(s) dans ${groups.length} service(s).`);
    };

    const loadInspectionData = () => {
        // Prevent multiple clicks while processing
        if (inspectionProcessingRef.current || isLoading) return;

        inspectionProcessingRef.current = true;
        inspectionEmployeesRef.current = [];
        setDataLoaded(false);
        setInspectionEmployees([]);
        // Load only active employees (situationId = '01')
        fetchEmployees(null, 'Get', baseUrl + '/api/grh/employees/findall/active', 'loadActiveEmployees');
    };

    const loadServiceData = () => {
        setServiceDataLoaded(false);
        setServiceGroups([]);
        // Load only active employees (situationId = '01')
        fetchServiceEmployees(null, 'Get', baseUrl + '/api/grh/employees/findall/active', 'loadActiveEmployeesForService');
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        onBeforePrint: () => {
            if (!componentRef.current) {
                accept('error', 'Erreur', 'Le contenu a imprimer est indisponible');
                return Promise.reject('No content to print');
            }
            return Promise.resolve();
        },
        pageStyle: `
            @page {
                size: A4 landscape;
                margin: 10mm;
            }
            @media print {
                body {
                    padding: 5mm;
                }
                table {
                    page-break-inside: auto;
                }
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
            }
        `,
        onAfterPrint: () => {
            accept('info', 'Succes', 'Impression effectuee avec succes');
            setPrintDialogVisible(false);
        },
        onPrintError: (error) => {
            accept('error', 'Erreur', `Echec de l'impression: ${error}`);
        }
    });

    const handleServicePrint = useReactToPrint({
        contentRef: serviceComponentRef,
        onBeforePrint: () => {
            if (!serviceComponentRef.current) {
                accept('error', 'Erreur', 'Le contenu a imprimer est indisponible');
                return Promise.reject('No content to print');
            }
            return Promise.resolve();
        },
        pageStyle: `
            @page {
                size: A4 portrait;
                margin: 10mm;
            }
            @media print {
                body {
                    padding: 5mm;
                }
                table {
                    page-break-inside: auto;
                }
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
            }
        `,
        onAfterPrint: () => {
            accept('info', 'Succes', 'Impression effectuee avec succes');
            setServicePrintDialogVisible(false);
        },
        onPrintError: (error) => {
            accept('error', 'Erreur', `Echec de l'impression: ${error}`);
        }
    });

    const openPrintDialog = () => {
        if (inspectionEmployees.length === 0) {
            accept('warn', 'Attention', 'Veuillez d\'abord charger les donnees.');
            return;
        }
        setPrintDialogVisible(true);
    };

    const openServicePrintDialog = () => {
        if (serviceGroups.length === 0) {
            accept('warn', 'Attention', 'Veuillez d\'abord charger les donnees.');
            return;
        }
        setServicePrintDialogVisible(true);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index);
    };

    // Get fonction label for display
    const getFonctionLabel = (fonctionId: string) => {
        if (!fonctionId) return '';
        const fonction = fonctions.find(f => f.fonctionid === fonctionId);
        return fonction ? fonction.libelle : fonctionId;
    };

    const isLoading = employeeLoading || carriereLoading || fonctionLoading;
    const isServiceLoading = serviceEmployeeLoading || serviceCarriereLoading || serviceLoading;

    // Flatten service groups for DataTable display
    const flattenedServiceEmployees = serviceGroups.flatMap(group =>
        group.employees.map(emp => ({
            ...emp,
            serviceLibelle: group.serviceLibelle
        }))
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Print Dialog for Inspection Report */}
            <Dialog
                header="Apercu d'impression - Rapport Inspection du Travail"
                visible={printDialogVisible}
                style={{ width: '90vw', maxHeight: '90vh' }}
                modal
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
                            onClick={handlePrint}
                        />
                    </div>
                }
            >
                <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
                    <div ref={componentRef}>
                        <PrintableInspectionTravail employees={inspectionEmployees} />
                    </div>
                </div>
            </Dialog>

            {/* Print Dialog for Employee par Service Report */}
            <Dialog
                header="Apercu d'impression - Listing des Employes par Service"
                visible={servicePrintDialogVisible}
                style={{ width: '90vw', maxHeight: '90vh' }}
                modal
                onHide={() => setServicePrintDialogVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            onClick={() => setServicePrintDialogVisible(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Imprimer"
                            icon="pi pi-print"
                            onClick={handleServicePrint}
                        />
                    </div>
                }
            >
                <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
                    <div ref={serviceComponentRef}>
                        <PrintableEmployeParService serviceGroups={serviceGroups} />
                    </div>
                </div>
            </Dialog>

            <h5>Edition</h5>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Rapport Insp. Trav.">
                    <div className="grid">
                        <div className="col-12">
                            <div className="card">
                                {/* Action buttons */}
                                <div className="flex justify-content-between align-items-center mb-3">
                                    <div className="flex gap-2">
                                        <Button
                                            label="Charger les donnees"
                                            icon="pi pi-download"
                                            onClick={loadInspectionData}
                                            loading={isLoading}
                                        />
                                        <Button
                                            label="Imprimer"
                                            icon="pi pi-print"
                                            onClick={openPrintDialog}
                                            severity="secondary"
                                            disabled={!dataLoaded || inspectionEmployees.length === 0}
                                        />
                                    </div>
                                    {dataLoaded && (
                                        <span className="text-secondary">
                                            {inspectionEmployees.length} employe(s) actif(s)
                                        </span>
                                    )}
                                </div>

                                {/* DataTable */}
                                <DataTable
                                    value={inspectionEmployees}
                                    paginator
                                    rows={20}
                                    rowsPerPageOptions={[10, 20, 50, 100]}
                                    loading={isLoading}
                                    emptyMessage="Cliquez sur 'Charger les donnees' pour afficher la liste des employes"
                                    scrollable
                                    scrollHeight="500px"
                                    sortField="matriculeId"
                                    sortOrder={1}
                                >
                                    <Column
                                        field="matriculeId"
                                        header="Matricule"
                                        sortable
                                        style={{ minWidth: '100px' }}
                                    />
                                    <Column
                                        header="Nom et Prenom"
                                        body={(rowData) => `${rowData.nom || ''} ${rowData.prenom || ''}`.trim().toUpperCase()}
                                        sortable
                                        sortField="nom"
                                        style={{ minWidth: '200px' }}
                                    />
                                    <Column
                                        field="dateEngagement"
                                        header="Date d'engagement"
                                        sortable
                                        style={{ minWidth: '120px' }}
                                    />
                                    <Column
                                        field="natureTravailLibelle"
                                        header="Nature du Travail"
                                        sortable
                                        style={{ minWidth: '200px' }}
                                    />
                                    <Column
                                        field="dateCessation"
                                        header="Date de cessation"
                                        body={(rowData) =>
                                            rowData.dateCessation
                                                ? new Date(rowData.dateCessation).toLocaleDateString('fr-FR')
                                                : ''
                                        }
                                        style={{ minWidth: '120px' }}
                                    />
                                    <Column
                                        field="causeCessation"
                                        header="Cause de cessation"
                                        style={{ minWidth: '150px' }}
                                    />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Employe par service">
                    <div className="grid">
                        <div className="col-12">
                            <div className="card">
                                {/* Action buttons */}
                                <div className="flex justify-content-between align-items-center mb-3">
                                    <div className="flex gap-2">
                                        <Button
                                            label="Charger les donnees"
                                            icon="pi pi-download"
                                            onClick={loadServiceData}
                                            loading={isServiceLoading}
                                        />
                                        <Button
                                            label="Imprimer"
                                            icon="pi pi-print"
                                            onClick={openServicePrintDialog}
                                            severity="secondary"
                                            disabled={!serviceDataLoaded || serviceGroups.length === 0}
                                        />
                                    </div>
                                    {serviceDataLoaded && (
                                        <span className="text-secondary">
                                            {flattenedServiceEmployees.length} employe(s) actif(s) dans {serviceGroups.length} service(s)
                                        </span>
                                    )}
                                </div>

                                {/* DataTable */}
                                <DataTable
                                    value={flattenedServiceEmployees}
                                    paginator
                                    rows={20}
                                    rowsPerPageOptions={[10, 20, 50, 100]}
                                    loading={isServiceLoading}
                                    emptyMessage="Cliquez sur 'Charger les donnees' pour afficher la liste des employes actifs par service"
                                    scrollable
                                    scrollHeight="500px"
                                    rowGroupMode="subheader"
                                    groupRowsBy="serviceLibelle"
                                    sortMode="single"
                                    sortField="serviceLibelle"
                                    sortOrder={1}
                                    rowGroupHeaderTemplate={(data) => (
                                        <span className="font-bold">{data.serviceLibelle}</span>
                                    )}
                                >
                                    <Column
                                        field="serviceLibelle"
                                        header="Service"
                                        style={{ display: 'none' }}
                                    />
                                    <Column
                                        field="matriculeId"
                                        header="Matricule"
                                        style={{ minWidth: '100px' }}
                                    />
                                    <Column
                                        header="Nom et prenom"
                                        body={(rowData) => `${(rowData.nom || '').toUpperCase()} ${rowData.prenom || ''}`.trim()}
                                        style={{ minWidth: '300px' }}
                                    />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </div>
    );
}

export default EditionComponent;
