 const N = 9;
        const gridEl = document.getElementById("grid");
        const btnNew = document.getElementById("newGame");
        const timerEl = document.getElementById("timer");

        let solution = emptyBoard();
        let puzzle = emptyBoard();
        let current = emptyBoard();
        let timerInterval = null;
        let seconds = 0;
        let timerStarted = false;
        let gameFinished = false;

        initUI();
        initGame();

        btnNew.addEventListener("click", () => {
            resetTimer();
            initGame();
        });

        /* ================= TIMER ================= */

        function startTimer() {
            if (timerStarted) return;
            timerStarted = true;
            timerInterval = setInterval(() => {
                if (!gameFinished) {
                    seconds++;
                    updateTimerDisplay();
                }
            }, 1000);
        }

        function stopTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }

        function resetTimer() {
            stopTimer();
            seconds = 0;
            timerStarted = false;
            gameFinished = false;
            updateTimerDisplay();
        }

        function updateTimerDisplay() {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        function checkGameFinished() {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (current[r][c] === 0) return false;
                    const v = current[r][c];
                    let isValid = true;
                    
                    for (let i = 0; i < 9; i++) {
                        if (i !== c && current[r][i] === v) {
                            isValid = false;
                            break;
                        }
                    }
                    
                    for (let i = 0; i < 9; i++) {
                        if (i !== r && current[i][c] === v) {
                            isValid = false;
                            break;
                        }
                    }
                    
                    const br = Math.floor(r / 3) * 3;
                    const bc = Math.floor(c / 3) * 3;
                    for (let rr = br; rr < br + 3; rr++) {
                        for (let cc = bc; cc < bc + 3; cc++) {
                            if ((rr !== r || cc !== c) && current[rr][cc] === v) {
                                isValid = false;
                                break;
                            }
                        }
                    }
                    
                    if (!isValid) return false;
                }
            }
            return true;
        }

        /* ================= UI ================= */

        function initUI() {
            gridEl.innerHTML = "";
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const inp = document.createElement("input");
                    inp.className = "cell";
                    inp.type = "text";
                    inp.inputMode = "numeric";
                    inp.maxLength = 1;
                    inp.dataset.r = r;
                    inp.dataset.c = c;

                    if (c === 2 || c === 5 || c === 8) inp.classList.add("bR");
                    if (r === 2 || r === 5 || r === 8) inp.classList.add("bB");

                    inp.addEventListener("keypress", e => {
                        if (e.key.length === 1 && !/[1-9]/.test(e.key)) {
                            e.preventDefault();
                        }
                    });

                    inp.addEventListener("input", () => {
                        if (inp.classList.contains("given")) return;
                        const r = +inp.dataset.r;
                        const c = +inp.dataset.c;
                        if (inp.value !== "" && !/^[1-9]$/.test(inp.value)) {
                            inp.value = "";
                        }
                        current[r][c] = inp.value === "" ? 0 : Number(inp.value);
                        inp.classList.remove("bad");
                    });

                    inp.addEventListener("keydown", e => {
                        const r = +inp.dataset.r;
                        const c = +inp.dataset.c;
                        const go = (rr, cc) => {
                            const next = gridEl.querySelector(`.cell[data-r="${rr}"][data-c="${cc}"]`);
                            if (next) next.focus();
                        };

                        if (e.key === "ArrowUp") { e.preventDefault(); go(Math.max(0, r-1), c); }
                        if (e.key === "ArrowDown") { e.preventDefault(); go(Math.min(8, r+1), c); }
                        if (e.key === "ArrowLeft") { e.preventDefault(); go(r, Math.max(0, c-1)); }
                        if (e.key === "ArrowRight") { e.preventDefault(); go(r, Math.min(8, c+1)); }

                        if (e.key === "Backspace" || e.key === "Delete") {
                            inp.value = "";
                            current[r][c] = 0;
                            inp.classList.remove("bad");
                        }

                        if (e.key === "Enter") {
                            e.preventDefault();
                            if (!timerStarted) startTimer();
                            validateCell(r, c);
                        }
                    });

                    gridEl.appendChild(inp);
                }
            }
        }

        /* ================= GAME ================= */

        function initGame() {
            solution = emptyBoard();
            fillBoard(solution);
            puzzle = cloneBoard(solution);
            pokeHoles(puzzle, 50);
            current = cloneBoard(puzzle);
            render(puzzle);
        }

        function render(board) {
            forEachCell((inp, r, c) => {
                inp.classList.remove("given", "bad", "box-ok", "good");
                if (board[r][c] !== 0) {
                    inp.value = board[r][c];
                    inp.classList.add("given");
                    inp.disabled = true;
                } else {
                    inp.value = "";
                    inp.disabled = false;
                }
            });
        }

        /* ================= VALIDATION ================= */

        function validateCell(r, c) {
            const inp = gridEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
            if (!inp) return;
            const v = current[r][c];
            inp.classList.remove("bad", "good");
            if (v === 0) return;

            let isValid = true;
            
            for (let c2 = 0; c2 < 9; c2++) {
                if (c2 !== c && current[r][c2] === v) {
                    isValid = false;
                    break;
                }
            }
            
            for (let r2 = 0; r2 < 9; r2++) {
                if (r2 !== r && current[r2][c] === v) {
                    isValid = false;
                    break;
                }
            }
            
            const br = Math.floor(r / 3) * 3;
            const bc = Math.floor(c / 3) * 3;
            for (let rr = br; rr < br + 3; rr++) {
                for (let cc = bc; cc < bc + 3; cc++) {
                    if ((rr !== r || cc !== c) && current[rr][cc] === v) {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid) break;
            }

            if (!isValid) {
                inp.classList.add("bad");
            } else {
                inp.classList.add("good");
            }

            updateBoxHighlight(r, c);

            if (checkGameFinished()) {
                gameFinished = true;
                stopTimer();
            }
        }

        /* ================= SUDOKU LOGIC ================= */

        function emptyBoard() {
            return Array.from({ length: N }, () => Array(N).fill(0));
        }

        function cloneBoard(b) {
            return b.map(row => row.slice());
        }

        function isValidPlacement(board, r, c, val, allowSameCell) {
            for (let i = 0; i < 9; i++) {
                if (i !== c && board[r][i] === val) return false;
                if (i !== r && board[i][c] === val) return false;
            }

            const br = Math.floor(r / 3) * 3;
            const bc = Math.floor(c / 3) * 3;
            for (let rr = br; rr < br + 3; rr++) {
                for (let cc = bc; cc < bc + 3; cc++) {
                    if (allowSameCell && rr === r && cc === c) continue;
                    if (board[rr][cc] === val) return false;
                }
            }
            return true;
        }

        function fillBoard(board) {
            const pos = findEmpty(board);
            if (!pos) return true;
            const [r, c] = pos;
            for (const v of shuffledDigits()) {
                if (isValidPlacement(board, r, c, v, false)) {
                    board[r][c] = v;
                    if (fillBoard(board)) return true;
                    board[r][c] = 0;
                }
            }
            return false;
        }

        function findEmpty(board) {
            for (let r = 0; r < 9; r++)
                for (let c = 0; c < 9; c++)
                    if (board[r][c] === 0) return [r, c];
            return null;
        }

        function shuffledDigits() {
            return [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
        }

        function pokeHoles(board, holes) {
            let removed = 0;
            while (removed < holes) {
                const r = Math.floor(Math.random() * 9);
                const c = Math.floor(Math.random() * 9);
                if (board[r][c] !== 0) {
                    board[r][c] = 0;
                    removed++;
                }
            }
        }

        /* ================= BOX ================= */

        function getBoxCells(r, c) {
            const br = Math.floor(r / 3) * 3;
            const bc = Math.floor(c / 3) * 3;
            const cells = [];
            for (let rr = br; rr < br + 3; rr++)
                for (let cc = bc; cc < bc + 3; cc++)
                    cells.push([rr, cc]);
            return cells;
        }

        function updateBoxHighlight(r, c) {
            const cells = getBoxCells(r, c);
            const seen = new Set();
            for (const [rr, cc] of cells) {
                const v = current[rr][cc];
                if (v === 0 || seen.has(v)) {
                    clearBox(cells);
                    return;
                }
                seen.add(v);
            }

            cells.forEach(([rr, cc]) => {
                gridEl.querySelector(`.cell[data-r="${rr}"][data-c="${cc}"]`)
                    .classList.add("box-ok");
            });
        }

        function clearBox(cells) {
            cells.forEach(([rr, cc]) => {
                gridEl.querySelector(`.cell[data-r="${rr}"][data-c="${cc}"]`)
                    .classList.remove("box-ok");
            });
        }

        /* ================= HELPERS ================= */

        function forEachCell(fn) {
            gridEl.querySelectorAll(".cell").forEach(inp => {
                fn(inp, +inp.dataset.r, +inp.dataset.c);
            });
        }