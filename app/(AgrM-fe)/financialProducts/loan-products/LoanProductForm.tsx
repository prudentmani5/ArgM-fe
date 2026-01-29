"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { LoanProduct } from "./LoanProduct";
import useConsumApi from "@/hooks/fetchData/useConsumApi";

interface LoanProductFormProps {
  visible: boolean;
  onHide: () => void;
  loanProduct: LoanProduct | null;
  onSave: (loanProduct: LoanProduct) => void;
}

const LoanProductForm: React.FC<LoanProductFormProps> = ({
  visible,
  onHide,
  loanProduct,
  onSave,
}) => {
  const [formData, setFormData] = useState<LoanProduct>(new LoanProduct());
  const [submitted, setSubmitted] = useState(false);

  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [interestCalcMethods, setInterestCalcMethods] = useState<any[]>([]);
  const [paymentFrequencies, setPaymentFrequencies] = useState<any[]>([]);

  const { processRequest: loadProductTypes } = useConsumApi();
  const { processRequest: loadCurrencies } = useConsumApi();
  const { processRequest: loadInterestCalcMethods } = useConsumApi();
  const { processRequest: loadPaymentFrequencies } = useConsumApi();

  const targetClienteleOptions = [
    { label: "Individual / Individuel", value: "INDIVIDUAL" },
    { label: "Group / Groupe", value: "GROUP" },
    { label: "Mixed / Mixte", value: "MIXED" },
  ];

  const gracePeriodTypeOptions = [
    { label: "None / Aucun", value: "NONE" },
    { label: "Principal / Principal", value: "PRINCIPAL" },
    { label: "Interest / Intérêt", value: "INTEREST" },
    { label: "Both / Les deux", value: "BOTH" },
  ];

  const statusOptions = [
    { label: "Draft / Brouillon", value: "DRAFT" },
    { label: "Active / Actif", value: "ACTIVE" },
    { label: "Suspended / Suspendu", value: "SUSPENDED" },
    { label: "Discontinued / Abandonné", value: "DISCONTINUED" },
  ];

  useEffect(() => {
    if (loanProduct) {
      setFormData({ ...loanProduct });
    } else {
      setFormData(new LoanProduct());
    }
    setSubmitted(false);
  }, [loanProduct, visible]);

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [ptResponse, currResponse, icmResponse, pfResponse] = await Promise.all([
        loadProductTypes({
          route: "/api/financial-products/reference/loan-product-types/findall",
          method: "GET",
        }),
        loadCurrencies({
          route: "/api/financial-products/reference/currencies/findall",
          method: "GET",
        }),
        loadInterestCalcMethods({
          route: "/api/financial-products/reference/interest-calculation-methods/findall",
          method: "GET",
        }),
        loadPaymentFrequencies({
          route: "/api/financial-products/reference/payment-frequencies/findall",
          method: "GET",
        }),
      ]);

      if (ptResponse?.data) setProductTypes(ptResponse.data);
      if (currResponse?.data) setCurrencies(currResponse.data);
      if (icmResponse?.data) setInterestCalcMethods(icmResponse.data);
      if (pfResponse?.data) setPaymentFrequencies(pfResponse.data);
    } catch (error) {
      console.error("Error loading reference data:", error);
    }
  };

  const handleChange = (field: keyof LoanProduct, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (
      !formData.productCode ||
      !formData.productName ||
      !formData.productTypeId ||
      !formData.currencyId ||
      !formData.interestCalculationMethodId ||
      !formData.paymentFrequencyId ||
      formData.minAmount >= formData.maxAmount ||
      formData.minTermMonths >= formData.maxTermMonths ||
      formData.minInterestRate >= formData.maxInterestRate
    ) {
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
      style={{ width: "60vw" }}
      header={
        loanProduct?.id
          ? "Edit Loan Product / Modifier Produit de Crédit"
          : "New Loan Product / Nouveau Produit de Crédit"
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* Section 1: Basic Information */}
        <Divider>
          <span className="p-tag">Basic Information / Informations de Base</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="productCode" className="col-12 mb-2 md:col-3 md:mb-0">
            Product Code / Code Produit *
          </label>
          <div className="col-12 md:col-9">
            <InputText
              id="productCode"
              value={formData.productCode}
              onChange={(e) => handleChange("productCode", e.target.value)}
              className={submitted && !formData.productCode ? "p-invalid" : ""}
            />
            {submitted && !formData.productCode && (
              <small className="p-error">Product code is required / Code produit requis</small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="productName" className="col-12 mb-2 md:col-3 md:mb-0">
            Product Name / Nom du Produit *
          </label>
          <div className="col-12 md:col-9">
            <InputText
              id="productName"
              value={formData.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              className={submitted && !formData.productName ? "p-invalid" : ""}
            />
            {submitted && !formData.productName && (
              <small className="p-error">Product name is required / Nom produit requis</small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="productNameFr" className="col-12 mb-2 md:col-3 md:mb-0">
            Product Name (FR) / Nom du Produit (FR)
          </label>
          <div className="col-12 md:col-9">
            <InputText
              id="productNameFr"
              value={formData.productNameFr || ""}
              onChange={(e) => handleChange("productNameFr", e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Product Configuration */}
        <Divider>
          <span className="p-tag">Product Configuration / Configuration Produit</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="productTypeId" className="col-12 mb-2 md:col-3 md:mb-0">
            Product Type / Type de Produit *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="productTypeId"
              value={formData.productTypeId}
              options={productTypes}
              onChange={(e) => handleChange("productTypeId", e.value)}
              optionLabel="typeName"
              optionValue="id"
              placeholder="Select / Sélectionner"
              className={submitted && !formData.productTypeId ? "p-invalid" : ""}
            />
            {submitted && !formData.productTypeId && (
              <small className="p-error">Product type is required / Type produit requis</small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="currencyId" className="col-12 mb-2 md:col-3 md:mb-0">
            Currency / Devise *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="currencyId"
              value={formData.currencyId}
              options={currencies}
              onChange={(e) => handleChange("currencyId", e.value)}
              optionLabel="currencyCode"
              optionValue="id"
              placeholder="Select / Sélectionner"
              className={submitted && !formData.currencyId ? "p-invalid" : ""}
            />
            {submitted && !formData.currencyId && (
              <small className="p-error">Currency is required / Devise requise</small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="targetClientele" className="col-12 mb-2 md:col-3 md:mb-0">
            Target Clientele / Clientèle Cible *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="targetClientele"
              value={formData.targetClientele}
              options={targetClienteleOptions}
              onChange={(e) => handleChange("targetClientele", e.value)}
              placeholder="Select / Sélectionner"
            />
          </div>
        </div>

        {/* Section 3: Amount Limits */}
        <Divider>
          <span className="p-tag">Amount Limits / Limites de Montant</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="minAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Minimum Amount / Montant Minimum *
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="minAmount"
              value={formData.minAmount}
              onValueChange={(e) => handleChange("minAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
              className={
                submitted && formData.minAmount >= formData.maxAmount ? "p-invalid" : ""
              }
            />
            {submitted && formData.minAmount >= formData.maxAmount && (
              <small className="p-error">
                Min amount must be less than max / Montant min doit être inférieur au max
              </small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="maxAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Maximum Amount / Montant Maximum *
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="maxAmount"
              value={formData.maxAmount}
              onValueChange={(e) => handleChange("maxAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="defaultAmount" className="col-12 mb-2 md:col-3 md:mb-0">
            Default Amount / Montant par Défaut
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="defaultAmount"
              value={formData.defaultAmount || 0}
              onValueChange={(e) => handleChange("defaultAmount", e.value || 0)}
              mode="currency"
              currency="BIF"
              locale="fr-BI"
            />
          </div>
        </div>

        {/* Section 4: Term Configuration */}
        <Divider>
          <span className="p-tag">Term Configuration / Configuration de Durée</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="minTermMonths" className="col-12 mb-2 md:col-3 md:mb-0">
            Minimum Term (Months) / Durée Minimum (Mois) *
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="minTermMonths"
              value={formData.minTermMonths}
              onValueChange={(e) => handleChange("minTermMonths", e.value || 1)}
              min={1}
              className={
                submitted && formData.minTermMonths >= formData.maxTermMonths ? "p-invalid" : ""
              }
            />
            {submitted && formData.minTermMonths >= formData.maxTermMonths && (
              <small className="p-error">
                Min term must be less than max / Durée min doit être inférieure au max
              </small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="maxTermMonths" className="col-12 mb-2 md:col-3 md:mb-0">
            Maximum Term (Months) / Durée Maximum (Mois) *
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="maxTermMonths"
              value={formData.maxTermMonths}
              onValueChange={(e) => handleChange("maxTermMonths", e.value || 12)}
              min={1}
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="defaultTermMonths" className="col-12 mb-2 md:col-3 md:mb-0">
            Default Term (Months) / Durée par Défaut (Mois)
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="defaultTermMonths"
              value={formData.defaultTermMonths || 0}
              onValueChange={(e) => handleChange("defaultTermMonths", e.value || 0)}
              min={0}
            />
          </div>
        </div>

        {/* Section 5: Interest Configuration */}
        <Divider>
          <span className="p-tag">Interest Configuration / Configuration d&apos;Intérêt</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="interestCalculationMethodId" className="col-12 mb-2 md:col-3 md:mb-0">
            Interest Calculation Method / Méthode de Calcul d&apos;Intérêt *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="interestCalculationMethodId"
              value={formData.interestCalculationMethodId}
              options={interestCalcMethods}
              onChange={(e) => handleChange("interestCalculationMethodId", e.value)}
              optionLabel="methodName"
              optionValue="id"
              placeholder="Select / Sélectionner"
              className={submitted && !formData.interestCalculationMethodId ? "p-invalid" : ""}
            />
            {submitted && !formData.interestCalculationMethodId && (
              <small className="p-error">
                Interest calculation method is required / Méthode de calcul requise
              </small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="minInterestRate" className="col-12 mb-2 md:col-3 md:mb-0">
            Minimum Interest Rate / Taux d&apos;Intérêt Minimum *
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="minInterestRate"
              value={formData.minInterestRate}
              onValueChange={(e) => handleChange("minInterestRate", e.value || 0)}
              suffix="%"
              minFractionDigits={2}
              maxFractionDigits={2}
              className={
                submitted && formData.minInterestRate >= formData.maxInterestRate
                  ? "p-invalid"
                  : ""
              }
            />
            {submitted && formData.minInterestRate >= formData.maxInterestRate && (
              <small className="p-error">
                Min rate must be less than max / Taux min doit être inférieur au max
              </small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="maxInterestRate" className="col-12 mb-2 md:col-3 md:mb-0">
            Maximum Interest Rate / Taux d&apos;Intérêt Maximum *
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="maxInterestRate"
              value={formData.maxInterestRate}
              onValueChange={(e) => handleChange("maxInterestRate", e.value || 0)}
              suffix="%"
              minFractionDigits={2}
              maxFractionDigits={2}
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="defaultInterestRate" className="col-12 mb-2 md:col-3 md:mb-0">
            Default Interest Rate / Taux d&apos;Intérêt par Défaut *
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="defaultInterestRate"
              value={formData.defaultInterestRate}
              onValueChange={(e) => handleChange("defaultInterestRate", e.value || 0)}
              suffix="%"
              minFractionDigits={2}
              maxFractionDigits={2}
            />
          </div>
        </div>

        {/* Section 6: Payment & Grace Period */}
        <Divider>
          <span className="p-tag">Payment & Grace Period / Paiement & Période de Grâce</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="paymentFrequencyId" className="col-12 mb-2 md:col-3 md:mb-0">
            Payment Frequency / Fréquence de Paiement *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="paymentFrequencyId"
              value={formData.paymentFrequencyId}
              options={paymentFrequencies}
              onChange={(e) => handleChange("paymentFrequencyId", e.value)}
              optionLabel="frequencyName"
              optionValue="id"
              placeholder="Select / Sélectionner"
              className={submitted && !formData.paymentFrequencyId ? "p-invalid" : ""}
            />
            {submitted && !formData.paymentFrequencyId && (
              <small className="p-error">
                Payment frequency is required / Fréquence de paiement requise
              </small>
            )}
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="gracePeriodType" className="col-12 mb-2 md:col-3 md:mb-0">
            Grace Period Type / Type de Période de Grâce
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="gracePeriodType"
              value={formData.gracePeriodType || "NONE"}
              options={gracePeriodTypeOptions}
              onChange={(e) => handleChange("gracePeriodType", e.value)}
              placeholder="Select / Sélectionner"
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="maxGracePeriodDays" className="col-12 mb-2 md:col-3 md:mb-0">
            Max Grace Period (Days) / Période de Grâce Max (Jours)
          </label>
          <div className="col-12 md:col-9">
            <InputNumber
              id="maxGracePeriodDays"
              value={formData.maxGracePeriodDays || 0}
              onValueChange={(e) => handleChange("maxGracePeriodDays", e.value || 0)}
              min={0}
            />
          </div>
        </div>

        {/* Section 7: Early Repayment */}
        <Divider>
          <span className="p-tag">Early Repayment / Remboursement Anticipé</span>
        </Divider>

        <div className="field grid">
          <label className="col-12 mb-2 md:col-3 md:mb-0">
            Allows Early Repayment / Autorise Remboursement Anticipé
          </label>
          <div className="col-12 md:col-9">
            <Checkbox
              inputId="allowsEarlyRepayment"
              checked={formData.allowsEarlyRepayment}
              onChange={(e) => handleChange("allowsEarlyRepayment", e.checked)}
            />
          </div>
        </div>

        {formData.allowsEarlyRepayment && (
          <div className="field grid">
            <label htmlFor="earlyRepaymentPenaltyRate" className="col-12 mb-2 md:col-3 md:mb-0">
              Early Repayment Penalty Rate / Taux de Pénalité
            </label>
            <div className="col-12 md:col-9">
              <InputNumber
                id="earlyRepaymentPenaltyRate"
                value={formData.earlyRepaymentPenaltyRate || 0}
                onValueChange={(e) => handleChange("earlyRepaymentPenaltyRate", e.value || 0)}
                suffix="%"
                minFractionDigits={2}
                maxFractionDigits={2}
              />
            </div>
          </div>
        )}

        {/* Section 8: Requirements */}
        <Divider>
          <span className="p-tag">Requirements / Exigences</span>
        </Divider>

        <div className="field grid">
          <label className="col-12 mb-2 md:col-3 md:mb-0">
            Requires Guarantors / Exige des Garants
          </label>
          <div className="col-12 md:col-9">
            <Checkbox
              inputId="requiresGuarantors"
              checked={formData.requiresGuarantors}
              onChange={(e) => handleChange("requiresGuarantors", e.checked)}
            />
          </div>
        </div>

        {formData.requiresGuarantors && (
          <div className="field grid">
            <label htmlFor="minGuarantors" className="col-12 mb-2 md:col-3 md:mb-0">
              Minimum Guarantors / Nombre Minimum de Garants
            </label>
            <div className="col-12 md:col-9">
              <InputNumber
                id="minGuarantors"
                value={formData.minGuarantors || 1}
                onValueChange={(e) => handleChange("minGuarantors", e.value || 1)}
                min={1}
              />
            </div>
          </div>
        )}

        <div className="field grid">
          <label className="col-12 mb-2 md:col-3 md:mb-0">
            Requires Collateral / Exige des Garanties
          </label>
          <div className="col-12 md:col-9">
            <Checkbox
              inputId="requiresCollateral"
              checked={formData.requiresCollateral}
              onChange={(e) => handleChange("requiresCollateral", e.checked)}
            />
          </div>
        </div>

        {/* Section 9: Description */}
        <Divider>
          <span className="p-tag">Description</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="description" className="col-12 mb-2 md:col-3 md:mb-0">
            Description (EN)
          </label>
          <div className="col-12 md:col-9">
            <InputTextarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="field grid">
          <label htmlFor="descriptionFr" className="col-12 mb-2 md:col-3 md:mb-0">
            Description (FR)
          </label>
          <div className="col-12 md:col-9">
            <InputTextarea
              id="descriptionFr"
              value={formData.descriptionFr || ""}
              onChange={(e) => handleChange("descriptionFr", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Section 10: Status */}
        <Divider>
          <span className="p-tag">Status / Statut</span>
        </Divider>

        <div className="field grid">
          <label htmlFor="status" className="col-12 mb-2 md:col-3 md:mb-0">
            Status / Statut *
          </label>
          <div className="col-12 md:col-9">
            <Dropdown
              id="status"
              value={formData.status}
              options={statusOptions}
              onChange={(e) => handleChange("status", e.value)}
              placeholder="Select / Sélectionner"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LoanProductForm;
