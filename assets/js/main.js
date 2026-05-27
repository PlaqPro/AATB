const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

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

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const emailConfig = {
  publicKey: "Npc5XujGi641GA81m",
  serviceId: "service_h1yah0h",
  templateId: "template_c7ld5fc",
};

if (window.emailjs) {
  window.emailjs.init({ publicKey: emailConfig.publicKey });
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    if (!window.emailjs) {
      return;
    }

    event.preventDefault();
    const submitButton = contactForm.querySelector("button[type='submit']");

    formStatus.className = "form-status";
    formStatus.textContent = "Envoi de votre demande...";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Envoi en cours...";
    }

    try {
      await window.emailjs.sendForm(
        emailConfig.serviceId,
        emailConfig.templateId,
        contactForm,
      );

      contactForm.reset();
      formStatus.className = "form-status success";
      formStatus.textContent = "Votre demande a bien été envoyée.";
    } catch (error) {
      formStatus.className = "form-status error";
      formStatus.textContent = "L'envoi a échoué. Vous pouvez écrire à aatb@aa-tb.fr.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Envoyer la demande";
      }
    }
  });
}
