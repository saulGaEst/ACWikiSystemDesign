// Wiki Design System Scripts
document.addEventListener('DOMContentLoaded', function () {

    // ========================================
    // NAVEGACIÓN Y SIDEBAR
    // ========================================

    // Smooth scrolling para enlaces internos
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Calcular offset considerando el header fijo
                const headerHeight = document.querySelector('.wiki-header').offsetHeight;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Actualizar estado activo en sidebar
                updateActiveNavLink(this);

                // Cerrar sidebar en móvil después de hacer click
                if (window.innerWidth < 992) {
                    const sidebarCollapse = document.getElementById('sidebarContent');
                    if (sidebarCollapse && sidebarCollapse.classList.contains('show')) {
                        const bsCollapse = bootstrap.Collapse.getInstance(sidebarCollapse);
                        if (bsCollapse) {
                            bsCollapse.hide();
                        }
                    }
                }
            }
        });
    });

    // Actualizar enlace activo en sidebar
    function updateActiveNavLink(activeLink) {
        // Remover clase active de todos los enlaces
        document.querySelectorAll('.sidebar-nav a, .list-group-item').forEach(link => {
            link.classList.remove('active');
        });

        // Agregar clase active al enlace clickeado
        activeLink.classList.add('active');
    }

    // Detectar sección visible al hacer scroll
    const sections = document.querySelectorAll('.wiki-section');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a[data-section], .list-group-item[data-section]');

    function updateActiveSection() {
        let currentSection = '';
        const headerHeight = document.querySelector('.wiki-header').offsetHeight;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= headerHeight + 100 && rect.bottom >= headerHeight + 100) {
                currentSection = section.id;
            }
        });

        // Actualizar sidebar
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', throttle(updateActiveSection, 100));

    // ========================================
    // BÚSQUEDA
    // ========================================

    const searchInput = document.getElementById('searchInput');
    const searchableElements = document.querySelectorAll('.wiki-section, .nav-section a');

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();

            if (searchTerm === '') {
                // Mostrar todo si no hay búsqueda
                showAllSections();
                return;
            }

            // Filtrar contenido
            filterContent(searchTerm);
        });
    }

    function filterContent(searchTerm) {
        sections.forEach(section => {
            const sectionText = section.textContent.toLowerCase();
            const sectionTitle = section.querySelector('h2')?.textContent.toLowerCase() || '';

            if (sectionText.includes(searchTerm) || sectionTitle.includes(searchTerm)) {
                section.style.display = 'block';
                highlightSearchTerm(section, searchTerm);
            } else {
                section.style.display = 'none';
            }
        });

        // Filtrar enlaces del sidebar
        sidebarLinks.forEach(link => {
            const linkText = link.textContent.toLowerCase();
            const listItem = link.closest('li');

            if (linkText.includes(searchTerm)) {
                listItem.style.display = 'block';
            } else {
                listItem.style.display = 'none';
            }
        });
    }

    function showAllSections() {
        sections.forEach(section => {
            section.style.display = 'block';
            removeHighlights(section);
        });

        sidebarLinks.forEach(link => {
            link.closest('li').style.display = 'block';
        });
    }

    function highlightSearchTerm(element, term) {
        // Implementación básica de highlight
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;

        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const regex = new RegExp(`(${term})`, 'gi');

            if (regex.test(text)) {
                const highlightedText = text.replace(regex, '<mark>$1</mark>');
                const span = document.createElement('span');
                span.innerHTML = highlightedText;
                textNode.parentNode.replaceChild(span, textNode);
            }
        });
    }

    function removeHighlights(element) {
        const marks = element.querySelectorAll('mark');
        marks.forEach(mark => {
            mark.outerHTML = mark.innerHTML;
        });
    }

    // ========================================
    // THEME TOGGLE
    // ========================================

    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('wiki-theme') || 'light';
    setTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            localStorage.setItem('wiki-theme', newTheme);
        });
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="bi bi-sun me-1"></i><span class="d-none d-lg-inline">Tema</span>';
            }
        } else {
            body.classList.remove('dark-theme');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="bi bi-moon-stars me-1"></i><span class="d-none d-lg-inline">Tema</span>';
            }
        }
    }

    // ========================================
    // VEHICLE CARDS INTERACTIVITY
    // ========================================

    // Funcionalidad para botones de compartir en tarjetas de vehículos
    const shareButtons = document.querySelectorAll('.vehicle-card .btn-group .btn[title="Compartir"]');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const url = window.location.href;
            
            // Copiar al portapapeles
            navigator.clipboard.writeText(url).then(() => {
                // Cambiar icono temporalmente
                const icon = this.querySelector('i');
                const originalClass = icon.className;
                icon.className = 'fa fa-check';
                this.classList.remove('btn-outline-secondary');
                this.classList.add('btn-success');
                
                setTimeout(() => {
                    icon.className = originalClass;
                    this.classList.remove('btn-success');
                    this.classList.add('btn-outline-secondary');
                }, 2000);
            }).catch(() => {
                alert('Enlace: ' + url);
            });
        });
    });

    // Funcionalidad para botones de favoritos
    const favoriteButtons = document.querySelectorAll('.vehicle-card .btn-group .btn[title="Favoritos"]');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.classList.contains('btn-danger')) {
                // Quitar de favoritos
                this.classList.remove('btn-danger');
                this.classList.add('btn-outline-secondary');
            } else {
                // Agregar a favoritos
                this.classList.remove('btn-outline-secondary');
                this.classList.add('btn-danger');
            }
        });
    });

    // Funcionalidad para botones de contacto
    const contactButtons = document.querySelectorAll('.vehicle-card .btn-group .btn[title="Contactar"]');
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Función de contacto - En un proyecto real aquí se abriría un modal o formulario de contacto');
        });
    });

    // ========================================
    // BRAND CARDS INTERACTIVITY
    // ========================================

    // Animación para las tarjetas de marcas
    const brandCards = document.querySelectorAll('.brand-card-modern');
    
    brandCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Agregar efecto de vibración sutil al logo
            const logo = this.querySelector('.brand-logo');
            if (logo) {
                logo.style.animation = 'subtle-bounce 0.6s ease';
            }
        });

        card.addEventListener('mouseleave', function() {
            const logo = this.querySelector('.brand-logo');
            if (logo) {
                logo.style.animation = '';
            }
        });
    });

    // Funcionalidad para botones explorar
    const exploreButtons = document.querySelectorAll('.btn-explore');
    exploreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // En producción, aquí navegaría a la página de la marca
            const brandCard = this.closest('.brand-card-modern');
            const brandTitle = brandCard.querySelector('.brand-title')?.textContent;
            
            if (brandTitle && window.location.hash === '#brands-catalog') {
                e.preventDefault();
                console.log(`Navegando a la marca: ${brandTitle}`);
                // Aquí iría la navegación real
            }
        });
    });

    // Agregar estilos de animación para el logo
    if (!document.getElementById('brand-animations')) {
        const style = document.createElement('style');
        style.id = 'brand-animations';
        style.textContent = `
            @keyframes subtle-bounce {
                0%, 100% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.05) rotate(-3deg); }
                50% { transform: scale(1.1) rotate(3deg); }
                75% { transform: scale(1.05) rotate(-2deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // COPY TO CLIPBOARD
    // ========================================

    // Agregar botón de copiar a los bloques de código
    const codeBlocks = document.querySelectorAll('.code-example pre');

    codeBlocks.forEach(codeBlock => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '📋 Copiar';
        copyButton.title = 'Copiar código';

        const codeExample = codeBlock.closest('.code-example');
        const header = codeExample.querySelector('h4');

        if (header) {
            header.appendChild(copyButton);
        }

        copyButton.addEventListener('click', function () {
            const code = codeBlock.querySelector('code');
            const text = code ? code.textContent : codeBlock.textContent;

            navigator.clipboard.writeText(text).then(() => {
                copyButton.innerHTML = '✅ Copiado';
                copyButton.style.background = 'var(--success)';

                setTimeout(() => {
                    copyButton.innerHTML = '📋 Copiar';
                    copyButton.style.background = '';
                }, 2000);
            }).catch(() => {
                // Fallback para navegadores sin clipboard API
                fallbackCopyTextToClipboard(text);
            });
        });
    });

    // Funcionalidad para botones de copiar en tabs
    const copyCodeButtons = document.querySelectorAll('.copy-code-btn');
    
    copyCodeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const codeElement = document.getElementById(targetId);
            
            if (codeElement) {
                const text = codeElement.textContent;
                const originalHTML = this.innerHTML;
                
                navigator.clipboard.writeText(text).then(() => {
                    this.innerHTML = '<i class="fa fa-check mr-1"></i> Copiado';
                    this.classList.remove('btn-primary');
                    this.classList.add('btn-success');
                    
                    setTimeout(() => {
                        this.innerHTML = originalHTML;
                        this.classList.remove('btn-success');
                        this.classList.add('btn-primary');
                    }, 2000);
                }).catch(() => {
                    fallbackCopyTextToClipboard(text);
                });
            }
        });
    });

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Error al copiar texto: ', err);
        }

        document.body.removeChild(textArea);
    }

    // ========================================
    // RESPONSIVE SIDEBAR
    // ========================================
    
    let sidebarVisible = window.innerWidth > 768;

    // Toggle sidebar en móviles
    function toggleSidebar() {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('sidebar-mobile-open');
            sidebarVisible = !sidebarVisible;
        }
    }

    // Cerrar sidebar al hacer click fuera en móviles
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 768 &&
            !sidebar.contains(e.target) &&
            !e.target.closest('.sidebar-toggle')) {
            sidebar.classList.remove('sidebar-mobile-open');
            sidebarVisible = false;
        }
    });

    // Ajustar layout en resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('sidebar-mobile-open');
            sidebarVisible = true;
        }
    });

    // ========================================
    // UTILIDADES
    // ========================================

    // Throttle function para optimizar scroll
    function throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Lazy loading para imágenes
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Inicialización completa
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('show');
        });

        // Cerrar sidebar al hacer click fuera
        document.addEventListener('click', function (e) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }

    const copyButtons = document.querySelectorAll('.btn-copy-simple');

    copyButtons.forEach(button => {
        button.onclick = function () {
            const color = this.getAttribute('data-color');
            copyColor(color, this);
        };
    });
    function copyColor(color, button) {
        console.log('Intentando copiar:', color);

        // Crear elemento temporal
        const tempInput = document.createElement('input');
        tempInput.value = color;
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); // Para móviles

        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(tempInput);

            if (successful) {
                // Mostrar feedback visual
                const colorItem = button.closest('.color-item-simple');
                colorItem.style.backgroundColor = '#28a745';
                colorItem.style.color = 'white';

                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-check';
                }

                // Restaurar después de 1.5 segundos
                setTimeout(() => {
                    colorItem.style.backgroundColor = '';
                    colorItem.style.color = '';
                    if (icon) {
                        icon.className = 'fas fa-copy';
                    }
                }, 1500);

                console.log('¡Color copiado!');
            } else {
                alert('Color: ' + color + ' (copia manual)');
            }
        } catch (err) {
            document.body.removeChild(tempInput);
            alert('Color: ' + color + ' (copia manual)');
            console.error('Error:', err);
        }
    }

    // ========================================
    // ESTILOS ADICIONALES PARA DARK THEME (inyectar dinámicamente)
    // ========================================
    
    // Agregar estilos CSS para tema oscuro dinámicamente (solo una vez)
    if (!document.getElementById('darkThemeStyles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'darkThemeStyles';
        styleSheet.textContent = `
    .dark-theme {
        --gray-100: #1a1a1a;
        --gray-200: #2d2d2d;
        --gray-300: #404040;
        --gray-400: #525252;
        --gray-500: #737373;
        --gray-600: #a3a3a3;
        --gray-700: #d4d4d4;
        --gray-800: #f5f5f5;
    }
    
    .dark-theme body {
        background-color: var(--gray-100);
        color: var(--gray-700);
    }
    
    .dark-theme .wiki-header,
    .dark-theme .wiki-sidebar,
    .dark-theme .wiki-section {
        background-color: var(--gray-200);
        border-color: var(--gray-300);
    }
    
    .dark-theme .form-input,
    .dark-theme .form-select,
    .dark-theme .form-textarea {
        background-color: var(--gray-300);
        border-color: var(--gray-400);
        color: var(--gray-700);
    }
    
    .dark-theme .principle-card,
    .dark-theme .color-item {
        background-color: var(--gray-300);
    }
    
    .copy-button {
        background: var(--primary-blue);
        color: white;
        border: none;
        padding: var(--space-1) var(--space-2);
        border-radius: 4px;
        font-size: 0.75rem;
        cursor: pointer;
        margin-left: var(--space-3);
        transition: background var(--transition-fast);
    }
    
    .copy-button:hover {
        background: var(--primary-dark);
    }
    
    @media (max-width: 768px) {
        .wiki-main {
            margin-left: 0;
        }
        
        .wiki-sidebar {
            transform: translateX(-100%);
            transition: transform var(--transition-normal);
        }
        
        .wiki-sidebar.sidebar-mobile-open {
            transform: translateX(0);
        }
        
        .wiki-footer {
            margin-left: 0;
        }
        
        .credit-simulator {
            grid-template-columns: 1fr;
        }
        
        .hero-stats {
            flex-direction: column;
            gap: var(--space-6);
        }
        
        .typography-showcase {
            grid-template-columns: 1fr;
        }
        
        .color-palette {
            grid-template-columns: 1fr;
        }
    }
`;
        document.head.appendChild(styleSheet);
    }

    // ========================================
    // ACTION CARDS - Quick Actions
    // ========================================
    
    const actionCards = document.querySelectorAll('.hover-effect');
    
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            // Obtener el título de la card desde el texto
            const cardText = this.textContent;
            
            // Mapear contenido a secciones
            let targetSection = '';
            
            if (cardText.includes('Componentes UI')) {
                targetSection = 'botones';
            } else if (cardText.includes('Guía de Estilos')) {
                targetSection = 'colores';
            } else if (cardText.includes('Código de Ejemplo')) {
                targetSection = 'botones';
            } else if (cardText.includes('Rendimiento') || cardText.includes('Seguridad') || cardText.includes('Responsive')) {
                targetSection = 'principios';
            }
            
            if (targetSection) {
                const element = document.getElementById(targetSection);
                if (element) {
                    const headerHeight = document.querySelector('.wiki-header').offsetHeight;
                    const elementPosition = element.offsetTop;
                    const offsetPosition = elementPosition - headerHeight - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
        
        // Agregar efecto ripple al hacer click
        card.addEventListener('mousedown', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // ============================================================
    // CREDIT SIMULATOR - Custom Sliders
    // ============================================================
    
    const vehiclePrice = 450000; // Precio del vehículo
    let downPayment = 10000;     // Enganche inicial
    let loanTerm = 48;            // Plazo en meses
    
    // Función para inicializar sliders personalizados
    function initializeSlider(sliderId, min, max, value, step, callback) {
        console.log('Inicializando slider:', sliderId);
        const container = document.getElementById(sliderId);
        console.log('Container encontrado:', container);
        if (!container) {
            console.error('No se encontró el contenedor para:', sliderId);
            return;
        }
        
        const sliderHTML = `
            <div class="custom-slider">
                <div class="slider-track"></div>
                <div class="slider-fill"></div>
                <div class="slider-thumb" tabindex="0"></div>
            </div>
        `;
        
        container.innerHTML = sliderHTML;
        
        const slider = container.querySelector('.custom-slider');
        const thumb = slider.querySelector('.slider-thumb');
        const fill = slider.querySelector('.slider-fill');
        let isDragging = false;
        
        // Función para actualizar posición del slider
        function updateSlider(clientX) {
            const rect = slider.getBoundingClientRect();
            let percent = (clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));
            
            // Calcular valor basado en el porcentaje
            let newValue = min + (percent * (max - min));
            
            // Aplicar step
            if (step) {
                newValue = Math.round(newValue / step) * step;
            }
            
            newValue = Math.max(min, Math.min(max, newValue));
            
            // Actualizar UI
            const actualPercent = ((newValue - min) / (max - min)) * 100;
            thumb.style.left = actualPercent + '%';
            fill.style.width = actualPercent + '%';
            
            // Callback con el nuevo valor
            if (callback) callback(newValue);
            
            return newValue;
        }
        
        // Event listeners para mouse
        thumb.addEventListener('mousedown', function(e) {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                updateSlider(e.clientX);
            }
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // Event listeners para touch
        thumb.addEventListener('touchstart', function(e) {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', function(e) {
            if (isDragging) {
                updateSlider(e.touches[0].clientX);
            }
        });
        
        document.addEventListener('touchend', function() {
            isDragging = false;
        });
        
        // Click en la barra para mover el thumb
        slider.addEventListener('click', function(e) {
            if (e.target !== thumb) {
                updateSlider(e.clientX);
            }
        });
        
        // Keyboard support
        thumb.addEventListener('keydown', function(e) {
            let currentValue = ((parseFloat(thumb.style.left) || 0) / 100) * (max - min) + min;
            let newValue = currentValue;
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                newValue = currentValue - (step || 1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                newValue = currentValue + (step || 1);
                e.preventDefault();
            }
            
            newValue = Math.max(min, Math.min(max, newValue));
            const percent = ((newValue - min) / (max - min)) * 100;
            thumb.style.left = percent + '%';
            fill.style.width = percent + '%';
            
            if (callback) callback(newValue);
        });
        
        // Inicializar posición
        const initialPercent = ((value - min) / (max - min)) * 100;
        thumb.style.left = initialPercent + '%';
        fill.style.width = initialPercent + '%';
    }
    
    // Función para calcular el pago mensual
    function calculatePayment() {
        const interestRateElement = document.getElementById('interestRate');
        if (!interestRateElement) return;
        
        const annualRate = parseFloat(interestRateElement.value);
        const monthlyRate = annualRate / 100 / 12;
        const principal = vehiclePrice - downPayment;
        const months = loanTerm;
        
        // Fórmula de pago mensual: P * [r(1+r)^n] / [(1+r)^n - 1]
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                              (Math.pow(1 + monthlyRate, months) - 1);
        
        const totalPayment = monthlyPayment * months;
        const totalInterest = totalPayment - principal;
        
        // Actualizar UI
        document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
        document.getElementById('financedAmount').textContent = formatCurrency(principal);
        document.getElementById('totalPayment').textContent = formatCurrency(totalPayment);
        document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    }
    
    // Función para formatear moneda
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    // Inicializar sliders cuando el DOM esté listo
    // Usar setTimeout para asegurar que todos los elementos estén cargados
    console.log('Intentando inicializar sliders...');
    
    setTimeout(function() {
        console.log('setTimeout ejecutado');
        const regularSliderElement = document.getElementById('regularSlider');
        const stepSliderElement = document.getElementById('stepSlider');
        console.log('regularSlider element:', regularSliderElement);
        console.log('stepSlider element:', stepSliderElement);
        
        if (regularSliderElement && stepSliderElement) {
            console.log('Ambos elementos encontrados, inicializando sliders...');
            
            // Slider de enganche: $10,000 - $200,000
            initializeSlider('regularSlider', 10000, 200000, 10000, 1000, function(value) {
                downPayment = value;
                document.getElementById('regularSliderAmount').textContent = formatCurrency(value);
                calculatePayment();
            });
            
            // Slider de plazo: 12 - 72 meses
            initializeSlider('stepSlider', 12, 72, 48, 6, function(value) {
                loanTerm = value;
                document.getElementById('stepSliderAmount').textContent = value;
                calculatePayment();
            });
            
            // Event listener para cambio de tasa de interés
            const interestRateElement = document.getElementById('interestRate');
            if (interestRateElement) {
                interestRateElement.addEventListener('change', calculatePayment);
            }
            
            // Calcular pago inicial
            calculatePayment();
            console.log('Sliders inicializados correctamente');
        } else {
            console.error('No se encontraron los elementos del slider');
        }
    }, 300);

    // Form validation for contact form
    var contactForm = document.getElementById('contactFormExample');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            if (contactForm.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            }
            contactForm.classList.add('was-validated');
        }, false);
    }

    // Estado/Municipio cascade functionality
    var estadoSelect = document.getElementById('contactEstado');
    var municipioSelect = document.getElementById('contactMunicipio');
    
    if (estadoSelect && municipioSelect) {
        estadoSelect.addEventListener('change', function() {
            var estado = this.value;
            var municipios = [];

            // Map of estados to municipios
            var estadoMunicipios = {
                'cdmx': ['Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuajimalpa', 'Cuauhtémoc', 'Gustavo A. Madero', 'Iztacalco', 'Iztapalapa', 'Magdalena Contreras', 'Miguel Hidalgo', 'Milpa Alta', 'Tláhuac', 'Tlalpan', 'Venustiano Carranza', 'Xochimilco'],
                'jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco de Zúñiga', 'El Salto', 'Puerto Vallarta', 'Lagos de Moreno'],
                'nuevo-leon': ['Monterrey', 'San Pedro Garza García', 'Santa Catarina', 'Guadalupe', 'San Nicolás de los Garza', 'Apodaca', 'General Escobedo', 'Juárez'],
                'mexico': ['Toluca', 'Ecatepec', 'Naucalpan', 'Nezahualcóyotl', 'Tlalnepantla', 'Atizapán de Zaragoza', 'Cuautitlán Izcalli', 'Chimalhuacán'],
                'guanajuato': ['León', 'Irapuato', 'Celaya', 'Salamanca', 'Guanajuato', 'San Miguel de Allende', 'Pénjamo', 'Dolores Hidalgo'],
                'puebla': ['Puebla', 'Tehuacán', 'San Martín Texmelucan', 'Atlixco', 'Cholula', 'Teziutlán', 'Cuautlancingo'],
                'queretaro': ['Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués', 'Tequisquiapan'],
                'chihuahua': ['Chihuahua', 'Ciudad Juárez', 'Cuauhtémoc', 'Delicias', 'Parral', 'Nuevo Casas Grandes'],
                'sonora': ['Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado', 'Navojoa', 'Guaymas'],
                'veracruz': ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Córdoba', 'Poza Rica', 'Orizaba', 'Boca del Río'],
                'yucatan': ['Mérida', 'Valladolid', 'Tizimín', 'Progreso', 'Kanasín', 'Umán']
            };

            municipios = estadoMunicipios[estado] || [];

            // Clear and update municipio select
            municipioSelect.innerHTML = '<option selected disabled>Seleccionar...</option>';
            
            municipios.forEach(function(municipio) {
                var option = document.createElement('option');
                option.value = municipio.toLowerCase().replace(/ /g, '-');
                option.textContent = municipio;
                municipioSelect.appendChild(option);
            });

            municipioSelect.disabled = municipios.length === 0;
        });
    }

}); // Fin del DOMContentLoaded