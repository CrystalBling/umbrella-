import React, { useState } from 'react';
import { MessageSquare, Users, ExternalLink, RefreshCw, MessageCircle } from 'lucide-react';
import { LocationInfo } from '../types';

interface DisqusCommentsProps {
  location?: LocationInfo;
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({ location }) => {
  const [reloadKey, setReloadKey] = useState(0);

  const cityName = location ? location.name : 'Global Community';
  const pageIdentifier = location 
    ? `needumbrella-city-${location.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` 
    : 'needumbrella-home-thread';
  
  const pageTitle = `UmbrellaCast Live Weather & Rain Discussion - ${cityName}`;
  const canonicalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}${location ? `?loc=${encodeURIComponent(location.name)}` : ''}`
    : 'https://needumbrella.disqus.com';

  // Safe isolated HTML for iframe: runs the exact needumbrella.disqus.com embed script in an isolated context
  const disqusIframeHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color-scheme: dark;
      background: transparent;
      color: #e2e8f0;
      min-height: 320px;
    }
    #disqus_thread {
      min-height: 280px;
    }
  </style>
</head>
<body>
  <div id="disqus_thread"></div>
  <script>
    // Suppress cross-origin noise inside the isolated frame
    window.onerror = function() { return true; };
    window.onunhandledrejection = function(e) { if (e) e.preventDefault(); return true; };

    var disqus_config = function () {
      this.page.url = "${canonicalUrl}";
      this.page.identifier = "${pageIdentifier}";
      this.page.title = "${pageTitle.replace(/"/g, '\\"')}";
    };

    (function() {
      try {
        var d = document, s = d.createElement('script');
        s.src = 'https://needumbrella.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
      } catch (err) {
        console.warn('Disqus loading issue:', err);
      }
    })();
  </script>
  <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
</body>
</html>`;

  return (
    <section id="community-discussion" className="my-8 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-xl p-5 sm:p-7 shadow-2xl transition-all">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Live Community Weather & Rain Reports
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Disqus Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Share real-time observations, rain reports, and umbrella advice for <span className="text-slate-200 font-medium">{cityName}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto">
          <Users className="w-4 h-4 text-cyan-400 shrink-0" />
          <a
            href="https://needumbrella.disqus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-300 transition-colors flex items-center gap-1 font-mono font-medium text-slate-300 hover:underline"
            title="Visit needumbrella on Disqus"
          >
            <span>needumbrella.disqus.com</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* Isolated Disqus Container */}
      <div className="min-h-[360px] bg-slate-950/60 rounded-2xl p-2 sm:p-4 border border-white/5 relative overflow-hidden">
        <iframe
          key={`${pageIdentifier}-${reloadKey}`}
          srcDoc={disqusIframeHtml}
          title={`Disqus Discussion - ${cityName}`}
          className="w-full min-h-[380px] border-0 rounded-xl bg-transparent"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Thread linked to <strong className="text-slate-300 font-normal">{cityName}</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setReloadKey((prev) => prev + 1)}
            className="hover:text-cyan-400 text-slate-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reload Comments</span>
          </button>
          <a
            href="https://needumbrella.disqus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <span>Open on Disqus</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
};

