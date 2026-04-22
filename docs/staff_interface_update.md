# 🚨 Feature Upgrade — Staff Interface (Real Parking Gate System)

This document defines the **actual operational UI** used by parking staff at a university motorbike parking gate.

This OVERRIDES all previous Staff Interface designs.

---

## 🎯 Goal

Build a **camera-first, event-driven interface** that mirrors real-world parking systems:

- Dual live camera feeds
- No manual form input
- Card reader triggers system actions
- Image capture on check-in
- Image comparison on check-out

---

## ⚙️ System Behavior (CRITICAL CHANGE)

This system is **event-driven**, not form-based.

### Input comes from:
- Card reader (student swipe/tap)
- License plate OCR (automatic)

👉 Staff does NOT type license plate or scan QR.

---

## 🎥 Camera System

### Required Views

1. **Front Camera (Camera trước)**
   - Captures student face

2. **Rear Camera (Camera sau)**
   - Captures license plate

---

## 🧱 UI Layout (Camera-First)

```

---

| Front Camera        | Rear Camera              |
| (Face)              | (License Plate)          |
--------------------------------------------------

## | Student Info        | Vehicle Info             |

## | Stored Images (ONLY on checkout)              |

## |   [Cho vào]     [Cho ra]     [Báo lỗi]         |

```

---

## 🟢 Check-in Flow (Vehicle Entering)

### Trigger:
- Student swipes card

### System Actions:
1. Backend identifies student
2. OCR detects license plate (automatic)

### UI Displays:
- Student name / ID
- Detected license plate
- Status (valid / unregistered)

### On "Cho vào":
- Capture images from BOTH cameras:
  - Face image
  - License plate image
- Show confirmation:
  - “Đã ghi nhận vào bãi”
  - Timestamp

---

## 🔴 Check-out Flow (Vehicle Leaving)

### Trigger:
- Student swipes card

### System Actions:
1. Backend retrieves:
   - Stored face image (check-in)
   - Stored plate image (check-in)

### UI Displays:

#### 🔥 CRITICAL — Comparison View

Show side-by-side:

- Current camera feeds:
  - Face (live)
  - Plate (live)

- Stored images:
  - Face (check-in)
  - Plate (check-in)

👉 Purpose:
- Staff visually verifies identity

---

### Staff Decision:

- ✅ **Cho ra** (Allow exit)
- ❌ **Báo lỗi / Từ chối** (Mismatch / issue)

---

## ⚠️ Alerts

Trigger alerts when:
- Card not recognized
- Vehicle not registered
- Face mismatch
- Plate mismatch

UI:
- Red warning banner
- Clear message
- Require manual decision

---

## ⚡ UX Requirements (VERY IMPORTANT)

- ZERO manual typing
- Fully driven by card swipe
- ≤ 2 taps per operation
- Large buttons (tablet-friendly)
- Real-time updates

---

## 🧪 Implementation Notes

### Camera
- Use:
  - navigator.mediaDevices.getUserMedia
- Display continuous live feed

---

### Image Capture
- Capture frame from video element on:
  - Check-in
- Store temporarily (mock backend)

---

### Mock Backend Behavior

Simulate:

- On check-in:
  - Save images by student/card ID

- On check-out:
  - Return stored images for comparison

---

## 🎯 Expected Result

The UI should feel like:

- A real parking gate terminal
- Fully automated (card + OCR)
- Staff only verifies and approves

NOT:
- A form-based system
- A CRUD dashboard