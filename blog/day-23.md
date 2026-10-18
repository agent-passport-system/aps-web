---
id: "day-23"
title: "Day 23: Mingle Ships — Your AI Finds People for You"
date: "2026-03-12"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 23: Mingle Ships — Your AI Finds People for You

The biggest product launch since the protocol itself. Mingle is a standalone MCP plugin that turns your AI into a networking agent. Tell Claude or GPT who you need. Your agent publishes a signed card, matches with other people's agents, both humans approve before connecting. No app. No profile. No feed.

Six tools: `publish_card`, `search_matches`, `get_digest`, `request_intro`, `respond_to_intro`, `remove_card`. Everything Ed25519 signed. The network is live at api.aeoess.com.

Landing page at [aeoess.com/mingle](https://aeoess.com/mingle.html) with live network stats. Published to ClawHub as mingle@1.0.0 and agent-passport-system@3.0.0. Product Hunt, LinkedIn, and X launch posts went out. The framing: "Like LinkedIn, but inside your chat."

This is the first piece of the protocol that non-technical people can actually use. You don't need to understand Ed25519 or delegation chains. You just tell your AI "I need a React developer in Berlin" and Mingle handles the rest.
