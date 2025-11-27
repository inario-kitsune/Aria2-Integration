<script>
    import { onMount, onDestroy } from "svelte";
    import {
        downloads,
        startDownloadUpdates,
        stopDownloadUpdates,
    } from "../stores/downloads.js";
    import { t } from "../lib/i18n.js";
    import DownloadItem from "./DownloadItem.svelte";

    let activeTab = "active";

    $: filteredDownloads = $downloads.filter((d) => {
        if (activeTab === "active") return d.status === "active";
        if (activeTab === "waiting") return d.status === "waiting";
        if (activeTab === "stopped")
            return (
                d.status === "complete" ||
                d.status === "error" ||
                d.status === "removed"
            );
        return true;
    });

    onMount(() => {
        startDownloadUpdates();
    });

    onDestroy(() => {
        stopDownloadUpdates();
    });
</script>

<div class="download-list">
    <div class="tabs">
        <button
            class="tab"
            class:active={activeTab === "active"}
            on:click={() => (activeTab = "active")}
        >
            {$t("downloads.tabs.active")} ({$downloads.filter(
                (d) => d.status === "active",
            ).length})
        </button>
        <button
            class="tab"
            class:active={activeTab === "waiting"}
            on:click={() => (activeTab = "waiting")}
        >
            {$t("downloads.tabs.waiting")} ({$downloads.filter(
                (d) => d.status === "waiting",
            ).length})
        </button>
        <button
            class="tab"
            class:active={activeTab === "stopped"}
            on:click={() => (activeTab = "stopped")}
        >
            {$t("downloads.tabs.stopped")} ({$downloads.filter(
                (d) =>
                    d.status === "complete" ||
                    d.status === "error" ||
                    d.status === "removed",
            ).length})
        </button>
    </div>

    <div class="download-items">
        {#if filteredDownloads.length === 0}
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <div class="empty-text">{$t("downloads.empty")}</div>
            </div>
        {:else}
            {#each filteredDownloads as download (download.gid)}
                <DownloadItem {download} />
            {/each}
        {/if}
    </div>
</div>

<style>
    .download-list {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        overflow: hidden;
    }

    .tabs {
        display: flex;
        border-bottom: 1px solid var(--border);
        background: var(--background);
    }

    .tab {
        flex: 1;
        padding: 0.75rem 1rem;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 2px solid transparent;
    }

    .tab:hover {
        color: var(--text);
        background: rgba(0, 0, 0, 0.02);
    }

    .tab.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
        background: var(--surface);
    }

    .download-items {
        min-height: 400px;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .empty-text {
        font-size: 1rem;
    }
</style>
