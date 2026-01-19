// EntreeVehPortForm.tsx
'use client';

import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent, DropdownFilterEvent, DropdownPassThroughOptions } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { EntreeVehPort } from './EntreeVehPort';
import { Marchandise } from '../../../(settings)/settings/marchandise/Marchandise';
import { CategorieVehiculeEntrepot } from '../../../(settings)/settings/categorieVehicule/CategorieVehiculeEntrepot';
import { Importer } from '../../../(settings)/settings/importateur/Importer';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { LegacyRef, MutableRefObject, Ref } from 'react';
import React from 'react';
import { useCurrentUser } from '../../../../../hooks/fetchData/useCurrentUser';
import { hasAuthority } from '../../../usermanagement/types';
import { stringToDate } from '@/utils/dateUtils';

interface EntreeVehPortFormProps {
    entreeVehPort: EntreeVehPort;
    catVehicules: CategorieVehiculeEntrepot[];
    marchandises : Marchandise[];
    importateurs: Importer[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (value: number | null, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    filterValue?: string;
    onFilterChange?: (value: string) => void;
}

const CustomFilterInput = React.forwardRef<HTMLInputElement, {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }>(({ value, onChange }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        className="p-dropdown-filter p-inputtext p-component"
        placeholder="Rechercher..."
      />
    );
  });

const etatOptions = [
    { label: 'Bon', value: 'BON' },
    { label: 'Mauvais', value: 'MAUVAIS' },
    { label: 'En réparation', value: 'EN_REPARATION' }
];

const EntreeVehPortForm: React.FC<EntreeVehPortFormProps> = ({
    entreeVehPort,
    catVehicules,
    marchandises,
    importateurs,
    loadingStatus,
    filterValue,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleLazyLoading,
    onFilterChange
}) => {
    const { user: appUser } = useCurrentUser();
    const canChangeDateEntree = appUser ? hasAuthority(appUser, 'ENTREE_VEHICULE_CHANGE_DATE') : false;

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="categorieVeh">Catégorie véhicule</label>
                    <Dropdown
                        name="categorieVehId"
                        value={entreeVehPort.categorieVehId}
                        options={catVehicules}
                        optionLabel='libelle'
                        optionValue='id'
                        onChange={handleDropdownChange}
                        placeholder='Sélectionner la catégorie de véhicule'
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="dateEntree">Date d'entrée</label>
                    <Calendar
                        id="dateEntree"
                        name="dateEntree"
                        value={stringToDate(entreeVehPort.dateEntree)}
                        onChange={(e) => handleDateChange(e.value, "dateEntree")}
                        showIcon
                        dateFormat="dd/mm/yy"
                        disabled={!canChangeDateEntree}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="clientId">Client</label>
                    <Dropdown
                        name="clientId"
                        value={entreeVehPort.clientId}
                        onChange={handleDropdownChange}
                        options={importateurs}
                        placeholder='Sélectionner un client'
                        filterBy='nom'
                        filter
                        filtervalue={filterValue || ''}
                        onFilter={(e) => {
                            // Only update the filter value, don't trigger API call here
                            onFilterChange?.(e.filter);
                        }}
                        virtualScrollerOptions={{itemSize: 40, items: importateurs, lazy:true, loading: loadingStatus, onLazyLoad: handleLazyLoading, delay: 250}}
                        optionLabel='nom'
                        optionValue='importateurId'
                        pt={{
                            filterInput: {
                                root: { style: { display: 'contents' } }
                            },
                            filterContainer: {
                                className: 'p-dropdown-filter-container'
                            }
                        }}
                        filterTemplate={(options) => (
                            <CustomFilterInput
                                value={filterValue || ''}
                                onChange={(e) => onFilterChange?.(e.target.value)}
                                ref={options.filterInputRef}
                            />
                        )}
                        itemTemplate={(item) => (
                            <div className="flex align-items-center">
                              <i className="pi pi-user mr-2" />
                              <span>{item.nom} - {item.nif}</span>
                            </div>
                          )}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="plaque">Plaque</label>
                    <InputText
                        id="plaque"
                        name="plaque"
                        value={entreeVehPort.plaque}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-4">
                    <label htmlFor="marque">Marque</label>
                    <InputText
                        id="marque"
                        name="marque"
                        value={entreeVehPort.marque}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="lt">LT *</label>
                    <InputText
                        id="lt"
                        name="lt"
                        value={entreeVehPort.lt}
                        onChange={handleChange}
                        required
                        className={!entreeVehPort.lt || entreeVehPort.lt.trim() === '' ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="marchandiseId">Marchandise *</label>
                    <Dropdown
                        name="marchandiseId"
                        value={entreeVehPort.marchandiseId}
                        onChange={handleDropdownChange}
                        options={marchandises}
                        optionLabel="nom"
                        optionValue='marchandiseId'
                        placeholder='Sélectionner la marchandise'
                        filter
                        filterBy='nom'
                        filterPlaceholder="Rechercher..."
                        emptyFilterMessage="Aucune marchandise trouvée"
                        required
                        className={!entreeVehPort.marchandiseId ? 'p-invalid' : ''}
                        itemTemplate={(item) => (
                            <div className="flex align-items-center">
                                <i className="pi pi-box mr-2" />
                                <span>{item.nom}</span>
                            </div>
                        )}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="poids">Poids</label>
                    <InputNumber
                        id="poids"
                        name="poids"
                        value={entreeVehPort.poids}
                        onValueChange={(e) => handleNumberChange(e.value, "poids")}
                        locale='FR-fr'
                        mode="decimal"
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="etat">État</label>
                    <Dropdown
                        id="etat"
                        name="etat"
                        value={entreeVehPort.etat}
                        options={etatOptions}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionner un état"
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="couleur">Couleur</label>
                    <InputText
                        id="couleur"
                        name="couleur"
                        value={entreeVehPort.couleur}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="observation">Observation</label>
                    <InputText
                        id="observation"
                        name="observation"
                        value={entreeVehPort.observation}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default EntreeVehPortForm;