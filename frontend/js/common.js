/**
 * AnomalyGuard — Common Utilities
 * Shared functions for sidebar, topbar, formatters, and notifications
 */

/** Generate sidebar HTML */
function renderSidebar(activePage) {
    const user = AUTH.getUser();
    const username = user ? user.username : 'User';
    const role = user ? user.role : 'analyst';
    const initials = username.substring(0, 2).toUpperCase();

    return `
    <div class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <div class="sidebar-brand-icon"><i class="fas fa-shield-halved"></i></div>
            <div>
                <div class="sidebar-brand-text">AnomalyGuard</div>
                <div class="sidebar-brand-sub">Network Security</div>
            </div>
        </div>
        <div class="sidebar-nav">
            <div class="sidebar-section-label">Main</div>
            <a href="dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">
                <i class="fas fa-chart-line"></i> Dashboard
            </a>
            <a href="live-monitoring.html" class="sidebar-link ${activePage === 'monitoring' ? 'active' : ''}">
                <i class="fas fa-tower-broadcast"></i> Live Monitoring
            </a>
            <a href="packet-capture.html" class="sidebar-link ${activePage === 'packets' ? 'active' : ''}">
                <i class="fas fa-network-wired"></i> Packet Capture
            </a>

            <div class="sidebar-section-label">Intelligence</div>
            <a href="ml-prediction.html" class="sidebar-link ${activePage === 'prediction' ? 'active' : ''}">
                <i class="fas fa-brain"></i> ML Prediction
            </a>
            <a href="attack-detection.html" class="sidebar-link ${activePage === 'attacks' ? 'active' : ''}">
                <i class="fas fa-crosshairs"></i> Attack Detection
            </a>
            <a href="alert-center.html" class="sidebar-link ${activePage === 'alerts' ? 'active' : ''}">
                <i class="fas fa-bell"></i> Alert Center
                <span class="sidebar-badge" id="alertBadge" style="display:none">0</span>
            </a>

            <div class="sidebar-section-label">Analytics</div>
            <a href="analytics.html" class="sidebar-link ${activePage === 'analytics' ? 'active' : ''}">
                <i class="fas fa-chart-pie"></i> Analytics
            </a>
            <a href="reports.html" class="sidebar-link ${activePage === 'reports' ? 'active' : ''}">
                <i class="fas fa-file-alt"></i> Reports
            </a>

            <div class="sidebar-section-label">Management</div>
            <a href="dataset-management.html" class="sidebar-link ${activePage === 'datasets' ? 'active' : ''}">
                <i class="fas fa-database"></i> Datasets
            </a>
            <a href="model-management.html" class="sidebar-link ${activePage === 'models' ? 'active' : ''}">
                <i class="fas fa-cogs"></i> Models
            </a>
            <a href="user-management.html" class="sidebar-link ${activePage === 'users' ? 'active' : ''}">
                <i class="fas fa-users"></i> Users
            </a>

            <div class="sidebar-section-label">System</div>
            <a href="logs.html" class="sidebar-link ${activePage === 'logs' ? 'active' : ''}">
                <i class="fas fa-scroll"></i> Logs
            </a>
            <a href="settings.html" class="sidebar-link ${activePage === 'settings' ? 'active' : ''}">
                <i class="fas fa-sliders-h"></i> Settings
            </a>
            <a href="profile.html" class="sidebar-link ${activePage === 'profile' ? 'active' : ''}">
                <i class="fas fa-user-circle"></i> Profile
            </a>
        </div>
        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="sidebar-avatar">${initials}</div>
                <div>
                    <div class="sidebar-user-name">${username}</div>
                    <div class="sidebar-user-role">${role.charAt(0).toUpperCase() + role.slice(1)}</div>
                </div>
            </div>
        </div>
    </div>`;
}

/** Generate topbar HTML */
function renderTopbar(pageTitle) {
    const user = AUTH.getUser();
    const username = user ? user.username : 'User';

    return `
    <div class="topbar">
        <div class="topbar-left">
            <button class="btn btn-sm btn-outline-secondary d-md-none" onclick="toggleSidebar()">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="topbar-title">${pageTitle}</h1>
        </div>
        <div class="topbar-right">
            <div class="topbar-search">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search..." id="globalSearch">
            </div>
            <span class="topbar-clock" id="topbarClock"></span>
            <button class="topbar-btn" onclick="window.location.href='alert-center.html'" title="Notifications">
                <i class="fas fa-bell"></i>
                <span class="notification-dot" id="notifDot" style="display:none"></span>
            </button>
            <div class="topbar-user" onclick="window.location.href='profile.html'">
                <i class="fas fa-user"></i>
                <span>${username}</span>
            </div>
            <button class="topbar-btn" onclick="AUTH.logout()" title="Logout">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
    </div>`;
}

/** Initialize page layout with sidebar and topbar */
function initPageLayout(activePage, pageTitle) {
    if (!AUTH.requireAuth()) return false;

    const wrapper = document.getElementById('app');
    if (!wrapper) return false;

    const sidebarHTML = renderSidebar(activePage);
    const topbarHTML = renderTopbar(pageTitle);

    // Insert sidebar before main content
    wrapper.insertAdjacentHTML('afterbegin', sidebarHTML);

    // Insert topbar at beginning of main-content
    const mainContent = wrapper.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertAdjacentHTML('afterbegin', topbarHTML);
    }

    // Start clock
    startClock();

    // Load alert count for badge
    loadAlertBadge();

    return true;
}

/** Toggle sidebar on mobile */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

/** Start live clock */
function startClock() {
    const clock = document.getElementById('topbarClock');
    if (!clock) return;

    function update() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString([], { hour12: false });
    }
    update();
    setInterval(update, 1000);
}

/** Load alert badge count */
async function loadAlertBadge() {
    try {
        const data = await API.getAlertCounts();
        if (data && data.unread > 0) {
            const badge = document.getElementById('alertBadge');
            const dot = document.getElementById('notifDot');
            if (badge) {
                badge.textContent = data.unread;
                badge.style.display = 'inline';
            }
            if (dot) dot.style.display = 'block';
        }
    } catch (e) {
        // Silently fail
    }
}

/** Format number with commas */
function formatNumber(n) {
    if (n === null || n === undefined) return '0';
    return Number(n).toLocaleString();
}

/** Format percentage */
function formatPercent(n) {
    return `${Number(n).toFixed(1)}%`;
}

/** Format date/time */
function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString([], {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

/** Format relative time */
function formatTimeAgo(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

/** Get severity badge HTML */
function severityBadge(severity) {
    return `<span class="badge-severity badge-${severity}">${severity}</span>`;
}

/** Get status badge HTML */
function statusBadge(status) {
    return `<span class="badge-severity badge-${status}">${status}</span>`;
}

/** Format file size */
function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

/** Create pagination HTML */
function renderPagination(page, totalPages, onPageChange) {
    if (totalPages <= 1) return '';

    let html = '<nav><ul class="pagination pagination-sm mb-0">';
    html += `<li class="page-item ${page <= 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="${onPageChange}(${page - 1}); return false;">&laquo;</a></li>`;

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
        html += `<li class="page-item ${i === page ? 'active' : ''}">
            <a class="page-link" href="#" onclick="${onPageChange}(${i}); return false;">${i}</a></li>`;
    }

    html += `<li class="page-item ${page >= totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="${onPageChange}(${page + 1}); return false;">&raquo;</a></li>`;
    html += '</ul></nav>';

    return html;
}

/** Show toast notification */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 80px; right: 24px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    toast.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}

/** Chart.js color palette */
const CHART_COLORS = {
    primary: '#2563EB',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#D97706',
    info: '#0EA5E9',
    purple: '#7C3AED',
    pink: '#EC4899',
    teal: '#14B8A6',
    palette: ['#2563EB', '#16A34A', '#DC2626', '#D97706', '#0EA5E9', '#7C3AED', '#EC4899', '#14B8A6'],
};
