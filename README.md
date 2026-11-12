# Gemini NPC Dialogue System

**Dynamic NPC dialogue system powered by Generative AI, developed for RPG Maker MZ.**

This project was developed as part of a Computer Science undergraduate thesis (TCC). It explores the integration of Large Language Models (LLMs) into digital RPGs to enable dynamic, context-aware conversations between players and Non-Playable Characters (NPCs).

The system integrates Google Gemini models with RPG Maker MZ through a JavaScript plugin, a Cloudflare Workers serverless backend, and a Cloudflare D1 database for persistent conversation history.

## Features

- **Dynamic NPC Dialogue:** Free-text conversations powered by Google Gemini.
- **Custom NPC Personalities:** Configurable personas, dialogue examples, and narrative instructions.
- **Persistent Memory:** Conversation history stored in Cloudflare D1.
- **Campaign Separation:** Independent dialogue histories using `runId`.
- **User Authentication:** Login and session management.
- **Narrative Control:** Structured decisions and deterministic validation of in-game actions.
- **Interactive Shop:** Natural-language purchases and sales with inventory and currency validation.
- **Error Handling:** Retry/backoff and configurable Gemini models.

## Technologies

- JavaScript
- RPG Maker MZ
- Google Gemini API
- Cloudflare Workers
- Cloudflare D1 (SQLite)
- REST APIs

## Architecture

The system follows a modular architecture:

**Player → RPG Maker MZ → JavaScript Plugin → Cloudflare Worker → Gemini API**

Cloudflare Worker also communicates with Cloudflare D1 to store and retrieve conversation history associated with individual users, NPCs, and campaigns.

The language model generates dialogue and structured intentions, while RPG Maker MZ remains responsible for validating and executing gameplay actions.

## Project Status

Functional academic prototype developed and evaluated as part of an undergraduate Computer Science thesis. The evaluation was exploratory, involving five participants, and does not establish superiority over traditional dialogue systems.

## Author

Davi Darroit Dutra

Computer Science — Universidade do Vale do Itajaí (UNIVALI).