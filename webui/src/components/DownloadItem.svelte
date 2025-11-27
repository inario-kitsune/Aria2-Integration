<script>
    import { aria2Client } from "../stores/client.js";
    import { t } from "../lib/i18n.js";

    export let download;

    function formatBytes(bytes) {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    function formatSpeed(bytes) {
        return formatBytes(bytes) + "/s";
    }

    function getFileName(download) {
        if (download.bittorrent?.info?.name) {
            return download.bittorrent.info.name;
        }
        if (download.files && download.files[0]?.path) {
            return download.files[0].path.split("/").pop();
        }
        return (
            download.files?.[0]?.uris?.[0]?.uri.split("/").pop() || "Unknown"
        );
    }

    function getProgress(download) {
        const total = parseInt(download.totalLength) || 0;
        const completed = parseInt(download.completedLength) || 0;
        if (total === 0) return 0;
        return (completed / total) * 100;
    }

    async function handlePause() {
        const client = aria2Client.getInstance();
        if (!client) return;
        try {
            await client.pause(download.gid);
        } catch (error) {
            console.error("Failed to pause download:", error);
        }
    }

    async function handleResume() {
        const client = aria2Client.getInstance();
        if (!client) return;
        try {
            await client.unpause(download.gid);
        } catch (error) {
            console.error("Failed to resume download:", error);
        }
    }

    async function handleRemove() {
        const client = aria2Client.getInstance();
        if (!client) return;
        try {
            if (
                download.status === "active" ||
                download.status === "waiting" ||
                download.status === "paused"
            ) {
                await client.remove(download.gid);
            } else {
                await client.removeDownloadResult(download.gid);
            }
        } catch (error) {
            console.error("Failed to remove download:", error);
        }
    }

    $: progress = getProgress(download);
    $: fileName = getFileName(download);
    $: isActive = download.status === "active";
    $: isPaused = download.status === "paused";
    $: isWaiting = download.status === "waiting";
</script>

<div class="download-item">
    <div class="download-header">
        <div class="file-name" title={fileName}>
            {fileName}
        </div>
        <div class="actions">
            {#if isActive}
                <button
                    class="action-btn"
                    on:click={handlePause}
                    title={$t("download.action.pause")}
                >
                    ⏸
                </button>
            {:else if isPaused || isWaiting}
                <button
                    class="action-btn"
                    on:click={handleResume}
                    title={$t("download.action.resume")}
                >
                    ▶
                </button>
            {/if}
            <button
                class="action-btn danger"
                on:click={handleRemove}
                title={$t("download.action.remove")}
            >
                ✕
            </button>
        </div>
    </div>

    <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
    </div>

    <div class="download-info">
        <div class="info-item">
            <span class="info-label">{$t("download.info.status")}:</span>
            <span class="status-badge {download.status}">{download.status}</span
            >
        </div>
        <div class="info-item">
            <span class="info-label">{$t("download.info.progress")}:</span>
            <span>{progress.toFixed(1)}%</span>
        </div>
        <div class="info-item">
            <span class="info-label">{$t("download.info.size")}:</span>
            <span
                >{formatBytes(download.completedLength)} / {formatBytes(
                    download.totalLength,
                )}</span
            >
        </div>
        {#if isActive}
            <div class="info-item">
                <span class="info-label">{$t("download.info.speed")}:</span>
                <span>↓ {formatSpeed(download.downloadSpeed)}</span>
            </div>
        {/if}
    </div>
</div>

<style>
    .download-item {
        padding: 1rem;
        border-bottom: 1px solid var(--border);
    }

    .download-item:last-child {
        border-bottom: none;
    }

    .download-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .file-name {
        flex: 1;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 1rem;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn {
        width: 2rem;
        height: 2rem;
        padding: 0;
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: 0.25rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text);
    }

    .action-btn:hover {
        background: var(--border);
    }

    .action-btn.danger {
        color: var(--danger);
    }

    .action-btn.danger:hover {
        background: var(--danger);
        border-color: var(--danger);
        color: white;
    }

    .progress-bar {
        height: 0.5rem;
        background: var(--background);
        border-radius: 0.25rem;
        overflow: hidden;
        margin-bottom: 0.75rem;
    }

    .progress-fill {
        height: 100%;
        background: var(--primary);
        transition: width 0.3s ease;
    }

    .download-info {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
    }

    .info-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .info-label {
        font-weight: 500;
    }

    .status-badge {
        padding: 0.125rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
    }

    .status-badge.active {
        background: rgba(46, 160, 67, 0.1);
        color: var(--success);
    }

    .status-badge.waiting {
        background: rgba(251, 191, 36, 0.1);
        color: var(--warning);
    }

    .status-badge.paused {
        background: rgba(107, 114, 128, 0.1);
        color: var(--text-secondary);
    }

    .status-badge.complete {
        background: rgba(59, 130, 246, 0.1);
        color: var(--primary);
    }

    .status-badge.error {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
    }
</style>
