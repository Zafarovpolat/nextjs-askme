"use client";

import { useState } from "react";

const aboutTabs = [
  { id: "who", label: "Кто мы и куда?" },
  { id: "news", label: "Что нового" },
  { id: "ranks", label: "Система рангов" },
  { id: "rules", label: "Поддерживаем уют" },
  { id: "links", label: "Полезные ссылки" },
];

export default function AboutSidebarTabs() {
  const [activeTab, setActiveTab] = useState("who");

  return (
    <div className="about-sidebar">
      <h2 className="about-sidebar-title">Всё об otvetai</h2>
      <div className="about-tabs">
        {aboutTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`about-tab ${activeTab === tab.id ? "about-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
