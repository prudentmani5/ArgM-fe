'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { ExitStock } from "./ExitStock";

interface ExitStockProps {
    exitStock: ExitStock;
    entrepots: any[];
    marchandises: any[];
    importateurs: any[];
    agencesDouane: any[];
    barges: any[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
}

const transportTypes = [
    { label: 'Camion', value: 'CAMION' },
    { label: 'Bateau', value: 'BATEAU' },
    { label: 'Train', value: 'TRAIN' },
    { label: 'Avion', value: 'AVION' }
];

const ExitStockForm: React.FC<ExitStockProps> = ({ 
    exitStock, 
    entrepots,
    marchandises,
    importateurs,
    agencesDouane,
    barges,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="lettreTransport">Lettre de Transport</label>
                    <InputText 
                        id="lettreTransport"
                        name="lettreTransport"
                        value={exitStock.lettreTransport}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="rsp">RSP</label>
                    <InputText 
                        id="rsp"
                        name="rsp"
                        value={exitStock.rsp}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="noEntree">Numéro Entrée</label>
                    <InputNumber 
                        id="noEntree"
                        name="noEntree"
                        value={exitStock.noEntree}
                        onValueChange={handleNumberChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dateEntree">Date Entrée</label>
                    <Calendar 
                        id="dateEntree"
                        name="dateEntree"
                        value={exitStock.dateEntree}
                        onChange={(e) => handleDateChange(e.value, "dateEntree")}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="entreposId">Entrepôt</label>
                    <Dropdown 
                        id="entreposId"
                        name="entreposId"
                        value={exitStock.entreposId}
                        options={entrepots}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un entrepôt"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="marchandiseId">Marchandise</label>
                    <Dropdown 
                        id="marchandiseId"
                        name="marchandiseId"
                        value={exitStock.marchandiseId}
                        options={marchandises}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une marchandise"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="importateurId">Importateur</label>
                    <Dropdown 
                        id="importateurId"
                        name="importateurId"
                        value={exitStock.importateurId}
                        options={importateurs}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un importateur"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="agenceDouaneId">Agence Douane</label>
                    <Dropdown 
                        id="agenceDouaneId"
                        name="agenceDouaneId"
                        value={exitStock.agenceDouaneId}
                        options={agencesDouane}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une agence"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="declarant">Déclarant</label>
                    <InputText 
                        id="declarant"
                        name="declarant"
                        value={exitStock.declarant}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dmc">DMC</label>
                    <InputText 
                        id="dmc"
                        name="dmc"
                        value={exitStock.dmc}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="noConteneur">Numéro Conteneur</label>
                    <InputText 
                        id="noConteneur"
                        name="noConteneur"
                        value={exitStock.noConteneur}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="nbreColis">Nombre Colis</label>
                    <InputNumber 
                        id="nbreColis"
                        name="nbreColis"
                        value={exitStock.nbreColis}
                        onValueChange={handleNumberChange}
                        min={0}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dateSortie">Date Sortie</label>
                    <Calendar 
                        id="dateSortie"
                        name="dateSortie"
                        value={exitStock.dateSortie}
                        onChange={(e) => handleDateChange(e.value, "dateSortie")}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="montant">Montant</label>
                    <InputNumber 
                        id="montant"
                        name="montant"
                        value={exitStock.montant}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="XOF"
                        locale="fr-FR"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="sortie">Sortie</label>
                    <Checkbox 
                        inputId="sortie"
                        name="sortie"
                        checked={exitStock.sortie}
                        onChange={handleCheckboxChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="bargeIdEntree">Barge Entrée</label>
                    <Dropdown 
                        id="bargeIdEntree"
                        name="bargeIdEntree"
                        value={exitStock.bargeIdEntree}
                        options={barges}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une barge"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="typeTransportEntre">Type Transport Entrée</label>
                    <Dropdown 
                        id="typeTransportEntre"
                        name="typeTransportEntre"
                        value={exitStock.typeTransportEntre}
                        options={transportTypes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="typeTransportSortie">Type Transport Sortie</label>
                    <Dropdown 
                        id="typeTransportSortie"
                        name="typeTransportSortie"
                        value={exitStock.typeTransportSortie}
                        options={transportTypes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="poidsSortie">Poids Sortie (kg)</label>
                    <InputNumber 
                        id="poidsSortie"
                        name="poidsSortie"
                        value={exitStock.poidsSortie}
                        onValueChange={handleNumberChange}
                        min={0}
                        suffix=" kg"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="poidsEntre">Poids Entrée (kg)</label>
                    <InputNumber 
                        id="poidsEntre"
                        name="poidsEntre"
                        value={exitStock.poidsEntre}
                        onValueChange={handleNumberChange}
                        min={0}
                        suffix=" kg"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="noFacture">Numéro Facture</label>
                    <InputText 
                        id="noFacture"
                        name="noFacture"
                        value={exitStock.noFacture}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="plaqueSortie">Plaque Sortie</label>
                    <InputText 
                        id="plaqueSortie"
                        name="plaqueSortie"
                        value={exitStock.plaqueSortie}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="plaqueEntree">Plaque Entrée</label>
                    <InputText 
                        id="plaqueEntree"
                        name="plaqueEntree"
                        value={exitStock.plaqueEntree}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="solde">Solde</label>
                    <InputNumber 
                        id="solde"
                        name="solde"
                        value={exitStock.solde}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="XOF"
                        locale="fr-FR"
                    />
                </div>
            </div>
        </div>
    );
};

export default ExitStockForm;