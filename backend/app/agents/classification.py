"""
CrisesMesh AI — Classification Agent
Classifies incident type with confidence and alternative hypotheses using Google Gemini.
"""

from typing import Any, Dict
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent
from app.agents.gemini_client import query_gemini_json


class ClassificationAgent(BaseAgent):
    name = "Classification Agent"
    description = "Classifies the incident type based on fused signals using Gemini LLM"

    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        signals = input_data.get("signals", [])
        fusion_result = input_data.get("fusion_result", {})
        step_logs = []

        def add_log(msg: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            step_logs.append(f"[{ts}] {msg}")

        add_log("⚙️ SYSTEM: INITIALIZING CLASSIFIER: Receiving fused signal vectors...")
        add_log(f"🔎 COGNITIVE SCAN: Commencing semantic analysis on {len(signals)} sources.")

        # --- HEURISTIC FALLBACK CALCULATION ---
        category_counts: Dict[str, int] = {}
        for s in signals:
            text = s.get("text", "").lower()
            if "flood" in text or "water" in text or "pani" in text:
                category_counts["Urban Flooding"] = category_counts.get("Urban Flooding", 0) + 1
            if "drain" in text or "nala" in text:
                category_counts["Drain Overflow"] = category_counts.get("Drain Overflow", 0) + 1
            if "water main" in text or "pipe" in text or "burst" in text:
                category_counts["Water Main Burst"] = category_counts.get("Water Main Burst", 0) + 1

        if not category_counts:
            category_counts["Urban Flooding"] = len(signals)

        primary_fallback = max(category_counts, key=category_counts.get)  # type: ignore
        total_fallback = sum(category_counts.values())
        primary_confidence_fallback = category_counts[primary_fallback] / max(total_fallback, 1)
        
        alternatives_fallback = [
            {"type": k, "confidence": round(v / total_fallback, 2)}
            for k, v in sorted(category_counts.items(), key=lambda x: -x[1])
            if k != primary_fallback
        ]
        overall_confidence_fallback = round(
            primary_confidence_fallback * 0.6 + fusion_result.get("overall_confidence", 0.5) * 0.4, 2
        )

        fallback_reasoning = (
            f"Analyzed signal text content and metadata (Offline Sandbox). "
            f"Primary classification: {primary_fallback} ({primary_confidence_fallback:.0%} signal match). "
            f"Alternative hypotheses: {', '.join(a['type'] for a in alternatives_fallback) or 'none'}."
        )

        fallback_output = {
            "incident_type": primary_fallback,
            "type_confidence": round(primary_confidence_fallback, 2),
            "overall_confidence": overall_confidence_fallback,
            "alternative_hypotheses": alternatives_fallback,
            "classification_label": "HIGH" if overall_confidence_fallback > 0.7 else "MODERATE" if overall_confidence_fallback > 0.5 else "LOW",
            "reasoning_summary": fallback_reasoning
        }

        # --- REAL COGNITIVE GEMINI LOOP ---
        prompt = f"""
        You are the CrisesMesh AI Classification Agent. Your task is to classify an emergency incident based on fused signal inputs.
        
        Here are the fused signals:
        {signals}
        
        Fusion Result:
        {fusion_result}
        
        Please classify this incident into one of the following official categories:
        - Urban Flooding
        - Water Logging
        - Drain Overflow
        - Water-main Burst
        - Heatwave
        - Traffic accident
        - Infrastructure failure
        - Power outage
        - Fire
        - Protest
        - Disease cluster
        - Public disorder
        - Medical emergency
        - Unknown crisis
        
        Return a clean JSON containing exactly:
        - "incident_type": (string, chosen from the list above)
        - "type_confidence": (float, 0.0 to 1.0, representing your confidence in this category based on signal evidence)
        - "overall_confidence": (float, 0.0 to 1.0, combining signal evidence and fusion verification confidence)
        - "alternative_hypotheses": (list of objects with "type" and "confidence" for other plausible categories)
        - "classification_label": (string: "HIGH", "MODERATE", or "LOW" depending on overall_confidence)
        - "reasoning_summary": (string, 1-2 sentence explanation of your decision suitable for government command transparency)
        """

        add_log("🤖 COGNITIVE BRAIN: Querying Google Gemini 1.5 Flash classifier core...")
        gemini_res = await query_gemini_json(prompt, model="gemini-1.5-flash", fallback_result=fallback_output)
        
        incident_type = gemini_res.get("incident_type", primary_fallback)
        type_confidence = gemini_res.get("type_confidence", primary_confidence_fallback)
        overall_confidence = gemini_res.get("overall_confidence", overall_confidence_fallback)
        alternatives = gemini_res.get("alternative_hypotheses", alternatives_fallback)
        classification_label = gemini_res.get("classification_label", fallback_output["classification_label"])
        reasoning_summary = gemini_res.get("reasoning_summary", fallback_reasoning)

        add_log(f"🎯 LOCK SUCCESSFUL: Category classified as '{incident_type}' with {type_confidence:.0%} matching velocity.")
        if alternatives:
            add_log(f"ℹ️ HYPOTHESIS TREE: Found alternative hypotheses: {', '.join(a['type'] for a in alternatives)}")

        return {
            "input_summary": f"Classified {len(signals)} signals for incident {incident_id}",
            "reasoning_summary": reasoning_summary,
            "confidence": overall_confidence,
            "output": {
                "incident_type": incident_type,
                "type_confidence": round(type_confidence, 2),
                "overall_confidence": round(overall_confidence, 2),
                "alternative_hypotheses": alternatives,
                "classification_label": classification_label,
                "step_logs": step_logs,
            },
        }
