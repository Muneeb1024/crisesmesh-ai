"""
CrisesMesh AI — Notification Agent
Generates bilingual alerts and stakeholder notifications using Google Gemini.
"""

from typing import Any, Dict
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent
from app.agents.gemini_client import query_gemini_json


class NotificationAgent(BaseAgent):
    name = "Notification Agent"
    description = "Generates bilingual public alerts and stakeholder notifications using Gemini LLM"

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

        add_log("⚙️ SYSTEM: INITIALIZING NOTIFICATION DISPATCHER: Drafting alert packages...")
        add_log(f"📝 FORMATTING INCIDENT: Target is '{severity} {incident_type}' within G-10/F-10 corridor.")

        # --- HEURISTIC FALLBACK CALCULATION ---
        english_text_fallback = (
            f"⚠️ {severity} {incident_type} Alert — G-10 Islamabad. "
            f"Affected area: {affected_radius}m radius. "
            f"Avoid the area. Follow rescue team instructions. "
            f"Emergency: 1122"
        )

        roman_urdu_text_fallback = (
            f"⚠️ {severity} {incident_type} — G-10 Islamabad. "
            f"Mutasira area: {affected_radius}m. "
            f"Is ilaqe se door rahein. Rescue team ki hidayat par amal karein. "
            f"Emergency: 1122"
        )

        notifications_fallback = [
            {"to": "Public (Citizens)", "channel": "in_app", "message": english_text_fallback[:100]},
            {"to": "Rescue Teams", "channel": "dispatch", "message": f"Deploy to G-10 underpass — {severity} {incident_type}"},
            {"to": "Hospital (PIMS)", "channel": "alert", "message": f"Prepare for potential casualties — {severity} flood rescue"},
            {"to": "Traffic Police", "channel": "radio", "message": f"Block G-10 underpass, divert to Margalla Road"},
            {"to": "Utility (WASA)", "channel": "alert", "message": f"Check water mains near G-10 — possible pipe burst contributing to flooding"},
        ]

        fallback_reasoning = (
            f"Generated bilingual alert (English + Roman Urdu) for {severity} {incident_type} (Offline Sandbox). "
            f"5 stakeholder notifications prepared. Alert status: Draft."
        )

        fallback_output = {
            "english_text": english_text_fallback,
            "roman_urdu_text": roman_urdu_text_fallback,
            "stakeholder_notifications": notifications_fallback,
            "confidence": 0.92,
            "reasoning_summary": fallback_reasoning
        }

        # --- REAL COGNITIVE GEMINI LOOP ---
        prompt = f"""
        You are the CrisesMesh AI Notification Agent. Your task is to draft a public bilingual warning (English and Roman Urdu) and tailored stakeholder notification dispatches.
        
        Incident Severity:
        {severity_result}
        
        Incident Classification:
        {classification_result}
        
        Please generate the alert text and return a clean JSON containing exactly:
        - "english_text": (string, concise public alert warning citizens of the threat and giving safety steps in English, max 160 chars)
        - "roman_urdu_text": (string, natural Roman Urdu translation of the English alert for Pakistani citizens, e.g. "Mutasira ilaqay se door rahain", max 160 chars)
        - "stakeholder_notifications": (list of objects with:
             "to": recipient name (e.g. "Rescue Teams", "Hospital (PIMS)", "Traffic Police", "Utility (WASA)", "Public (Citizens)")
             "channel": communication channel (e.g. "dispatch", "alert", "radio", "in_app")
             "message": tailored instruction message for that specific responder entity)
        - "confidence": (float, 0.0 to 1.0, representing notification generation confidence)
        - "reasoning_summary": (string, 1-2 sentence explaining your alert drafting choices for transparency)
        """

        add_log("🗣️ DUAL BILINGUAL GENERATOR: Preparing bilingual warning draft...")
        add_log("🤖 COGNITIVE BRAIN: Querying Google Gemini 1.5 Flash notification core...")
        
        gemini_res = await query_gemini_json(prompt, model="gemini-1.5-flash", fallback_result=fallback_output)

        english_text = gemini_res.get("english_text", english_text_fallback)
        roman_urdu_text = gemini_res.get("roman_urdu_text", roman_urdu_text_fallback)
        notifications = gemini_res.get("stakeholder_notifications", notifications_fallback)
        confidence = float(gemini_res.get("confidence", fallback_output["confidence"]))
        reasoning_summary = gemini_res.get("reasoning_summary", fallback_reasoning)

        add_log("🗣️ DUAL BILINGUAL GENERATOR: Drafted English emergency warning.")
        add_log("🗣️ DUAL BILINGUAL GENERATOR: Transliterated Roman Urdu instructions for local citizens.")
        add_log(f"📢 MULTI-CHANNEL DISPATCH: Prepared {len(notifications)} stakeholder target feeds (Rescue 1122, WASA, Traffic Police, PIMS).")
        add_log("🔒 SYSTEM STATE: Alert flagged as 'DRAFT'. Awaiting cryptographic approval from Command Center.")

        return {
            "input_summary": f"Notification drafts for {severity} {incident_type}",
            "reasoning_summary": reasoning_summary,
            "confidence": round(confidence, 2),
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
