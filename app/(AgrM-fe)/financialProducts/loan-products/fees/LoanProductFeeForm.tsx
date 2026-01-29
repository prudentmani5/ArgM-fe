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
    { label: "Application / Demande", value: "APPLICATION" },
    { label: "Approval / Approbation", value: "APPROVAL" },
    { label: "Disbursement / Décaissement", value: "DISBURSEMENT" },
    { label: "Monthly / Mensuel", value: "MONTHLY" },
    { label: "Annually / Annuel", value: "ANNUALLY" },
    { label: "Closure / Clôture", value: "CLOSURE" },
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
          route: "/api/financial-products/reference/calculation-methods/findall",
          method: "GET",
        }),
      ]);

      if (ftResponse?.data) setFeeTypes(ftResponse.data);
      if (cmResponse?.data) setCalculationMethods(cmResponse.data);
    } catch (error) {
      console.error("Error loading reference data:", error);
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
          label="Cancel / Annuler"
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
        />
        <Button
          label="Save / Enregistrer"
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
          ? "Edit Loan Product Fee / Modifier Frais de Produit"
          : "New Loan Product Fee / Nouveau Frais de Produit"
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Section 1: Fee Configuration */}
        <Divider>
          <span className="p-tag">Fee Configuration / Configuration des Frais</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="feeTypeId" className="col-12 mb-2 md:col-3 md:mb-0">
            Fee Type / Type de Frais *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="feeTypeId"
              value={formData.feeTypeId}
              options={feeTypes}
              onChange={(e) => handleChange("feeTypeId", e.value)}
              optionLabel="typeName"
              optionValue="id"
              placeholder="Select / Sélectionner"
              className={submitted && !formData.feeTypeId ? "p-invalid" : ""}
            />
            {submitted && !formData.feeTypeId && (
              <small className="p-error">Fee type is required / Type de frais requis</small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="calculationMethodId" className="col-12 mb-2 md:col-3 md:mb-0">
            Calculation Method / Méthode de Calcul *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="calculationMethodId"
              value={formData.calculationMethodId}
              options={calculationMethods}
              onChange={(e) => handleChange("calculationMethodId", e.value)}
              optionLabel="methodName"
              optionValue="id"
              placeholder="Select / Sélectionner"
              className={submitted && !formData.calculationMethodId ? "p-invalid" : ""}
            />
            {submitted && !formData.calculationMethodId && (
              <small className="p-error">
                Calculation method is required / Méthode de calcul requise
              </small>
            )}
          </div>
        </div>

        {/* Section 2: Amount Configuration */}
        <Divider>
          <span className="p-tag">Amount Configuration / Configuration du Montant</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="fixedAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Fixed Amount / Montant Fixe
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
            Percentage Rate / Taux de Pourcentage
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
            Minimum Amount / Montant Minimum
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
            Maximum Amount / Montant Maximum
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

        {/* Section 3: Collection Configuration */}
        <Divider>
          <span className="p-tag">Collection Configuration / Configuration de Collecte</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="collectionTime" className="col-12 mb-2 md:col-3 md:mb-0">
            Collection Time / Moment de Collecte *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="collectionTime"
              value={formData.collectionTime}
              options={collectionTimeOptions}
              onChange={(e) => handleChange("collectionTime", e.value)}
              placeholder="Select / Sélectionner"
            />
          </div>
        </div>

        <div className="field grid">
          <label className="col-12 mb-2 md:col-3 md:mb-0">
            Is Active / Est Actif
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
