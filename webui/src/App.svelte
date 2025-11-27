<script>
    import { onMount, onDestroy } from "svelte";
    import { aria2Client, connected } from "./stores/client.js";
    import {
        downloads,
        startDownloadUpdates,
        stopDownloadUpdates,
    } from "./stores/downloads.js";
    import {
        stats,
        startStatsUpdates,
        stopStatsUpdates,
    } from "./stores/stats.js";
    import { t, locale, LOCALES, setLocale } from "./lib/i18n.js";
    import DownloadList from "./components/DownloadList.svelte";
    import AddDownload from "./components/AddDownload.svelte";
    import Stats from "./components/Stats.svelte";
    import Settings from "./components/Settings.svelte";
    import ConnectionInfo from "./components/ConnectionInfo.svelte";

    let showAddDialog = false;
    let showSettingsDialog = false;
    let showConnectionInfo = false;
    let showLangMenu = false;

    onMount(async () => {
        // ArcUI as standalone app - use localStorage as primary storage
        try {
            let serverConfig = null;

            // 1. Check for config passed via URL hash (from extension integration)
            const hashParams = new URLSearchParams(
                window.location.hash.slice(1),
            );
            if (hashParams.has("config")) {
                try {
                    serverConfig = JSON.parse(
                        decodeURIComponent(hashParams.get("config")),
                    );
                    console.log(
                        "Loaded config from URL hash (extension):",
                        serverConfig,
                    );
                } catch (e) {
                    console.warn("Failed to parse URL config:", e);
                }
            }

            // 2. Load from localStorage (ArcUI's primary storage)
            if (!serverConfig && typeof localStorage !== "undefined") {
                try {
                    const savedConfig = localStorage.getItem("aria2_config");
                    if (savedConfig) {
                        serverConfig = JSON.parse(savedConfig);
                        console.log(
                            "Loaded config from localStorage:",
                            serverConfig,
                        );
                    }
                } catch (e) {
                    console.warn("Failed to load from localStorage:", e);
                }
            }

            // 3. Fallback to default localhost config
            if (!serverConfig) {
                console.log("Using default config");
                serverConfig = {
                    protocol: "ws",
                    host: "127.0.0.1",
                    port: "6800",
                    path: "jsonrpc",
                    secret: "",
                };
            }

            // Initialize and connect
            aria2Client.initialize(serverConfig);
            await aria2Client.connect();

            // Verify connection by making a test call
            const client = aria2Client.getInstance();
            if (client) {
                try {
                    await client.getVersion();
                    // Connection verified, mark as connected and start updates
                    connected.set(true);
                    startDownloadUpdates();
                    startStatsUpdates();
                } catch (verifyError) {
                    console.error(
                        "Connection verification failed:",
                        verifyError,
                    );
                    connected.set(false);
                    aria2Client.disconnect();
                }
            }
        } catch (error) {
            console.error("Failed to initialize Aria2 client:", error);
            connected.set(false);
        }
    });

    onDestroy(() => {
        stopDownloadUpdates();
        stopStatsUpdates();
    });
</script>

<div class="app">
    <header class="header">
        <div class="header-content">
            <h1>{$t("app.name")}</h1>
            <div class="header-actions">
                {#if $connected}
                    <button
                        class="status-indicator connected clickable"
                        on:click={() => (showConnectionInfo = true)}
                        title={$t("header.connectionInfo") || "Connection Info"}
                    >
                        {$t("header.connected")}
                    </button>
                {:else}
                    <span class="status-indicator disconnected"
                        >{$t("header.disconnected")}</span
                    >
                {/if}

                <!-- Language Switcher -->
                <div class="lang-switcher">
                    <button
                        class="lang-btn"
                        on:click={() => (showLangMenu = !showLangMenu)}
                    >
                        🌐 {LOCALES[$locale]}
                    </button>
                    {#if showLangMenu}
                        <div class="lang-menu">
                            {#each Object.entries(LOCALES) as [code, name]}
                                <button
                                    class="lang-option"
                                    class:active={code === $locale}
                                    on:click={() => {
                                        setLocale(code);
                                        showLangMenu = false;
                                    }}
                                >
                                    {name}
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>

                <button
                    class="btn btn-primary"
                    on:click={() => (showAddDialog = true)}
                >
                    + {$t("header.addDownload")}
                </button>

                <button
                    class="btn btn-secondary"
                    on:click={() => (showSettingsDialog = true)}
                    title={$t("header.settings") || "Settings"}
                >
                    ⚙️
                </button>
            </div>
        </div>
    </header>

    <main class="main">
        <Stats />
        <DownloadList />
    </main>

    {#if showAddDialog}
        <AddDownload on:close={() => (showAddDialog = false)} />
    {/if}

    {#if showSettingsDialog}
        <Settings on:close={() => (showSettingsDialog = false)} />
    {/if}

    {#if showConnectionInfo}
        <ConnectionInfo on:close={() => (showConnectionInfo = false)} />
    {/if}
</div>

<style>
    .app {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--background);
        color: var(--text);
    }

    .header {
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .status-indicator {
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        border: none;
    }

    .status-indicator.connected {
        background: rgba(46, 160, 67, 0.1);
        color: var(--success);
    }

    .status-indicator.connected.clickable {
        cursor: pointer;
        transition: all 0.2s;
    }

    .status-indicator.connected.clickable:hover {
        background: rgba(46, 160, 67, 0.2);
    }

    .status-indicator.disconnected {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
    }

    .main {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;
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

    .btn-primary {
        background: var(--primary);
        color: white;
    }

    .btn-primary:hover {
        opacity: 0.9;
    }

    .btn-secondary {
        background: var(--background);
        color: var(--text);
        border: 1px solid var(--border);
    }

    .btn-secondary:hover {
        background: var(--surface);
    }

    .lang-switcher {
        position: relative;
    }

    .lang-btn {
        padding: 0.5rem 0.75rem;
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: 0.375rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text);
    }

    .lang-btn:hover {
        background: var(--surface);
    }

    .lang-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 0.375rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        min-width: 150px;
        z-index: 100;
    }

    .lang-option {
        display: block;
        width: 100%;
        padding: 0.75rem 1rem;
        background: none;
        border: none;
        text-align: left;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--text);
    }

    .lang-option:hover {
        background: var(--background);
    }

    .lang-option.active {
        color: var(--primary);
        font-weight: 500;
    }

    .lang-option:first-child {
        border-radius: 0.375rem 0.375rem 0 0;
    }

    .lang-option:last-child {
        border-radius: 0 0 0.375rem 0.375rem;
    }
</style>
