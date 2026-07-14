/* ==========================================================================
   BLACK CROWN BARBER CLUB — SCRIPT
   JavaScript puro, sem dependências externas.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------
     1. LOADING SCREEN
     Esconde a tela de carregamento assim que a página termina
     de carregar, com um pequeno atraso para suavizar a transição.
  --------------------------------------------------------- */
  const loadingScreen = document.getElementById("loading-screen");
  let pageFullyLoaded = false;

  const hideLoadingScreen = () => {
    if (loadingScreen.classList.contains("hidden")) return;
    loadingScreen.classList.add("hidden");
  };

  window.addEventListener("load", () => {
    pageFullyLoaded = true;
    setTimeout(hideLoadingScreen, 400);
  });

  // Teto de segurança: mesmo que alguma imagem externa (Unsplash, fontes)
  // demore para responder, a tela de carregamento nunca trava por mais
  // de ~2.2s. O conteúdo já está pronto (DOM montado); imagens fora da
  // viewport continuam com "loading=lazy" e carregam normalmente ao rolar.
  setTimeout(() => {
    if (!pageFullyLoaded) hideLoadingScreen();
  }, 2200);

  /* ---------------------------------------------------------
     1.5. FALLBACK DE IMAGENS
     Se qualquer foto externa (Unsplash) falhar ao carregar,
     substitui por um bloco visual elegante em vez de deixar
     o ícone de imagem quebrada aparecer.
  --------------------------------------------------------- */
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", function handleImgError() {
      this.removeEventListener("error", handleImgError);
      this.style.display = "none";
      const fallback = document.createElement("div");
      fallback.className = "img-fallback";
      fallback.setAttribute("aria-hidden", "true");
      fallback.innerHTML =
        '<svg viewBox="0 0 40 40" width="34" height="34"><path d="M10 40 L10 20 L21 30 L32 14 L43 30 L54 20 L54 40 Z" transform="scale(0.6) translate(3,3)" stroke="#C9A227" stroke-width="2.5" stroke-linejoin="round" fill="none"/></svg>';
      this.parentNode.insertBefore(fallback, this.nextSibling);
    });
  });

  /* ---------------------------------------------------------
     2. NAVBAR — efeito ao rolar + menu hambúrguer mobile
  --------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  const handleNavbarScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  };
  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll, { passive: true });

  const closeMobileMenu = () => {
    navbar.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Fecha o menu ao clicar em um link ou pressionar Esc (acessibilidade)
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });

  /* ---------------------------------------------------------
     3. PARALLAX SUAVE NO HERO
  --------------------------------------------------------- */
  const heroBg = document.getElementById("hero-bg");
  const hero = document.getElementById("hero");

  const handleParallax = () => {
    const scrollY = window.scrollY;
    if (scrollY < hero.offsetHeight) {
      heroBg.style.transform = `translateY(${scrollY * 0.35}px) scale(1.05)`;
    }
  };
  window.addEventListener("scroll", handleParallax, { passive: true });

  /* ---------------------------------------------------------
     4. ANIMAÇÕES DE SCROLL (Intersection Observer)
  --------------------------------------------------------- */
  const revealElements = document.querySelectorAll(
    ".reveal-fade, .reveal-left, .reveal-right"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = (index % 3) * 90;
          setTimeout(() => entry.target.classList.add("in-view"), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------
     5. CONTADORES ANIMADOS (estatísticas)
  --------------------------------------------------------- */
  const statNumbers = document.querySelectorAll(".stat-number");

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const isDecimal = el.dataset.decimal === "true";
    const duration = 1800;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
      const current = eased * target;

      el.textContent = isDecimal
        ? current.toFixed(1).replace(".", ",") + suffix
        : Math.floor(current).toLocaleString("pt-BR") + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = isDecimal
          ? target.toFixed(1).replace(".", ",") + suffix
          : target.toLocaleString("pt-BR") + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  statNumbers.forEach((el) => statsObserver.observe(el));

  /* ---------------------------------------------------------
     6. GALERIA — LIGHTBOX (modal de imagem ampliada)
  --------------------------------------------------------- */
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  let lastFocusedElement = null;

  const openLightbox = (item) => {
    const img = item.querySelector("img");
    lastFocusedElement = item;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = item.dataset.caption || img.alt;

    lightbox.hidden = false;
    // pequeno delay para permitir a transição de opacidade/escala
    requestAnimationFrame(() => lightbox.classList.add("active"));
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => { lightbox.hidden = true; }, 350);
    if (lastFocusedElement) lastFocusedElement.focus();
  };

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) closeLightbox();
  });

  /* ---------------------------------------------------------
     7. FORMULÁRIO DE AGENDAMENTO
     Validação simples e feedback ao usuário (sem backend real).
  --------------------------------------------------------- */
  const bookingForm = document.getElementById("booking-form");
  const formFeedback = document.getElementById("form-feedback");
  const dateInput = document.getElementById("date");
  const phoneInput = document.getElementById("phone");

  // Impede agendamentos em datas passadas
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  // Máscara simples de telefone brasileiro
  phoneInput.addEventListener("input", () => {
    let value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if (value.length > 6) {
      value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    }
    phoneInput.value = value;
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = phoneInput.value.trim();
    const service = document.getElementById("service").value;
    const barber = document.getElementById("barber").value;
    const date = dateInput.value;
    const time = document.getElementById("time").value;

    if (!name || !phone || !service || !barber || !date || !time) {
      formFeedback.style.color = "#e08b8b";
      formFeedback.textContent = "Por favor, preencha todos os campos para agendar.";
      return;
    }

    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("pt-BR");

    formFeedback.style.color = "#ddb948";
    formFeedback.textContent = `Perfeito, ${name.split(" ")[0]}! Seu horário para ${service} com ${barber} foi solicitado para ${formattedDate} às ${time}. Enviaremos a confirmação por WhatsApp.`;

    bookingForm.reset();
  });

  /* ---------------------------------------------------------
     8. BOTÃO "VOLTAR AO TOPO"
  --------------------------------------------------------- */
  const backToTopBtn = document.getElementById("back-to-top");

  const toggleBackToTop = () => {
    backToTopBtn.classList.toggle("visible", window.scrollY > 700);
  };
  window.addEventListener("scroll", toggleBackToTop, { passive: true });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------------------------------------------------------
     9. ANO ATUAL NO RODAPÉ
  --------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

});