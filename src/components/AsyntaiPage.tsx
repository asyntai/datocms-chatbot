import { RenderPageCtx } from 'datocms-plugin-sdk';
import { Canvas, Button, Spinner } from 'datocms-react-ui';
import { useState, useEffect, useCallback } from 'react';

type Props = {
  ctx: RenderPageCtx;
};

type Settings = {
  site_id: string;
  script_url: string;
  account_email: string;
};

export default function AsyntaiPage({ ctx }: Props) {
  const [settings, setSettings] = useState<Settings>({
    site_id: '',
    script_url: 'https://asyntai.com/static/js/chat-widget.js',
    account_email: '',
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectingStatus, setConnectingStatus] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [copied, setCopied] = useState(false);

  // Load settings from plugin parameters
  useEffect(() => {
    const params = ctx.plugin.attributes.parameters as Settings;
    setSettings({
      site_id: params?.site_id || '',
      script_url: params?.script_url || 'https://asyntai.com/static/js/chat-widget.js',
      account_email: params?.account_email || '',
    });
    setLoading(false);
  }, [ctx]);

  const generateState = useCallback(() => {
    return 'datocms_' + Math.random().toString(36).substr(2, 9);
  }, []);

  const saveConnection = useCallback(async (data: { site_id: string; script_url?: string; account_email?: string }): Promise<boolean> => {
    try {
      setConnectingStatus('Connected! Saving...');

      const payload = {
        site_id: data.site_id,
        script_url: data.script_url || 'https://asyntai.com/static/js/chat-widget.js',
        account_email: data.account_email || '',
      };

      await ctx.updatePluginParameters(payload);
      setSettings(payload);
      setConnecting(false);
      setConnectingStatus('');
      ctx.notice('Asyntai connected successfully!');
      return true;
    } catch (error: unknown) {
      console.error('[Asyntai] Save error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setConnecting(false);
      setConnectingStatus('');
      ctx.alert(`Connection failed: ${errorMessage}`);
      return false;
    }
  }, [ctx]);

  const pollForConnection = useCallback((state: string) => {
    let attempts = 0;
    const maxAttempts = 60;
    let isConnected = false;

    const checkConnection = () => {
      if (isConnected) {
        return;
      }

      attempts++;

      if (attempts > maxAttempts) {
        console.error('[Asyntai] Connection timeout after', maxAttempts, 'attempts');
        setConnecting(false);
        setConnectingStatus('');
        ctx.alert('Connection timeout. Please try again or use the manual link below.');
        return;
      }

      const script = document.createElement('script');
      const callbackName = `asyntaiCallback_${Date.now()}`;

      (window as unknown as Record<string, unknown>)[callbackName] = async (data: { site_id?: string; script_url?: string; account_email?: string }) => {
        delete (window as unknown as Record<string, unknown>)[callbackName];
        if (script.parentNode) {
          document.head.removeChild(script);
        }

        if (data && data.site_id) {
          const success = await saveConnection(data as { site_id: string; script_url?: string; account_email?: string });
          if (success) {
            isConnected = true;
          } else {
            console.warn('[Asyntai] Save failed, will retry');
            setTimeout(checkConnection, 500);
          }
        } else {
          setTimeout(checkConnection, 500);
        }
      };

      const scriptUrl = `https://asyntai.com/connect-status.js?state=${encodeURIComponent(state)}&cb=${callbackName}`;
      script.src = scriptUrl;
      script.onerror = () => {
        delete (window as unknown as Record<string, unknown>)[callbackName];
        if (script.parentNode) {
          document.head.removeChild(script);
        }
        setTimeout(checkConnection, 1000);
      };
      document.head.appendChild(script);

      setTimeout(() => {
        if ((window as unknown as Record<string, unknown>)[callbackName]) {
          delete (window as unknown as Record<string, unknown>)[callbackName];
          if (script.parentNode) {
            document.head.removeChild(script);
          }
          setTimeout(checkConnection, 500);
        }
      }, 3000);
    };

    // Start checking after a short delay
    setTimeout(checkConnection, 800);
  }, [ctx, saveConnection]);

  const openPopup = () => {
    const state = generateState();
    setCurrentState(state);
    setConnecting(true);
    setConnectingStatus('Waiting for authorization...');

    const url = `https://asyntai.com/wp-auth?platform=datocms&state=${encodeURIComponent(state)}`;

    const w = 800;
    const h = 720;
    // Use screen dimensions instead of window.top (which is blocked in cross-origin iframes)
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const y = Math.max(0, (screenHeight - h) / 2);
    const x = Math.max(0, (screenWidth - w) / 2);
    const popup = window.open(
      url,
      'asyntai_connect',
      `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h},top=${y},left=${x}`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      console.error('[Asyntai] Popup blocked');
      setConnecting(false);
      setConnectingStatus('');
      ctx.alert('Popup blocked. Please allow popups and try again.');
    } else {
      pollForConnection(state);
    }
  };

  const resetConnection = async () => {
    if (!confirm('Are you sure you want to disconnect Asyntai?')) {
      return;
    }

    try {
      await ctx.updatePluginParameters({
        site_id: '',
        script_url: 'https://asyntai.com/static/js/chat-widget.js',
        account_email: '',
      });
      setSettings({
        site_id: '',
        script_url: 'https://asyntai.com/static/js/chat-widget.js',
        account_email: '',
      });
      ctx.notice('Settings reset successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.alert(`Reset failed: ${errorMessage}`);
    }
  };

  const copySnippet = () => {
    const snippet = `<script src="${settings.script_url}" data-asyntai-id="${settings.site_id}" async></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    ctx.notice('Code copied to clipboard');
  };

  const connected = settings.site_id?.trim() !== '';

  if (loading) {
    return (
      <Canvas ctx={ctx}>
        <div style={styles.container}>
          <h1 style={styles.heading}>Asyntai AI Chatbot</h1>
          <p>Loading...</p>
        </div>
      </Canvas>
    );
  }

  return (
    <Canvas ctx={ctx}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Asyntai AI Chatbot</h1>

        <div style={styles.statusSection}>
          <p style={styles.statusText}>
            Status:{' '}
            <span style={{ color: connected ? '#008a20' : '#a00', fontWeight: 'bold' }}>
              {connected ? 'Connected' : 'Not connected'}
            </span>
            {connected && settings.account_email && ` as ${settings.account_email}`}
          </p>
          {connected && (
            <Button
              buttonType="muted"
              buttonSize="s"
              onClick={resetConnection}
            >
              Reset
            </Button>
          )}
        </div>

        {connected ? (
          <div style={styles.connectedBox}>
            <h3 style={styles.subHeading}>
              Add this JavaScript snippet to all pages where you want to enable the chatbot
            </h3>

            <div style={styles.codeContainer}>
              <pre style={styles.codeBlock}>
                <code>{`<script src="${settings.script_url}" data-asyntai-id="${settings.site_id}" async></script>`}</code>
              </pre>
              <div style={styles.centeredContent}>
                <Button
                  buttonType="primary"
                  buttonSize="s"
                  onClick={copySnippet}
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
            </div>

            <div style={styles.centeredContent}>
              <p style={styles.infoText}>
                Set up your AI chatbot, review chat logs and more:
              </p>
              <Button
                buttonType="primary"
                buttonSize="l"
                onClick={() => window.open('https://asyntai.com/dashboard', '_blank')}
              >
                Open Asyntai Panel
              </Button>
              <p style={styles.tipText}>
                <strong>Tip:</strong> If you want to change how the AI answers, please{' '}
                <a
                  href="https://asyntai.com/dashboard#setup"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  go here
                </a>
                .
              </p>
            </div>
          </div>
        ) : (
          <div style={styles.disconnectedBox}>
            {connecting && (
              <div style={styles.connectingBox}>
                <Spinner size={32} />
                <p style={styles.connectingText}>{connectingStatus}</p>
              </div>
            )}
            {!connecting && (
              <>
                <p style={styles.infoText}>
                  Create a free Asyntai account or sign in to enable the chatbot
                </p>
                <Button buttonType="primary" buttonSize="l" onClick={openPopup}>
                  Get started
                </Button>
                <p style={styles.tipText}>
                  If it doesn't work,{' '}
                  <a
                    href={`https://asyntai.com/wp-auth?platform=datocms&state=${currentState || generateState()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                    onClick={(e) => {
                      const state = generateState();
                      setCurrentState(state);
                      setConnecting(true);
                      setConnectingStatus('Waiting for authorization...');
                      (e.target as HTMLAnchorElement).href = `https://asyntai.com/wp-auth?platform=datocms&state=${state}`;
                      setTimeout(() => pollForConnection(state), 1000);
                    }}
                  >
                    open the connect window
                  </a>
                  .
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </Canvas>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 600,
    marginBottom: '24px',
    color: '#1a1a2e',
  },
  statusSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  statusText: {
    margin: 0,
    fontSize: '16px',
  },
  connectedBox: {
    padding: '32px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
  },
  disconnectedBox: {
    padding: '48px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    textAlign: 'center' as const,
  },
  connectingBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '20px',
  },
  connectingText: {
    fontSize: '16px',
    color: '#2563eb',
    fontWeight: 500,
    margin: 0,
  },
  subHeading: {
    fontSize: '18px',
    fontWeight: 500,
    marginBottom: '20px',
    textAlign: 'center' as const,
    color: '#333',
  },
  codeContainer: {
    marginBottom: '24px',
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '14px',
    overflowX: 'auto' as const,
    marginBottom: '12px',
    fontFamily: 'monospace',
  },
  centeredContent: {
    textAlign: 'center' as const,
  },
  infoText: {
    marginBottom: '16px',
    color: '#555',
    fontSize: '16px',
  },
  tipText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
};
