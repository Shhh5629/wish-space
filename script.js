// ============================================================
//  Wish Board – script.js
//  バグ修正済み・完全再現版
// ============================================================

// ── デフォルトデータ ────────────────────────────────────────
let boardData = [
    {
        id: 101,
        genreName: "✈️ 行きたいところ",
        color: "#f77ca7",
        isEditingMode: false,
        isCollapsed: false,
        wishes: [
            { id: 2, title: "京都で着物レンタルして食べ歩き", date: "10月の週末", location: "京都・清水寺周辺", note: "抹茶パフェのお店予約したい！", checked: false }
        ]
    },
    {
        id: 102,
        genreName: "🍔 カフェ・グルメ",
        color: "#54b2d3",
        isEditingMode: false,
        isCollapsed: false,
        wishes: [
            { id: 1, title: "話題の山盛りまぜそば", date: "今度の日曜", location: "新宿", note: "並ぶらしいから11時集合で。", checked: false }
        ]
    }
];

// テーマカラーのデフォルト値
let currentAppThemeColor = "#ffb7d2";
let currentAppTextColor  = "#ffffff";

// ============================================================
//  ヘッダー / テーマ
// ============================================================

function checkHeaderEmpty(element) {
    if (!element.innerText.trim()) {
        element.innerText = "Our Wish Space";
    }
    autoSave();
}

function changeAppTheme(colorHex) {
    currentAppThemeColor = colorHex;
    const header         = document.getElementById('dynamic-header');
    const floatBtn       = document.getElementById('dynamic-floating-btn');
    const modalSubmitBtn = document.getElementById('dynamic-modal-submit-btn');
    const heartSvg       = document.getElementById('header-bg-heart');
    const colorInput     = document.getElementById('app-theme-color');

    if (header)         header.style.backgroundColor = colorHex + "dd";
    if (floatBtn)       floatBtn.style.backgroundColor = colorHex + "cc";
    if (modalSubmitBtn) modalSubmitBtn.style.backgroundColor = colorHex;
    if (heartSvg)       heartSvg.style.fill = colorHex;
    // input[type=color] の表示値も同期
    if (colorInput && colorInput.value !== colorHex) colorInput.value = colorHex;

    document.querySelectorAll('.inner-add-btn').forEach(btn => {
        btn.style.setProperty('background', colorHex + "1a", 'important');
        btn.style.setProperty('color', colorHex, 'important');
    });

    autoSave();
}

function changeAppTextColor(colorHex) {
    currentAppTextColor = colorHex;
    const title     = document.getElementById('dynamic-title');
    const labels    = document.querySelectorAll('.picker-label');
    const dot       = document.getElementById('text-color-dot');
    const textInput = document.getElementById('app-text-color');

    if (title) title.style.color = colorHex;
    labels.forEach(label => label.style.color = colorHex);
    if (dot) dot.style.backgroundColor = colorHex;
    // input[type=color] の表示値も同期
    if (textInput && textInput.value !== colorHex) textInput.value = colorHex;

    autoSave();
}

function changeModalHeartColor(colorHex) {
    const modalHeartSvg = document.getElementById('modal-genre-heart');
    if (modalHeartSvg) modalHeartSvg.style.fill = colorHex;
}

function showThemePicker() {
    document.getElementById('theme-picker-container').classList.add('active');
}

function hideThemePicker() {
    document.getElementById('theme-picker-container').classList.remove('active');
}

function handleGlobalClick(e) {
    const pickerContainer = document.getElementById('theme-picker-container');
    const title = document.getElementById('dynamic-title');
    if (pickerContainer && !pickerContainer.contains(e.target) && e.target !== title) {
        hideThemePicker();
    }
}

// ============================================================
//  折りたたみ / 並び替え
// ============================================================

function toggleCollapse(genreId) {
    const section = boardData.find(b => b.id === genreId);
    if (section) {
        section.isCollapsed = !section.isCollapsed;
        renderBoard();
        autoSave();
    }
}

function moveGenreUp(index, e) {
    e.stopPropagation();
    if (index === 0) return;
    const temp = boardData[index];
    boardData[index] = boardData[index - 1];
    boardData[index - 1] = temp;
    renderBoard();
    autoSave();
}

function moveGenreDown(index, e) {
    e.stopPropagation();
    if (index === boardData.length - 1) return;
    const temp = boardData[index];
    boardData[index] = boardData[index + 1];
    boardData[index + 1] = temp;
    renderBoard();
    autoSave();
}

// ============================================================
//  renderBoard
// ============================================================

function renderBoard() {
    const container = document.getElementById('board-container');
    if (!container) return;
    container.innerHTML = '';

    if (boardData.length === 0) {
        container.innerHTML = `<div class="empty-message">右下の「＋」から<br>新しいリストを作ってね</div>`;
        return;
    }

    boardData.forEach((section, index) => {
        const genreCard = document.createElement('div');
        genreCard.className = [
            'genre-large-card',
            section.isEditingMode ? 'global-edit-active' : '',
            section.isCollapsed   ? 'is-collapsed'       : ''
        ].filter(Boolean).join(' ');
        genreCard.id = `genre-card-${section.id}`;
        genreCard.dataset.id = section.id;

        const headerBtn = section.isEditingMode
            ? `<button class="genre-mode-toggle-btn confirm-mode" style="color: ${section.color} !important" onclick="toggleGenreMode(${section.id}); event.stopPropagation();">✓</button>`
            : `<button class="genre-mode-toggle-btn" onclick="toggleGenreMode(${section.id}); event.stopPropagation();">•••</button>`;

        const upDisabled   = index === 0                    ? 'disabled' : '';
        const downDisabled = index === boardData.length - 1 ? 'disabled' : '';

        genreCard.innerHTML = `
            <div class="genre-card-header" onclick="toggleCollapse(${section.id})">
                <button class="genre-minus-btn" onclick="deleteGenre(${section.id}); event.stopPropagation();">ー</button>
                <h2 class="genre-card-title" style="color: ${section.color}" contenteditable="true"
                    onfocus="event.stopPropagation();"
                    onblur="updateGenreName(${section.id}, this.innerText)"
                    onclick="event.stopPropagation();">${section.genreName}</h2>
                <div class="genre-header-actions">
                    <button class="genre-order-btn ${upDisabled}" onclick="moveGenreUp(${index}, event)">↑</button>
                    <button class="genre-order-btn ${downDisabled}" onclick="moveGenreDown(${index}, event)">↓</button>
                    ${headerBtn}
                </div>
            </div>

            <div class="wish-list-container" id="list-container-${section.id}" data-genre-id="${section.id}"></div>

            <div class="genre-card-footer">
                <button class="inner-add-btn"
                    style="background: ${currentAppThemeColor}1a !important; color: ${currentAppThemeColor} !important;"
                    onclick="addWishToGenre(${section.id})">＋</button>
            </div>
        `;

        container.appendChild(genreCard);

        const listContainer = document.getElementById(`list-container-${section.id}`);
        if (!listContainer) return;

        section.wishes.forEach((wish) => {
            // [BUG FIX] undefinedガード: date/location/note が存在しない場合に備える
            const safeDate     = wish.date     || "";
            const safeLocation = wish.location || "";
            const safeNote     = wish.note     || "";

            const hasMeta = safeDate.trim() !== "" || safeLocation.trim() !== "";
            const hasNote = safeNote.trim() !== "";

            const rowClasses = ['wish-item-row'];
            if (hasMeta) rowClasses.push('has-meta');
            if (hasNote) rowClasses.push('has-note');
            if (wish.checked) {
                rowClasses.push('is-checked');
                if (!section.isEditingMode) rowClasses.push('is-hidden-done');
            }

            const itemRow = document.createElement('div');
            itemRow.className = rowClasses.join(' ');
            itemRow.id = `item-row-${wish.id}`;
            itemRow.dataset.wishId = wish.id;
            itemRow.style.setProperty('--genre-theme-color', section.color);

            // [BUG FIX] title の特殊文字によるHTML破壊を防ぐため、innerHTMLセット後にvalueを代入
            itemRow.innerHTML = `
                <button class="item-minus-btn" onclick="deleteWish(${section.id}, ${wish.id})">ー</button>

                <div class="item-checkbox-side">
                    <label class="todo-checkbox-wrapper">
                        <input type="checkbox" ${wish.checked ? 'checked' : ''}
                            onchange="toggleTodoCheck(${section.id}, ${wish.id}, this.checked)">
                        <span class="todo-checkmark"></span>
                    </label>
                </div>

                <div class="item-content-block">
                    <div class="item-main-line">
                        <input type="text" class="wish-title-input" placeholder="やりたいことを入力"
                            onfocus="openDetails(${wish.id})"
                            onblur="closeDetailsIfEmpty(${section.id}, ${wish.id})"
                            onkeydown="handleWishKeyDown(event, ${section.id}, ${wish.id})"
                            oninput="updateWishTitle(${section.id}, ${wish.id}, this.value)">
                    </div>

                    <div class="item-details-drawer">
                        <div class="item-meta-line">
                            <div class="meta-input-wrapper">
                                <span class="meta-icon">📅</span>
                                <input type="text" class="wish-meta-input" placeholder="いつ？"
                                    onfocus="openDetails(${wish.id})"
                                    onblur="closeDetailsIfEmpty(${section.id}, ${wish.id})"
                                    oninput="updateWishDate(${section.id}, ${wish.id}, this.value)">
                            </div>
                            <div class="meta-input-wrapper">
                                <span class="meta-icon">📍</span>
                                <input type="text" class="wish-meta-input" placeholder="どこで？"
                                    onfocus="openDetails(${wish.id})"
                                    onblur="closeDetailsIfEmpty(${section.id}, ${wish.id})"
                                    oninput="updateWishLocation(${section.id}, ${wish.id}, this.value)">
                            </div>
                        </div>
                        <textarea class="wish-textarea" placeholder="詳細やメモをここに..."
                            onfocus="openDetails(${wish.id})"
                            onblur="closeDetailsIfEmpty(${section.id}, ${wish.id})"
                            oninput="updateWishNote(${section.id}, ${wish.id}, this.value)"></textarea>
                    </div>
                </div>

                <div class="drag-handle">☰</div>
            `;

            // [BUG FIX] value を DOM 生成後に直接代入（HTML特殊文字・改行を安全に扱う）
            itemRow.querySelector('.wish-title-input').value  = wish.title    || "";
            itemRow.querySelector('.wish-textarea').value     = safeNote;
            const metaInputs = itemRow.querySelectorAll('.wish-meta-input');
            if (metaInputs[0]) metaInputs[0].value = safeDate;
            if (metaInputs[1]) metaInputs[1].value = safeLocation;

            setupWishCrossDragAndDrop(itemRow, listContainer);
            listContainer.appendChild(itemRow);
        });
    });
}

// ============================================================
//  キーボード操作
// ============================================================

function handleWishKeyDown(event, genreId, wishId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addWishToGenre(genreId);
    }
}

// ============================================================
//  アイテム操作
// ============================================================

function toggleTodoCheck(genreId, wishId, isChecked) {
    const section = boardData.find(b => b.id === genreId);
    if (!section) return;
    const wish = section.wishes.find(w => w.id === wishId);
    if (!wish) return;

    wish.checked = isChecked;
    const row = document.getElementById(`item-row-${wishId}`);
    if (!row) return;

    if (isChecked) {
        row.classList.add('is-checked');
        if (!section.isEditingMode) {
            setTimeout(() => {
                if (wish.checked) row.classList.add('is-hidden-done');
            }, 400);
        }
    } else {
        row.classList.remove('is-checked');
        row.classList.remove('is-hidden-done');
    }
    autoSave();
}

function toggleGenreMode(genreId) {
    const section = boardData.find(b => b.id === genreId);
    if (section) {
        section.isEditingMode = !section.isEditingMode;
        renderBoard();
    }
}

function openDetails(wishId) {
    const row = document.getElementById('item-row-' + wishId);
    if (row) row.classList.add('is-editing');
}

function closeDetailsIfEmpty(genreId, wishId) {
    setTimeout(() => {
        const section = boardData.find(b => b.id === genreId);
        if (!section) return;
        const wish = section.wishes.find(w => w.id === wishId);
        if (!wish) return;
        const row = document.getElementById('item-row-' + wishId);
        if (!row) return;

        // フォーカスがまだ行内にあれば何もしない
        if (row.contains(document.activeElement)) return;

        // タイトルが空なら削除
        if (!wish.title || wish.title.trim() === "") {
            section.wishes = section.wishes.filter(w => w.id !== wishId);
            renderBoard();
            autoSave();
            return;
        }

        row.classList.remove('is-editing');

        // [BUG FIX] undefinedガードを追加
        const safeDate     = wish.date     || "";
        const safeLocation = wish.location || "";
        const safeNote     = wish.note     || "";

        const hasMeta = safeDate.trim() !== "" || safeLocation.trim() !== "";
        const hasNote = safeNote.trim() !== "";

        if (hasMeta) row.classList.add('has-meta');    else row.classList.remove('has-meta');
        if (hasNote) row.classList.add('has-note');    else row.classList.remove('has-note');
    }, 150);
}

// ============================================================
//  ジャンル（リスト）操作
// ============================================================

function openGenreModal() {
    document.getElementById('genre-modal').classList.add('active');
    document.getElementById('new-genre-name').focus();
    const colorInput = document.getElementById('new-genre-color');
    if (colorInput) changeModalHeartColor(colorInput.value);
}

function closeGenreModal(e) {
    if (e === 'force' || (e && e.target && e.target.classList.contains('modal-overlay'))) {
        document.getElementById('genre-modal').classList.remove('active');
    }
}

function createGenreBoard() {
    const nameInput  = document.getElementById('new-genre-name');
    const colorInput = document.getElementById('new-genre-color');
    if (!nameInput || !colorInput) return;

    const name = nameInput.value.trim();
    if (!name) return;

    boardData.push({
        id: Date.now(),
        genreName: name,
        color: colorInput.value,
        isEditingMode: false,
        isCollapsed: false,
        wishes: []
    });

    nameInput.value = '';
    closeGenreModal('force');
    renderBoard();
    autoSave();
}

function updateGenreName(genreId, text) {
    const section = boardData.find(b => b.id === genreId);
    if (section) section.genreName = text || "";
    autoSave();
}

function deleteGenre(genreId) {
    boardData = boardData.filter(b => b.id !== genreId);
    renderBoard();
    autoSave();
}

function addWishToGenre(genreId) {
    const section = boardData.find(b => b.id === genreId);
    if (!section) return;

    if (section.isCollapsed) section.isCollapsed = false;

    // 末尾に未入力アイテムが既にあればそこへフォーカス
    const lastWish = section.wishes[section.wishes.length - 1];
    if (lastWish && (!lastWish.title || lastWish.title.trim() === "")) {
        const listContainer = document.getElementById('list-container-' + genreId);
        if (listContainer && listContainer.lastElementChild) {
            const titleInput = listContainer.lastElementChild.querySelector('.wish-title-input');
            if (titleInput) titleInput.focus();
        }
        return;
    }

    const newWish = { id: Date.now(), title: "", date: "", location: "", note: "", checked: false };
    section.wishes.push(newWish);
    renderBoard();

    openDetails(newWish.id);
    const listContainer = document.getElementById('list-container-' + genreId);
    if (listContainer && listContainer.lastElementChild) {
        const titleInput = listContainer.lastElementChild.querySelector('.wish-title-input');
        if (titleInput) titleInput.focus();
    }
    autoSave();
}

// ── wish フィールド更新 ──────────────────────────────────────
// [BUG FIX] updateWishTitle: タイトル空時にrenderBoard後もautoSaveを二重呼びしていたのを修正
function updateWishTitle(genreId, wishId, value) {
    const section = boardData.find(b => b.id === genreId);
    if (!section) return;
    const wish = section.wishes.find(w => w.id === wishId);
    if (!wish) return;
    wish.title = value;
    autoSave();
}

function updateWishDate(genreId, wishId, value) {
    const section = boardData.find(b => b.id === genreId);
    if (section) {
        const wish = section.wishes.find(w => w.id === wishId);
        if (wish) wish.date = value;
    }
    autoSave();
}

function updateWishLocation(genreId, wishId, value) {
    const section = boardData.find(b => b.id === genreId);
    if (section) {
        const wish = section.wishes.find(w => w.id === wishId);
        if (wish) wish.location = value;
    }
    autoSave();
}

function updateWishNote(genreId, wishId, value) {
    const section = boardData.find(b => b.id === genreId);
    if (section) {
        const wish = section.wishes.find(w => w.id === wishId);
        if (wish) wish.note = value;
    }
    autoSave();
}

function deleteWish(genreId, wishId) {
    const section = boardData.find(b => b.id === genreId);
    if (section) section.wishes = section.wishes.filter(w => w.id !== wishId);
    renderBoard();
    autoSave();
}

// ============================================================
//  ドラッグ & ドロップ
// ============================================================

function setupWishCrossDragAndDrop(item, currentContainer) {
    const handle = item.querySelector('.drag-handle');
    if (!handle) return;

    // ── タッチ ──────────────────────────────────────────────
    handle.addEventListener('touchstart', () => {
        item.classList.add('dragging');
    }, { passive: true });

    handle.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const allContainers = [...document.querySelectorAll('.wish-list-container')];
        let targetContainer = currentContainer;

        allContainers.forEach(c => {
            const rect = c.getBoundingClientRect();
            if (
                touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top  && touch.clientY <= rect.bottom
            ) {
                targetContainer = c;
            }
        });

        const targetElement = getDragAfterElement(targetContainer, touch.pageY);
        if (targetElement == null) {
            targetContainer.appendChild(item);
        } else {
            targetContainer.insertBefore(item, targetElement);
        }
    }, { passive: true });

    handle.addEventListener('touchend', () => {
        item.classList.remove('dragging');
        saveAllListsOrder();
    });

    // ── マウス ──────────────────────────────────────────────
    handle.addEventListener('mousedown', () => {
        item.setAttribute('draggable', 'true');
    });

    item.addEventListener('dragstart', () => item.classList.add('dragging'));

    // [BUG FIX] dragover を item 単位でなく listContainer 単位で登録し、
    //           renderBoard のたびに重複リスナーが積まれないよう currentContainer のみに付与
    currentContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.wish-item-row.dragging');
        if (!draggingItem) return;

        // 他リストへのクロスドロップ対応: dragover は全コンテナで受け取る
        const allContainers = [...document.querySelectorAll('.wish-list-container')];
        allContainers.forEach(c => {
            const rect = c.getBoundingClientRect();
            if (
                e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top  && e.clientY <= rect.bottom
            ) {
                const targetElement = getDragAfterElement(c, e.pageY);
                if (targetElement == null) {
                    c.appendChild(draggingItem);
                } else {
                    c.insertBefore(draggingItem, targetElement);
                }
            }
        });
    });

    item.addEventListener('dragend', () => {
        item.removeAttribute('draggable');
        item.classList.remove('dragging');
        saveAllListsOrder();
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.wish-item-row:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box         = child.getBoundingClientRect();
        const absoluteTop = box.top + window.scrollY;
        const offset      = y - (absoluteTop + box.height / 2);
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveAllListsOrder() {
    const allContainers = [...document.querySelectorAll('.wish-list-container')];

    // 全wish を id をキーに一時保存
    const tempWishMap = {};
    boardData.forEach(b => {
        b.wishes.forEach(w => { tempWishMap[w.id] = w; });
        b.wishes = [];
    });

    allContainers.forEach(container => {
        const genreId = parseInt(container.dataset.genreId);
        const section = boardData.find(b => b.id === genreId);
        if (!section) return;

        [...container.querySelectorAll('.wish-item-row')].forEach(row => {
            const wishId = parseInt(row.dataset.wishId);
            if (tempWishMap[wishId]) section.wishes.push(tempWishMap[wishId]);
        });
    });

    renderBoard();
    autoSave();
}

// ============================================================
//  永続化 (localStorage)
// ============================================================

// [BUG FIX] テーマカラー・タイトルも含めて保存・復元する
function autoSave() {
    const saveData = {
        boardData,
        appThemeColor: currentAppThemeColor,
        appTextColor:  currentAppTextColor,
        headerTitle:   (document.getElementById('dynamic-title') || {}).innerText || "Our Wish Space"
    };
    localStorage.setItem("wishBoardSave", JSON.stringify(saveData));
}

// ============================================================
//  初期化
// ============================================================

window.onload = () => {
    // [BUG FIX] 新キー "wishBoardSave" で保存・復元（旧キー "boardData" にも後方互換対応）
    const rawNew = localStorage.getItem("wishBoardSave");
    const rawOld = localStorage.getItem("boardData");

    if (rawNew) {
        try {
            const saved = JSON.parse(rawNew);
            if (Array.isArray(saved.boardData)) boardData = saved.boardData;

            // テーマカラー復元
            const themeHex = saved.appThemeColor || "#ffb7d2";
            const textHex  = saved.appTextColor  || "#ffffff";

            renderBoard();
            changeAppTheme(themeHex);
            changeAppTextColor(textHex);

            // タイトル復元
            const titleEl = document.getElementById('dynamic-title');
            if (titleEl && saved.headerTitle) titleEl.innerText = saved.headerTitle;

        } catch (e) {
            console.warn("[復元失敗] wishBoardSave のパースに失敗しました", e);
            renderBoard();
            changeAppTheme(currentAppThemeColor);
            changeAppTextColor(currentAppTextColor);
        }
    } else if (rawOld) {
        // 旧フォーマットからマイグレーション
        try {
            boardData = JSON.parse(rawOld);
        } catch (e) {
            console.warn("[復元失敗] 旧データのパースに失敗しました", e);
        }
        renderBoard();
        changeAppTheme(currentAppThemeColor);
        changeAppTextColor(currentAppTextColor);
    } else {
        // 初回起動
        renderBoard();
        changeAppTheme(currentAppThemeColor);
        changeAppTextColor(currentAppTextColor);
    }
};
