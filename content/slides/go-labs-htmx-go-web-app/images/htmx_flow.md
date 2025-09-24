# HTMX Flow Diagrams

## Simple Request Flow
```
User Action → HTMX → Server → HTML Response → DOM Update
```

## Detailed Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │    HTMX     │    │   Server    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       │ User clicks      │                  │
       │ hx-get="/data"   │                  │
       ├─────────────────►│                  │
       │                  │ GET /data        │
       │                  ├─────────────────►│
       │                  │                  │
       │                  │ HTML Response    │
       │                  │◄─────────────────┤
       │ DOM Updated      │                  │
       │◄─────────────────┤                  │
```

## State Management Comparison
```
Traditional SPA:
┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │
│   State     │    │   State     │
│ ┌─────────┐ │    │ ┌─────────┐ │
│ │ Redux   │ │    │ │Database │ │
│ │ Zustand │ │    │ │ Cache   │ │
│ │ Context │ │    │ │ Session │ │
│ └─────────┘ │    │ └─────────┘ │
└─────────────┘    └─────────────┘

HTMX:
┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │
│             │    │   State     │
│   DOM is    │    │ ┌─────────┐ │
│   the       │    │ │Database │ │
│   State     │    │ │ Session │ │
│             │    │ │ Cache   │ │
└─────────────┘    │ └─────────┘ │
                   └─────────────┘
```
