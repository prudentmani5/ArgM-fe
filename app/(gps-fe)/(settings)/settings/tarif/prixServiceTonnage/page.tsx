'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixServiceTonage } from './PrixServiceTonage';
import { FacService } from './FacService';
import PrixServiceTonageForm from './PrixServiceTonageForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { useMemo } from 'react';
import { buildApiUrl } from '../../../../../../utils/apiConfig';

function PrixServiceTonageComponent() {
    const baseUrl = buildApiUrl('');
    const [prixServiceTonage, setPrixServiceTonage] = useState<PrixServiceTonage>(new PrixServiceTonage());
    const [prixServiceTonageEdit, setPrixServiceTonageEdit] = useState<PrixServiceTonage>(new PrixServiceTonage());
    const [editPrixServiceTonageDialog, setEditPrixServiceTonageDialog] = useState(false);
    const [prixServiceTonages, setPrixServiceTonages] = useState<PrixServiceTonage[]>([]);
    const [services, setServices] = useState<FacService[]>([]);
    const [selectedService, setSelectedService] = useState<FacService | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: servicesData, fetchData: fetchServices } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);


    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };


    useEffect(() => {
        loadAllServices();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadPrixServiceTonages') {
                setPrixServiceTonages(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
        if (servicesData && callType === 'loadServices') {
            setServices(Array.isArray(servicesData) ? servicesData : [servicesData]);
        }
    }, [data, servicesData]);

    // Chargement initial
    useEffect(() => {
        const loadServices = async () => {
            try {
                const response = await fetch(baseUrl + '/facservices/findall');
                if (!response.ok) throw new Error('Erreur réseau');
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error("Erreur de chargement:", error);
                accept('error', 'Erreur', 'Impossible de charger les services');
            }
        };
        loadServices();
    }, []);

    // Gestion de la sélection
    const handleServiceSelect = (e: DropdownChangeEvent) => {
        const selectedId = e.value;
        const service = services.find(s => s.id === selectedId);
        setSelectedService(service || null);

        if (!editPrixServiceTonageDialog) {
            setPrixServiceTonage(prev => ({ ...prev, serviceId: selectedId }));
        } else {
            setPrixServiceTonageEdit(prev => ({ ...prev, serviceId: selectedId }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrixServiceTonage((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrixServiceTonageEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleValueChange = (e: InputNumberValueChangeEvent) => {
        setPrixServiceTonage((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleValueChangeEdit = (e: InputNumberValueChangeEvent) => {
        setPrixServiceTonageEdit((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleDropDownSelect = (e: DropdownChangeEvent) => {
        if (e.target.name === 'serviceId') {
            services.forEach((service: FacService) => {
                if (service.id === e.value) {
                    setSelectedService(service);
                    if (!editPrixServiceTonageDialog) {
                        setPrixServiceTonage(prev => ({ ...prev, serviceId: service.id }));
                    } else {
                        setPrixServiceTonageEdit(prev => ({ ...prev, serviceId: service.id }));
                    }
                    return;
                }
            });
        }
    };

    const handleSubmit = () => {
        if (prixServiceTonage.serviceId <= 0) {
            accept('error', 'Erreur', 'Veuillez sélectionner un service');
            return;
        }

        if (prixServiceTonage.poids1 <= 0 || prixServiceTonage.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }

        if (prixServiceTonage.poids1 >= prixServiceTonage.poids2) {
            accept('error', 'Erreur', 'Le poids max doit être supérieur au poids min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixServiceTonage, 'POST', baseUrl + '/prixservicetonages/new', 'createPrixServiceTonage');
    };

    const handleSubmitEdit = () => {
        if (prixServiceTonageEdit.serviceId <= 0) {
            accept('error', 'Erreur', 'Veuillez sélectionner un service');
            return;
        }

        if (prixServiceTonageEdit.poids1 <= 0 || prixServiceTonageEdit.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }

        if (prixServiceTonageEdit.poids1 >= prixServiceTonageEdit.poids2) {
            accept('error', 'Erreur', 'Le poids max doit être supérieur au poids min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixServiceTonageEdit, 'PUT', baseUrl + '/prixservicetonages/update/' + prixServiceTonageEdit.paramServiceId, 'updatePrixServiceTonage');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updatePrixServiceTonage') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des prix de service de tonage');
        }
        else if (data !== null && error === null) {
            if (callType === 'createPrixServiceTonage') {
                setPrixServiceTonage(new PrixServiceTonage());
                accept('success', 'Succès', 'Prix de service de tonage créé avec succès');
            } else if (callType === 'updatePrixServiceTonage') {
                accept('success', 'Succès', 'Prix de service de tonage modifié avec succès');
                setPrixServiceTonageEdit(new PrixServiceTonage());
                setEditPrixServiceTonageDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    // Et modifiez la partie serviceOptions
    const serviceOptions = useMemo(() => {
        return services.map(s => ({ label: s.libelleService, value: s.libelleService }));
    }, [services]);

    const customFilter = (items: PrixServiceTonage[]) => {
        if (!globalFilter) return items;

        return items.filter(item => {
            const serviceName = getServiceName(item.serviceId).toLowerCase();
            const poids1Str = item.poids1.toString();
            const poids2Str = item.poids2.toString();
            const montantStr = item.montantBarge.toString();

            return (
                serviceName.includes(globalFilter.toLowerCase()) ||
                poids1Str.includes(globalFilter) ||
                poids2Str.includes(globalFilter) ||
                montantStr.includes(globalFilter)
            );
        });
    };

    const loadPrixServiceTonageToEdit = (data: PrixServiceTonage) => {
        if (data) {
            setEditPrixServiceTonageDialog(true);
            setPrixServiceTonageEdit(data);
            services.forEach(service => {
                if (service.id === data.serviceId) {
                    setSelectedService(service);
                }
            });
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadPrixServiceTonageToEdit(data)}
                    rounded
                    severity='warning'
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', baseUrl + '/prixservicetonages/findall', 'loadPrixServiceTonages');
    };

    const loadAllServices = () => {
        fetchServices(null, 'GET', baseUrl + '/facservices/findall', 'loadServices');
    };

    useEffect(() => {
        if (servicesData && callType === 'loadServices') {
            console.log('Services chargés:', servicesData);
            setServices(Array.isArray(servicesData) ? servicesData : [servicesData]);
        }
        if (data && callType === 'loadPrixServiceTonages') {
            console.log('PrixServiceTonages chargés:', data);
            setPrixServiceTonages(Array.isArray(data) ? data : [data]);
        }
    }, [data, servicesData, callType]);

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const getServiceName = (serviceId: number): string => {
        if (!services || services.length === 0) return 'Chargement...';
        const service = services.find(s => s.id === serviceId);
        return service ? service.libelleService : 'Service inconnu';
    };
    const [globalFilter, setGlobalFilter] = useState<string>('');

    // Création d'une map pour les services (optimisation)
const servicesMap = useMemo(() => {
    const map = new Map<number, string>();
    services.forEach(service => map.set(service.id, service.libelleService));
    return map;
}, [services]);


const filteredData = prixServiceTonages.filter(item => {
    const service = services.find(s => s.id === item.serviceId);
    return JSON.stringify({
        service: service?.libelleService,
        poids1: item.poids1,
        poids2: item.poids2,
        montant: item.montantBarge
    }).toLowerCase().includes(globalFilter.toLowerCase());
});

    //const [serviceFilter, setServiceFilter] = useState<string>('');
     
     // Configuration améliorée de la recherche
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
                placeholder="Rechercher par service, poids ou montant..."
                className="w-full"
            />
        </span>
    </div>
);



    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Prix Service Tonage"
                visible={editPrixServiceTonageDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditPrixServiceTonageDialog(false)}
            >
                <PrixServiceTonageForm
                    prixServiceTonage={prixServiceTonageEdit}
                    services={services}
                    selectedService={selectedService as FacService}
                    handleChange={handleChangeEdit}
                    handleValueChange={handleValueChangeEdit}
                    handleDropDownSelect={handleDropDownSelect}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditPrixServiceTonageDialog(false)}
                        className="p-button-text"
                    />
                    <Button
                        label="Enregistrer"
                        icon="pi pi-check"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <PrixServiceTonageForm
                        prixServiceTonage={prixServiceTonage}
                        services={services}
                        selectedService={selectedService as FacService}
                        handleChange={handleChange}
                        handleValueChange={handleValueChange}
                        handleDropDownSelect={handleDropDownSelect}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={() => setPrixServiceTonage(new PrixServiceTonage())}
                            severity="secondary"
                        />
                        <Button
                            label="Enregistrer"
                            icon="pi pi-save"
                            loading={btnLoading}
                            onClick={handleSubmit}
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste">
                    <div className="card">
                        <DataTable
                            value={customFilter(prixServiceTonages)}
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun prix de service de tonage trouvé"
                            filters={{ global: { value: globalFilter, matchMode: 'contains' } }} // Configuration du filtre
                        >
                            <Column
                                field="service.libelleService"
                                header="Service" 
                                body={(rowData) => {
                                    const service = services.find(s => s.id === rowData.serviceId);
                                    return service?.libelleService || 'Inconnu';
                                }}
                                sortable
                                filter
                                filterField="service.libelleService"
                                filterPlaceholder="Rechercher service"
                                filterMatchMode="contains"
                                
                            />

                            <Column field="poids1" header="Poids Min (kg)" body={(rowData) => `${rowData.poids1} kg`} sortable />
                            <Column field="poids2" header="Poids Max (kg)" body={(rowData) => `${rowData.poids2} kg`} sortable />
                            <Column field="montantBarge" header="Montant Barge" body={(rowData) => formatCurrency(rowData.montantBarge)} sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default PrixServiceTonageComponent;