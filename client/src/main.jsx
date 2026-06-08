const rootElement = document.getElementById("root");

const showStartupError = (error) => {
  if (!rootElement) {
    return;
  }

  rootElement.innerHTML = `
    <main style="font-family: Arial, sans-serif; padding: 32px; color: #1f2937;">
      <h1 style="margin: 0 0 12px;">Unable to load application</h1>
      <p style="margin: 0 0 16px;">Please redeploy the latest version or check the browser console.</p>
      <pre style="white-space: pre-wrap; background: #f3f4f6; padding: 16px; border-radius: 8px;">${
        error?.message || "Unknown startup error"
      }</pre>
    </main>
  `;
};

if (rootElement) {
  rootElement.innerHTML = `
    <main style="font-family: Arial, sans-serif; padding: 32px; color: #1f2937;">
      Loading Material Test Certificate Generator...
    </main>
  `;
}

Promise.all([
  import("react"),
  import("react-dom/client"),
  import("react-router-dom"),
  import("./App.jsx"),
  import("./styles.css")
])
  .then(([ReactModule, ReactDOMModule, RouterModule, AppModule]) => {
    const React = ReactModule.default;
    const ReactDOM = ReactDOMModule.default;
    const { BrowserRouter } = RouterModule;
    const App = AppModule.default;

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  })
  .catch(showStartupError);
