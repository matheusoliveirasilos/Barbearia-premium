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
     2. NAVBAR — efeito ao rolar
  --------------------------------------------------------- */
  const navbar = document.getElementById("navbar");

  const handleNavbarScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  };
  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll, { passive: true });

  /* ---------------------------------------------------------
     2.1 DRAWER MOBILE PREMIUM
     Menu hambúrguer com overlay escurecido, fechamento ao
     clicar fora, ao pressionar Esc, ao clicar em um item, e
     bloqueio do scroll da página enquanto está aberto.
  --------------------------------------------------------- */
  const navToggle = document.getElementById("nav-toggle");
  const drawer = document.getElementById("mobile-drawer");
  const drawerOverlay = document.getElementById("drawer-overlay");
  const drawerClose = document.getElementById("drawer-close");
  const mainContent = document.getElementById("main-content");
  const footerEl = document.querySelector(".footer");

  let lastFocusedBeforeDrawer = null;

  const isDrawerOpen = () => drawer.classList.contains("open");

  const openDrawer = () => {
    lastFocusedBeforeDrawer = document.activeElement;
    drawerOverlay.hidden = false;
    // requestAnimationFrame garante que a transição de opacidade/transform seja aplicada
    requestAnimationFrame(() => {
      drawer.classList.add("open");
      drawerOverlay.classList.add("active");
    });
    drawer.setAttribute("aria-hidden", "false");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    // Esconde o restante do site de leitores de tela enquanto o drawer está ativo
    if (mainContent) mainContent.setAttribute("aria-hidden", "true");
    if (footerEl) footerEl.setAttribute("aria-hidden", "true");
    drawerClose.focus();
  };

  const closeDrawer = () => {
    if (!isDrawerOpen()) return;
    drawer.classList.remove("open");
    drawerOverlay.classList.remove("active");
    drawer.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
    if (mainContent) mainContent.removeAttribute("aria-hidden");
    if (footerEl) footerEl.removeAttribute("aria-hidden");
    setTimeout(() => { drawerOverlay.hidden = true; }, 500);
    // Só libera o scroll se o catálogo também não estiver aberto
    if (!document.getElementById("catalog-modal").classList.contains("active")) {
      document.body.classList.remove("no-scroll");
    }
    if (lastFocusedBeforeDrawer) lastFocusedBeforeDrawer.focus();
  };

  navToggle.addEventListener("click", () => {
    isDrawerOpen() ? closeDrawer() : openDrawer();
  });
  drawerClose.addEventListener("click", closeDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);

  // Fecha o drawer ao clicar em qualquer link de navegação interno
  drawer.querySelectorAll("[data-drawer-link]").forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  // Foco preso (focus trap) dentro do drawer enquanto ele estiver aberto
  drawer.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !isDrawerOpen()) return;
    const focusable = drawer.querySelectorAll(
      'a[href], button:not([disabled])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isDrawerOpen()) closeDrawer();
  });

  /* ---------------------------------------------------------
     2.2 CATÁLOGO DE SERVIÇOS (MODAL)
     Abre em tela cheia (mobile) ou como modal centralizado
     (desktop/tablet), com overlay que fecha ao ser clicado,
     tecla Esc e botão dedicado de voltar.
  --------------------------------------------------------- */
  const catalogModal = document.getElementById("catalog-modal");
  const catalogOverlay = document.getElementById("catalog-overlay");
  const catalogBack = document.getElementById("catalog-back");
  const catalogTriggers = [
    document.getElementById("open-catalog"),
    document.getElementById("open-catalog-footer"),
  ].filter(Boolean);

  let lastFocusedBeforeCatalog = null;

  const isCatalogOpen = () => catalogModal.classList.contains("active");

  const openCatalog = () => {
    // Se o drawer mobile estiver aberto, fecha-o primeiro para não empilhar camadas
    if (isDrawerOpen()) closeDrawer();

    lastFocusedBeforeCatalog = document.activeElement;
    catalogOverlay.hidden = false;
    catalogModal.hidden = false;
    requestAnimationFrame(() => {
      catalogOverlay.classList.add("active");
      catalogModal.classList.add("active");
    });
    document.body.classList.add("no-scroll");
    if (mainContent) mainContent.setAttribute("aria-hidden", "true");
    if (footerEl) footerEl.setAttribute("aria-hidden", "true");
    navbar.setAttribute("aria-hidden", "true");
    catalogBack.focus();
  };

  const closeCatalog = () => {
    if (!isCatalogOpen()) return;
    catalogOverlay.classList.remove("active");
    catalogModal.classList.remove("active");
    document.body.classList.remove("no-scroll");
    if (mainContent) mainContent.removeAttribute("aria-hidden");
    if (footerEl) footerEl.removeAttribute("aria-hidden");
    navbar.removeAttribute("aria-hidden");
    setTimeout(() => {
      catalogOverlay.hidden = true;
      catalogModal.hidden = true;
    }, 400);
    if (lastFocusedBeforeCatalog) lastFocusedBeforeCatalog.focus();
  };

  catalogTriggers.forEach((btn) => btn.addEventListener("click", openCatalog));
  catalogBack.addEventListener("click", closeCatalog);
  catalogOverlay.addEventListener("click", closeCatalog);

  catalogModal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !isCatalogOpen()) return;
    const focusable = catalogModal.querySelectorAll('a[href], button:not([disabled])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isCatalogOpen()) closeCatalog();
  });

  /* ---------------------------------------------------------
     2.3 SCROLLSPY — destaca o link da seção visível no momento
     tanto no menu desktop quanto no drawer mobile.
  --------------------------------------------------------- */
  const sectionIds = ["sobre", "servicos", "equipe", "galeria", "depoimentos", "agendamento", "localizacao"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinkGroups = sectionIds.map((id) =>
    document.querySelectorAll(`[data-section="${id}"]`)
  );

  const setActiveSection = (id) => {
    sectionIds.forEach((sectionId, index) => {
      navLinkGroups[index].forEach((link) => {
        const isActive = sectionId === id;
        link.classList.toggle("active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  };

  const scrollspyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((section) => scrollspyObserver.observe(section));

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
    document.body.classList.add("no-scroll");
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    setTimeout(() => { lightbox.hidden = true; }, 350);
    // Só libera o scroll se nenhuma outra camada (drawer/catálogo) ainda estiver aberta
    if (!drawer.classList.contains("open") && !document.getElementById("catalog-modal").classList.contains("active")) {
      document.body.classList.remove("no-scroll");
    }
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

  // Impede agendamentos em datas passadas (usa data local, não UTC,
  // para evitar bloquear o próprio dia à noite em fusos como o do Brasil)
  if (dateInput) {
    const now = new Date();
    const localToday =
      now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0");
    dateInput.setAttribute("min", localToday);
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