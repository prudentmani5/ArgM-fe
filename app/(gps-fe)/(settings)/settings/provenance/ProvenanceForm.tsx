'use client';
import { InputText } from "primereact/inputtext";
import { Provenance } from "./Provenance";

interface ProvenanceFormProps {
    provenance: Provenance;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProvenanceForm({
    provenance,
    handleChange
}: ProvenanceFormProps) {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="nom">Nom</label>
                    <InputText
                        id="nom"
                        name="nom"
                        value={provenance.nom}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="pays">Pays</label>
                    <InputText
                        id="pays"
                        name="pays"
                        value={provenance.pays}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
    );
}