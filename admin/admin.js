        :root {
            --primary: #cc1f2b;
            --dark: #0f0f14;
            --panel: #171720;
            --border: rgba(255,255,255,0.08);
            --text: #ffffff;
            --muted: #9aa0a6;
        }

        * { 
          box-sizing: border-box; 
          
        }

        body {
            margin: 0;
            font-family: Inter, system-ui, sans-serif;
            background: var(--dark);
            color: var(--text);
            height: 100vh;
            display: flex;
        }

        /* Sidebar */
        .sidebar {
            width: 300px;
            background: var(--panel);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
        }

        .sidebar-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid var(--border);
        }

        .sidebar-header img { width: 36px; }

        .session-list {
            flex: 1;
            overflow-y: auto;
        }

        .session {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border);
            cursor: pointer;
        }

        .session.active { background: rgba(204,31,43,0.15); }

        .session small { color: var(--muted); }

        /* Chat Panel */
        .chat-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .chat-header {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            background: var(--panel);
        }

        .chat-body {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
        }

        .msg {
            margin-bottom: 14px;
            max-width: 70%;
        }

        .msg.visitor {
            background: #222;
            padding: 12px;
            border-radius: 12px 12px 12px 0;
        }

        .msg.admin {
            background: var(--primary);
            margin-left: auto;
            padding: 12px;
            border-radius: 12px 12px 0 12px;
        }

        .chat-input {
            display: flex;
            border-top: 1px solid var(--border);
            background: var(--panel);
        }

        .chat-input input {
            flex: 1;
            padding: 14px;
            background: transparent;
            border: none;
            color: white;
            outline: none;
        }

        .chat-input button {
            background: var(--primary);
            border: none;
            color: white;
            padding: 0 22px;
            cursor: pointer;
        }

        .empty {
            color: var(--muted);
            text-align: center;
            margin-top: 20%;
        }

        .tier-card {
            background: rgba(255,255,255,0.03);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .tier-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
        }

        .tier-basic { background: #666; }
        .tier-premium { background: #4caf50; }
        .tier-vip { background: #ffd700; color: #000; }
        .tier-instructor { background: #2196f3; }
        .tier-admin { background: var(--primary); }

        select.tier-select {
            padding: 8px 12px;
            background: var(--panel);
            border: 1px solid var(--border);
            color: white;
            border-radius: 6px;
            cursor: pointer;
        }
