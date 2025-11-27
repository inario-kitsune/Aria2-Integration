<script>
    import { createEventDispatcher } from "svelte";
    import { aria2Client, connected } from "../stores/client.js";
    import {
        startDownloadUpdates,
        stopDownloadUpdates,
    } from "../stores/downloads.js";
    import { startStatsUpdates, stopStatsUpdates } from "../stores/stats.js";
    import { t } from "../lib/i18n.js";

    const dispatch = createEventDispatcher();

    let protocol = "ws";
    let host = "127.0.0.1";
    let port = "6800";
    let path = "jsonrpc";
    let secret = "";
    let saving = false;
    let error = "";
    let success = "";

    // Load current config
    async function loadConfig() {
        const client = aria2Client.getInstance();
        if (client && client.config) {
            protocol = client.config.protocol || "ws";
            host = client.config.host || "127.0.0.1";
            port = client.config.port || "6800";
            path = client.config.path || "jsonrpc";
            secret = client.config.secret || "";
        }
    }

    loadConfig();

    async function handleSave() {
        error = "";
        success = "";
        saving = true;

        try {
            // Stop existing updates
            stopDownloadUpdates();
            stopStatsUpdates();

            const newConfig = {
                protocol,
                host,
                port,
                path,
                secret,
            };

            // Initialize with new config
            aria2Client.initialize(newConfig);

            // Try to connect
            await aria2Client.connect();

            // Test connection by getting version
            const client = aria2Client.getInstance();
            await client.getVersion();

            // Connection successful - mark as connected and start updates
            connected.set(true);
            startDownloadUpdates();
            startStatsUpdates();

            // Save to localStorage (ArcUI's primary storage)
            if (typeof localStorage !== "undefined") {
                try {
                    localStorage.setItem(
                        "aria2_config",
                        JSON.stringify(newConfig),
                    );
                    console.log("Saved config to localStorage");
                } catch (e) {
                    console.warn("Failed to save to localStorage:", e);
                }
            }

            success =
                $t("settings.saveSuccess") || "Settings saved and connected!";

            // Close dialog after 1 second
            setTimeout(() => {
                dispatch("close");
            }, 1000);
        } catch (err) {
            error =
                err.message ||
                $t("settings.saveError") ||
                "Failed to connect to Aria2";
            connected.set(false);
        } finally {
            saving = false;
        }
    }

    function handleCancel() {
        dispatch("close");
    }
</script>

<div class="overlay" on:click={handleCancel}>
    <div class="dialog" on:click|stopPropagation>
        <div class="dialog-header">
            <h2>{$t("settings.title") || "Server Settings"}</h2>
            <button class="close-btn" on:click={handleCancel}>✕</button>
        </div>

        <div class="dialog-body">
            <div class="form-group">
                <label for="protocol"
                    >{$t("settings.protocol") || "Protocol"}</label
                >
                <select id="protocol" bind:value={protocol}>
                    <option value="ws">WebSocket (ws://)</option>
                    <option value="wss">WebSocket Secure (wss://)</option>
                    <option value="http">HTTP (http://)</option>
                    <option value="https">HTTPS (https://)</option>
                </select>
            </div>

            <div class="form-group">
                <label for="host">{$t("settings.host") || "Host"}</label>
                <input
                    id="host"
                    type="text"
                    bind:value={host}
                    placeholder="127.0.0.1"
                />
            </div>

            <div class="form-group">
                <label for="port">{$t("settings.port") || "Port"}</label>
                <input
                    id="port"
                    type="text"
                    bind:value={port}
                    placeholder="6800"
                />
            </div>

            <div class="form-group">
                <label for="path">{$t("settings.path") || "Path"}</label>
                <input
                    id="path"
                    type="text"
                    bind:value={path}
                    placeholder="jsonrpc"
                />
            </div>

            <div class="form-group">
                <label for="secret"
                    >{$t("settings.secret") || "Secret Token"}</label
                >
                <input
                    id="secret"
                    type="password"
                    bind:value={secret}
                    placeholder="Optional"
                />
            </div>

            {#if error}
                <div class="error-message">{error}</div>
            {/if}

            {#if success}
                <div class="success-message">{success}</div>
            {/if}
        </div>

        <div class="dialog-footer">
            <button
                class="btn btn-secondary"
                on:click={handleCancel}
                disabled={saving}
            >
                {$t("settings.cancel") || "Cancel"}
            </button>
            <button
                class="btn btn-primary"
                on:click={handleSave}
                disabled={saving}
            >
                {saving
                    ? $t("settings.saving") || "Saving..."
                    : $t("settings.save") || "Save & Connect"}
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
        max-width: 500px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
        max-height: 60vh;
        overflow-y: auto;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group:last-child {
        margin-bottom: 0;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
        color: var(--text);
    }

    input,
    select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: 0.375rem;
        font-family: inherit;
        font-size: 0.875rem;
        background: var(--background);
        color: var(--text);
    }

    input:focus,
    select:focus {
        outline: none;
        border-color: var(--primary);
    }

    .error-message {
        margin-top: 1rem;
        padding: 0.75rem;
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }

    .success-message {
        margin-top: 1rem;
        padding: 0.75rem;
        background: rgba(46, 160, 67, 0.1);
        color: var(--success);
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid var(--border);
    }

    .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-primary {
        background: var(--primary);
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        opacity: 0.9;
    }

    .btn-secondary {
        background: var(--background);
        color: var(--text);
        border: 1px solid var(--border);
    }

    .btn-secondary:hover:not(:disabled) {
        background: var(--border);
    }
</style>
