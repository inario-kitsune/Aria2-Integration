<script>
    import { onMount, onDestroy } from "svelte";
    import {
        stats,
        startStatsUpdates,
        stopStatsUpdates,
    } from "../stores/stats.js";
    import { t } from "../lib/i18n.js";

    function formatSpeed(bytes) {
        if (bytes === 0) return "0 B/s";
        const k = 1024;
        const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    onMount(() => {
        startStatsUpdates();
    });

    onDestroy(() => {
        stopStatsUpdates();
    });
</script>

<div class="stats">
    <div class="stat-card">
        <div class="stat-icon download">↓</div>
        <div class="stat-info">
            <div class="stat-label">{$t("stats.download")}</div>
            <div class="stat-value">{formatSpeed($stats.downloadSpeed)}</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon upload">↑</div>
        <div class="stat-info">
            <div class="stat-label">{$t("stats.upload")}</div>
            <div class="stat-value">{formatSpeed($stats.uploadSpeed)}</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon active">●</div>
        <div class="stat-info">
            <div class="stat-label">{$t("stats.active")}</div>
            <div class="stat-value">{$stats.numActive}</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon waiting">◐</div>
        <div class="stat-info">
            <div class="stat-label">{$t("stats.waiting")}</div>
            <div class="stat-value">{$stats.numWaiting}</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon stopped">■</div>
        <div class="stat-info">
            <div class="stat-label">{$t("stats.stopped")}</div>
            <div class="stat-value">{$stats.numStopped}</div>
        </div>
    </div>
</div>

<style>
    .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        transition: box-shadow 0.2s;
    }

    .stat-card:hover {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .stat-icon.download {
        background: rgba(59, 130, 246, 0.1);
        color: var(--primary);
    }

    .stat-icon.upload {
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
    }

    .stat-icon.active {
        background: rgba(46, 160, 67, 0.1);
        color: var(--success);
    }

    .stat-icon.waiting {
        background: rgba(251, 191, 36, 0.1);
        color: var(--warning);
    }

    .stat-icon.stopped {
        background: rgba(107, 114, 128, 0.1);
        color: var(--text-secondary);
    }

    .stat-info {
        flex: 1;
    }

    .stat-label {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
    }

    .stat-value {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text);
    }
</style>
