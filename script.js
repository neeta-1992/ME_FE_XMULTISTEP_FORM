(() => {
    const form = document.querySelector("#multi-step-form");
    const stepPanels = [...document.querySelectorAll(".form-step")];
    const indicators = [...document.querySelectorAll("[data-step-indicator]")];
    const nextButton = document.querySelector("#next-button");
    const backButton = document.querySelector("#back-button");
    const actions = document.querySelector("#form-actions");
    const planCards = [...document.querySelectorAll(".plan_card")];
    const addonInputs = [...document.querySelectorAll('input[name="addons"]')];
    const billingSwitch = document.querySelector("#billing-switch");
    const monthlyLabel = document.querySelector("#monthly-label");
    const yearlyLabel = document.querySelector("#yearly-label");
    const formState = { step: 0, yearly: false, plan: null, confirmed: false };
  
    const plans = {
      arcade: { name: "Arcade", monthly: 9, yearly: 90 },
      advanced: { name: "Advanced", monthly: 12, yearly: 120 },
      pro: { name: "Pro", monthly: 15, yearly: 150 }
    };
    const addons = {
      online: { name: "Online service", monthly: 1, yearly: 10 },
      storage: { name: "Larger storage", monthly: 2, yearly: 20 },
      profile: { name: "Customizable profile", monthly: 2, yearly: 20 }
    };
    const currency = value => `$${value}`;
    const period = () => formState.yearly ? "yr" : "mo";
    const priceFor = item => formState.yearly ? item.yearly : item.monthly;
  
    function showError(input, message) {
      const error = document.getElementById(`${input.name}-error`);
      input.classList.toggle("invalid", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");
      error.textContent = message || "";
    }
  
    function validatePersonalInfo() {
      const name = form.elements.userName;
      const email = form.elements.email;
      const phone = form.elements.phone;
      let valid = true;
  
      const nameMessage = name.value.trim() ? "" : "Enter your name";
      const emailValue = email.value.trim();
      let emailMessage = "";
      if (!emailValue) emailMessage = "Enter email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) emailMessage = "Enter a valid email";
      const phoneMessage = phone.value.trim() ? "" : "Enter your mobile number";
  
      showError(name, nameMessage);
      showError(email, emailMessage);
      showError(phone, phoneMessage);
      valid = !nameMessage && !emailMessage && !phoneMessage;
      if (!valid) {
        const firstInvalid = [name, email, phone].find(input => input.getAttribute("aria-invalid") === "true");
        firstInvalid?.focus();
      }
      return valid;
    }
  
    function renderStep() {
      stepPanels.forEach((panel, index) => {
        const active = index === formState.step;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
      });
      indicators.forEach((indicator, index) => {
        const active = index === Math.min(formState.step, 3);
        indicator.classList.toggle("active", active);
        if (active) indicator.setAttribute("aria-current", "step");
        else indicator.removeAttribute("aria-current");
      });
      backButton.hidden = formState.step === 0 || formState.step === 4;
      actions.hidden = formState.step === 4;
      nextButton.hidden = formState.step === 4;
      nextButton.textContent = formState.step === 3 ? "Confirm" : "Next Step";
      nextButton.classList.toggle("confirm", formState.step === 3);
      if (formState.step === 1) renderPlans();
      if (formState.step === 2) renderAddonPrices();
      if (formState.step === 3) renderSummary();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  
    function renderPlans() {
      planCards.forEach(card => {
        const key = card.dataset.plan;
        const plan = plans[key];
        const price = priceFor(plan);
        card.querySelector(".plan-price").textContent = `${currency(price)}/${period()}`;
        card.classList.toggle("selected", formState.plan === key);
        card.setAttribute("aria-checked", String(formState.plan === key));
      });
      document.querySelector(".plan-grid").classList.toggle("yearly", formState.yearly);
      document.querySelector(".form-step[data-step='1']").classList.toggle("yearly", formState.yearly);
      monthlyLabel.classList.toggle("billing-active", !formState.yearly);
      yearlyLabel.classList.toggle("billing-active", formState.yearly);
      billingSwitch.setAttribute("aria-checked", String(formState.yearly));
      billingSwitch.setAttribute("aria-label", formState.yearly ? "Switch monthly billing" : "Switch yearly billing");
    }
  
    function renderAddonPrices() {
      document.querySelectorAll("[data-addon-price]").forEach(node => {
        node.textContent = `+${currency(priceFor(addons[node.dataset.addonPrice]))}/${period()}`;
      });
    }
  
    function renderSummary() {
      const selectedPlan = plans[formState.plan];
      if (!selectedPlan) return;
      document.querySelector("#summary-plan-name").textContent = `${selectedPlan.name} (${formState.yearly ? "Yearly" : "Monthly"})`;
      document.querySelector("#summary-plan-price").textContent = `${currency(priceFor(selectedPlan))}/${period()}`;
      const summaryAddons = document.querySelector("#summary-addons");
      summaryAddons.replaceChildren();
      let total = priceFor(selectedPlan);
      addonInputs.filter(input => input.checked).forEach(input => {
        const addon = addons[input.value];
        total += priceFor(addon);
        const row = document.createElement("div");
        row.className = "summary-addon";
        const name = document.createElement("span");
        name.textContent = addon.name;
        const price = document.createElement("span");
        price.textContent = `+${currency(priceFor(addon))}/${period()}`;
        row.append(name, price);
        summaryAddons.append(row);
      });
      document.querySelector("#summary-total-label").textContent = `Total (per ${formState.yearly ? "year" : "month"})`;
      document.querySelector("#summary-total").textContent = `${currency(total)}/${period()}`;
    }
  
    function clearPlanError() {
      document.querySelector("#plan-error").textContent = "";
    }
  
    planCards.forEach(card => card.addEventListener("click", () => {
      formState.plan = card.dataset.plan;
      clearPlanError();
      renderPlans();
    }));
  
    billingSwitch.addEventListener("click", () => {
      formState.yearly = !formState.yearly;
      renderPlans();
      renderAddonPrices();
    });
  
    addonInputs.forEach(input => input.addEventListener("change", () => {
      input.closest(".addon_card").classList.toggle("selected", input.checked);
    }));
  
    document.querySelector("#change-plan").addEventListener("click", () => {
      formState.step = 1;
      renderStep();
    });
  
    backButton.addEventListener("click", () => {
      if (formState.step > 0 && formState.step < 4) {
        formState.step -= 1;
        renderStep();
      }
    });
  
    nextButton.addEventListener("click", () => {
      if (formState.step === 0) {
        if (!validatePersonalInfo()) return;
        formState.step = 1;
      } else if (formState.step === 1) {
        if (!formState.plan) {
          document.querySelector("#plan-error").textContent = "Please select a plan";
          return;
        }
        clearPlanError();
        formState.step = 2;
      } else if (formState.step === 2) {
        formState.step = 3;
      } else if (formState.step === 3) {
        formState.step = 4;
        formState.confirmed = true;
      }
      renderStep();
    });
  
    ["userName", "email", "phone"].forEach(name => {
      form.elements[name].addEventListener("input", event => {
        if (event.target.getAttribute("aria-invalid") === "true") {
          const input = event.target;
          if (input.name === "userName" && input.value.trim()) showError(input, "");
          if (input.name === "phone" && input.value.trim()) showError(input, "");
          if (input.name === "email") {
            const value = input.value.trim();
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) showError(input, "");
            else if (!value) showError(input, "Enter email");
            else showError(input, "Enter a valid email");
          }
        }
      });
    });
  
    renderStep();
  })();
  