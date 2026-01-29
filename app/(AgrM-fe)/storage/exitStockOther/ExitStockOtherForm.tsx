'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { ExitStockOther } from "./ExitStockOther";

interface ExitStockOtherProps {
    exitStockOther: ExitStockOther;
    entrepots: any[];
    marchandises: any[];
    importateurs: any[];
    agencesDouane: any[];
    banques: any[];
    categoriesVehicule: any[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
}

const ExitStockOtherForm: React.FC<ExitStockOtherProps> = ({ 
    exitStockOther, 
    entrepots,
    marchandises,
    importateurs,
    agencesDouane,
    banques,
    categoriesVehicule,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="lettreTransport">Lettre de Transport</label>
                    <InputText 
                        id="lettreTransport"
                        name="lettreTransport"
                        value={exitStockOther.lettreTransport}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="rsp">RSP</label>
                    <InputText 
                        id="rsp"
                        name="rsp"
                        value={exitStockOther.rsp}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="noEntree">Numéro Entrée</label>
                    <InputNumber 
                        id="noEntree"
                        name="noEntree"
                        value={exitStockOther.noEntree}
                        onValueChange={handleNumberChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dateEntree">Date Entrée</label>
                    <Calendar 
                        id="dateEntree"
                        name="dateEntree"
                        value={exitStockOther.dateEntree}
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
                        value={exitStockOther.entreposId}
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
                        value={exitStockOther.marchandiseId}
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
                        value={exitStockOther.importateurId}
                        options={importateurs}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un importateur"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="categorieVehiculeId">Catégorie Véhicule</label>
                    <Dropdown 
                        id="categorieVehiculeId"
                        name="categorieVehiculeId"
                        value={exitStockOther.categorieVehiculeId}
                        options={categoriesVehicule}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une catégorie"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="nbreColis">Nombre Colis</label>
                    <InputNumber 
                        id="nbreColis"
                        name="nbreColis"
                        value={exitStockOther.nbreColis}
                        onValueChange={handleNumberChange}
                        min={0}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dateSortie">Date Sortie</label>
                    <Calendar 
                        id="dateSortie"
                        name="dateSortie"
                        value={exitStockOther.dateSortie}
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
                        value={exitStockOther.montant}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="poidsEntre">Poids Entrée (kg)</label>
                    <InputNumber 
                        id="poidsEntre"
                        name="poidsEntre"
                        value={exitStockOther.poidsEntre}
                        onValueChange={handleNumberChange}
                        min={0}
                        suffix=" kg"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="poidsSortie">Poids Sortie (kg)</label>
                    <InputNumber 
                        id="poidsSortie"
                        name="poidsSortie"
                        value={exitStockOther.poidsSortie}
                        onValueChange={handleNumberChange}
                        min={0}
                        suffix=" kg"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="tare">Tare (kg)</label>
                    <InputNumber 
                        id="tare"
                        name="tare"
                        value={exitStockOther.tare}
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
                        value={exitStockOther.noFacture}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="plaqueEntree">Plaque Entrée</label>
                    <InputText 
                        id="plaqueEntree"
                        name="plaqueEntree"
                        value={exitStockOther.plaqueEntree}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="plaqueSortie">Plaque Sortie</label>
                    <InputText 
                        id="plaqueSortie"
                        name="plaqueSortie"
                        value={exitStockOther.plaqueSortie}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="agenceDouaneId">Agence Douane</label>
                    <Dropdown 
                        id="agenceDouaneId"
                        name="agenceDouaneId"
                        value={exitStockOther.agenceDouaneId}
                        options={agencesDouane}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une agence"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dmc">DMC</label>
                    <InputText 
                        id="dmc"
                        name="dmc"
                        value={exitStockOther.dmc}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="quittance">Quittance</label>
                    <InputText 
                        id="quittance"
                        name="quittance"
                        value={exitStockOther.quittance}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="noBordereau">Numéro Bordereau</label>
                    <InputText 
                        id="noBordereau"
                        name="noBordereau"
                        value={exitStockOther.noBordereau}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="banqueId">Banque</label>
                    <Dropdown 
                        id="banqueId"
                        name="banqueId"
                        value={exitStockOther.banqueId}
                        options={banques}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une banque"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="dateSaisieEntree">Date Saisie Entrée</label>
                    <Calendar 
                        id="dateSaisieEntree"
                        name="dateSaisieEntree"
                        value={exitStockOther.dateSaisieEntree}
                        onChange={(e) => handleDateChange(e.value, "dateSaisieEntree")}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>
            </div>
        </div>
    );
};

export default ExitStockOtherForm;