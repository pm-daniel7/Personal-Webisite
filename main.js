/**
 * DANIEL ANDER (PMD) Portfolio Scripts
 * Monospace Minimalist CV inspired by p.cv
 */

(function () {
    "use strict";

    // -------------------------------------------------------------
    // Clean URLs: strip .html and /index.html from address bar
    // -------------------------------------------------------------
    try {
        if (window.location.pathname.endsWith("/index.html") || window.location.pathname === "/index.html") {
            window.history.replaceState(null, "", window.location.pathname.replace(/\/index\.html$/, "/") || "/");
        } else if (window.location.pathname.endsWith(".html")) {
            window.history.replaceState(null, "", window.location.pathname.replace(/\.html$/, ""));
        }
    } catch (e) {}

    // -------------------------------------------------------------
    // 1. Theme Management (Themes 1 to 9 with LocalStorage persistence)
    // -------------------------------------------------------------
    var themeOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    function applyTheme(theme) {
        if (!theme || themeOrder.indexOf(theme) === -1) {
            theme = "1";
        }
        document.documentElement.setAttribute("data-theme", theme);
        try {
            localStorage.setItem("theme", theme);
        } catch (e) {
            // LocalStorage might be disabled in private mode
        }
    }

    function initTheme() {
        var storedTheme = null;
        try {
            storedTheme = localStorage.getItem("theme");
        } catch (e) {}

        if (storedTheme && themeOrder.indexOf(storedTheme) !== -1) {
            applyTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            applyTheme("6"); // Dark theme fallback
        } else {
            applyTheme("1"); // Light theme default
        }
    }

    function cycleTheme() {
        var currentTheme = document.documentElement.getAttribute("data-theme") || "1";
        var currentIndex = themeOrder.indexOf(currentTheme);
        var nextIndex = (currentIndex + 1) % themeOrder.length;
        var nextTheme = themeOrder[nextIndex];
        applyTheme(nextTheme);
    }

    initTheme();

    document.addEventListener("DOMContentLoaded", function () {
        var themeToggle = document.getElementById("theme-toggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", function (e) {
                e.preventDefault();
                cycleTheme();
            });
        }

        // -------------------------------------------------------------
        // 2. Typewriter Cycling (index.html: PRODUCT -> RESEARCH -> STRATEGY -> INNOVATION)
        // -------------------------------------------------------------
        var typewriterText = document.getElementById("typewriter-text");
        if (typewriterText) {
            var words = ["PRODUCT", "RESEARCH", "STRATEGY", "INNOVATION"];
            var wordIndex = 0;
            var isDeleting = false;
            var currentText = words[0];
            typewriterText.textContent = currentText;

            var typeSpeed = 90;
            var deleteSpeed = 50;
            var holdDelay = 1800;
            var pauseBetween = 300;

            function runTypewriter() {
                var targetWord = words[wordIndex];

                if (!isDeleting) {
                    // Typing forward
                    if (currentText.length < targetWord.length) {
                        currentText = targetWord.substring(0, currentText.length + 1);
                        typewriterText.textContent = currentText;
                        setTimeout(runTypewriter, typeSpeed);
                    } else {
                        // Word completely typed, wait before deleting
                        isDeleting = true;
                        setTimeout(runTypewriter, holdDelay);
                    }
                } else {
                    // Deleting backwards
                    if (currentText.length > 0) {
                        currentText = currentText.substring(0, currentText.length - 1);
                        typewriterText.textContent = currentText;
                        setTimeout(runTypewriter, deleteSpeed);
                    } else {
                        // Word completely deleted, switch to next word
                        isDeleting = false;
                        wordIndex = (wordIndex + 1) % words.length;
                        setTimeout(runTypewriter, pauseBetween);
                    }
                }
            }

            // Start cycle after initial hold
            setTimeout(function () {
                isDeleting = true;
                runTypewriter();
            }, holdDelay);
        }

        // -------------------------------------------------------------
        // 3. Portfolio Page Typewriter (portfolio.html: COMING SOON)
        // -------------------------------------------------------------
        var portfolioTypewriter = document.getElementById("portfolio-typewriter");
        if (portfolioTypewriter) {
            var fullMessage = "COMING SOON";
            var charIndex = 0;
            portfolioTypewriter.textContent = "";

            function typePortfolioMessage() {
                if (charIndex < fullMessage.length) {
                    portfolioTypewriter.textContent += fullMessage.charAt(charIndex);
                    charIndex++;
                    setTimeout(typePortfolioMessage, 100);
                }
            }

            setTimeout(typePortfolioMessage, 300);
        }

        // -------------------------------------------------------------
        // 4. MISC Dropdown Sub-List Toggle
        // -------------------------------------------------------------
        var miscToggle = document.getElementById("misc-toggle");
        var miscDropdown = document.getElementById("misc-dropdown");
        var miscIndicator = document.getElementById("misc-toggle-indicator");

        if (miscToggle && miscDropdown) {
            miscToggle.addEventListener("click", function (e) {
                e.preventDefault();
                var isExpanded = miscToggle.getAttribute("aria-expanded") === "true";
                var newState = !isExpanded;

                miscToggle.setAttribute("aria-expanded", newState ? "true" : "false");
                if (newState) {
                    miscDropdown.style.display = "flex";
                    miscToggle.classList.add("is-open");
                    if (miscIndicator) miscIndicator.textContent = "[-]";
                } else {
                    miscDropdown.style.display = "none";
                    miscToggle.classList.remove("is-open");
                    if (miscIndicator) miscIndicator.textContent = "[+]";
                }
            });
        }

        // -------------------------------------------------------------
        // 5. EMAIL Copy to Clipboard & Hover Effects (p.cv style)
        // -------------------------------------------------------------
        var emailCopy = document.getElementById("email-copy");
        var emailAddress = "pmdanielander.com";
        var copyTimeout = null;

        if (emailCopy) {
            var root = document.documentElement;

            function setCopyText(text) {
                root.style.setProperty("--copy-text", '" ' + text + '"');
            }

            emailCopy.addEventListener("mouseenter", function () {
                if (!emailCopy.classList.contains("copied")) {
                    setCopyText("[+]");
                }
            });

            emailCopy.addEventListener("focus", function () {
                if (!emailCopy.classList.contains("copied")) {
                    setCopyText("[+]");
                }
            });

            emailCopy.addEventListener("click", function (e) {
                e.preventDefault();
                copyToClipboard(emailAddress);
                emailCopy.classList.add("copied");
                setCopyText("[COPIED]");

                clearTimeout(copyTimeout);
                copyTimeout = setTimeout(function () {
                    emailCopy.classList.remove("copied");
                    setCopyText("[+]");
                }, 2200);
            });
        }

        function copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).catch(function () {
                    legacyCopy(text);
                });
            } else {
                legacyCopy(text);
            }
        }

        function legacyCopy(text) {
            var textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            textarea.style.top = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand("copy");
            } catch (err) {
                console.warn("Unable to copy to clipboard", err);
            }
            document.body.removeChild(textarea);
        }

        // -------------------------------------------------------------
        // 6. Interactive Prismatic Shard Particles & Dynamic Custom Cursor ("Breaking the Prism")
        // -------------------------------------------------------------
        (function initPrismaticExperience() {
            // Only disable on pure touch / coarse-only pointer devices without mouse
            var isCoarseOnly = window.matchMedia && 
                               window.matchMedia('(pointer: coarse)').matches && 
                               !window.matchMedia('(pointer: fine)').matches;
            if (isCoarseOnly) return;

            // 6A. Dynamic Low-Poly Crystalline Cursor
            var cursorEl = document.createElement("div");
            cursorEl.id = "prism-cursor";
            var defaultSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="facet-tip" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00F5D4"/><stop offset="100%" stop-color="#00BBF9"/></linearGradient><linearGradient id="facet-gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FEE440"/><stop offset="100%" stop-color="#FF9E00"/></linearGradient><linearGradient id="facet-coral" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF5400"/><stop offset="100%" stop-color="#FF0054"/></linearGradient><linearGradient id="facet-magenta" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF007F"/><stop offset="100%" stop-color="#9B5DE5"/></linearGradient><linearGradient id="facet-violet" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7209B7"/><stop offset="100%" stop-color="#3A0CA3"/></linearGradient><linearGradient id="facet-cyan" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4CC9F0"/><stop offset="100%" stop-color="#0077B6"/></linearGradient></defs><g stroke="#FFFFFF" stroke-width="0.65" stroke-linejoin="round" stroke-linecap="round"><polygon points="1,1 11,11 2,16" fill="url(#facet-tip)"/><polygon points="1,1 17,9 11,11" fill="url(#facet-gold)"/><polygon points="11,11 17,9 15,16 11,15" fill="url(#facet-magenta)"/><polygon points="2,16 11,11 8,20" fill="url(#facet-coral)"/><polygon points="11,15 15,16 13,20" fill="url(#facet-violet)"/><polygon points="20,11 23,13 21,15" fill="url(#facet-gold)"/><polygon points="17,19 21,21 18,23" fill="url(#facet-magenta)"/><polygon points="10,23 13,26 9,26" fill="url(#facet-cyan)"/><polygon points="24,19 27,21 25,23" fill="url(#facet-violet)"/><polygon points="20,26 22,27 21,29" fill="url(#facet-tip)" stroke-width="0.5"/></g></svg>';

            var pointerSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="p-tip" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00F5D4"/><stop offset="100%" stop-color="#00BBF9"/></linearGradient><linearGradient id="p-gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FEE440"/><stop offset="100%" stop-color="#FF9E00"/></linearGradient><linearGradient id="p-coral" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF5400"/><stop offset="100%" stop-color="#FF0054"/></linearGradient><linearGradient id="p-magenta" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF007F"/><stop offset="100%" stop-color="#9B5DE5"/></linearGradient><linearGradient id="p-violet" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7209B7"/><stop offset="100%" stop-color="#3A0CA3"/></linearGradient><linearGradient id="p-cyan" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4CC9F0"/><stop offset="100%" stop-color="#0077B6"/></linearGradient></defs><g stroke="#FFFFFF" stroke-width="0.65" stroke-linejoin="round" stroke-linecap="round"><polygon points="7,1 11,5 6,8" fill="url(#p-tip)"/><polygon points="7,1 12,3 11,5" fill="url(#p-gold)"/><polygon points="6,8 11,5 10,13 5,12" fill="url(#p-cyan)"/><polygon points="11,5 14,7 13,13 10,13" fill="url(#p-magenta)"/><polygon points="2,12 5,12 4,16 1,15" fill="url(#p-coral)"/><polygon points="5,12 10,13 8,18 4,16" fill="url(#p-coral)"/><polygon points="10,13 15,13 14,19 8,18" fill="url(#p-magenta)"/><polygon points="14,7 17,9 18,14 15,13" fill="url(#p-gold)"/><polygon points="15,13 18,14 16,19 14,19" fill="url(#p-violet)"/><polygon points="8,18 14,19 12,23 7,21" fill="url(#p-violet)"/><polygon points="21,5 24,7 22,9" fill="url(#p-gold)"/><polygon points="20,13 23,15 21,17" fill="url(#p-magenta)"/><polygon points="14,23 18,25 15,27" fill="url(#p-cyan)"/><polygon points="3,21 6,24 2,24" fill="url(#p-coral)"/><polygon points="22,21 24,22 23,24" fill="url(#p-tip)" stroke-width="0.5"/></g></svg>';

            cursorEl.innerHTML = 
                '<div id="prism-cursor-arrow">' + defaultSvg + '</div>' +
                '<div id="prism-cursor-pointer" style="display:none;">' + pointerSvg + '</div>';
            document.body.appendChild(cursorEl);

            var arrowDiv = document.getElementById("prism-cursor-arrow");
            var pointerDiv = document.getElementById("prism-cursor-pointer");

            // 6B. Full-Screen Canvas for Colorful Prismatic Shards
            var canvas = document.createElement("canvas");
            canvas.id = "prism-canvas";
            canvas.style.position = "fixed";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.width = "100vw";
            canvas.style.height = "100vh";
            canvas.style.pointerEvents = "none";
            canvas.style.zIndex = "999999";
            canvas.style.display = "block";
            document.body.appendChild(canvas);

            var ctx = canvas.getContext("2d");
            var width = window.innerWidth;
            var height = window.innerHeight;
            var dpr = window.devicePixelRatio || 1;

            function resizeCanvas() {
                width = window.innerWidth;
                height = window.innerHeight;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
            }
            resizeCanvas();
            window.addEventListener("resize", resizeCanvas);

            // Vibrant chromatic prism palette matching low-poly crystal facets
            var prismColors = [
                "#00F5D4", // Turquoise / Mint
                "#00BBF9", // Sky Blue
                "#FEE440", // Pure Gold
                "#FF9E00", // Warm Amber
                "#FF5400", // Tangerine / Coral
                "#FF0054", // Crimson Ruby
                "#FF007F", // Neon Magenta
                "#9B5DE5", // Amethyst Violet
                "#7209B7"  // Deep Indigo
            ];

            var shards = [];
            var maxShards = 80;
            var isLoopRunning = false;
            var lastX = -100;
            var lastY = -100;

            function createShard(x, y, isBurst) {
                var color = prismColors[Math.floor(Math.random() * prismColors.length)];
                // Balanced delicate glitter shards matching user refinement
                var size = isBurst ? (Math.random() * 3.5 + 5.5) : (Math.random() * 2 + 3.8);
                var angle = Math.random() * Math.PI * 2;
                var speed = isBurst ? (Math.random() * 2.8 + 1.2) : (Math.random() * 1.0 + 0.35);
                var life = isBurst ? (Math.random() * 26 + 22) : (Math.random() * 20 + 16);

                // Generate an asymmetric crystalline triangle with faceted proportions
                var r1 = size * (Math.random() * 0.4 + 0.8);
                var r2 = size * (Math.random() * 0.5 + 0.6);
                var r3 = size * (Math.random() * 0.6 + 0.7);
                var a1 = 0;
                var a2 = (2 * Math.PI / 3) + (Math.random() - 0.5) * 0.6;
                var a3 = (4 * Math.PI / 3) + (Math.random() - 0.5) * 0.6;

                return {
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed + (isBurst ? 0.35 : 0.15),
                    rot: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.18,
                    color: color,
                    r1: r1, r2: r2, r3: r3,
                    a1: a1, a2: a2, a3: a3,
                    life: life,
                    maxLife: life
                };
            }

            function addBurst(x, y, count) {
                for (var i = 0; i < count; i++) {
                    if (shards.length < maxShards) {
                        shards.push(createShard(x, y, true));
                    }
                }
                wakeLoop();
            }

            function wakeLoop() {
                if (!isLoopRunning) {
                    isLoopRunning = true;
                    requestAnimationFrame(loop);
                }
            }

            function loop() {
                if (shards.length === 0) {
                    ctx.clearRect(0, 0, width, height);
                    isLoopRunning = false;
                    return;
                }

                ctx.clearRect(0, 0, width, height);

                for (var i = shards.length - 1; i >= 0; i--) {
                    var s = shards[i];
                    s.x += s.vx;
                    s.y += s.vy;
                    s.rot += s.vRot;
                    s.vx *= 0.96;
                    s.vy *= 0.96;
                    s.life--;

                    if (s.life <= 0) {
                        shards.splice(i, 1);
                        continue;
                    }

                    var progress = s.life / s.maxLife;
                    var alpha = progress * 0.9;

                    ctx.save();
                    ctx.translate(s.x, s.y);
                    ctx.rotate(s.rot);

                    ctx.beginPath();
                    ctx.moveTo(Math.cos(s.a1) * s.r1, Math.sin(s.a1) * s.r1);
                    ctx.lineTo(Math.cos(s.a2) * s.r2, Math.sin(s.a2) * s.r2);
                    ctx.lineTo(Math.cos(s.a3) * s.r3, Math.sin(s.a3) * s.r3);
                    ctx.closePath();

                    ctx.fillStyle = s.color;
                    ctx.globalAlpha = alpha;
                    ctx.fill();

                    // Crisp luminous prismatic facet border
                    ctx.strokeStyle = "rgba(255, 255, 255, " + (alpha * 0.95) + ")";
                    ctx.lineWidth = 0.75;
                    ctx.stroke();

                    ctx.restore();
                }

                requestAnimationFrame(loop);
            }

            // Mouse tracking: positions custom cursor and emits trailing crystal shards
            window.addEventListener("mousemove", function (e) {
                cursorEl.style.left = e.clientX + "px";
                cursorEl.style.top = e.clientY + "px";
                if (!cursorEl.classList.contains("visible")) {
                    cursorEl.classList.add("visible");
                }

                var dx = e.clientX - lastX;
                var dy = e.clientY - lastY;
                var distSq = dx * dx + dy * dy;

                if (distSq > 30) {
                    lastX = e.clientX;
                    lastY = e.clientY;

                    if (shards.length < maxShards) {
                        shards.push(createShard(e.clientX, e.clientY, false));
                    }
                    wakeLoop();
                }
            }, { passive: true });

            // Interactive element hover detection to switch cursor
            document.addEventListener("mouseover", function (e) {
                var interactive = e.target.closest("a, button, .content-link-anchor, .content-copy, .content-copy-anchor, .content-toggle, .content-switch, .back-link, #ascii-click, [tabindex=\"1\"], [role=\"button\"]");
                var isNoLink = e.target.closest(".content-no-link");

                if (interactive && !isNoLink) {
                    cursorEl.classList.add("is-pointer");
                    if (arrowDiv) arrowDiv.style.display = "none";
                    if (pointerDiv) pointerDiv.style.display = "block";
                } else {
                    cursorEl.classList.remove("is-pointer");
                    if (arrowDiv) arrowDiv.style.display = "block";
                    if (pointerDiv) pointerDiv.style.display = "none";
                }
            });

            document.documentElement.addEventListener("mouseleave", function () {
                cursorEl.classList.remove("visible");
            });
            document.documentElement.addEventListener("mouseenter", function () {
                cursorEl.classList.add("visible");
            });

            // Dynamic burst on click / mousedown
            window.addEventListener("mousedown", function (e) {
                addBurst(e.clientX, e.clientY, Math.floor(Math.random() * 4 + 8));
            }, { passive: true });
        })();
    });
})();
