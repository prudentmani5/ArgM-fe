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
import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
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
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [interestCalcMethods, setInterestCalcMethods] = useState<any[]>([]);
  const [paymentFrequencies, setPaymentFrequencies] = useState<any[]>([]);

  const { processRequest: loadProductTypes } = useConsumApi();
  const { processRequest: loadCurrencies } = useConsumApi();
  const { processRequest: loadInterestCalcMethods } = useConsumApi();
  const { processRequest: loadPaymentFrequencies } = useConsumApi();

  const targetClienteleOptions = [
    { label: "Individuel", value: "INDIVIDUAL" },
    { label: "Groupe", value: "GROUP" },
    { label: "Mixte", value: "MIXED" },
  ];

  const gracePeriodTypeOptions = [
    { label: "Aucun", value: "NONE" },
    { label: "Principal uniquement", value: "PRINCIPAL" },
    { label: "Intérêt uniquement", value: "INTEREST" },
    { label: "Principal et Intérêt", value: "BOTH" },
  ];

  const statusOptions = [
    { label: "Brouillon", value: "DRAFT" },
    { label: "Actif", value: "ACTIVE" },
    { label: "Suspendu", value: "SUSPENDED" },
    { label: "Abandonné", value: "DISCONTINUED" },
  ];

  useEffect(() => {
    if (loanProduct) {
      setFormData({
        ...loanProduct,
        productTypeId: loanProduct.productType?.id || loanProduct.productTypeId,
        currencyId: loanProduct.currency?.id || loanProduct.currencyId,
        interestCalculationMethodId: loanProduct.interestCalculationMethod?.id || loanProduct.interestCalculationMethodId,
        paymentFrequencyId: loanProduct.paymentFrequency?.id || loanProduct.paymentFrequencyId,
      });
    } else {
      setFormData(new LoanProduct());
    }
    setSubmitted(false);
    setActiveTabIndex(0);
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
      console.error("Erreur lors du chargement des données de référence:", error);
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

    // Transform data to match backend structure
    const dataToSend = {
      ...formData,
      productType: { id: formData.productTypeId },
      currency: { id: formData.currencyId },
      interestCalculationMethod: { id: formData.interestCalculationMethodId },
      paymentFrequency: { id: formData.paymentFrequencyId },
    };

    onSave(dataToSend);
  };

  const renderDialogFooter = () => {
    return (
      <div className="flex justify-content-end gap-2">
        <Button
          label="Annuler"
          icon="pi pi-times"
          severity="secondary"
          outlined
          onClick={onHide}
        />
        <Button
          label="Enregistrer"
          icon="pi pi-check"
          severity="success"
          onClick={handleSubmit}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "75vw", maxWidth: "1200px" }}
      header={
        <div className="flex align-items-center gap-2">
          <i className={`pi ${loanProduct?.id ? "pi-pencil" : "pi-plus-circle"} text-primary`} style={{ fontSize: "1.5rem" }}></i>
          <span className="font-bold text-xl">
            {loanProduct?.id ? "Modifier le Produit de Crédit" : "Nouveau Produit de Crédit"}
          </span>
        </div>
      }
      modal
      className="p-fluid"
      footer={renderDialogFooter()}
      onHide={onHide}
      maximizable
      draggable={false}
    >
      <TabView activeIndex={activeTabIndex} onTabChange={(e) => setActiveTabIndex(e.index)}>
        {/* Tab 1: Informations Générales */}
        <TabPanel header="Informations Générales" leftIcon="pi pi-info-circle mr-2">
          <div className="grid">
            {/* Identification */}
            <div className="col-12">
              <Card className="shadow-2 mb-3">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-id-card text-primary" style={{ fontSize: "1.2rem" }}></i>
                  <span className="font-semibold text-lg">Identification du Produit</span>
                </div>
                <Divider className="mt-0" />

                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="productCode" className="font-medium">
                        Code Produit <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="productCode"
                        value={formData.productCode}
                        onChange={(e) => handleChange("productCode", e.target.value.toUpperCase())}
                        className={submitted && !formData.productCode ? "p-invalid" : ""}
                        placeholder="Ex: MICRO-001"
                      />
                      {submitted && !formData.productCode && (
                        <small className="p-error">Le code produit est requis</small>
                      )}
                    </div>
                  </div>

                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="productTypeId" className="font-medium">
                        Type de Produit <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        id="productTypeId"
                        value={formData.productTypeId}
                        options={productTypes}
                        onChange={(e) => handleChange("productTypeId", e.value)}
                        optionLabel="nameFr"
                        optionValue="id"
                        placeholder="Sélectionner un type"
                        className={submitted && !formData.productTypeId ? "p-invalid" : ""}
                        filter
                        showClear
                      />
                      {submitted && !formData.productTypeId && (
                        <small className="p-error">Le type de produit est requis</small>
                      )}
                    </div>
                  </div>

                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="productName" className="font-medium">
                        Nom du Produit (EN) <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="productName"
                        value={formData.productName}
                        onChange={(e) => handleChange("productName", e.target.value)}
                        className={submitted && !formData.productName ? "p-invalid" : ""}
                        placeholder="Nom en anglais"
                      />
                      {submitted && !formData.productName && (
                        <small className="p-error">Le nom du produit est requis</small>
                      )}
                    </div>
                  </div>

                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="productNameFr" className="font-medium">
                        Nom du Produit (FR) <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="productNameFr"
                        value={formData.productNameFr || ""}
                        onChange={(e) => handleChange("productNameFr", e.target.value)}
                        placeholder="Nom en français"
                      />
                    </div>
                  </div>

                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="currencyId" className="font-medium">
                        Devise <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        id="currencyId"
                        value={formData.currencyId}
                        options={currencies}
                        onChange={(e) => handleChange("currencyId", e.value)}
                        optionLabel="code"
                        optionValue="id"
                        placeholder="Sélectionner une devise"
                        className={submitted && !formData.currencyId ? "p-invalid" : ""}
                        filter
                        showClear
                      />
                      {submitted && !formData.currencyId && (
                        <small className="p-error">La devise est requise</small>
                      )}
                    </div>
                  </div>

                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="targetClientele" className="font-medium">
                        Clientèle Cible
                      </label>
                      <Dropdown
                        id="targetClientele"
                        value={formData.targetClientele}
                        options={targetClienteleOptions}
                        onChange={(e) => handleChange("targetClientele", e.value)}
                        placeholder="Sélectionner"
                      />
                    </div>
                  </div>

                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="status" className="font-medium">
                        Statut
                      </label>
                      <Dropdown
                        id="status"
                        value={formData.status}
                        options={statusOptions}
                        onChange={(e) => handleChange("status", e.value)}
                        placeholder="Sélectionner"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Description */}
            <div className="col-12">
              <Card className="shadow-2">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-align-left text-primary" style={{ fontSize: "1.2rem" }}></i>
                  <span className="font-semibold text-lg">Description</span>
                </div>
                <Divider className="mt-0" />

                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="description" className="font-medium">Description (EN)</label>
                      <InputTextarea
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={4}
                        autoResize
                        placeholder="Description en anglais..."
                      />
                    </div>
                  </div>
                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="descriptionFr" className="font-medium">Description (FR)</label>
                      <InputTextarea
                        id="descriptionFr"
                        value={formData.descriptionFr || ""}
                        onChange={(e) => handleChange("descriptionFr", e.target.value)}
                        rows={4}
                        autoResize
                        placeholder="Description en français..."
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* Tab 2: Montants et Durées */}
        <TabPanel header="Montants & Durées" leftIcon="pi pi-calculator mr-2">
          <div className="grid">
            {/* Limites de Montant */}
            <div className="col-12 lg:col-6">
              <Card className="shadow-2 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-wallet text-primary" style={{ fontSize: "1.2rem" }}></i>
                  <span className="font-semibold text-lg">Limites de Montant</span>
                </div>
                <Divider className="mt-0" />

                <div className="grid">
                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="minAmount" className="font-medium">
                        Montant Minimum <span className="text-red-500">*</span>
                      </label>
                      <InputNumber
                        id="minAmount"
                        value={formData.minAmount}
                        onValueChange={(e) => handleChange("minAmount", e.value || 0)}
                        mode="currency"
                        currency="BIF"
                        locale="fr-BI"
                        className={submitted && formData.minAmount >= formData.maxAmount ? "p-invalid" : ""}
                      />
                      {submitted && formData.minAmount >= formData.maxAmount && (
                        <small className="p-error">Le montant minimum doit être inférieur au maximum</small>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="maxAmount" className="font-medium">
                        Montant Maximum <span className="text-red-500">*</span>
                      </label>
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

                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="defaultAmount" className="font-medium">Montant par Défaut</label>
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
                </div>
              </Card>
            </div>

            {/* Configuration de Durée */}
            <div className="col-12 lg:col-6">
              <Card className="shadow-2 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-calendar text-primary" style={{ fontSize: "1.2rem" }}></i>
                  <span className="font-semibold text-lg">Durée du Prêt (en mois)</span>
                </div>
                <Divider className="mt-0" />

                <div className="grid">
                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="minTermMonths" className="font-medium">
                        Durée Minimum <span className="text-red-500">*</span>
                      </label>
                      <InputNumber
                        id="minTermMonths"
                        value={formData.minTermMonths}
                        onValueChange={(e) => handleChange("minTermMonths", e.value || 1)}
                        min={1}
                        suffix=" mois"
                        className={submitted && formData.minTermMonths >= formData.maxTermMonths ? "p-invalid" : ""}
                      />
                      {submitted && formData.minTermMonths >= formData.maxTermMonths && (
                        <small className="p-error">La durée minimum doit être inférieure à la maximum</small>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="maxTermMonths" className="font-medium">
                        Durée Maximum <span className="text-red-500">*</span>
                      </label>
                      <InputNumber
                        id="maxTermMonths"
                        value={formData.maxTermMonths}
                        onValueChange={(e) => handleChange("maxTermMonths", e.value || 12)}
                        min={1}
                        suffix=" mois"
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="defaultTermMonths" className="font-medium">Durée par Défaut</label>
                      <InputNumber
                        id="defaultTermMonths"
                        value={formData.defaultTermMonths || 0}
                        onValueChange={(e) => handleChange("defaultTermMonths", e.value || 0)}
                        min={0}
                        suffix=" mois"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* Tab 3: Intérêts et Paiements */}
        <TabPanel header="Intérêts & Paiements" leftIcon="pi pi-percentage mr-2">
          <div className="grid">
            {/* Configuration des Intérêts */}
            <div className="col-12 lg:col-6">
              <Card className="shadow-2 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-chart-line text-primary" style={{ fontSize: "1.2rem" }}></i>
                  <span className="font-semibold text-lg">Configuration des Intérêts</span>
                </div>
                <Divider className="mt-0" />

                <div className="grid">
                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="interestCalculationMethodId" className="font-medium">
                        Méthode de Calcul <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        id="interestCalculationMethodId"
                        value={formData.interestCalculationMethodId}
                        options={interestCalcMethods}
                        onChange={(e) => handleChange("interestCalculationMethodId", e.value)}
                        optionLabel="nameFr"
                        optionValue="id"
                        placeholder="Sélectionner une méthode"
                        className={submitted && !formData.interestCalculationMethodId ? "p-invalid" : ""}
                        filter
                        showClear
                      />
                      {submitted && !formData.interestCalculationMethodId && (
                        <small className="p-error">La méthode de calcul est requise</small>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="minInterestRate" className="font-medium">
                        Taux Minimum <span className="text-red-500">*</span>
                      </label>
                      <InputNumber
                        id="minInterestRate"
                        value={formData.minInterestRate}
                        onValueChange={(e) => handleChange("minInterestRate", e.value || 0)}
                        suffix=" %"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        className={submitted && formData.minInterestRate >= formData.maxInterestRate ? "p-invalid" : ""}
                      />
                      {submitted && formData.minInterestRate >= formData.maxInterestRate && (
                        <small className="p-error">Le taux minimum doit être inférieur au maximum</small>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="maxInterestRate" className="font-medium">
                        Taux Maximum <span className="text-red-500">*</span>
                      </label>
                      <InputNumber
                        id="maxInterestRate"
                        value={formData.maxInterestRate}
                        onValueChange={(e) => handleChange("maxInterestRate", e.value || 0)}
                        suffix=" %"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="defaultInterestRate" className="font-medium">Taux par Défaut</label>
                      <InputNumber
                        id="defaultInterestRate"
                        value={formData.defaultInterestRate}
                        onValueChange={(e) => handleChange("defaultInterestRate", e.value || 0)}
                        suffix=" %"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Paiements et Période de Grâce */}
            <div className="col-12 lg:col-6">
              <Card className="shadow-2 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-money-bill text-primary" style={{ fontSize: "1.2rem" }}></i>
                  <span className="font-semibold text-lg">Paiements & Période de Grâce</span>
                </div>
                <Divider className="mt-0" />

                <div className="grid">
                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="paymentFrequencyId" className="font-medium">
                        Fréquence de Paiement <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        id="paymentFrequencyId"
                        value={formData.paymentFrequencyId}
                        options={paymentFrequencies}
                        onChange={(e) => handleChange("paymentFrequencyId", e.value)}
                        optionLabel="nameFr"
                        optionValue="id"
                        placeholder="Sélectionner une fréquence"
                        className={submitted && !formData.paymentFrequencyId ? "p-invalid" : ""}
                        filter
                        showClear
                      />
                      {submitted && !formData.paymentFrequencyId && (
                        <small className="p-error">La fréquence de paiement est requise</small>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="gracePeriodType" className="font-medium">Type de Période de Grâce</label>
                      <Dropdown
                        id="gracePeriodType"
                        value={formData.gracePeriodType || "NONE"}
                        options={gracePeriodTypeOptions}
                        onChange={(e) => handleChange("gracePeriodType", e.value)}
                        placeholder="Sélectionner"
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="maxGracePeriodDays" className="font-medium">
                        Période de Grâce Maximum (jours)
                      </label>
                      <InputNumber
                        id="maxGracePeriodDays"
                        value={formData.maxGracePeriodDays || 0}
                        onValueChange={(e) => handleChange("maxGracePeriodDays", e.value || 0)}
                        min={0}
                        suffix=" jours"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* Tab 4: Options et Exigences */}
        <TabPanel header="Options & Exigences" leftIcon="pi pi-cog mr-2">
          <div className="grid">
            {/* Remboursement Anticipé */}
            <div className="col-12 lg:col-6">
              <Card className="shadow-2 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-fast-forward text-primary" style={{ fontSize: "1.2rem" }}></i>
                  <span className="font-semibold text-lg">Remboursement Anticipé</span>
                </div>
                <Divider className="mt-0" />

                <div className="grid">
                  <div className="col-12">
                    <div className="field-checkbox">
                      <Checkbox
                        inputId="allowsEarlyRepayment"
                        checked={formData.allowsEarlyRepayment}
                        onChange={(e) => handleChange("allowsEarlyRepayment", e.checked)}
                      />
                      <label htmlFor="allowsEarlyRepayment" className="ml-2 font-medium">
                        Autoriser le remboursement anticipé
                      </label>
                    </div>
                  </div>

                  {formData.allowsEarlyRepayment && (
                    <div className="col-12">
                      <div className="field">
                        <label htmlFor="earlyRepaymentPenaltyRate" className="font-medium">
                          Taux de Pénalité
                        </label>
                        <InputNumber
                          id="earlyRepaymentPenaltyRate"
                          value={formData.earlyRepaymentPenaltyRate || 0}
                          onValueChange={(e) => handleChange("earlyRepaymentPenaltyRate", e.value || 0)}
                          suffix=" %"
                          minFractionDigits={2}
                          maxFractionDigits={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Exigences */}
            <div className="col-12 lg:col-6">
              <Card className="shadow-2 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-shield text-primary" style={{ fontSize: "1.2rem" }}></i>
                  <span className="font-semibold text-lg">Exigences de Garantie</span>
                </div>
                <Divider className="mt-0" />

                <div className="grid">
                  <div className="col-12">
                    <div className="field-checkbox">
                      <Checkbox
                        inputId="requiresGuarantors"
                        checked={formData.requiresGuarantors}
                        onChange={(e) => handleChange("requiresGuarantors", e.checked)}
                      />
                      <label htmlFor="requiresGuarantors" className="ml-2 font-medium">
                        Exiger des garants
                      </label>
                    </div>
                  </div>

                  {formData.requiresGuarantors && (
                    <div className="col-12">
                      <div className="field">
                        <label htmlFor="minGuarantors" className="font-medium">
                          Nombre Minimum de Garants
                        </label>
                        <InputNumber
                          id="minGuarantors"
                          value={formData.minGuarantors || 1}
                          onValueChange={(e) => handleChange("minGuarantors", e.value || 1)}
                          min={1}
                          showButtons
                          buttonLayout="horizontal"
                          decrementButtonClassName="p-button-secondary"
                          incrementButtonClassName="p-button-secondary"
                          incrementButtonIcon="pi pi-plus"
                          decrementButtonIcon="pi pi-minus"
                        />
                      </div>
                    </div>
                  )}

                  <div className="col-12 mt-3">
                    <div className="field-checkbox">
                      <Checkbox
                        inputId="requiresCollateral"
                        checked={formData.requiresCollateral}
                        onChange={(e) => handleChange("requiresCollateral", e.checked)}
                      />
                      <label htmlFor="requiresCollateral" className="ml-2 font-medium">
                        Exiger des garanties matérielles
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </Dialog>
  );
};

export default LoanProductForm;
