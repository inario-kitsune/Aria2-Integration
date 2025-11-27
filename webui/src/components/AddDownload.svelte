<script>
    import { createEventDispatcher } from "svelte";
    import { aria2Client } from "../stores/client.js";
    import { t } from "../lib/i18n.js";

    const dispatch = createEventDispatcher();

    let urls = "";
    let loading = false;
    let error = "";

    async function handleSubmit() {
        if (!urls.trim()) {
            error = $t("addDownload.error.empty");
            return;
        }

        loading = true;
        error = "";

        const client = aria2Client.getInstance();
        if (!client) {
            error = $t("addDownload.error.notConnected");
            loading = false;
            return;
        }

        try {
            const urlList = urls
                .split("\n")
                .map((u) => u.trim())
                .filter((u) => u.length > 0);

            for (const url of urlList) {
                if (url.startsWith("magnet:") || url.match(/\.torrent$/i)) {
                    await client.addUri([url]);
                } else {
                    await client.addUri([url]);
                }
            }

            dispatch("close");
        } catch (err) {
            error = err.message || $t("addDownload.error.failed");
        } finally {
            loading = false;
        }
    }

    function handleCancel() {
        dispatch("close");
    }
</script>

<div class="overlay" on:click={handleCancel}>
    <div class="dialog" on:click|stopPropagation>
        <div class="dialog-header">
            <h2>{$t("addDownload.title")}</h2>
            <button class="close-btn" on:click={handleCancel}>✕</button>
        </div>

        <div class="dialog-body">
            <label for="urls">
                {$t("addDownload.urlLabel")}
            </label>
            <textarea
                id="urls"
                bind:value={urls}
                placeholder={$t("addDownload.urlPlaceholder")}
                rows="8"
            ></textarea>

            {#if error}
                <div class="error-message">{error}</div>
            {/if}
        </div>

        <div class="dialog-footer">
            <button
                class="btn btn-secondary"
                on:click={handleCancel}
                disabled={loading}
            >
                {$t("addDownload.cancel")}
            </button>
            <button
                class="btn btn-primary"
                on:click={handleSubmit}
                disabled={loading}
            >
                {loading ? $t("addDownload.adding") : $t("addDownload.add")}
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
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
    }

    textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: 0.375rem;
        font-family: inherit;
        font-size: 0.875rem;
        resize: vertical;
        background: var(--background);
        color: var(--text);
    }

    textarea:focus {
        outline: none;
        border-color: var(--primary);
    }

    .error-message {
        margin-top: 0.75rem;
        padding: 0.75rem;
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
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
