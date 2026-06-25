"use client";
import { useEffect } from "react";

export default function ApiDocsPage() {
  useEffect(() => {
    // Load Swagger UI CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css";
    document.head.appendChild(link);

    // Load Swagger UI Bundle JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js";
    script.async = true;
    script.onload = () => {
      const scriptPreset = document.createElement("script");
      scriptPreset.src = "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js";
      scriptPreset.async = true;
      scriptPreset.onload = () => {
        // Initialize Swagger UI
        // @ts-ignore
        window.SwaggerUIBundle({
          url: "/swagger.json",
          dom_id: "#swagger-ui",
          presets: [
            // @ts-ignore
            window.SwaggerUIBundle.presets.apis,
            // @ts-ignore
            window.SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout",
        });
      };
      document.body.appendChild(scriptPreset);
    };
    document.body.appendChild(script);

    return () => {
      // Clean up scripts and stylesheets if page unmounts
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div id="swagger-ui"></div>
    </div>
  );
}
