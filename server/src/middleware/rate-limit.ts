import rateLimit from "express-rate-limit";

/** 5 submissions per 15 minutes per IP — generous for a real visitor, tight for a script. */
export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Too many messages sent. Please try again in a few minutes." },
});

/** Loose ceiling on the public read-only content endpoints — not meant to bite real traffic, just scripted scraping/abuse. */
export const publicApiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Too many requests. Please slow down." },
});

/** Tight limit on login attempts per IP — slows down credential-stuffing/brute-force without locking out a real admin. */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Too many login attempts. Please try again in a few minutes." },
});

/** Generous ceiling on the tracking beacon — fires on every pageview/event, so real traffic can be bursty. */
export const analyticsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Too many requests." },
});
