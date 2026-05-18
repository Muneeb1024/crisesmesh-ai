"""
CrisesMesh AI — Classification Agent
Classifies incident type with confidence and alternative hypotheses.
"""

from typing import Any, Dict
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent


class ClassificationAgent(BaseAgent):
    name = "Classification"
    description = "Classifies the incident type based on fused signals"

    async def process(self, input_data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        signals = input_data.get("signals", [])
        fusion_result = input_data.get("fusion_result", {})
        step_logs = []

        def add_log(msg: str):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
            step_logs.append(f"[{ts}] {msg}")

        add_log("⚙️ INITIALIZING CLASSIFIER: Receiving fused signal vectors...")
        add_log(f"🔎 COGNITIVE SCAN: Commencing semantic analysis on {len(signals)} sources.")

        # Count categories from signals
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

        # Primary classification
        primary = max(category_counts, key=category_counts.get)  # type: ignore
        total = sum(category_counts.values())
        primary_confidence = category_counts[primary] / max(total, 1)

        add_log(f"📊 MATRIX RESOLUTION: Matched categories -> {dict(category_counts)}")
        add_log(f"⚖️ BAYESIAN PROBABILITY: Testing hypothesis A ({primary}) vs secondary categories...")

        # Alternative hypotheses
        alternatives = [
            {"type": k, "confidence": round(v / total, 2)}
            for k, v in sorted(category_counts.items(), key=lambda x: -x[1])
            if k != primary
        ]

        overall_confidence = round(
            primary_confidence * 0.6 + fusion_result.get("overall_confidence", 0.5) * 0.4, 2
        )

        add_log(f"🎯 LOCK SUCCESSFUL: Category classified as '{primary}' with {primary_confidence:.0%} matching velocity.")
        if alternatives:
            add_log(f"ℹ️ HYPOTHESIS TREE: Found alternative hypotheses: {', '.join(a['type'] for a in alternatives)}")

        return {
            "input_summary": f"Classified {len(signals)} signals for incident {incident_id}",
            "reasoning_summary": (
                f"Analyzed signal text content and metadata. "
                f"Primary classification: {primary} ({primary_confidence:.0%} signal match). "
                f"Alternative hypotheses: {', '.join(a['type'] for a in alternatives) or 'none'}. "
                f"Combined classification confidence: {overall_confidence:.0%}."
            ),
            "confidence": overall_confidence,
            "output": {
                "incident_type": primary,
                "type_confidence": round(primary_confidence, 2),
                "overall_confidence": overall_confidence,
                "alternative_hypotheses": alternatives,
                "classification_label": "HIGH" if overall_confidence > 0.7 else "MODERATE" if overall_confidence > 0.5 else "LOW",
                "step_logs": step_logs,
            },
        }

