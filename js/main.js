/**
 * MiCryptoGuía - Main JavaScript
 * Handles: navigation, theme, search, tabs, glossary filters, mobile menu, smooth scrolling
 */

(function () {
  'use strict';

  // ===== DOM Elements =====
  const navbar = document.getElementById('navbar');
  const navMenu = document.getElementById('navMenu');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const themeToggle = document.getElementById('themeToggle');
  const searchToggle = document.getElementById('searchToggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');
  const searchResults = document.getElementById('searchResults');
  const guiaTabs = document.querySelectorAll('.guia-tab');
  const guiaPanels = document.querySelectorAll('.guia-panel');
  const glosarioTags = document.querySelectorAll('.glosario-tag');
  const glosarioItems = document.querySelectorAll('.glosario-item');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollIndicator = document.querySelector('.scroll-indicator');

  // ===== Search Index =====
  const searchIndex = buildSearchIndex();

  function buildSearchIndex() {
    const index = [];

    // Sections
    const sections = [
      { title: 'Inicio', desc: 'Página principal de MiCryptoGuía', url: '#inicio', keywords: 'home inicio' },
      { title: 'Fundamentos Crypto', desc: 'Aprende los fundamentos: Bitcoin, blockchain, Ethereum, smart contracts, seguridad', url: '#fundamentos', keywords: 'bitcoin blockchain ethereum smart contracts seguridad fundamentos básico' },
      { title: 'Guías Paso a Paso', desc: 'Tutoriales para comprar crypto, trading, wallets, DeFi y seguridad', url: '#guias', keywords: 'guias tutoriales comprar trading wallets defi seguridad paso a paso' },
      { title: 'Comparativa de Exchanges', desc: 'Compara Binance y OKX, los mejores exchanges de criptomonedas', url: '#exchanges', keywords: 'exchanges binance okx comparativa comisiones trading' },
      { title: 'Wallets y Custodia', desc: 'Hot wallets, cold wallets, MetaMask, Trust Wallet, Ledger, Trezor', url: '#wallets', keywords: 'wallets billeteras metamask trust wallet ledger trezor custodia hot cold' },
      { title: 'DeFi y Web3', desc: 'Finanzas descentralizadas, DEXs, staking, NFTs, DAOs, puentes cross-chain', url: '#defi', keywords: 'defi finanzas descentralizadas dex staking nft dao web3 uniswap aave' },
      { title: 'Seguridad Crypto', desc: 'Reglas de seguridad, protección contra estafas, 2FA, phishing', url: '#seguridad', keywords: 'seguridad protección estafas phishing 2fa clave privada frase semilla' },
      { title: 'Glosario Crypto', desc: 'Términos clave: blockchain, altcoin, DeFi, NFT, HODL, gas fee, smart contract', url: '#glosario', keywords: 'glosario términos definiciones altcoin blockchain defi nft hodl gas fee smart contract' },
      { title: 'Herramientas Útiles', desc: 'CoinMarketCap, CoinGecko, DefiLlama, Etherscan, Dune Analytics', url: '#herramientas', keywords: 'herramientas coinmarketcap coingecko defillama etherscan dune analytics' },
    ];

    // Articles
    const articles = [
      { title: 'Qué es Bitcoin', desc: 'Guía completa para principiantes: cómo funciona Bitcoin, por qué tiene valor y cómo empezar', url: 'articulos/que-es-bitcoin.html', keywords: 'bitcoin que es bitcoin criptomoneda descentralizada satoshi nakamoto' },
      { title: 'Cómo comprar Bitcoin', desc: 'Guía paso a paso para comprar Bitcoin por primera vez en Binance u OKX', url: 'articulos/como-comprar-bitcoin.html', keywords: 'comprar bitcoin como comprar bitcoin exchange binance okx kyc' },
      { title: 'Crear y configurar MetaMask', desc: 'Guía completa para instalar, configurar y proteger MetaMask paso a paso', url: 'articulos/crear-configurar-metamask.html', keywords: 'metamask crear metamask configurar wallet billetera web3' },
      { title: 'Blockchain explicada', desc: 'Qué es blockchain, cómo funciona y por qué es importante — explicación sencilla', url: 'articulos/blockchain-explicacion-sencilla.html', keywords: 'blockchain cadena bloques como funciona explicacion sencilla' },
      { title: 'Binance vs OKX', desc: 'Comparativa completa de exchanges: comisiones, seguridad, experiencia de usuario', url: 'articulos/binance-vs-okx.html', keywords: 'binance okx comparativa exchange cual elegir comisiones seguridad' },
      { title: 'Cómo hacer staking', desc: 'Guía de staking de criptomonedas: cómo generar ingresos pasivos con tus criptos', url: 'articulos/como-hacer-staking.html', keywords: 'staking como hacer staking ingresos pasivos pos proof of stake' },
      { title: 'Seguridad crypto: 10 reglas', desc: '10 reglas de oro para proteger tus criptomonedas de hackers y estafas', url: 'articulos/seguridad-criptomonedas.html', keywords: 'seguridad crypto proteger fondos estafas phishing 2fa clave privada' },
      { title: 'Qué es USDT', desc: 'Guía completa de USDT: qué es, cómo funciona y para qué sirve la stablecoin', url: 'articulos/que-es-usdt.html', keywords: 'usdt stablecoin tether que es como usar comprar' },
      { title: 'Cómo usar Uniswap', desc: 'Guía paso a paso para intercambiar tokens en Uniswap, el DEX más grande', url: 'articulos/como-usar-uniswap.html', keywords: 'uniswap dex intercambiar tokens defi swap amm' },
      { title: 'Hot Wallet vs Cold Wallet', desc: 'Comparativa de wallets: cuál elegir según tu nivel de experiencia y cantidad', url: 'articulos/hot-wallet-vs-cold-wallet.html', keywords: 'hot wallet cold wallet metamask trust ledger trezor billetera' },
      { title: 'Sobre MiCryptoGuía', desc: 'Conoce al autor y la misión de MiCryptoGuía', url: 'sobre.html', keywords: 'sobre autor contacto misión equipo' },
    ];

    articles.forEach(function (a) {
      index.push(a);
    });

    sections.forEach(function (s) {
      index.push(s);
    });

    // Glossary terms
    var glossaryTerms = [
      'Altcoin', 'ATH', 'AMM', 'Blockchain', 'CEX', 'DeFi', 'DEX', 'DYOR', 'FOMO', 'FUD',
      'Gas Fee', 'HODL', 'KYC', 'Liquidity Pool', 'Market Cap', 'NFT', 'PoS', 'PoW',
      'Private Key', 'Rug Pull', 'Seed Phrase', 'Smart Contract', 'Stablecoin', 'TVL', 'Yield Farming'
    ];

    glossaryTerms.forEach(function (term) {
      index.push({
        title: 'Glosario: ' + term,
        desc: 'Definición de ' + term + ' en el glosario crypto',
        url: '#glosario',
        keywords: term.toLowerCase()
      });
    });

    return index;
  }

  // ===== Theme Toggle =====
  function getTheme() {
    return localStorage.getItem('micryptoguia-theme') || 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('micryptoguia-theme', theme);
  }

  function toggleTheme() {
    var current = getTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  // Initialize theme
  setTheme(getTheme());

  themeToggle.addEventListener('click', toggleTheme);

  // ===== Mobile Menu =====
  mobileMenuBtn.addEventListener('click', function () {
    mobileMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navMenu.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenuBtn.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ===== Search =====
  function openSearch() {
    searchOverlay.classList.add('active');
    searchInput.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.classList.remove('active');
    searchResults.innerHTML = '';
    document.body.style.overflow = '';
  }

  searchToggle.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);

  searchOverlay.addEventListener('click', function (e) {
    if (e.target === searchOverlay) {
      closeSearch();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    // Cmd/Ctrl + K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    // Escape to close search
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
      closeSearch();
    }
  });

  // Search functionality
  searchInput.addEventListener('input', function () {
    var query = this.value.toLowerCase().trim();

    if (query.length < 2) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }

    var results = searchIndex.filter(function (item) {
      return item.title.toLowerCase().indexOf(query) !== -1 ||
             item.desc.toLowerCase().indexOf(query) !== -1 ||
             item.keywords.toLowerCase().indexOf(query) !== -1;
    });

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="no-results">No se encontraron resultados para "' + query + '"</div>';
    } else {
      searchResults.innerHTML = results.map(function (item) {
        return '<div class="search-result-item" data-url="' + item.url + '">' +
               '<h4>' + item.title + '</h4>' +
               '<p>' + item.desc + '</p>' +
               '</div>';
      }).join('');

      // Add click handlers to results
      searchResults.querySelectorAll('.search-result-item').forEach(function (item) {
        item.addEventListener('click', function () {
          var url = this.getAttribute('data-url');
          closeSearch();
          if (url) {
            window.location.href = url;
          }
        });
      });
    }

    searchResults.classList.add('active');
  });

  // ===== Guías Tabs =====
  guiaTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = this.getAttribute('data-tab');

      // Update active tab
      guiaTabs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');

      // Show corresponding panel
      guiaPanels.forEach(function (panel) {
        panel.classList.remove('active');
        if (panel.id === target) {
          panel.classList.add('active');
        }
      });
    });
  });

  // ===== Glossary Filter =====
  glosarioTags.forEach(function (tag) {
    tag.addEventListener('click', function () {
      var filter = this.getAttribute('data-filter');

      // Update active tag
      glosarioTags.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');

      // Filter items
      glosarioItems.forEach(function (item) {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // ===== Scroll Handling =====
  var ticking = false;

  function updateActiveNavLink() {
    var scrollPos = window.scrollY + 100;

    var sections = document.querySelectorAll('section[id]');
    var currentSection = '';

    sections.forEach(function (section) {
      var sectionTop = section.offsetTop;
      var sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', function () {
    // Navbar shadow on scroll
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide scroll indicator when scrolled past hero
    if (scrollIndicator && window.scrollY > 100) {
      scrollIndicator.style.opacity = '0';
    } else if (scrollIndicator) {
      scrollIndicator.style.opacity = '0.6';
    }

    // Update active nav link (throttled)
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial call
  updateActiveNavLink();

  // ===== Smooth Scroll for anchor links (fallback for older browsers) =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = navbar.offsetHeight;
        var targetPos = target.offsetTop - navHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===== Animation on Scroll (Intersection Observer) =====
  if ('IntersectionObserver' in window) {
    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe cards
    document.querySelectorAll('.level-card, .fundamento-card, .defi-card, .seguridad-card, .wallet-card, .tool-card, .glosario-item').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

  console.log('🚀 MiCryptoGuía - Ready!');
  console.log('💡 Tip: Press Cmd+K (or Ctrl+K) to search');
  console.log('🌓 Click the sun/moon icon to toggle theme');

})();
