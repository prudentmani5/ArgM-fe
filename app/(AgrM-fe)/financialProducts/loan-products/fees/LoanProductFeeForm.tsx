"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { LoanProductFee } from "./LoanProductFee";
import useConsumApi from "@/hooks/fetchData/useConsumApi";

interface LoanProductFeeFormProps {
  visible: boolean;
  onHide: () => void;
  loanProductFee: LoanProductFee | null;
  onSave: (loanProductFee: LoanProductFee) => void;
  productId: number;
}

const LoanProductFeeForm: React.FC<LoanProductFeeFormProps> = ({
  visible,
  onHide,
  loanProductFee,
  onSave,
  productId,
}) => {
  const [formData, setFormData] = useState<LoanProductFee>(new LoanProductFee());
  const [submitted, setSubmitted] = useState(false);
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [calculationMethods, setCalculationMethods] = useState<any[]>([]);

  const { processRequest: loadFeeTypes } = useConsumApi();
  const { processRequest: loadCalculationMethods } = useConsumApi();

  const collectionTimeOptions = [
    { label: "Demande", value: "APPLICATION" },
    { label: "Approbation", value: "APPROVAL" },
    { label: "Décaissement", value: "DISBURSEMENT" },
    { label: "Mensuel", value: "MONTHLY" },
    { label: "Annuel", value: "ANNUALLY" },
    { label: "Clôture", value: "CLOSURE" },
  ];

  useEffect(() => {
    if (loanProductFee) {
      setFormData({ ...loanProductFee });
    } else {
      const newFee = new LoanProductFee();
      newFee.productId = productId;
      setFormData(newFee);
    }
    setSubmitted(false);
  }, [loanProductFee, visible, productId]);

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [ftResponse, cmResponse] = await Promise.all([
        loadFeeTypes({
          route: "/api/financial-products/reference/fee-types/findall",
          method: "GET",
        }),
        loadCalculationMethods({
          route: "/api/financial-products/reference/fee-calculation-methods/findall",
          method: "GET",
        }),
      ]);

      if (ftResponse?.data) setFeeTypes(ftResponse.data);
      if (cmResponse?.data) setCalculationMethods(cmResponse.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données de référence:", error);
    }
  };

  const handleChange = (field: keyof LoanProductFee, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!formData.feeTypeId || !formData.calculationMethodId) {
      return;
    }

    onSave(formData);
  };

  const renderDialogFooter = () => {
    return (
      <div>
        <Button
          label="Annuler"
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
        />
        <Button
          label="Enregistrer"
          icon="pi pi-check"
          onClick={handleSubmit}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "50vw" }}
      header={
        loanProductFee?.id
          ? "Modifier Frais de Produit"
          : "Nouveau Frais de Produit"
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Section 1: Configuration des Frais */}
        <Divider>
          <span className="p-tag">Configuration des Frais</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="feeTypeId" className="col-12 mb-2 md:col-3 md:mb-0">
            Type de Frais *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="feeTypeId"
              value={formData.feeTypeId}
              options={feeTypes}
              onChange={(e) => handleChange("feeTypeId", e.value)}
              optionLabel="nameFr"
              optionValue="id"
              placeholder="Sélectionner"
              className={submitted && !formData.feeTypeId ? "p-invalid" : ""}
            />
            {submitted && !formData.feeTypeId && (
              <small className="p-error">Type de frais requis</small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="calculationMethodId" className="col-12 mb-2 md:col-3 md:mb-0">
            Méthode de Calcul *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="calculationMethodId"
              value={formData.calculationMethodId}
              options={calculationMethods}
              onChange={(e) => handleChange("calculationMethodId", e.value)}
              optionLabel="nameFr"
              optionValue="id"
              placeholder="Sélectionner"
              className={submitted && !formData.calculationMethodId ? "p-invalid" : ""}
            />
            {submitted && !formData.calculationMethodId && (
              <small className="p-error">Méthode de calcul requise</small>
            )}
          </div>
        </div>

        {/* Section 2: Configuration du Montant */}
        <Divider>
          <span className="p-tag">Configuration du Montant</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="fixedAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Montant Fixe
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="fixedAmount"
              value={formData.fixedAmount || 0}
              onValueChange={(e) => handleChange("fixedAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="percentageRate" className="col-12 mb-2 md:col-3 md:mb-0">
            Taux de Pourcentage
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="percentageRate"
              value={formData.percentageRate || 0}
              onValueChange={(e) => handleChange("percentageRate", e.value || 0)}
              suffix="%"
              minFractionDigits={2}
              maxFractionDigits={2}
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="minAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Montant Minimum
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="minAmount"
              value={formData.minAmount || 0}
              onValueChange={(e) => handleChange("minAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="maxAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Montant Maximum
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="maxAmount"
              value={formData.maxAmount || 0}
              onValueChange={(e) => handleChange("maxAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>

        {/* Section 3: Configuration de Collecte */}
        <Divider>
          <span className="p-tag">Configuration de Collecte</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="collectionTime" className="col-12 mb-2 md:col-3 md:mb-0">
            Moment de Collecte *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="collectionTime"
              value={formData.collectionTime}
              options={collectionTimeOptions}
              onChange={(e) => handleChange("collectionTime", e.value)}
              placeholder="Sélectionner"
            />
          </div>
        </div>

        <div className="field grid">
          <label className="col-12 mb-2 md:col-3 md:mb-0">
            Actif
          </label>
          <div className="col-12 md:col-9">
            <Checkbox
              inputId="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.checked)}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LoanProductFeeForm;
