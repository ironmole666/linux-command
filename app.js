'use strict';

const PAGE_SIZE = 30;
const DATA_URL = './data/data.json';
const CATEGORY_ICONS = {
    Linux: '🐧',
    Windows: '🪟',
    '渗透测试': '🛡️',
    '开发工具': '💻'
};
const DANGEROUS_COMMAND = /(?:^|\s)(?:rm\s+-rf|mkfs(?:\.|\s)|dd\s+if=|shutdown|reboot|poweroff|iptables\s+-F|systemctl\s+(?:stop|disable)\s+firewalld|--os-shell|reverse_tcp|hydra\s|john\s)/i;

const state = {
    commands: [],
    filtered: [],
    mainCategory: '全部',
    subCategory: '全部',
    query: '',
    sort: 'default',
    page: 1
};

const elements = {
    totalCount: document.getElementById('totalCount'),
    visibleCount: document.getElementById('visibleCount'),
    updatedAt: document.getElementById('updatedAt'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    categoryList: document.getElementById('categoryList'),
    subcategoryList: document.getElementById('subcategoryList'),
    statusMessage: document.getElementById('statusMessage'),
    commandGrid: document.getElementById('commandGrid'),
    pagination: document.getElementById('pagination'),
    exportButton: document.getElementById('exportButton'),
    toast: document.getElementById('toast')
};

function normalizeCommand(raw, index) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error(`第 ${index + 1} 条命令格式不正确`);
    }

    const requiredFields = ['id', 'command', 'description', 'mainCategory', 'subCategory'];
    for (const field of requiredFields) {
        if (typeof raw[field] !== 'string' || !raw[field].trim()) {
            throw new Error(`第 ${index + 1} 条命令缺少 ${field}`);
        }
    }

    return {
        id: raw.id,
        command: raw.command,
        description: raw.description,
        mainCategory: raw.mainCategory,
        subCategory: raw.subCategory,
        tags: Array.isArray(raw.tags) ? raw.tags.filter(tag => typeof tag === 'string') : [],
        updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
        createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : ''
    };
}

function createFilterButton(label, active, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-button${active ? ' active' : ''}`;
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
}

function renderCategoryFilters() {
    const categories = [...new Set(state.commands.map(item => item.mainCategory))];
    elements.categoryList.replaceChildren();

    ['全部', ...categories].forEach(category => {
        const icon = CATEGORY_ICONS[category];
        const label = icon ? `${icon} ${category}` : category;
        elements.categoryList.appendChild(createFilterButton(label, state.mainCategory === category, () => {
            state.mainCategory = category;
            state.subCategory = '全部';
            state.page = 1;
            renderCategoryFilters();
            renderSubcategoryFilters();
            filterAndRender();
        }));
    });
}

function renderSubcategoryFilters() {
    elements.subcategoryList.replaceChildren();
    if (state.mainCategory === '全部') return;

    const subcategories = [...new Set(state.commands
        .filter(item => item.mainCategory === state.mainCategory)
        .map(item => item.subCategory))];

    ['全部', ...subcategories].forEach(category => {
        elements.subcategoryList.appendChild(createFilterButton(category, state.subCategory === category, () => {
            state.subCategory = category;
            state.page = 1;
            renderSubcategoryFilters();
            filterAndRender();
        }));
    });
}

function fuzzyContains(value, term) {
    const source = value.toLocaleLowerCase();
    const target = term.toLocaleLowerCase();
    if (source.includes(target)) return true;

    let position = 0;
    for (const character of source) {
        if (character === target[position]) position += 1;
        if (position === target.length) return true;
    }
    return false;
}

function matchesSearch(command) {
    const terms = state.query.split(/\s+/).filter(Boolean);
    if (!terms.length) return true;
    const searchable = [command.command, command.description, command.mainCategory, command.subCategory, ...command.tags].join(' ');
    return terms.every(term => fuzzyContains(searchable, term));
}

function filterAndRender() {
    state.filtered = state.commands.filter(command => {
        const mainMatches = state.mainCategory === '全部' || command.mainCategory === state.mainCategory;
        const subMatches = state.subCategory === '全部' || command.subCategory === state.subCategory;
        return mainMatches && subMatches && matchesSearch(command);
    });

    if (state.sort === 'name') {
        state.filtered.sort((a, b) => a.command.localeCompare(b.command, 'zh-CN'));
    } else if (state.sort === 'recent') {
        state.filtered.sort((a, b) => Date.parse(b.updatedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.createdAt || 0));
    }

    const totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    elements.totalCount.textContent = String(state.commands.length);
    elements.visibleCount.textContent = String(state.filtered.length);
    renderCommands();
    renderPagination(totalPages);
}

function createBadge(text, secondary = false) {
    const badge = document.createElement('span');
    badge.className = `badge${secondary ? ' sub' : ''}`;
    badge.textContent = text;
    return badge;
}

function renderCommands() {
    elements.commandGrid.replaceChildren();
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = state.filtered.slice(start, start + PAGE_SIZE);

    if (!pageItems.length) {
        elements.statusMessage.textContent = state.commands.length ? '没有找到匹配的命令。' : '数据文件中暂无命令。';
        return;
    }
    elements.statusMessage.textContent = '';

    for (const command of pageItems) {
        const card = document.createElement('article');
        card.className = 'command-card';

        const top = document.createElement('div');
        top.className = 'card-top';
        const badges = document.createElement('div');
        badges.className = 'badges';
        badges.append(createBadge(`${CATEGORY_ICONS[command.mainCategory] || '📁'} ${command.mainCategory}`));
        badges.append(createBadge(command.subCategory, true));
        top.appendChild(badges);

        const isDangerous = DANGEROUS_COMMAND.test(command.command);
        if (isDangerous) {
            const danger = document.createElement('span');
            danger.className = 'danger-badge';
            danger.textContent = '⚠ 谨慎执行';
            top.appendChild(danger);
        }

        const code = document.createElement('pre');
        code.className = 'command-code';
        code.textContent = command.command;

        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = command.description;

        const tags = document.createElement('div');
        tags.className = 'tags';
        for (const value of command.tags) {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = value;
            tags.appendChild(tag);
        }

        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'copy-button';
        copyButton.textContent = isDangerous ? '确认后复制' : '复制命令';
        copyButton.addEventListener('click', () => copyCommand(command, isDangerous));

        card.append(top, code, description, tags, copyButton);
        elements.commandGrid.appendChild(card);
    }
}

function renderPagination(totalPages) {
    elements.pagination.replaceChildren();
    if (totalPages <= 1) return;

    for (let page = 1; page <= totalPages; page += 1) {
        if (page !== 1 && page !== totalPages && Math.abs(page - state.page) > 2) continue;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `page-button${page === state.page ? ' active' : ''}`;
        button.textContent = String(page);
        button.setAttribute('aria-label', `第 ${page} 页`);
        button.addEventListener('click', () => {
            state.page = page;
            renderCommands();
            renderPagination(totalPages);
            elements.commandGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        elements.pagination.appendChild(button);
    }
}

async function copyCommand(command, needsConfirmation) {
    if (needsConfirmation && !window.confirm('这条命令可能修改或破坏系统。确认已经理解参数、影响和目标后再复制。\n\n继续复制吗？')) return;
    try {
        await navigator.clipboard.writeText(command.command);
        showToast('命令已复制，请在执行前再次检查参数。');
    } catch {
        showToast('浏览器未允许复制，请手动选择命令文本。');
    }
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    window.setTimeout(() => elements.toast.classList.remove('show'), 2600);
}

function exportCommands() {
    const content = JSON.stringify(state.filtered, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'linux-commands-readonly.json';
    link.click();
    URL.revokeObjectURL(url);
}

async function loadData() {
    try {
        const response = await fetch(DATA_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data || !Array.isArray(data.commands)) throw new Error('数据结构不正确');
        state.commands = data.commands.map(normalizeCommand);
        elements.updatedAt.textContent = data.updatedAt
            ? `更新于 ${new Date(data.updatedAt).toLocaleString('zh-CN')}`
            : '更新时间未知';
        renderCategoryFilters();
        renderSubcategoryFilters();
        filterAndRender();
    } catch (error) {
        elements.statusMessage.className = 'status-message error';
        elements.statusMessage.textContent = `命令数据加载失败：${error.message}`;
        elements.updatedAt.textContent = '加载失败';
    }
}

let searchTimer;
elements.searchInput.addEventListener('input', event => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
        state.query = event.target.value.trim();
        state.page = 1;
        filterAndRender();
    }, 180);
});
elements.sortSelect.addEventListener('change', event => {
    state.sort = event.target.value;
    state.page = 1;
    filterAndRender();
});
elements.exportButton.addEventListener('click', exportCommands);
document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        elements.searchInput.focus();
    }
});

loadData();
