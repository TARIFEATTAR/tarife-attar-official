# Customer Service Portal Proposal for Tarife Attar

## Executive Summary

A sophisticated, unified customer service portal that consolidates FAQ, help desk, ticketing, chat, and voice agent capabilities into a single, elegant interface that matches Tarife Attar's brand aesthetic and storytelling voice.

## Current State

✅ **Already Built:**
- CompassCurator chat interface (Atlas AI guide)
- Vercel AI SDK integration with OpenAI
- Chat API route (`/api/chat`)
- Consult page (`/consult`)

❌ **Missing:**
- FAQ/Help Desk system
- Ticketing system integration
- Voice agent capability
- Unified customer service portal
- Knowledge base

## Proposed Architecture

### 1. **Unified Portal Structure** (`/support`)

```
/support
├── /faq (Searchable FAQ with categories)
├── /help (Help articles & guides)
├── /contact (Ticket creation + chat)
├── /chat (Enhanced chat interface)
└── /voice (Voice agent interface)
```

### 2. **Core Components**

#### A. **Enhanced Chat Interface** (Building on CompassCurator)
- **Multi-mode support:**
  - Text chat (existing)
  - Voice chat (new)
  - Hybrid mode (voice + text)
- **Context awareness:**
  - Customer order history
  - Product recommendations
  - Previous conversations
- **Escalation to human:**
  - Seamless handoff to ticketing system
  - Live agent availability indicator

#### B. **FAQ/Knowledge Base System**
- **Sanity CMS integration:**
  - FAQ entries as document types
  - Categorized by: Orders, Products, Shipping, Returns, etc.
  - Searchable with semantic search
- **Smart suggestions:**
  - AI suggests relevant FAQs based on chat context
  - Auto-links to help articles

#### C. **Ticketing System Integration**
- **Supported platforms:**
  - Zendesk
  - Intercom
  - Freshdesk
  - Custom API integration
- **Features:**
  - Auto-create tickets from chat
  - Ticket status tracking
  - Customer ticket history
  - Email notifications

#### D. **Voice Agent**
- **Technology stack:**
  - Web Speech API (browser-based)
  - OpenAI Whisper (speech-to-text)
  - ElevenLabs or similar (text-to-speech with custom voice)
  - Same voice as storytelling content
- **Capabilities:**
  - Natural conversation flow
  - Multi-turn dialogue
  - Context retention
  - Emotion detection

### 3. **Technical Implementation**

#### Phase 1: Foundation (Week 1-2)
```typescript
// New Sanity Schema
{
  name: 'faqEntry',
  type: 'document',
  fields: [
    { name: 'question', type: 'string' },
    { name: 'answer', type: 'array', of: [{type: 'block'}] },
    { name: 'category', type: 'string' },
    { name: 'tags', type: 'array', of: [{type: 'string'}] },
    { name: 'relatedProducts', type: 'array', of: [{type: 'reference', to: [{type: 'product'}]}] }
  ]
}

{
  name: 'helpArticle',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'content', type: 'array', of: [{type: 'block'}] },
    { name: 'category', type: 'string' },
    { name: 'featured', type: 'boolean' }
  ]
}
```

#### Phase 2: Enhanced Chat (Week 3-4)
```typescript
// Enhanced chat API with context
// /api/support/chat/route.ts
- Add customer context (orders, cart, history)
- FAQ suggestion integration
- Ticket creation on escalation
- Voice transcription support
```

#### Phase 3: Voice Agent (Week 5-6)
```typescript
// Voice agent component
// /src/components/support/VoiceAgent.tsx
- Web Speech API integration
- Real-time transcription
- Voice synthesis with custom voice
- Conversation state management
```

#### Phase 4: Ticketing Integration (Week 7-8)
```typescript
// Ticketing API routes
// /api/support/tickets/route.ts
- Create tickets
- Fetch ticket status
- Update tickets
- Integration with Zendesk/Intercom/etc.
```

### 4. **User Experience Flow**

```
Customer needs help
    ↓
1. Lands on /support
    ↓
2. Sees options:
   - Search FAQ
   - Browse Help Articles
   - Start Chat (Text or Voice)
   - Create Ticket
    ↓
3. If chat:
   - AI answers immediately
   - Suggests relevant FAQs
   - Can escalate to ticket
   - Can switch to voice
    ↓
4. If voice:
   - Natural conversation
   - Same voice as storytelling
   - Can switch to text
   - Can create ticket
    ↓
5. Ticket created:
   - Auto-populated with conversation
   - Customer can track status
   - Email notifications
```

### 5. **Design Considerations**

- **Brand consistency:**
  - Same aesthetic as CompassCurator
  - Maintains "Atlas" storytelling voice
  - Elegant, minimal, sophisticated
- **Accessibility:**
  - Keyboard navigation
  - Screen reader support
  - Voice input/output alternatives
- **Mobile-first:**
  - Responsive design
  - Touch-optimized voice controls
  - Progressive web app features

### 6. **Recommended Tech Stack**

#### Core
- **Next.js 14** (already using)
- **Sanity CMS** (already using) - for FAQ/Help content
- **Vercel AI SDK** (already using) - for chat
- **TypeScript** (already using)

#### New Additions
- **OpenAI Whisper API** - Speech-to-text
- **ElevenLabs API** - Text-to-speech (custom voice)
- **Zendesk API** or **Intercom API** - Ticketing
- **Algolia** or **Sanity's search** - FAQ search
- **Web Speech API** - Browser voice input

#### Optional Enhancements
- **Crisp** or **Intercom** - Live chat widget (fallback)
- **Calendly** - Appointment booking for consultations
- **Stripe Customer Portal** - Order management integration

### 7. **Voice Agent Specifications**

#### Voice Characteristics
- Match storytelling voice tone
- Warm, knowledgeable, sophisticated
- Slight accent/character (if applicable)
- Natural pauses and intonation

#### Capabilities
- Understand context from previous messages
- Access to:
  - Product catalog
  - Order history
  - FAQ knowledge base
  - Shipping information
- Can perform actions:
  - Look up orders
  - Suggest products
  - Create tickets
  - Schedule consultations

### 8. **Integration Points**

#### Shopify Integration
- Order lookup
- Product information
- Inventory status
- Shipping tracking

#### Sanity Integration
- FAQ content
- Help articles
- Product details
- Storytelling content (for voice personality)

#### Email Integration
- Ticket notifications
- Order confirmations
- Follow-up surveys

### 9. **Implementation Phases**

#### Phase 1: MVP (4 weeks)
- FAQ system in Sanity
- Enhanced chat with FAQ suggestions
- Basic ticket creation
- Simple search

#### Phase 2: Voice (4 weeks)
- Voice input/output
- Custom voice integration
- Conversation flow improvements

#### Phase 3: Advanced (4 weeks)
- Full ticketing system integration
- Advanced analytics
- Customer history integration
- Multi-language support (if needed)

### 10. **Success Metrics**

- **Response time:** < 30 seconds for AI responses
- **Resolution rate:** 70%+ resolved without human intervention
- **Customer satisfaction:** 4.5+ stars
- **Ticket reduction:** 40% reduction in support tickets
- **Voice adoption:** 30%+ of users try voice interface

### 11. **Cost Considerations**

#### Monthly Costs (Estimated)
- **OpenAI API:** $50-200 (depending on usage)
- **ElevenLabs:** $22-330 (voice synthesis)
- **Zendesk/Intercom:** $50-150 (ticketing)
- **Algolia (optional):** $99+ (search)
- **Total:** ~$221-780/month

#### Development Time
- **Phase 1:** 4 weeks (1 developer)
- **Phase 2:** 4 weeks (1 developer + voice engineer)
- **Phase 3:** 4 weeks (1 developer)
- **Total:** 12 weeks

### 12. **Alternative Approaches**

#### Option A: All-in-One Platform
- Use **Intercom** or **Zendesk** as base
- Pros: Faster setup, built-in features
- Cons: Less customization, may not match brand

#### Option B: Custom Build (Recommended)
- Build on existing infrastructure
- Pros: Full control, brand consistency, scalable
- Cons: More development time

#### Option C: Hybrid
- Use platform for ticketing
- Custom chat/voice interface
- Pros: Best of both worlds
- Cons: Integration complexity

## Recommendation

**Build a custom solution** that:
1. Extends your existing CompassCurator chat
2. Adds Sanity-based FAQ/Help system
3. Integrates with ticketing platform (Zendesk recommended)
4. Adds voice agent with custom voice
5. Creates unified `/support` portal

This approach:
- ✅ Maintains brand consistency
- ✅ Leverages existing infrastructure
- ✅ Provides full customization
- ✅ Scales with your needs
- ✅ Creates unique customer experience

## Next Steps

1. **Decide on ticketing platform** (Zendesk, Intercom, or custom)
2. **Set up Sanity schema** for FAQ/Help content
3. **Design `/support` portal** layout
4. **Plan voice agent personality** and voice selection
5. **Create development timeline** and milestones

Would you like me to start implementing any specific part of this proposal?
