/**
 * ============================================================================
 * CLINIC CONFIGURATION - EDIT YOUR DETAILS HERE
 * Modify this single configuration block to update WhatsApp and phone actions.
 * ============================================================================
 */
const CLINIC_CONFIG = {
  // EDIT: Clinic Name
  clinicName: "Your Dental Clinic",

  // EDIT: WhatsApp Phone Number (include country code without + or spaces, e.g. "15551234567")
  whatsappNumber: "15551234567",

  // EDIT: Display Phone Number (used for tel: links and visual badges)
  phoneDisplay: "+1 (555) 123-4567",
  phoneRaw: "+15551234567",

  // EDIT: Default floating button message
  floatingMessage: "Hello! I would like to ask a question about your dental treatments and booking an appointment."
};

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initFaqAccordion();
  initAppointmentForm();
  initServiceSelectHelpers();
  initFloatingWhatsApp();
  initTestimonialDots();
});

/**
 * 1. NAVBAR & MOBILE DRAWER LOGIC
 */
function initNavbar() {
  const header = document.querySelector(".site-header");
  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  const mobileDrawer = document.querySelector(".mobile-drawer");
  const mobileLinks = document.querySelectorAll(".mobile-menu-link");

  // Sticky header background transition on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, { passive: true });

  if (!toggleBtn || !mobileDrawer) return;

  function toggleDrawer(open) {
    const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains("open");
    toggleBtn.classList.toggle("active", isOpen);
    mobileDrawer.classList.toggle("open", isOpen);
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  toggleBtn.addEventListener("click", () => toggleDrawer());

  // Close mobile drawer when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener("click", () => toggleDrawer(false));
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileDrawer.classList.contains("open")) {
      toggleDrawer(false);
    }
  });
}

/**
 * 2. FAQ ACCORDION LOGIC
 */
function initFaqAccordion() {
  const accordionItems = document.querySelectorAll(".accordion-item");

  accordionItems.forEach(item => {
    const header = item.querySelector(".accordion-header");
    const content = item.querySelector(".accordion-content");

    if (!header || !content) return;

    header.addEventListener("click", () => {
      const isCurrentlyActive = item.classList.contains("active");

      // Optional accordion behavior: close other open items
      accordionItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          const otherContent = otherItem.querySelector(".accordion-content");
          if (otherContent) otherContent.style.maxHeight = null;
          const otherHeader = otherItem.querySelector(".accordion-header");
          if (otherHeader) otherHeader.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle clicked item
      if (isCurrentlyActive) {
        item.classList.remove("active");
        content.style.maxHeight = null;
        header.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        content.style.maxHeight = content.scrollHeight + "px";
        header.setAttribute("aria-expanded", "true");
      }
    });

    // Support keyboard navigation (Enter and Space)
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        header.click();
      }
    });
  });

  // Open first item by default on load (as in reference design)
  if (accordionItems.length > 0) {
    const firstItem = accordionItems[0];
    const firstHeader = firstItem.querySelector(".accordion-header");
    const firstContent = firstItem.querySelector(".accordion-content");
    firstItem.classList.add("active");
    if (firstContent) firstContent.style.maxHeight = firstContent.scrollHeight + "px";
    if (firstHeader) firstHeader.setAttribute("aria-expanded", "true");
  }
}

/**
 * 3. APPOINTMENT FORM -> PRE-FILLED WHATSAPP
 */
function initAppointmentForm() {
  const form = document.getElementById("appointment-form");
  const feedback = document.getElementById("form-feedback");
  const dateInput = document.getElementById("pref-date");

  // Prevent past dates in appointment date picker
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("full-name")?.value.trim() || "";
    const phone = document.getElementById("phone-number")?.value.trim() || "";
    const date = document.getElementById("pref-date")?.value || "";
    const timeSlot = document.getElementById("pref-time")?.value || "Flexible";
    const service = document.getElementById("pref-service")?.value || "General Consultation";
    const notes = document.getElementById("notes")?.value.trim() || "None";

    if (!name || !phone || !date) {
      alert("Please fill in your name, phone number, and preferred date.");
      return;
    }

    // Build friendly pre-filled WhatsApp message
    const lines = [
      `*New Appointment Request - ${CLINIC_CONFIG.clinicName}*`,
      `---------------------------------`,
      `• *Patient Name:* ${name}`,
      `• *Phone:* ${phone}`,
      `• *Service:* ${service}`,
      `• *Preferred Date:* ${date}`,
      `• *Preferred Time:* ${timeSlot}`,
      `• *Notes:* ${notes}`,
      `---------------------------------`,
      `Please let me know if this slot is available. Thank you!`
    ];

    const messageText = lines.join("\n");
    const encodedMessage = encodeURIComponent(messageText);
    const cleanNumber = CLINIC_CONFIG.whatsappNumber.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

    // Show instant success message
    if (feedback) {
      feedback.style.display = "block";
      feedback.className = "form-feedback success";
      feedback.innerHTML = `✓ Opening WhatsApp with your appointment details for <strong>${escapeHtml(name)}</strong>...`;
    }

    // Open WhatsApp in new tab
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Clear form after 2 seconds
    setTimeout(() => {
      form.reset();
      if (feedback) {
        feedback.innerHTML = `✓ Appointment request sent! Our reception team will confirm via WhatsApp.`;
      }
    }, 2000);
  });
}

/**
 * 4. "BOOK THIS SERVICE" AUTO-SELECTION HELPER
 */
function initServiceSelectHelpers() {
  const serviceButtons = document.querySelectorAll("[data-select-service]");
  const serviceDropdown = document.getElementById("pref-service");

  serviceButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const serviceName = btn.getAttribute("data-select-service");
      if (serviceDropdown && serviceName) {
        // Find matching option
        for (let i = 0; i < serviceDropdown.options.length; i++) {
          if (serviceDropdown.options[i].value.toLowerCase().includes(serviceName.toLowerCase())) {
            serviceDropdown.selectedIndex = i;
            break;
          }
        }
      }
    });
  });
}

/**
 * 5. FLOATING WHATSAPP BUTTON LINK INJECTION
 */
function initFloatingWhatsApp() {
  const floatBtn = document.getElementById("floating-whatsapp-btn");
  if (!floatBtn) return;

  const cleanNumber = CLINIC_CONFIG.whatsappNumber.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(CLINIC_CONFIG.floatingMessage);
  floatBtn.href = `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * 6. TESTIMONIAL PAGINATION DOTS
 */
function initTestimonialDots() {
  const dots = document.querySelectorAll(".testimonial-dot");
  const cards = document.querySelectorAll(".testimonial-card");

  if (!dots.length || !cards.length) return;

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.getAttribute("data-index") || "0", 10);
      dots.forEach(d => d.classList.remove("active"));
      dot.classList.add("active");

      // On mobile screens, scroll the corresponding card into view
      if (window.innerWidth < 768 && cards[index]) {
        cards[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });
  });
}

/**
 * Helper to escape HTML tags in notifications
 */
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
