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

function syncEmailTemplateAliases(form) {
  const formData = new FormData(form);
  const aliases = {
    name: formData.get("nom") || "",
    from_name: formData.get("nom") || "",
    user_email: formData.get("email") || "",
    from_email: formData.get("email") || "",
    phone: formData.get("telephone") || "",
    project: formData.get("message") || "",
    to_email: "aatb@aa-tb.fr",
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

    try {
      syncEmailTemplateAliases(contactForm);

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
              nom: formData.get("nom") || "",
              email: formData.get("email") || "",
              telephone: formData.get("telephone") || "",
              message: formData.get("message") || "",
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${errorText}`);
        }
      }

      contactForm.reset();
      formStatus.className = "form-status success";
      formStatus.textContent = "Votre demande a bien été envoyée.";
    } catch (error) {
      formStatus.className = "form-status error";
      formStatus.textContent = `L'envoi a échoué (${error.text || error.message || "erreur inconnue"}). Vous pouvez écrire à aatb@aa-tb.fr.`;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer la demande";
    }
  });
}
