/**
 * DANIEL ANDER (PMD) Portfolio - Interactive Doom Flame ASCII Art
 * Replicating the exact minimalist interactive feel of p.cv
 *
 * Behavior:
 * - By default, the right side is completely blank (pre text is empty).
 * - On hover over #ascii-click, #ascii-hint displays [ ].
 * - On click & hold (mousedown) on #ascii-click, #ascii-hint displays [*],
 *   and the Doom Flame burns upward in ASCII characters: '...::/\/\/\+=*abcdef01XYZ#'.
 * - On mouseup or mouseleave, #ascii-hint returns to [ ] and the flame cools down
 *   and disappears completely back to an empty string.
 * - Responsive: hidden on mobile (<768px), consuming zero resources.
 */

(function () {
    "use strict";

    var asciiContainer = document.getElementById("ascii");
    var pre = asciiContainer ? asciiContainer.querySelector("pre") : null;
    var asciiHint = document.getElementById("ascii-hint");
    var asciiClick = document.getElementById("ascii-click");

    if (!asciiContainer || !pre) {
        return;
    }

    var flameChars = "...::/\\/\\/\\+=*abcdef01XYZ#";
    var cols = 64;
    var rows = 26;
    var charWidth = 9.63;
    var lineHeight = 24;

    var isPlaying = false;
    var isRunning = false;
    var animFrameId = null;
    var lastTime = 0;
    var targetFPS = 32;
    var frameDuration = 1000 / targetFPS;

    var data = [];
    var noise = valueNoise();

    // -------------------------------------------------------------------------
    // 1. Font Metrics & Grid Calculation
    // -------------------------------------------------------------------------
    function updateMetrics() {
        if (!document.body) return;
        var testSpan = document.createElement("span");
        testSpan.style.fontFamily = "inherit";
        testSpan.style.fontSize = "inherit";
        testSpan.style.lineHeight = "inherit";
        testSpan.style.position = "absolute";
        testSpan.style.visibility = "hidden";
        testSpan.style.whiteSpace = "pre";
        testSpan.textContent = "MMMMMMMMMMMMMMMMMMMM";
        document.body.appendChild(testSpan);

        var rect = testSpan.getBoundingClientRect();
        if (rect.width > 0) {
            charWidth = rect.width / 20;
        }
        var computedStyle = window.getComputedStyle(pre);
        var parsedLineHeight = parseFloat(computedStyle.lineHeight);
        if (!isNaN(parsedLineHeight) && parsedLineHeight > 0) {
            lineHeight = parsedLineHeight;
        }
        document.body.removeChild(testSpan);

        var cRect = asciiContainer.getBoundingClientRect();
        if (cRect.width > 0 && cRect.height > 0) {
            cols = Math.max(20, Math.floor(cRect.width / charWidth));
            rows = Math.max(10, Math.floor(cRect.height / lineHeight));
        } else {
            cols = 64;
            rows = 24;
        }

        var total = cols * rows;
        if (data.length !== total) {
            data = new Array(total).fill(0);
        }
    }

    // -------------------------------------------------------------------------
    // 2. Math Helpers: Clamp, Map, Linear Interpolation & Value Noise
    // -------------------------------------------------------------------------
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function map(v, inMin, inMax, outMin, outMax) {
        return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
    }

    function mix(a, b, t) {
        return a * (1 - t) + b * t;
    }

    function smoothstep(e0, e1, x) {
        var t = clamp((x - e0) / (e1 - e0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    }

    function rndi(a, b) {
        if (b === undefined) {
            b = 0;
        }
        if (a > b) {
            var temp = a; a = b; b = temp;
        }
        return Math.floor(a + Math.random() * (b - a + 1));
    }

    function valueNoise() {
        var tableSize = 256;
        var r = new Array(tableSize);
        var permutationTable = new Array(tableSize * 2);

        for (var k = 0; k < tableSize; k++) {
            r[k] = Math.random();
            permutationTable[k] = k;
        }

        for (var j = 0; j < tableSize; j++) {
            var randIdx = Math.floor(Math.random() * tableSize);
            var swap = permutationTable[j];
            permutationTable[j] = permutationTable[randIdx];
            permutationTable[randIdx] = swap;
            permutationTable[j + tableSize] = permutationTable[j];
        }

        return function (px, py) {
            var xi = Math.floor(px);
            var yi = Math.floor(py);

            var tx = px - xi;
            var ty = py - yi;

            var rx0 = ((xi % tableSize) + tableSize) % tableSize;
            var rx1 = (rx0 + 1) % tableSize;
            var ry0 = ((yi % tableSize) + tableSize) % tableSize;
            var ry1 = (ry0 + 1) % tableSize;

            var c00 = r[permutationTable[permutationTable[rx0] + ry0]];
            var c10 = r[permutationTable[permutationTable[rx1] + ry0]];
            var c01 = r[permutationTable[permutationTable[rx0] + ry1]];
            var c11 = r[permutationTable[permutationTable[rx1] + ry1]];

            var sx = smoothstep(0, 1, tx);
            var sy = smoothstep(0, 1, ty);

            var nx0 = mix(c00, c10, sx);
            var nx1 = mix(c01, c10, sx);

            return mix(nx0, nx1, sy);
        };
    }

    // -------------------------------------------------------------------------
    // 3. Flame Simulation & Monospace Frame Rendering
    // -------------------------------------------------------------------------
    function stepFlame(currentTime) {
        var last = cols * (rows - 1);
        var t = currentTime * 0.0015;

        // 1. Generate bottom fire when user is holding click (matching p.cv rate)
        if (isPlaying) {
            for (var i = 0; i < cols; i++) {
                var noiseVal = noise(i * 0.05, t);
                var val = Math.floor(map(noiseVal, 0, 1, 5, 40));
                data[last + i] = Math.min(val, data[last + i] + 2);
            }
        }

        // 2. Propagate heat upward towards the ceiling with randomness (single pass per frame)
        var activeCount = 0;
        var decayMin = isPlaying ? 0 : 1;
        var decayMax = isPlaying ? 2 : 3;

        for (var idx = 0; idx < data.length; idx++) {
            var row = Math.floor(idx / cols);
            var col = idx % cols;
            var src = Math.min(rows - 1, row + 1) * cols + clamp(col + rndi(-1, 1), 0, cols - 1);
            var decay = rndi(decayMin, decayMax);
            var cooled = Math.max(0, data[src] - decay);
            data[idx] = cooled;
            if (cooled > 0) activeCount++;
        }

        return activeCount;
    }

    function renderFlame() {
        var hasActive = false;
        var maxFlameIdx = flameChars.length - 1;
        var lines = [];

        for (var r = 0; r < rows; r++) {
            var lineChars = [];
            var rowStart = r * cols;
            for (var c = 0; c < cols; c++) {
                var u = data[rowStart + c];
                if (!u || u === 0) {
                    lineChars.push(" ");
                } else {
                    hasActive = true;
                    var chIdx = clamp(u, 0, maxFlameIdx);
                    lineChars.push(flameChars.charAt(chIdx));
                }
            }
            lines.push(lineChars.join(""));
        }

        if (!hasActive && !isPlaying) {
            pre.textContent = "";
            return false;
        }

        pre.textContent = lines.join("\n");
        return true;
    }

    // -------------------------------------------------------------------------
    // 4. Main Animation Loop
    // -------------------------------------------------------------------------
    function loop(currentTime) {
        if (!isRunning) return;

        var elapsed = currentTime - lastTime;
        if (elapsed >= frameDuration) {
            lastTime = currentTime - (elapsed % frameDuration);

            stepFlame(currentTime);
            var hasContent = renderFlame();

            // If not playing and flame has cooled down completely, pause loop to save CPU
            if (!isPlaying && !hasContent) {
                isRunning = false;
                pre.textContent = "";
                return;
            }
        }

        animFrameId = requestAnimationFrame(loop);
    }

    function startAnimation() {
        if (window.innerWidth <= 1024) return;
        updateMetrics();
        // Immediately inject and render first frame
        stepFlame(performance.now());
        renderFlame();

        if (!isRunning) {
            isRunning = true;
            lastTime = performance.now() - frameDuration;
            animFrameId = requestAnimationFrame(loop);
        }
    }

    // -------------------------------------------------------------------------
    // 5. Interactive Event Listeners matching p.cv
    // -------------------------------------------------------------------------
    var target = asciiClick || asciiContainer;

    if (target) {
        target.addEventListener("mouseenter", function () {
            if (window.innerWidth <= 1024) return;
            if (asciiHint) {
                asciiHint.classList.add("show");
                asciiHint.innerHTML = "[&nbsp;]";
            }
        });

        target.addEventListener("mouseleave", function () {
            if (asciiHint) {
                asciiHint.classList.remove("show");
            }
            if (isPlaying) {
                isPlaying = false;
            }
        });

        target.addEventListener("mousedown", function (e) {
            if (window.innerWidth <= 1024) return;
            e.preventDefault();
            isPlaying = true;
            if (asciiHint) {
                asciiHint.innerHTML = "[*]";
            }
            startAnimation();
        });

        function onRelease() {
            if (asciiHint) {
                asciiHint.innerHTML = "[&nbsp;]";
            }
            isPlaying = false;
        }

        target.addEventListener("mouseup", onRelease);
        window.addEventListener("mouseup", onRelease);
        document.addEventListener("mouseup", onRelease);

        // Touch support
        target.addEventListener("touchstart", function (e) {
            if (window.innerWidth <= 1024) return;
            isPlaying = true;
            if (asciiHint) {
                asciiHint.classList.add("show");
                asciiHint.innerHTML = "[*]";
            }
            startAnimation();
        }, { passive: true });

        target.addEventListener("touchend", function () {
            isPlaying = false;
            if (asciiHint) {
                asciiHint.innerHTML = "[&nbsp;]";
            }
        });
    }

    // Window resize handling
    window.addEventListener("resize", function () {
        if (window.innerWidth <= 1024) {
            isPlaying = false;
            isRunning = false;
            if (animFrameId) cancelAnimationFrame(animFrameId);
            pre.textContent = "";
        } else {
            updateMetrics();
        }
    });

    // Initialize metrics and start with blank/empty pre
    updateMetrics();
    pre.textContent = "";
})();
