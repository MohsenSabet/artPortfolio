/* pages/portfolio.js */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import React, { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import portfolioStyles from "@/styles/portfolioStyles";

/* ------------ background component ------------ */
const TunnelBackground = dynamic(
  () => import("@/components/TunnelBackground"),
  { ssr: false }
);

export default function Portfolio({ posts, profile }) {
  // back-to-top always visible, no toggle state needed

  // helper to format custom post date consistently
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  /* --- slide-by-slide animation (no scrubbing) --- */
  useEffect(() => {
    if (!posts?.length) return;

    gsap.registerPlugin(ScrollTrigger);

    const slides = gsap.utils.toArray(".post-slide:not(.intro-slide)");
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

    // initial label and ribbon hidden off-screen for graceful entrance
    gsap.set('.category-label', { autoAlpha: 0, x: -30 });
    gsap.set('.vertical-ribbon-wrapper', { autoAlpha: 0, x: 30 });

    // reveal label and ribbon immediately after a small scroll
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top -1', // when body has scrolled 1px
      onEnter: () => {
        const tlImmediate = gsap.timeline();
        tlImmediate.to('.category-label', { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' });
        tlImmediate.to('.vertical-ribbon-wrapper', { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' }, '-=0.4');
      },
      onLeaveBack: () => {
        const tlHide = gsap.timeline();
        tlHide.to('.category-label', { autoAlpha: 0, x: -30, duration: 0.5, ease: 'power3.in' });
        tlHide.to('.vertical-ribbon-wrapper', { autoAlpha: 0, x: 30, duration: 0.5, ease: 'power3.in' }, '-=0.4');
      },
    });

    /* initial state for every slide */
    slides.forEach((slide) =>
      gsap.set(slide, { autoAlpha: 0, scale: 0.94, yPercent: 10 })
    );

    /* play triggers for each slide */
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
    // hide intro slide and organically reveal label and ribbon
    ScrollTrigger.create({
      trigger: '#slide-0',
      start: 'top top',
      onEnter: () => {
        const tl = gsap.timeline();
        tl.to('#intro-slide', { autoAlpha: 0, yPercent: -100, duration: 0.8, ease: 'power3.in' });
        tl.to('.category-label', { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4');
        tl.to('.vertical-ribbon-wrapper', { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
      },
      onLeaveBack: () => {
        const tl2 = gsap.timeline();
        tl2.to('.category-label', { autoAlpha: 0, x: -30, duration: 0.8, ease: 'power3.in' });
        tl2.to('.vertical-ribbon-wrapper', { autoAlpha: 0, x: 30, duration: 0.8, ease: 'power3.in' }, '-=0.6');
        tl2.to('#intro-slide', { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
      }
    });

    // ...existing cleanup of ScrollTrigger...
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [posts]);

  /* --------------- JSX --------------- */
  return (
    <>
      {/* global styles */}
      <style jsx global>{portfolioStyles}</style>

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

      {/* vertical ribbon with thumbnails */}
      <div className="vertical-ribbon-wrapper">
        <div className="vertical-ribbon">
          {posts.map((post, idx) => (
            <img
              key={post.id}
              src={post.media_url}
              alt={post.title}
              onClick={() => document.getElementById(`slide-${idx}`)?.scrollIntoView({ behavior: 'smooth' })}
            />
          ))}
        </div>
      </div>

      {/* slide stack */}
      <div className="slides-wrapper">
        {/* inline intro slide with call-to-action */}
        <section id="intro-slide" className="post-slide intro-slide">
          <span className="slide-indicator">
            Scroll
            <img src="/images/portfilio/arrow.gif" alt="down arrow" />
          </span>
        </section>
        {posts.map((post, idx) => (
          <section id={`slide-${idx}`} key={post.id} className="post-slide">
            {post.media_url && (
              <img
                src={post.media_url}
                alt={post.title}
                className="slide-image"
              />
            )}
            <div className="slide-text">
              <h2>{post.title}</h2>
              {post.date && (
                <p className="slide-date">{formatDate(post.date)}</p>
              )}
              <div
                className="slide-desc"
                dangerouslySetInnerHTML={{ __html: post.description }}
              />
            </div>
          </section>
        ))}
      </div>

      {/* artist info section */}
      {profile && (
        <div className="artist-info">
          <h2>Meet the Artist</h2>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={`${profile.first_name} ${profile.last_name}`}
            />
          )}
          <h3>
            {profile.first_name} {profile.last_name}
            {profile.pronouns && ` (${profile.pronouns})`}
          </h3>
          {profile.portfolio_intro && <p>{profile.portfolio_intro}</p>}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <Link href="/about" className="about-link">Learn more about the artist &rarr;</Link>
        </div>
      )}

      {/* back to top button relocated */}
      <button
        className="back-to-top visible"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to Top"
      >
        <img src="/images/portfilio/arrow.gif" alt="Back to Top" width="32" height="32" />
      </button>

      {/* end of page content */}
    </>
  );
}

/* ---------- server-side data ---------- */
export async function getServerSideProps() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,title,description,media_url,category,featured,privacy,date,profiles(id,username,avatar_url)"
    )
    .eq("featured", true)
    .eq("privacy", "Public")
    .order("category", { ascending: false })
    .order("date", { ascending: true });

  if (error) console.error("Error fetching featured posts:", error.message);

  // fetch artist profile intro only
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("first_name,last_name,pronouns,avatar_url,portfolio_intro");
  if (profileError) console.error("Error fetching profile:", profileError.message);
  const profile = profiles?.[0] || null;

  return { props: { posts: data || [], profile } };
}
