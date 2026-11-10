"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-nav");
  const cookieBanner = document.querySelector("#cookie-banner");
  const toast = document.querySelector("#site-toast");
  let toastTimer;

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
    });

    navigation.addEventListener("click", (event) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (link instanceof HTMLAnchorElement && link.hash) {
        menuToggle.setAttribute("aria-expanded", "false");
        navigation.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        menuToggle.setAttribute("aria-expanded", "false");
        navigation.classList.remove("is-open");
      }
    });
  }

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 6000);
  };

  document.querySelectorAll("[data-demo-form]").forEach((form) => {
    if (!(form instanceof HTMLFormElement)) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      const fileInput = form.querySelector('input[type="file"]');
      if (fileInput instanceof HTMLInputElement && fileInput.files?.[0]) {
        const selectedFile = fileInput.files[0];
        const maxSize = Number(fileInput.dataset.maxSize);
        const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
          if (status) {
            status.textContent = "Please choose a PDF file.";
            status.classList.add("is-error");
          }
          fileInput.focus();
          return;
        }
        if (maxSize && selectedFile.size > maxSize) {
          if (status) {
            status.textContent = "The selected file is larger than 5 MB. Please choose a smaller PDF.";
            status.classList.add("is-error");
          }
          fileInput.focus();
          return;
        }
      }

      if (status) {
        status.classList.remove("is-error");
        status.textContent = form.id === "prequal-form"
          ? "Form validated. This demo does not transmit your details or include the requested pack files."
          : form.id === "career-form"
            ? "Form validated. This demo does not upload your CV or send your details."
            : "Form validated. This demo does not transmit or store your details.";
      } else {
        showToast("Form validated. This demo does not transmit or store your details.");
      }
    });
  });

  const quoteForm = document.querySelector("#quote-form");
  if (quoteForm instanceof HTMLFormElement) {
    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!quoteForm.reportValidity()) return;

      const values = new FormData(quoteForm);
      const rows = [
        ["Name", values.get("name")],
        ["Email", values.get("email")],
        ["Company", values.get("company") || "Not provided"],
        ["Phone", values.get("phone") || "Not provided"],
        ["Service", values.get("service")],
        ["Project location", values.get("location") || "Not provided"],
        ["Ideal start date", values.get("start-date") || "Not provided"],
        ["Project notes", values.get("scope")]
      ];

      let dialog = document.querySelector("#quote-summary-dialog");
      if (!(dialog instanceof HTMLDialogElement)) {
        dialog = document.createElement("dialog");
        dialog.id = "quote-summary-dialog";
        dialog.className = "summary-dialog";
        dialog.innerHTML = '<div id="print-summary"><p class="eyebrow">Yame Yame Construction Company</p><h2>Project enquiry summary</h2><p class="summary-warning">Enquiry summary only — not a priced quotation or confirmed offer.</p><dl class="summary-details"></dl><p class="summary-date"></p><div class="summary-actions"><button type="button" class="button button-dark" data-print-summary>Print / save as PDF</button><button type="button" class="button button-outline" data-close-summary>Close</button></div></div>';
        document.body.append(dialog);
        dialog.querySelector("[data-print-summary]")?.addEventListener("click", () => window.print());
        dialog.querySelector("[data-close-summary]")?.addEventListener("click", () => dialog.close());
        dialog.addEventListener("click", (dialogEvent) => {
          if (dialogEvent.target === dialog) dialog.close();
        });
      }

      const details = dialog.querySelector(".summary-details");
      if (!details) return;
      details.replaceChildren();
      rows.forEach(([label, value]) => {
        const term = document.createElement("dt");
        const description = document.createElement("dd");
        term.textContent = label;
        description.textContent = String(value ?? "");
        details.append(term, description);
      });

      const summaryDate = dialog.querySelector(".summary-date");
      if (summaryDate) {
        summaryDate.textContent = `Prepared ${new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date())}`;
      }

      const status = quoteForm.querySelector(".form-status");
      if (status) {
        status.classList.remove("is-error");
        status.textContent = "Your project enquiry summary is ready to print. No details were sent.";
      }
      dialog.showModal();
    });
  }

  const consentKey = "yame-yame-cookie-choice";
  if (cookieBanner instanceof HTMLElement) {
    if (!window.localStorage.getItem(consentKey)) cookieBanner.hidden = false;
    document.querySelectorAll("[data-cookie-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const choice = button.getAttribute("data-cookie-choice");
        if (choice !== "essential" && choice !== "all") return;
        window.localStorage.setItem(consentKey, choice);
        cookieBanner.hidden = true;
      });
    });
    document.querySelectorAll(".cookie-settings").forEach((button) => {
      button.addEventListener("click", () => {
        cookieBanner.hidden = false;
        cookieBanner.querySelector("button")?.focus();
      });
    });
  }

  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    if (input instanceof HTMLInputElement) input.min = localToday;
  });
});
