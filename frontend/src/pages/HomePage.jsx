// src/pages/HomePage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDevMode } from "../context/DevModeContext";
import { useLayout } from "../context/LayoutContext";
import useSiteSettings from "../hooks/useSiteSettings";
import HeroGalleryEditDialog from "../components/home/HeroGalleryEditDialog";
import { getImageUrl } from "../utils/imageUtils";
import "./styles/HomePage.css";

const SLIDE_INTERVAL = 5000;

function HomePage() {
  const { hasRole } = useAuth();
  const { devMode } = useDevMode();
  const { setHasHero, setHeroScrollThreshold } = useLayout();
  const { getHeroImages } = useSiteSettings();

  const isAdmin = hasRole("admin") && devMode;

  const [heroImages, setHeroImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);

  const intervalRef = useRef(null);
  const heroRef = useRef(null);

  // Signal that this page has a hero at the top
  useEffect(() => {
    setHasHero(true);
    return () => setHasHero(false);
  }, [setHasHero]);

  // Keep scroll threshold in sync with rendered hero height
  useEffect(() => {
    if (!heroRef.current) return;
    const updateThreshold = () => {
      if (heroRef.current) {
        setHeroScrollThreshold(heroRef.current.offsetHeight);
      }
    };
    updateThreshold();
    window.addEventListener("resize", updateThreshold);
    return () => window.removeEventListener("resize", updateThreshold);
  }, [heroImages, setHeroScrollThreshold]);

  const fetchHeroImages = useCallback(async () => {
    const response = await getHeroImages();
    if (response && response.data) {
      setHeroImages(response.data);
    }
  }, [getHeroImages]);

  useEffect(() => {
    fetchHeroImages();
  }, [fetchHeroImages]);

  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning || heroImages.length <= 1) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, heroImages.length],
  );

  const goNext = useCallback(() => {
    goToSlide((currentSlide + 1) % heroImages.length);
  }, [currentSlide, heroImages.length, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((currentSlide - 1 + heroImages.length) % heroImages.length);
  }, [currentSlide, heroImages.length, goToSlide]);

  // Auto-advance
  useEffect(() => {
    if (heroImages.length <= 1 || isPaused) return;
    intervalRef.current = setInterval(goNext, SLIDE_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [heroImages.length, isPaused, goNext]);

  const handleImagesUpdated = async () => {
    await fetchHeroImages();
    setCurrentSlide(0);
  };

  const hasImages = heroImages.length > 0;
  const currentImage = hasImages ? heroImages[currentSlide] : null;

  return (
    <div className="home-container">
      {/* Hero Slider — full-width, starts at top of viewport behind fixed header */}
      <div
        ref={heroRef}
        className="hero-slider-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`hero-slide ${isTransitioning ? "transitioning" : ""}`}
          style={
            currentImage
              ? {
                  backgroundImage: `url(${getImageUrl(currentImage.imageUrl)})`,
                }
              : {}
          }
        >
          {/* Fallback background when no image */}
          {!hasImages && <div className="hero-placeholder-bg" />}

          {/* Dark overlay */}
          <div className="hero-overlay" />

          {/* Text content */}
          <div className="hero-content">
            <h1 className="hero-title">Country Fair Days</h1>
            <p className="hero-subtitle">Community Events &amp; Recreation</p>
            <Link to="/events" className="hero-cta">
              View Events
            </Link>
          </div>

          {/* Navigation arrows */}
          {hasImages && heroImages.length > 1 && (
            <>
              <button
                className="hero-nav-btn hero-nav-prev"
                onClick={goPrev}
                aria-label="Previous slide"
                type="button"
              >
                ‹
              </button>
              <button
                className="hero-nav-btn hero-nav-next"
                onClick={goNext}
                aria-label="Next slide"
                type="button"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Dot indicators */}
        {hasImages && heroImages.length > 1 && (
          <div className="hero-dots">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                type="button"
              />
            ))}
          </div>
        )}
      </div>

      {/* Admin edit button */}
      {isAdmin && (
        <div className="hero-admin-bar">
          <button
            className="hero-edit-btn"
            onClick={() => setIsGalleryDialogOpen(true)}
            type="button"
          >
            {hasImages ? "Edit Hero Images" : "Add Hero Images"}
          </button>
        </div>
      )}

      {/* Page body */}
      <div className="home-body">
        <section className="welcome-section">
          <h2>Welcome to Country Fair Days</h2>
          <p>
            Join us for fun community events throughout the year. From festivals
            to sports tournaments, there&apos;s something for everyone.
          </p>
          <Link to="/events" className="primary-button">
            View Events
          </Link>
        </section>
      </div>

      {isGalleryDialogOpen && (
        <HeroGalleryEditDialog
          isOpen={isGalleryDialogOpen}
          onClose={() => setIsGalleryDialogOpen(false)}
          images={heroImages}
          onImagesUpdated={handleImagesUpdated}
        />
      )}
    </div>
  );
}

export default HomePage;
