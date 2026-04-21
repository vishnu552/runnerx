'use client';

import { useState } from 'react';

export default function TabsViewer({ tabs }) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || null);

  if (!tabs || tabs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
        Information coming soon.
      </div>
    );
  }

  const activeTab = tabs.find((t, idx) => (t.id || idx) === activeTabId) || tabs[0];

  return (
    <div className="tabs-container">
      {/* Sidebar Navigation */}
      <div className="tabs-sidebar">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id || `tab-${idx}`}
            onClick={() => setActiveTabId(tab.id || idx)}
            className={`tab-btn ${activeTabId === (tab.id || idx) ? 'active' : ''}`}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-title">{tab.title}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="tab-content-area">
        {activeTab ? (
          <div 
            key={activeTab.id} // Re-render animation if needed
            className="category-tab-content rich-text fade-in"
            dangerouslySetInnerHTML={{ __html: activeTab.body }} 
          />
        ) : null}
      </div>

      <style jsx>{`
        .tabs-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          align-items: start;
        }
        
        .tabs-sidebar {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: sticky;
          top: 100px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          color: var(--text-secondary);
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .tab-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(229, 57, 53, 0.3);
        }

        .tab-icon {
          font-size: 1.2rem;
          opacity: 0.8;
        }

        .tab-btn.active .tab-icon {
          opacity: 1;
        }

        .tab-title {
          font-size: 0.95rem;
        }

        .tab-content-area {
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 40px;
          min-height: 400px;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .tabs-container {
            grid-template-columns: 1fr;
          }
          .tabs-sidebar {
            position: relative;
            top: 0;
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
            scroll-snap-type: x mandatory;
          }
          .tab-btn {
            flex-shrink: 0;
            scroll-snap-align: start;
            padding: 12px 16px;
          }
          .tab-content-area {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
