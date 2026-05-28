const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.getElementById("mainNav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Ouvrir le menu");
    });
  });
}

const banner = document.getElementById("cookieBanner");
const accept = document.getElementById("cookieAccept");
const reject = document.getElementById("cookieReject");
const choice = localStorage.getItem("aatb_cookie_choice");

if (banner && !choice) {
  setTimeout(() => banner.classList.add("show"), 500);
}

function closeCookieBanner(value) {
  localStorage.setItem("aatb_cookie_choice", value);
  if (banner) {
    banner.classList.remove("show");
  }
}

if (accept) {
  accept.addEventListener("click", () => closeCookieBanner("accepted"));
}

if (reject) {
  reject.addEventListener("click", () => closeCookieBanner("rejected"));
}

const contactForm = document.getElementById("form");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("button");
const emailConfig = {
  publicKey: "Npc5XujGi641GA81m",
  serviceId: "service_x6q06ze",
  templateId: "template_c7ld5fc",
};

if (window.emailjs) {
  window.emailjs.init({ publicKey: emailConfig.publicKey });
}

function getFormValue(formData, name) {
  return (formData.get(name) || "").toString().trim();
}

function buildProjectMessage(formData) {
  const rows = [
    ["Type de projet", getFormValue(formData, "type_projet")],
    ["Commune du chantier", getFormValue(formData, "commune")],
    ["Surface estimee", getFormValue(formData, "surface")],
    ["Delai souhaite", getFormValue(formData, "delai")],
    ["Preference de contact", getFormValue(formData, "preference_contact")],
    ["Details", getFormValue(formData, "message")],
  ];

  return rows
    .filter(([, value]) => value)
    .map(([label, value]) => `${label} : ${value}`)
    .join("\n");
}

function syncEmailTemplateAliases(form) {
  const formData = new FormData(form);
  const projectMessage = buildProjectMessage(formData);
  const name = getFormValue(formData, "nom");
  const email = getFormValue(formData, "email");
  const phone = getFormValue(formData, "telephone");
  const aliases = {
    name,
    nom: name,
    from_name: name,
    user_name: name,
    email,
    user_email: email,
    from_email: email,
    reply_to: email,
    telephone: phone,
    phone,
    phone_number: phone,
    project_type: getFormValue(formData, "type_projet"),
    type_projet: getFormValue(formData, "type_projet"),
    city: getFormValue(formData, "commune"),
    commune: getFormValue(formData, "commune"),
    surface: getFormValue(formData, "surface"),
    deadline: getFormValue(formData, "delai"),
    delai: getFormValue(formData, "delai"),
    contact_preference: getFormValue(formData, "preference_contact"),
    preference_contact: getFormValue(formData, "preference_contact"),
    details: getFormValue(formData, "message"),
    project: projectMessage,
    project_message: projectMessage,
    demande: projectMessage,
    message_full: projectMessage,
    full_message: projectMessage,
    to_email: "aatb@aa-tb.fr",
    recipient_email: "aatb@aa-tb.fr",
    subject: "Nouvelle demande depuis le site AATB",
  };

  Object.entries(aliases).forEach(([name, value]) => {
    let input = form.querySelector(`input[name="${name}"]`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  });
}

if (contactForm && formStatus && submitButton) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    formStatus.className = "form-status";
    formStatus.textContent = "Envoi de votre demande...";
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";
    const messageField = contactForm.elements.message;
    const initialMessage = messageField ? messageField.value : "";
    let sent = false;

    try {
      syncEmailTemplateAliases(contactForm);

      if (messageField) {
        messageField.value = buildProjectMessage(new FormData(contactForm));
      }

      if (window.emailjs) {
        await window.emailjs.sendForm(
          emailConfig.serviceId,
          emailConfig.templateId,
          contactForm,
        );
      } else {
        const formData = new FormData(contactForm);
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: emailConfig.serviceId,
            template_id: emailConfig.templateId,
            user_id: emailConfig.publicKey,
            template_params: {
              nom: getFormValue(formData, "nom"),
              name: getFormValue(formData, "nom"),
              from_name: getFormValue(formData, "nom"),
              email: getFormValue(formData, "email"),
              user_email: getFormValue(formData, "email"),
              from_email: getFormValue(formData, "email"),
              reply_to: getFormValue(formData, "email"),
              telephone: getFormValue(formData, "telephone"),
              phone: getFormValue(formData, "telephone"),
              phone_number: getFormValue(formData, "telephone"),
              type_projet: getFormValue(formData, "type_projet"),
              project_type: getFormValue(formData, "type_projet"),
              commune: getFormValue(formData, "commune"),
              city: getFormValue(formData, "commune"),
              surface: getFormValue(formData, "surface"),
              delai: getFormValue(formData, "delai"),
              deadline: getFormValue(formData, "delai"),
              preference_contact: getFormValue(formData, "preference_contact"),
              contact_preference: getFormValue(formData, "preference_contact"),
              message: getFormValue(formData, "message"),
              details: getFormValue(formData, "message"),
              project: getFormValue(formData, "message"),
              project_message: getFormValue(formData, "message"),
              demande: getFormValue(formData, "message"),
              message_full: getFormValue(formData, "message"),
              full_message: getFormValue(formData, "message"),
              to_email: "aatb@aa-tb.fr",
              recipient_email: "aatb@aa-tb.fr",
              subject: "Nouvelle demande depuis le site AATB",
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${errorText}`);
        }
      }

      sent = true;
      contactForm.reset();
      formStatus.className = "form-status success";
      formStatus.textContent = "Votre demande a bien été envoyée.";
    } catch (error) {
      formStatus.className = "form-status error";
      formStatus.textContent = `L'envoi a échoué (${error.text || error.message || "erreur inconnue"}). Vous pouvez écrire à aatb@aa-tb.fr.`;
    } finally {
      if (!sent && messageField) {
        messageField.value = initialMessage;
      }
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer la demande";
    }
  });
}
