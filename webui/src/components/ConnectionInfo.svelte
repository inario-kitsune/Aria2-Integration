<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { aria2Client } from "../stores/client.js";
    import { t } from "../lib/i18n.js";

    const dispatch = createEventDispatcher();

    let loading = true;
    let error = "";
    let versionInfo = null;
    let globalStat = null;
    let sessionInfo = null;

    onMount(async () => {
        await loadConnectionInfo();
    });

    async function loadConnectionInfo() {
        loading = true;
        error = "";

        const client = aria2Client.getInstance();
        if (!client) {
            error = "Client not available";
            loading = false;
            return;
        }

        try {
            // Get version info
            versionInfo = await client.getVersion();

            // Get global stats
            globalStat = await client.getGlobalStat();

            // Get session info
            try {
                sessionInfo = await client.getSessionInfo();
            } catch (e) {
                console.warn("Failed to get session info:", e);
            }
        } catch (err) {
            error = err.message || "Failed to load connection info";
        } finally {
            loading = false;
        }
    }

    function handleClose() {
        dispatch("close");
    }

    function formatBytes(bytes) {
        if (!bytes || bytes === "0") return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
</script>

<div class="overlay" on:click={handleClose}>
    <div class="dialog" on:click|stopPropagation>
        <div class="dialog-header">
            <h2>{$t("connectionInfo.title") || "Connection Information"}</h2>
            <button class="close-btn" on:click={handleClose}>✕</button>
        </div>

        <div class="dialog-body">
            {#if loading}
                <div class="loading">
                    <div class="spinner"></div>
                    <p>{$t("connectionInfo.loading") || "Loading..."}</p>
                </div>
            {:else if error}
                <div class="error-message">{error}</div>
            {:else}
                <!-- Server Info -->
                {#if aria2Client.getInstance()}
                    <div class="info-section">
                        <h3>{$t("connectionInfo.server") || "Server"}</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.protocol") ||
                                        "Protocol"}:</span
                                >
                                <span class="value"
                                    >{aria2Client
                                        .getInstance()
                                        ?.protocol?.toUpperCase()}</span
                                >
                            </div>
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.host") ||
                                        "Host"}:</span
                                >
                                <span class="value"
                                    >{aria2Client.getInstance()?.host}</span
                                >
                            </div>
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.port") ||
                                        "Port"}:</span
                                >
                                <span class="value"
                                    >{aria2Client.getInstance()?.port}</span
                                >
                            </div>
                        </div>
                    </div>
                {/if}

                <!-- Version Info -->
                {#if versionInfo}
                    <div class="info-section">
                        <h3>{$t("connectionInfo.version") || "Version"}</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.aria2Version") ||
                                        "Aria2 Version"}:</span
                                >
                                <span class="value version"
                                    >{versionInfo.version}</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Features -->
                    {#if versionInfo.enabledFeatures && versionInfo.enabledFeatures.length > 0}
                        <div class="info-section">
                            <h3>
                                {$t("connectionInfo.features") ||
                                    "Enabled Features"}
                            </h3>
                            <div class="features">
                                {#each versionInfo.enabledFeatures as feature}
                                    <span class="feature-badge">{feature}</span>
                                {/each}
                            </div>
                        </div>
                    {/if}
                {/if}

                <!-- Global Stats -->
                {#if globalStat}
                    <div class="info-section">
                        <h3>
                            {$t("connectionInfo.statistics") || "Statistics"}
                        </h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.downloadSpeed") ||
                                        "Download Speed"}:</span
                                >
                                <span class="value"
                                    >{formatBytes(
                                        globalStat.downloadSpeed,
                                    )}/s</span
                                >
                            </div>
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.uploadSpeed") ||
                                        "Upload Speed"}:</span
                                >
                                <span class="value"
                                    >{formatBytes(
                                        globalStat.uploadSpeed,
                                    )}/s</span
                                >
                            </div>
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.numActive") ||
                                        "Active Downloads"}:</span
                                >
                                <span class="value">{globalStat.numActive}</span
                                >
                            </div>
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.numWaiting") ||
                                        "Waiting"}:</span
                                >
                                <span class="value"
                                    >{globalStat.numWaiting}</span
                                >
                            </div>
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.numStopped") ||
                                        "Stopped"}:</span
                                >
                                <span class="value"
                                    >{globalStat.numStopped}</span
                                >
                            </div>
                        </div>
                    </div>
                {/if}

                <!-- Session Info -->
                {#if sessionInfo}
                    <div class="info-section">
                        <h3>{$t("connectionInfo.session") || "Session"}</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label"
                                    >{$t("connectionInfo.sessionId") ||
                                        "Session ID"}:</span
                                >
                                <span class="value mono"
                                    >{sessionInfo.sessionId}</span
                                >
                            </div>
                        </div>
                    </div>
                {/if}
            {/if}
        </div>

        <div class="dialog-footer">
            <button class="btn btn-primary" on:click={handleClose}>
                {$t("connectionInfo.close") || "Close"}
            </button>
        </div>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .dialog {
        background: var(--surface);
        border-radius: 0.5rem;
        width: 90%;
        max-width: 600px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        max-height: 80vh;
        display: flex;
        flex-direction: column;
    }

    .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border);
    }

    .dialog-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .close-btn {
        width: 2rem;
        height: 2rem;
        padding: 0;
        background: none;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 1.25rem;
        color: var(--text-secondary);
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: var(--background);
        color: var(--text);
    }

    .dialog-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 0;
        color: var(--text-secondary);
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .error-message {
        padding: 1rem;
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }

    .info-section {
        margin-bottom: 1.5rem;
    }

    .info-section:last-child {
        margin-bottom: 0;
    }

    .info-section h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text);
    }

    .info-grid {
        display: grid;
        gap: 0.75rem;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border);
    }

    .info-item:last-child {
        border-bottom: none;
    }

    .label {
        font-size: 0.875rem;
        color: var(--text-secondary);
        font-weight: 500;
    }

    .value {
        font-size: 0.875rem;
        color: var(--text);
        font-weight: 500;
    }

    .value.version {
        color: var(--primary);
        font-family: monospace;
    }

    .value.mono {
        font-family: monospace;
        font-size: 0.75rem;
    }

    .features {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .feature-badge {
        padding: 0.25rem 0.75rem;
        background: rgba(59, 130, 246, 0.1);
        color: var(--primary);
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1.5rem;
        border-top: 1px solid var(--border);
    }

    .btn {
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-primary {
        background: var(--primary);
        color: white;
    }

    .btn-primary:hover {
        opacity: 0.9;
    }
</style>
