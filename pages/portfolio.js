/* pages/portfolio.js */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import dynamic from "next/dynamic";
import Head from "next/head";
import { supabase } from "@/lib/supabaseClient";

/* ------------ background component ------------ */
const TunnelBackground = dynamic(
  () => import("@/components/TunnelBackground"),
  { ssr: false }
);

export default function Portfolio({ posts }) {
  const [showBackBtn, setShowBackBtn] = useState(false);
  /* --- slide-by-slide animation (no scrubbing) --- */
  useEffect(() => {
    if (!posts?.length) return;

    gsap.registerPlugin(ScrollTrigger);

    const slides = gsap.utils.toArray(".post-slide");
    const labelEl = document.querySelector(".category-label");

    // animate category label on change
    const animateLabel = (i) => {
      const newCat = posts[i].category;
      if (labelEl.textContent === newCat) return;
      const tl = gsap.timeline();
      tl.to(labelEl, { autoAlpha: 0, y: -20, duration: 0.2, ease: 'power1.in' });
      tl.call(() => (labelEl.textContent = newCat));
      tl.to(labelEl, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power1.out' });
    };
    // initial label without animation
    labelEl.textContent = posts[0].category;

    /* initial state for every slide */
    slides.forEach((slide) =>
      gsap.set(slide, { autoAlpha: 0, scale: 0.94, yPercent: 10 })
    );

    /* “play once per scroll” triggers for each slide */
    slides.forEach((slide, i) => {
      ScrollTrigger.create({
        trigger: slide,
        start: "top 65%",
        end: "bottom 35%",
        onEnter() {
          animateLabel(i);
          gsap.to(slide, {
            autoAlpha: 1,
            scale: 1,
            yPercent: 0,
            duration: 0.6,
            ease: "power3.out",
          });
        },
        onLeave() {
          gsap.to(slide, {
            autoAlpha: 0,
            scale: 1.04,
            yPercent: -10,
            duration: 0.6,
            ease: "power3.in",
          });
        },
        onEnterBack() {
          animateLabel(i);
          gsap.to(slide, {
            autoAlpha: 1,
            scale: 1,
            yPercent: 0,
            duration: 0.6,
            ease: "power3.out",
          });
        },
        onLeaveBack() {
          gsap.to(slide, {
            autoAlpha: 0,
            scale: 0.94,
            yPercent: 10,
            duration: 0.6,
            ease: "power3.in",
          });
        },
      });
    });
    // toggle back-to-top when sentinel at page end is in view
    const sentinel = document.querySelector('.scroll-end-sentinel');
    let observer;
    if (sentinel) {
      observer = new IntersectionObserver(([entry]) => {
        setShowBackBtn(entry.isIntersecting);
      }, { threshold: 1.0 });
      observer.observe(sentinel);
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      if (observer) observer.disconnect();
    };
  }, [posts]);

  /* --------------- JSX --------------- */
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+Pro:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          overflow-x: hidden;
        }

        /* fixed wrapper at mid-left */
        .category-label-wrapper {
          width: 0;
          height: 0;
          position: fixed;
          left: 40px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
        }

        /* rotated text inside wrapper */
        .category-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-90deg);
          transform-origin: center center;
          font-family: "Playfair Display", serif;
          font-size: 1.4rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          white-space: nowrap;
          text-align: center;
          color: #fff;
          text-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
        }

        /* vertical flow — one full-viewport slide per section */
        .slides-wrapper {
          width: 100%;
        }

        .post-slide {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
        }
        .post-slide:nth-child(odd) {
          flex-direction: row-reverse;
        }

        .slide-text {
          width: 45%;
        }
        .slide-text h2 {
          font-family: "Playfair Display", serif;
          font-size: 3rem;
          font-weight: 700;
          margin: 0 0 1rem;
          color: #fff;
        }
        .slide-desc {
          font-family: "Source Sans Pro", sans-serif;
          font-weight: 400;
          font-size: 1.2rem;
          line-height: 1.6;
          color: #eee;
        }
        .back-to-top {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translate(-50%, 20px);
          opacity: 0;
          pointer-events: none;
          padding: 0.75rem 1.25rem;
          font-size: 1rem;
          background: transparent;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          z-index: 5;
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .back-to-top.visible {
          opacity: 1;
          transform: translate(-50%, 0);
          pointer-events: auto;
        }
        .back-to-top:hover {
          /* gentle grow on hover */
          transform: translate(-50%, 0) scale(1.4);
        }
        .back-to-top img {
          width: 32px;
          height: 32px;
          transform: rotate(180deg);
          display: block;
        }
      `}</style>

      {/* background */}
      <TunnelBackground
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      />

      {/* fixed category indicator */}
      <div className="category-label-wrapper">
        <span className="category-label" />
      </div>

      {/* slide stack */}
      <div className="slides-wrapper">
        {posts.map((post) => (
          <section key={post.id} className="post-slide">
            {post.media_url && (
              <img
                src={post.media_url}
                alt={post.title}
                style={{
                  maxHeight: "80%",
                  maxWidth: "45%",
                  objectFit: "cover",
                }}
              />
            )}
            <div className="slide-text">
              <h2>{post.title}</h2>
              <div
                className="slide-desc"
                dangerouslySetInnerHTML={{ __html: post.description }}
              />
            </div>
          </section>
        ))}
      </div>
     {/* sentinel at end to detect bottom */}
     <div className="scroll-end-sentinel" style={{ height: '1px' }} />

     {/* back to top button */}
     <button
       className={`back-to-top ${showBackBtn ? 'visible' : ''}`}
       onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
       aria-label="Back to Top"
     >
       <img src="/images/portfilio/arrow.gif" alt="Back to Top" width="32" height="32" />
     </button>
    </>
  );
}

/* ---------- server-side data ---------- */
export async function getServerSideProps() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,title,description,media_url,category,featured,privacy,profiles(id,username,avatar_url)"
    )
    .eq("featured", true)
    .eq("privacy", "Public")
    .order("category", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) console.error("Error fetching featured posts:", error.message);

  return { props: { posts: data || [] } };
}
