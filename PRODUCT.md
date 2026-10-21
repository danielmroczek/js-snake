# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static vanilla JavaScript (ES modules) with HTML5 Canvas and Alpine.js for UI state binding. Pico CSS via CDN as a base stylesheet, project `styles.css` for theme. Zero build step — any static file server works (`npx serve .`). Tests via Node's built-in test runner (`npm test`).

## Users

The developer/owner and their portfolio visitors. JS-Snake is shown as a demo of frontend craft: the primary use is someone playing a quick round in a browser after opening the repo or portfolio link.

## Product Purpose

A classic Snake game that feels excellent to play. Success is judged by game feel — smoothness, responsiveness, juice — with polish outranking new features.

## Positioning

Zero-dependency, zero-build classic Snake that runs anywhere a browser runs, with a clean snapshot-based architecture (Game → Renderer seam) and CSS-driven theming. Its differentiator is engineering clarity plus game feel, not feature volume.

## Operating Context

Played in a desktop browser; must also work on mobile (touch controls planned/needed). Keyboard: arrows/WASD to steer, Space to pause, R to restart. Served over HTTP due to ES modules.

## Capabilities and Constraints

- Wrap-around board (edges teleport, not kill)
- Direction input queue (up to 10 buffered turns)
- Death animation: segments gray out sequentially before game-over overlay
- All colors/sizes/ratios are CSS custom properties on `:root` — restyling must not require JS changes
- Renderer consumes plain-object snapshots; narrow, testable seam
- ES modules require an HTTP server (no `file://` openings)

## Brand Commitments

Name: JS-Snake. No other binding identity constraints recorded.

## Evidence on Hand

Gameplay implementation, README.md (~60 lines), unit tests (`test/game.test.js`, `test/renderer.test.js`). No screenshots, videos, testimonials, or metrics exist — do not fabricate them.

## Product Principles

1. Game feel first: every change should make play smoother, snappier, or more satisfying.
2. Zero build: the game must stay openable with a static server and nothing else.
3. Theme in CSS, logic in JS: visual changes never touch game logic.
4. Small, honest code: narrow seams and testing discipline are part of the product.

## Accessibility & Inclusion

Verbatim user instruction: "Should work on mobile too." Touch/swipe controls and a responsive layout are required in future work.
