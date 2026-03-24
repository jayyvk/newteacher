# NewTeacher

NewTeacher is an adaptive AI teacher for children.

It combines:

- a voice-first ElevenLabs classroom experience
- typed topic and optional uploaded lesson material as session grounding
- Firecrawl for live web context, current events, and modern relevance

The result is a teacher that explains topics at a child's level, answers follow-up questions in conversation, and connects classroom lessons to what is happening in the real world.

https://github.com/user-attachments/assets/23dd8c50-835b-4d4e-8c64-5d716b822bc4

## Problem

Children often learn from static textbooks that go out of date quickly. Even when the fundamentals are still correct, the examples, world context, and applications can feel disconnected from the present.

That creates a few problems:

- learning feels less relevant
- students cannot easily ask unlimited follow-up questions
- explanations are not adapted to each student's pace
- textbooks alone cannot connect old concepts to current events

## Solution

NewTeacher is a voice-first AI tutor that teaches from trusted textbook material first, then expands with live information only when useful.

Example:

- A student asks about World War II.
- NewTeacher explains the textbook topic in a child-friendly way.
- The student asks how wars still affect the world today.
- Firecrawl fetches relevant, current information.
- NewTeacher responds with a safe, age-appropriate comparison between the historical lesson and present-day events.

This makes learning feel alive instead of frozen in an old book.

## How It Works

### 1. Voice-native tutoring

Using an ElevenLabs voice agent, the student interacts naturally by speaking instead of typing.

The agent can:

- explain topics step by step
- ask check-for-understanding questions
- repeat or simplify answers
- turn lessons into back-and-forth conversation

### 2. Session grounding

The class starts with a topic, subject, and optional uploaded lesson material.

That session setup is passed into the teacher so it can:

- start from the requested topic immediately
- use uploaded lesson context when available
- stay aligned with the student's learning goal

### 3. Live context with Firecrawl

Firecrawl is used between turns whenever current context would improve the lesson.

Examples:

- recent space discoveries during a science lesson
- current climate events during geography lessons
- modern examples of democracy during civics lessons
- present-day consequences of historical conflicts during history lessons

This lets NewTeacher stay rooted in trusted learning material while still being current.

## Why This Matters

NewTeacher acts like a teacher who:

- knows the student's textbook
- speaks naturally
- adapts to the student's pace
- can bring in live, relevant context when the student is curious

It is not replacing curriculum. It is making curriculum adaptive, conversational, and current.

## Core User Flow

1. Student starts a class with a topic and subject.
2. Optional lesson material is added for session grounding.
3. The ElevenLabs teacher starts the lesson.
4. NewTeacher explains the topic conversationally.
5. If the student asks for modern relevance or live facts, Firecrawl fetches current web context.
6. The teacher responds with a richer answer and cites useful sources.
7. The class ends with a summary, transcript, and sources.

## Example Use Cases

- "Explain photosynthesis like I'm 8."
- "What happened in the Battle of Plassey?"
- "Does anything like that still affect countries today?"
- "Why is climate change in the news right now?"
- "Can you quiz me on this chapter?"

## Tech Stack

- ElevenLabs: voice agent for natural spoken tutoring
- Firecrawl: live web retrieval for current events and modern context
- Next.js 15 + React 19
- Local session parsing for uploaded lesson material

## Demo Story

The strongest demo is a short voice session:

1. A child asks NewTeacher to explain a textbook history topic.
2. NewTeacher gives a simple, accurate explanation grounded in the lesson.
3. The child asks how that topic relates to today's world.
4. Firecrawl retrieves current information.
5. NewTeacher gives a richer answer that connects the textbook to real life.
6. The agent ends with a quick quiz or recap.

## What Makes It Different

Most tutoring tools do one of two things:

- they are static and curriculum-bound
- or they are open-ended but not anchored to trusted learning material

NewTeacher combines both:

- grounded in textbooks
- delivered through voice
- enhanced with live context
- personalized to the student

## One-Line Pitch

NewTeacher is a voice AI teacher that starts from the student's lesson topic and uses live web context to make every class current, adaptive, and conversational.

## Short Submission Summary

NewTeacher is an AI teacher for children built with ElevenLabs and Firecrawl. It teaches through natural voice conversation, starts from the student's lesson topic and uploaded class material, and uses live web context to bring in modern relevance, current examples, and useful sources. Instead of following a static lesson, NewTeacher adapts to the student and to the world.
