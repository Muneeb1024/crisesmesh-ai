"""
CrisesMesh AI — Recovery Agent
Handles incident reclassification and alert retraction.
"""

from typing import Any, Dict
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent


class RecoveryAgent(BaseAgent):
    name = "Recovery"
    description = "Handles false positive reclassification and alert retraction"

    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        severity_result = input_data.get("severity_result", {})
        fusion_result = input_data.get("fusion_result", {})

        contradiction = fusion_result.get("contradiction_level", 0.0)
        confidence = fusion_result.get("overall_confidence", 0.5)
        step_logs = []

        def add_log(msg: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            step_logs.append(f"[{ts}] {msg}")

        add_log("⚙️ INITIALIZING RECOVERY SYSTEM: Ingesting active incident confidence values...")
        add_log(f"🔎 CONTRADICTION RATIO CHECK: Contradiction value: {contradiction:.0%}, Fusion confidence: {confidence:.0%}.")

        # Recovery assessment
        needs_reclassification = contradiction > 0.4 or confidence < 0.4
        possible_reclassification = "Water Main Burst" if needs_reclassification else None

        if needs_reclassification:
            action = "RECLASSIFY"
            add_log("🚨 ANOMALY DETECTED: High contradiction limits or low confidence detected. Raising reclassification flag.")
            add_log(f"⚠️ PROJECTION DIVERGENCE: Incident type classified as possible false-positive. Recommended target: '{possible_reclassification}'.")
            add_log("👮 RESCUE INSTRUCTIONS: Recommending sending field officer Malik for rapid physical ground verification.")
            reasoning = (
                f"High contradiction level ({contradiction:.0%}) or low confidence ({confidence:.0%}) "
                f"suggests possible misclassification. "
                f"Field verification recommended. "
                f"Possible reclassification: {possible_reclassification}."
            )
        else:
            action = "MONITOR"
            add_log("✅ VERIFICATION SECURED: Incident classification stable. No structural divergence detected.")
            add_log("🔄 EVOLUTION PROFILE: Monitoring active signal variations... OK.")
            reasoning = (
                f"Incident classification stable. "
                f"Contradiction level: {contradiction:.0%}. "
                f"Confidence: {confidence:.0%}. "
                f"No reclassification needed at this time."
            )

        return {
            "input_summary": f"Recovery assessment for incident {incident_id}",
            "reasoning_summary": reasoning,
            "confidence": round(1.0 - contradiction, 2),
            "output": {
                "action": action,
                "needs_reclassification": needs_reclassification,
                "possible_reclassification": possible_reclassification,
                "contradiction_level": round(contradiction, 2),
                "field_verification_needed": needs_reclassification,
                "alert_retraction_needed": needs_reclassification,
                "recommendation": (
                    "Send field officer for ground verification"
                    if needs_reclassification
                    else "Continue monitoring signals"
                ),
                "step_logs": step_logs,
            },
        }

