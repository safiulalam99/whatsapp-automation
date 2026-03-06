# LEDGR - Functional Specification Document

## Overview
Ledgr is a WhatsApp-based client management system for accountants. It uses AI to automatically process incoming WhatsApp messages, understand what clients need, generate smart summaries, and help accountants respond quickly with minimal interaction.

---

## Core User Flow (Accountant's Perspective)

### 1. **Messages Come In Automatically**
- Accountant's clients send WhatsApp messages (e.g., "Bhai invoice pathao please urgently")
- Messages arrive via Whapi.Cloud webhook
- System saves ALL messages (casual greetings, business requests, everything)
- No manual import or sync needed - it's real-time

### 2. **AI Processes Every Message**
The AI (Claude 3.5 Haiku via OpenRouter) does several things:

**Per Individual Message:**
- Detects language (English, Bengali, Banglish, mixed)
- Identifies if it's casual ("hi", "thanks") or actionable ("send invoice")
- Extracts entities: amounts, currency, dates, document types
- Determines urgency (urgent, high, normal, low)

**Per Client Conversation:**
- Reads ALL messages from that client
- Generates ONE summary of what they want overall
- Examples:
  - "Client requesting invoice for December services"
  - "Casual greeting, no action needed"
  - "Client asked about VAT return, accountant said will check tomorrow"
- Detects conversation status:
  - **pending** = New, no response yet
  - **in_progress** = Accountant replied but conversation ongoing
  - **done** = Request completed or conversation closed
  - **follow_up** = Accountant needs to follow up later

**Smart Follow-Up Detection:**
- If accountant replies "I'll get back to you tomorrow"
- AI creates a reminder task with due date
- Accountant gets notified when follow-up is due

---

## What the Accountant Sees (Main Screen)

### **Inbox View - Two Priority Sections:**

**🔔 NEEDS REPLY** (Top section - Priority)
- Shows clients who need immediate attention
- Determined by AI based on:
  - Unanswered client messages
  - Urgent language detected
  - Follow-up reminders that are due
- Sorted by urgency + recency

**💬 ALL CONVERSATIONS** (Below section)
- Shows everyone who has messaged
- Including casual conversations
- Sorted by most recent activity

### **Each Conversation Shows:**
- **Client name** + phone number
- **AI-generated summary** (one sentence: "Client requesting invoice")
- **Time** since last message (2m ago, 45m ago, 3h ago)
- **Visual urgency indicator**:
  - 🔴 Red dot = Urgent
  - 🟡 Yellow dot = High priority
  - No dot = Normal
- **Status badge**:
  - 🔔 New
  - 💬 Active
  - ✓ Done
  - 🔄 Follow-up
- **Message count** (e.g., "3 messages")

---

## Primary User Actions (Minimal Interaction Design)

### **Mobile (390px - 768px):**

**Swipe Right (50%)** → Quick Send AI Reply
- Instantly sends the AI-generated reply
- No confirmation needed
- Conversation marked as "in progress"
- Haptic feedback confirms action

**Swipe Right (100%)** → Edit & Send
- Opens bottom sheet with editable reply
- Accountant can modify AI's draft
- Large "Send" button in thumb zone
- Can also mark done or snooze here

**Swipe Left (50%)** → Snooze 1 Hour
- Hides conversation for 1 hour
- Reappears automatically
- Visual feedback with amber background reveal

**Swipe Left (100%)** → Mark Done
- Conversation moves to "Done" section
- Fades to 60% opacity
- Can be un-done if needed

**Tap** → View Full Conversation
- Bottom sheet slides up (90% screen height)
- Shows ALL messages in chronological order
- Shows AI summary at top
- Reply box with AI draft pre-filled
- Primary action: Send Reply (emerald, prominent)
- Secondary actions: Mark Done, Snooze

### **Desktop (1024px+):**

**Click** → Select Conversation
- Right panel shows full conversation
- Left panel stays visible for quick scanning
- Emerald left border indicates selection

**Hover** → Quick Actions Appear
- Three buttons show on card:
  - **📤 Send** (emerald) - Send AI reply
  - **✓ Done** (gray) - Mark complete
  - **💤 Snooze** (gray) - Snooze 1 hour

**Keyboard Shortcuts:**
- **↑/↓** Navigate conversations
- **Enter** Open selected conversation
- **Cmd+R** Quick reply (sends AI draft)
- **Cmd+D** Mark done
- **Esc** Close detail panel

---

## AI Intelligence Examples

### Example 1: Invoice Request
**Client Message:** "Bhai invoice pathao please urgently chai"

**AI Processing:**
- Language: Banglish (Bengali + English mix)
- Type: Invoice request
- Urgency: High (detected "urgently", "please", "chai")
- Entities: { document_type: "invoice" }
- Summary: "Client requesting invoice urgently"
- Reply Draft (in Banglish): "Assalamualaikum! Invoice ta 10 minutes e pathacchi."
- Status: pending
- Needs Action: TRUE

**What Happens:**
- Conversation appears in "NEEDS REPLY" section with 🟡 yellow dot
- Accountant swipes right → AI reply sent automatically
- Conversation moves to "Active" section
- AI continues monitoring for client's response

### Example 2: Follow-Up Scenario
**Client:** "VAT certificate ta kobe pabo?"
**Accountant:** "Let me check with the team, will update you by tomorrow afternoon"

**AI Processing:**
- Detects follow-up promise: "tomorrow afternoon"
- Creates reminder task for accountant
- Sets due_date: Tomorrow at 2:00 PM
- Summary: "Client asked about VAT certificate, accountant promised update by tomorrow afternoon"
- Status: follow_up
- Follow-up message: "Check VAT certificate status and reply to client"

**What Happens:**
- Conversation shows 🔄 Follow-up badge
- Tomorrow at 2:00 PM → Conversation reappears in "NEEDS REPLY"
- Visual reminder: "Follow-up due: VAT certificate status"
- Accountant can quickly respond or snooze again

### Example 3: Casual Conversation
**Client:** "Bhai kemon achen? Long time!"

**AI Processing:**
- Type: Casual greeting
- Urgency: Low
- Summary: "Casual check-in, no business request"
- Needs Action: FALSE
- Status: in_progress (after accountant replies)

**What Happens:**
- Conversation appears in "ALL CONVERSATIONS" (not priority)
- No urgency indicator
- Accountant can reply casually or mark done
- Doesn't clutter the priority inbox

### Example 4: Auto-Status Update
**Client:** "Thanks bhai! Got the invoice."

**AI Processing:**
- Detects confirmation/completion language
- Type: Payment confirmation / acknowledgment
- Summary: "Client confirmed receipt of invoice"
- Recommended Status: done
- Needs Action: FALSE

**What Happens:**
- AI automatically marks conversation as "done"
- Conversation fades to 60% opacity
- Moves to bottom of list
- Accountant can override if needed

---

## Mass Messaging / Campaign Feature (Future Phase)

### Use Case:
Accountant needs to send "VAT deadline reminder" to 50 clients

### Flow:
1. Tap "📤 Campaigns" tab
2. Tap "+ New Campaign"
3. AI generates template: "Reminder: VAT deadline is December 31..."
4. Select recipients:
   - All clients (132)
   - Clients who need action (47) ← Smart filter
   - Select manually
5. Schedule:
   - Send now
   - Tomorrow at 9:00 AM
   - Pick custom date/time
6. Tap "Schedule Campaign"

### Smart Features:
- AI personalizes each message with client name
- Random 15-45 second delays between sends (anti-spam)
- Only sends to clients who have messaged first
- Respects quiet hours (no messages 11pm-7am)
- Shows delivery status: Sent, Delivered, Read

---

## Data Model (What AI Works With)

### **Clients Table:**
```
- wa_number (unique identifier)
- display_name
- conversation_summary (AI-generated)
- conversation_status (pending/in_progress/done/follow_up)
- last_message_at (timestamp)
- needs_action (boolean - appears in priority inbox)
- urgency (low/normal/high/urgent)
- message_count (total messages exchanged)
```

### **Messages Table:**
```
- client_id
- direction (in/out)
- body (message text)
- created_at
- raw_payload (full WhatsApp webhook data)
```

### **Follow-ups Table:**
```
- client_id
- message (what needs to be done)
- due_date (when to remind)
- status (pending/done/cancelled)
```

---

## Key Design Principles for UI Designer

### 1. **Speed is Everything**
- Accountants process dozens of messages daily
- Goal: <3 seconds from seeing message to sending reply
- Minimize clicks, maximize swipes and keyboard shortcuts

### 2. **WhatsApp-Native Feel**
- Accountants already use WhatsApp daily
- UI should feel familiar, not alien
- Dark theme (like WhatsApp dark mode)
- Green accent color for actions (emerald #10B981)

### 3. **Information Hierarchy**
Priority inbox logic:
1. **URGENT** (red dot) → Needs immediate attention
2. **High** (yellow dot) → Should respond today
3. **Normal** (no dot) → Can wait
4. **Done** (faded, checkmark) → Completed, reference only

### 4. **Progressive Disclosure**
- Don't show everything at once
- Quick glance: Name + Summary + Time
- Tap/Click for details: Full conversation + Reply box
- Advanced: Keyboard shortcuts for power users

### 5. **Mobile-First, Desktop-Enhanced**
- **Mobile:** Swipe gestures primary (thumb-friendly)
- **Desktop:** Keyboard shortcuts primary + mouse hover actions
- **Both:** Same data, same features, different interaction patterns

### 6. **AI Transparency**
- Show AI summary clearly
- Show AI-generated reply draft (let user edit)
- Don't hide that AI is doing work - embrace it
- "AI suggested:" prefix on drafts

### 7. **No Clutter**
- Empty states are good (no conversations = happy accountant)
- No unnecessary badges or notifications
- Only show urgency when truly urgent
- Use whitespace (or dark-space) generously

---

## Success Metrics (What Makes This App "Work")

1. **Reply Speed:** Average <30 seconds from message arrival to reply sent
2. **AI Accuracy:** 90%+ of AI summaries are accurate
3. **Action Rate:** 70%+ of replies use AI draft without edits
4. **Follow-up Completion:** 95%+ of follow-ups are completed on time
5. **User Satisfaction:** Accountant processes 2x more conversations in same time

---

## Technical Constraints for Designer

- **Framework:** Next.js 14 (React)
- **Styling:** TailwindCSS only (no Figma components, we code directly)
- **Fonts:** Inter (UI), JetBrains Mono (phone numbers, timestamps)
- **No external UI libraries:** Everything custom-built
- **Performance:** Must work smoothly on 390px width (iPhone 14)
- **Responsive:** One codebase, adapts to all screen sizes
- **Dark Theme Only:** Sophisticated dark (#0F0F0F background, not pitch black)

---

## Non-Goals (What This App Is NOT)

❌ Not a full CRM (no sales pipelines, no deal tracking)
❌ Not a team collaboration tool (no @mentions, no channels)
❌ Not a full WhatsApp replacement (accountant still uses WhatsApp app for calls, status, groups)
❌ Not a chatbot (AI helps accountant, doesn't replace them)
❌ Not multi-tenant (one accountant = one account = one WhatsApp number)

---

## Summary for Design AI

**Build a lightning-fast, WhatsApp-style inbox where:**
1. Conversations are auto-prioritized by AI
2. Accountant can reply with one swipe
3. AI handles summarization, urgency detection, and follow-up reminders
4. Design feels native to WhatsApp users
5. Works perfectly on mobile (swipes) and desktop (keyboard shortcuts)
6. Minimal interaction = maximum productivity

**Design References:**
- Superhuman (speed-first email)
- Linear (clean, modern, keyboard-driven)
- WhatsApp (familiar interaction patterns)
- Intercom inbox (conversation management)

**Core User Need:**
"I get 50+ client messages a day. I need to know who needs what, reply fast, and never forget follow-ups."
