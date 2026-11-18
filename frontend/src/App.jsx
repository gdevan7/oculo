import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import LoginDialog from "./components/LoginDialog.jsx";
import HomePage from "./pages/HomePage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import CameraConsent from "./features/tryon/CameraConsent.jsx";
import TryOnModal from "./features/tryon/TryOnModal.jsx";
import { fallbackCatalog } from "./data/glasses.js";
import { getGlasses } from "./services/api.js";
import { hasCameraConsent, grantCameraConsent } from "./lib/cameraConsent.js";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export default function App() {
  const [catalog, setCatalog] = useState(fallbackCatalog);
  const [activeProduct, setActiveProduct] = useState(null);
  const [consentProduct, setConsentProduct] = useState(null);
  const [page, setPage] = useState("home");
  const [showLogin, setShowLogin] = useState(false);
  const [scrollToAbout, setScrollToAbout] = useState(false);

  const requestTryOn = (item) => {
    if (hasCameraConsent()) setActiveProduct(item);
    else setConsentProduct(item);
  };

  const acceptCameraConsent = () => {
    grantCameraConsent();
    setActiveProduct(consentProduct);
    setConsentProduct(null);
  };

  useEffect(() => {
    if (page === "home" && scrollToAbout) {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setScrollToAbout(false);
    }
  }, [page, scrollToAbout]);

  useEffect(() => {
    let live = true;
    getGlasses().then((data) => {
      if (!live || !Array.isArray(data)) return;
      setCatalog(fallbackCatalog.map((item) => { const row = data.find((entry) => entry.name === item.name || entry.id === item.id); return { ...item, ...(row || {}), model_url: item.model_url, price: item.price, subtitle: item.subtitle, colors: item.colors }; }));
    }).catch(() => {});
    return () => { live = false; };
  }, []);

  const goHome = () => { setPage("home"); setScrollToAbout(false); scrollToTop(); };
  const goCatalog = () => { setScrollToAbout(false); setPage("catalog"); scrollToTop(); };
  const goAbout = () => {
    if (page === "home") document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    else { setScrollToAbout(true); setPage("home"); }
  };

  return (
    <main className="catalog-page">
      <Header page={page} onHome={goHome} onCatalog={goCatalog} onAbout={goAbout} onLogin={() => setShowLogin(true)}/>

      {page === "home" ? (
        <HomePage onOpenCatalog={goCatalog} onExploreCatalog={() => setPage("catalog")}/>
      ) : (
        <CatalogPage catalog={catalog} onTryOn={requestTryOn}/>
      )}

      <Footer onHome={() => { setPage("home"); setScrollToAbout(false); }}/>

      {showLogin && <LoginDialog onClose={() => setShowLogin(false)}/>}
      {consentProduct && <CameraConsent onAgree={acceptCameraConsent} onDisagree={() => setConsentProduct(null)}/>}
      {activeProduct && <TryOnModal product={activeProduct} onSelect={setActiveProduct} onClose={() => setActiveProduct(null)}/>}
    </main>
  );
}
