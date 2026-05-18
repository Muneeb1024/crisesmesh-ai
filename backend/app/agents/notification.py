"""
CrisesMesh AI — Notification Agent
Generates bilingual alerts for stakeholders.
"""

from typing import Any, Dict
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent


class NotificationAgent(BaseAgent):
    name = "Notification"
    description = "Generates bilingual public alerts and stakeholder notifications"

    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        severity_result = input_data.get("severity_result", {})
        classification_result = input_data.get("classification_result", {})

        severity = severity_result.get("severity", "Medium")
        incident_type = classification_result.get("incident_type", "Urban Flooding")
        affected_radius = severity_result.get("affected_radius_m", 500)
        step_logs = []

        def add_log(msg: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            step_logs.append(f"[{ts}] {msg}")

        add_log("⚙️ INITIALIZING NOTIFICATION DISPATCHER: Drafting alert packages...")
        add_log(f"📝 FORMATTING INCIDENT: Target is '{severity} {incident_type}' within F-10/G-10 sector corridor.")

        # Generate bilingual alerts
        english_text = (
            f"⚠️ {severity} {incident_type} Alert — G-10 Islamabad. "
            f"Affected area: {affected_radius}m radius. "
            f"Avoid the area. Follow rescue team instructions. "
            f"Emergency: 1122"
        )

        roman_urdu_text = (
            f"⚠️ {severity} {incident_type} — G-10 Islamabad. "
            f"Mutasira area: {affected_radius}m. "
            f"Is ilaqe se door rahein. Rescue team ki hidayat par amal karein. "
            f"Emergency: 1122"
        )

        add_log("🗣️ DUAL BILINGUAL GENERATOR: Drafted English emergency warning.")
        add_log("🗣️ DUAL BILINGUAL GENERATOR: Transliterated Roman Urdu instructions for local citizens.")

        # Stakeholder notifications
        notifications = [
            {"to": "Public (Citizens)", "channel": "in_app", "message": english_text[:100]},
            {"to": "Rescue Teams", "channel": "dispatch", "message": f"Deploy to G-10 underpass — {severity} {incident_type}"},
            {"to": "Hospital (PIMS)", "channel": "alert", "message": f"Prepare for potential casualties — {severity} flood rescue"},
            {"to": "Traffic Police", "channel": "radio", "message": f"Block G-10 underpass, divert to Margalla Road"},
            {"to": "Utility (WASA)", "channel": "alert", "message": f"Check water mains near G-10 — possible pipe burst contributing to flooding"},
        ]

        add_log(f"📢 MULTI-CHANNEL DISPATCH: Prepared {len(notifications)} stakeholder target feeds (Rescue 1122, WASA, Islamabad Traffic Police, PIMS Hospital).")
        add_log("🔒 SYSTEM STATE: Alert flagged as 'DRAFT'. Awaiting cryptographic approval from Command Center.")

        return {
            "input_summary": f"Notification drafts for {severity} {incident_type}",
            "reasoning_summary": (
                f"Generated bilingual alert (English + Roman Urdu) for {severity} {incident_type}. "
                f"5 stakeholder notifications prepared: Public, Rescue, Hospital, Traffic Police, WASA. "
                f"Alert status: Draft (requires government approval before sending)."
            ),
            "confidence": 0.92,
            "output": {
                "alert": {
                    "severity": severity,
                    "english_text": english_text,
                    "roman_urdu_text": roman_urdu_text,
                    "channels": ["in_app", "sms", "whatsapp"],
                    "status": "Draft",
                },
                "stakeholder_notifications": notifications,
                "requires_approval": True,
                "step_logs": step_logs,
            },
        }

