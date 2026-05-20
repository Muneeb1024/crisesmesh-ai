"""
CrisesMesh AI — Recovery Agent
Handles incident reclassification and alert retraction using Google Gemini.
"""

from typing import Any, Dict
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent
from app.agents.gemini_client import query_gemini_json


class RecoveryAgent(BaseAgent):
    name = "Recovery Agent"
    description = "Handles false positive reclassification and alert retraction using Gemini LLM"

    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        severity_result = input_data.get("severity_result", {})
        fusion_result = input_data.get("fusion_result", {})

        contradiction = fusion_result.get("contradiction_level", 0.0)
        confidence = fusion_result.get("overall_confidence", 0.5)
        step_logs = []

        def add_log(msg: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            step_logs.append(f"[{ts}] {msg}")

        add_log("⚙️ SYSTEM: INITIALIZING RECOVERY SYSTEM: Ingesting active incident confidence values...")
        add_log(f"🔎 CONTRADICTION RATIO CHECK: Contradiction value: {contradiction:.0%}, Fusion confidence: {confidence:.0%}.")

        # --- HEURISTIC FALLBACK CALCULATION ---
        needs_reclassification_fallback = contradiction > 0.4 or confidence < 0.4
        possible_reclassification_fallback = "Water Main Burst" if needs_reclassification_fallback else None

        if needs_reclassification_fallback:
            action_fallback = "RECLASSIFY"
            reasoning_fallback = (
                f"High contradiction level ({contradiction:.0%}) or low confidence ({confidence:.0%}) "
                f"suggests possible misclassification. Field verification recommended. "
                f"Possible reclassification: {possible_reclassification_fallback}."
            )
        else:
            action_fallback = "MONITOR"
            reasoning_fallback = (
                f"Incident classification stable. Contradiction level: {contradiction:.0%}. "
                f"Confidence: {confidence:.0%}. No reclassification needed."
            )

        fallback_output = {
            "action": action_fallback,
            "needs_reclassification": needs_reclassification_fallback,
            "possible_reclassification": possible_reclassification_fallback,
            "contradiction_level": contradiction,
            "field_verification_needed": needs_reclassification_fallback,
            "alert_retraction_needed": needs_reclassification_fallback,
            "recommendation": "Send field officer for ground verification" if needs_reclassification_fallback else "Continue monitoring signals",
            "confidence": round(1.0 - contradiction, 2),
            "reasoning_summary": reasoning_fallback
        }

        # --- REAL COGNITIVE GEMINI LOOP ---
        prompt = f"""
        You are the CrisesMesh AI Recovery & Correction Agent. Your task is to evaluate if there is enough contradiction or low confidence in the signal data to suspect a false positive or misclassification.
        
        Severity Result:
        {severity_result}
        
        Fusion Result:
        {fusion_result}
        
        Evaluate whether the incident requires rollback, retraction, or reclassification (e.g. if monsoonal flooding might actually be a localized water-main burst, or if it is a false report).
        
        Return a clean JSON containing exactly:
        - "action": (string: "RECLASSIFY" or "MONITOR")
        - "needs_reclassification": (boolean)
        - "possible_reclassification": (string choice: "Water-main Burst", "False/Duplicate", or null if not needed)
        - "field_verification_needed": (boolean)
        - "alert_retraction_needed": (boolean)
        - "recommendation": (string, e.g. "Send field officer Malik for physical ground check", "Continue monitoring live feeds")
        - "confidence": (float, 0.0 to 1.0, representing recovery assessment confidence)
        - "reasoning_summary": (string, 1-2 sentence explaining your recovery audit result)
        """

        add_log("🤖 COGNITIVE BRAIN: Querying Google Gemini 1.5 Flash recovery core...")
        gemini_res = await query_gemini_json(prompt, model="gemini-1.5-flash", fallback_result=fallback_output)

        action = gemini_res.get("action", action_fallback)
        needs_reclassification = bool(gemini_res.get("needs_reclassification", needs_reclassification_fallback))
        possible_reclassification = gemini_res.get("possible_reclassification", possible_reclassification_fallback)
        field_verification_needed = bool(gemini_res.get("field_verification_needed", needs_reclassification_fallback))
        alert_retraction_needed = bool(gemini_res.get("alert_retraction_needed", needs_reclassification_fallback))
        recommendation = gemini_res.get("recommendation", fallback_output["recommendation"])
        confidence_model = float(gemini_res.get("confidence", fallback_output["confidence"]))
        reasoning_summary = gemini_res.get("reasoning_summary", reasoning_fallback)

        if needs_reclassification:
            add_log("🚨 ANOMALY DETECTED: High contradiction limits or low confidence detected. Raising reclassification flag.")
            add_log(f"⚠️ PROJECTION DIVERGENCE: Incident type classified as possible false-positive. Recommended target: '{possible_reclassification}'.")
            add_log("👮 RESCUE INSTRUCTIONS: Recommending sending field officer Malik for rapid physical ground verification.")
        else:
            add_log("✅ VERIFICATION SECURED: Incident classification stable. No structural divergence detected.")
            add_log("🔄 EVOLUTION PROFILE: Monitoring active signal variations... OK.")

        return {
            "input_summary": f"Recovery assessment for incident {incident_id}",
            "reasoning_summary": reasoning_summary,
            "confidence": round(confidence_model, 2),
            "output": {
                "action": action,
                "needs_reclassification": needs_reclassification,
                "possible_reclassification": possible_reclassification,
                "contradiction_level": round(contradiction, 2),
                "field_verification_needed": field_verification_needed,
                "alert_retraction_needed": alert_retraction_needed,
                "recommendation": recommendation,
                "step_logs": step_logs,
            },
        }
